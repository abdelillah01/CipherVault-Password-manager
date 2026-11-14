'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { errorMessage } from '@/lib/api';
import { CryptoService } from '@/lib/crypto';
import { getStrength } from '@/lib/password';
import { useAuthStore } from '@/lib/store';
import { ConfirmDialog, ToastProvider, useToast } from '@/components/ui';
import Sidebar from '@/components/vault/Sidebar';
import EntryList from '@/components/vault/EntryList';
import EntryDetail from '@/components/vault/EntryDetail';
import EntryEditor from '@/components/vault/EntryEditor';

const AUTO_LOCK_MS = 10 * 60 * 1000;

export default function DashboardPage() {
  return (
    <ToastProvider>
      <Vault />
    </ToastProvider>
  );
}

function Vault() {
  const router = useRouter();
  const toast = useToast();
  const { user, masterKey, clearAuth } = useAuthStore();

  const [items, setItems] = useState([]);
  const [strengths, setStrengths] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState({ type: 'all' });
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editor, setEditor] = useState({ open: false, item: null, regenerate: false });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);

  /* ---------- session ---------- */

  const lock = useCallback(async () => {
    try {
      await api.post('/logout/');
    } catch {
      /* session may already be gone */
    }
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  useEffect(() => {
    if (!user || !masterKey) router.replace('/login');
  }, [user, masterKey, router]);

  // Auto-lock after inactivity.
  useEffect(() => {
    if (!masterKey) return;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(lock, AUTO_LOCK_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [masterKey, lock]);

  /* ---------- data ---------- */

  // Decrypt each entry once to score its strength; plaintext is discarded immediately.
  const scoreAll = useCallback(
    async (list) => {
      const pairs = await Promise.all(
        list.map(async (it) => {
          try {
            return [it.id, getStrength(await CryptoService.decrypt(it.encrypted_data, it.iv, masterKey))];
          } catch {
            return [it.id, ''];
          }
        })
      );
      setStrengths(Object.fromEntries(pairs));
    },
    [masterKey]
  );

  const load = useCallback(async () => {
    if (!masterKey) return;
    setLoading(true);
    try {
      const res = await api.get('/items/');
      setItems(res.data);
      await scoreAll(res.data);
    } catch (err) {
      if (err?.response?.status === 403 || err?.response?.status === 401) return lock();
      toast(errorMessage(err, 'Could not load vault'), 'error');
    } finally {
      setLoading(false);
    }
  }, [masterKey, scoreAll, lock, toast]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- derived ---------- */

  const folders = useMemo(() => {
    const m = new Map();
    items.forEach((i) => i.folder && m.set(i.folder, (m.get(i.folder) || 0) + 1));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const counts = useMemo(
    () => ({
      all: items.length,
      favorites: items.filter((i) => i.favorite).length,
      weak: items.filter((i) => strengths[i.id] === 'weak').length,
    }),
    [items, strengths]
  );

  const inView = useMemo(() => {
    switch (view.type) {
      case 'favorites':
        return items.filter((i) => i.favorite);
      case 'weak':
        return items.filter((i) => strengths[i.id] === 'weak');
      case 'folder':
        return items.filter((i) => i.folder === view.folder);
      default:
        return items;
    }
  }, [items, strengths, view]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inView;
    return inView.filter((i) =>
      [i.website, i.username, i.folder].some((f) => f && f.toLowerCase().includes(q))
    );
  }, [inView, query]);

  const selected = items.find((i) => i.id === selectedId) || null;

  const viewTitle =
    view.type === 'favorites' ? 'Favorites' : view.type === 'weak' ? 'Weak passwords' : view.type === 'folder' ? view.folder : 'All items';

  // On wide screens keep something selected so the detail pane is never blank.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    if (!wide) return;
    if (!visible.some((i) => i.id === selectedId)) setSelectedId(visible[0]?.id ?? null);
  }, [visible, selectedId]);

  /* ---------- keyboard ---------- */

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if (editor.open || pendingDelete) return;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if ((e.key === 'n' || e.key === 'N') && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setEditor({ open: true, item: null, regenerate: false });
      } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && visible.length) {
        if (typing && document.activeElement !== searchRef.current) return;
        e.preventDefault();
        const idx = visible.findIndex((i) => i.id === selectedId);
        const next = e.key === 'ArrowDown' ? Math.min(idx + 1, visible.length - 1) : Math.max(idx - 1, 0);
        const id = visible[next].id;
        setSelectedId(id);
        document.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Escape' && typing && document.activeElement === searchRef.current) {
        setQuery('');
        searchRef.current.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editor.open, pendingDelete, visible, selectedId]);

  /* ---------- mutations ---------- */

  const handleSaved = async (saved) => {
    setEditor({ open: false, item: null, regenerate: false });
    setItems((list) => {
      const exists = list.some((i) => i.id === saved.id);
      const next = exists ? list.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...list];
      return next.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    });
    setSelectedId(saved.id);
    try {
      const plain = await CryptoService.decrypt(saved.encrypted_data, saved.iv, masterKey);
      setStrengths((s) => ({ ...s, [saved.id]: getStrength(plain) }));
    } catch {
      /* ignore */
    }
  };

  const toggleFavorite = async (item) => {
    const favorite = !item.favorite;
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, favorite } : i)));
    try {
      await api.patch(`/items/${item.id}/`, { favorite });
    } catch (err) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, favorite: item.favorite } : i)));
      toast(errorMessage(err, 'Could not update'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/items/${pendingDelete.id}/`);
      setItems((list) => list.filter((i) => i.id !== pendingDelete.id));
      if (selectedId === pendingDelete.id) setSelectedId(null);
      toast('Item deleted');
      setPendingDelete(null);
    } catch (err) {
      toast(errorMessage(err, 'Could not delete'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!user || !masterKey) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={user}
        view={view}
        setView={(v) => {
          setView(v);
          setQuery('');
        }}
        counts={counts}
        folders={folders}
        onNew={() => setEditor({ open: true, item: null, regenerate: false })}
        onLock={lock}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <EntryList
        ref={searchRef}
        title={viewTitle}
        items={visible}
        total={inView.length}
        strengths={strengths}
        selectedId={selectedId}
        onSelect={setSelectedId}
        query={query}
        setQuery={setQuery}
        loading={loading}
        onRefresh={load}
        onNew={() => setEditor({ open: true, item: null, regenerate: false })}
        onMenu={() => setMenuOpen(true)}
      />

      {/* Detail: a column on desktop, a full-screen sheet below lg */}
      <div
        className={`${
          selected ? 'fixed inset-0 z-30 flex animate-fade-in lg:animate-none' : 'hidden'
        } lg:static lg:z-auto lg:flex lg:flex-1`}
      >
        <EntryDetail
          item={selected}
          masterKey={masterKey}
          strength={selected ? strengths[selected.id] : ''}
          onBack={() => setSelectedId(null)}
          onEdit={(item, opts) => setEditor({ open: true, item, regenerate: !!opts?.regenerate })}
          onDelete={setPendingDelete}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      <EntryEditor
        open={editor.open}
        item={editor.item}
        regenerate={editor.regenerate}
        masterKey={masterKey}
        folders={folders.map(([f]) => f)}
        onClose={() => setEditor({ open: false, item: null, regenerate: false })}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete ${pendingDelete?.website || 'this item'}?`}
        body="The encrypted entry is removed from the server. This cannot be undone."
        onCancel={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </div>
  );
}
