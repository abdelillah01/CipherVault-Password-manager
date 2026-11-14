'use client';
import { Logo, Monogram } from '../ui';
import { AlertIcon, FolderIcon, GridIcon, LockIcon, PlusIcon, StarIcon, XIcon } from '../icons';

export default function Sidebar({ user, view, setView, counts, folders, onNew, onLock, open, onClose }) {
  const nav = [
    { key: 'all', label: 'All items', icon: GridIcon, count: counts.all },
    { key: 'favorites', label: 'Favorites', icon: StarIcon, count: counts.favorites },
    { key: 'weak', label: 'Weak passwords', icon: AlertIcon, count: counts.weak, tone: counts.weak ? 'warn' : null },
  ];

  const select = (v) => {
    setView(v);
    onClose?.();
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden animate-fade-in" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <Logo href="/dashboard" />
          <button className="icon-btn md:hidden" onClick={onClose} aria-label="Close menu">
            <XIcon />
          </button>
        </div>

        <div className="p-3">
          <button className="btn-primary w-full" onClick={() => { onNew(); onClose?.(); }}>
            <PlusIcon />
            New item
            <span className="ml-auto rounded bg-accent-ink/15 px-1.5 font-mono text-2xs">N</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <ul className="space-y-0.5">
            {nav.map((n) => (
              <NavItem
                key={n.key}
                active={view.type === n.key}
                onClick={() => select({ type: n.key })}
                icon={n.icon}
                label={n.label}
                count={n.count}
                tone={n.tone}
              />
            ))}
          </ul>

          <p className="eyebrow mb-2 mt-6 px-2.5">Folders</p>
          {folders.length === 0 ? (
            <p className="px-2.5 text-xs text-faint">Add a folder name to an item to group it here.</p>
          ) : (
            <ul className="space-y-0.5">
              {folders.map(([name, count]) => (
                <NavItem
                  key={name}
                  active={view.type === 'folder' && view.folder === name}
                  onClick={() => select({ type: 'folder', folder: name })}
                  icon={FolderIcon}
                  label={name}
                  count={count}
                />
              ))}
            </ul>
          )}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1">
            <Monogram name={user || '?'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{user}</p>
              <p className="font-mono text-2xs text-faint">auto-lock · 10 min</p>
            </div>
            <button className="icon-btn" onClick={onLock} title="Lock vault" aria-label="Lock vault">
              <LockIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ active, onClick, icon: Icon, label, count, tone }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`group flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors ${
          active ? 'bg-raised text-fg' : 'text-muted hover:bg-raised/60 hover:text-fg'
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-accent' : tone === 'warn' ? 'text-warn' : 'text-faint group-hover:text-muted'}`} />
        <span className="truncate">{label}</span>
        <span className={`ml-auto font-mono text-2xs ${tone === 'warn' ? 'text-warn' : 'text-faint'}`}>{count}</span>
      </button>
    </li>
  );
}
