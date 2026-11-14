'use client';
import { useEffect, useState } from 'react';
import api, { errorMessage } from '@/lib/api';
import { CryptoService } from '@/lib/crypto';
import { generatePassword, getStrength } from '@/lib/password';
import { Dialog, Spinner, StrengthMeter, useToast } from '../ui';
import { DiceIcon, EyeIcon, EyeOffIcon, StarIcon, XIcon } from '../icons';

const EMPTY = { website: '', username: '', password: '', folder: '', favorite: false };

export default function EntryEditor({ open, item, regenerate, masterKey, folders, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [show, setShow] = useState(false);
  const [gen, setGen] = useState({ length: 20, upper: true, digits: true, symbols: true });
  const [genOpen, setGenOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load (and decrypt) the item being edited each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setShow(false);
    setGenOpen(!!regenerate);
    if (!item) {
      setForm(EMPTY);
      return;
    }
    let cancelled = false;
    setLoading(true);
    CryptoService.decrypt(item.encrypted_data, item.iv, masterKey)
      .then((password) => {
        if (cancelled) return;
        setForm({
          website: item.website,
          username: item.username,
          password: regenerate ? generatePassword(gen) : password,
          folder: item.folder,
          favorite: item.favorite,
        });
        if (regenerate) setShow(true);
      })
      .catch(() => toast('Could not decrypt this item', 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, regenerate, masterKey]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const regen = (opts = gen) => {
    setForm((f) => ({ ...f, password: generatePassword(opts) }));
    setShow(true);
  };

  const updateGen = (patch) => {
    const next = { ...gen, ...patch };
    setGen(next);
    regen(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.password) return;
    setSaving(true);
    try {
      const { encrypted, iv } = await CryptoService.encrypt(form.password, masterKey);
      const payload = {
        encrypted_data: encrypted,
        iv,
        website: form.website.trim(),
        username: form.username.trim(),
        folder: form.folder.trim(),
        favorite: form.favorite,
      };
      const res = item ? await api.put(`/items/${item.id}/`, payload) : await api.post('/items/', payload);
      toast(item ? 'Changes saved' : 'Item added');
      onSaved(res.data);
    } catch (err) {
      toast(errorMessage(err, 'Could not save'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const busy = loading || saving;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} labelledBy="editor-title" className="max-w-lg">
      <form onSubmit={submit}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="editor-title" className="text-[15px] font-semibold text-fg">
              {item ? 'Edit item' : 'New item'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">The password is encrypted before it is sent.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={saving}>
            <XIcon />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="website" className="label">Website</label>
              <input
                id="website"
                className="input"
                placeholder="github.com"
                value={form.website}
                onChange={set('website')}
                disabled={busy}
                required
                data-autofocus={!item || undefined}
              />
            </div>
            <div>
              <label htmlFor="entry-username" className="label">Username or email</label>
              <input
                id="entry-username"
                className="input"
                value={form.username}
                onChange={set('username')}
                disabled={busy}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="entry-password" className="label">Password</label>
              <button
                type="button"
                onClick={() => setGenOpen((o) => !o)}
                className="text-2xs font-medium text-accent hover:text-accent/80"
                disabled={busy}
              >
                {genOpen ? 'Hide generator' : 'Generator'}
              </button>
            </div>
            <div className="relative">
              <input
                id="entry-password"
                type={show ? 'text' : 'password'}
                className="input pr-[4.5rem] font-mono"
                value={form.password}
                onChange={set('password')}
                disabled={busy}
                required
                autoComplete="new-password"
                spellCheck={false}
                data-autofocus={item ? true : undefined}
              />
              <div className="absolute inset-y-0 right-1 flex items-center">
                <button
                  type="button"
                  className="icon-btn h-8 w-8"
                  onClick={() => regen()}
                  title="Generate password"
                  aria-label="Generate password"
                  disabled={busy}
                >
                  <DiceIcon />
                </button>
                <button
                  type="button"
                  className="icon-btn h-8 w-8"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  disabled={busy}
                >
                  {show ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <StrengthMeter strength={getStrength(form.password)} className="mt-2.5" showLabel={!!form.password} />

            {genOpen && (
              <div className="mt-3 rounded-md border border-line bg-bg p-3.5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <label htmlFor="gen-length" className="text-xs text-muted">Length</label>
                  <input
                    id="gen-length"
                    type="range"
                    min={8}
                    max={64}
                    value={gen.length}
                    onChange={(e) => updateGen({ length: Number(e.target.value) })}
                    className="flex-1 accent-[rgb(var(--accent))]"
                  />
                  <span className="w-6 text-right font-mono text-xs text-fg">{gen.length}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ['upper', 'A–Z'],
                    ['digits', '0–9'],
                    ['symbols', '!@#'],
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => updateGen({ [k]: !gen[k] })}
                      aria-pressed={gen[k]}
                      className={`h-7 rounded-md border px-2.5 font-mono text-2xs transition-colors ${
                        gen[k] ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line text-faint hover:text-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <span className="ml-auto self-center font-mono text-2xs text-faint">crypto.getRandomValues</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="folder" className="label">Folder</label>
              <input
                id="folder"
                className="input"
                placeholder="Personal, Work…"
                list="folder-options"
                value={form.folder}
                onChange={set('folder')}
                disabled={busy}
              />
              <datalist id="folder-options">
                {folders.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, favorite: !f.favorite }))}
              aria-pressed={form.favorite}
              disabled={busy}
              className={`btn h-10 border ${
                form.favorite ? 'border-warn/40 bg-warn/10 text-warn' : 'border-line text-muted hover:text-fg'
              }`}
            >
              <StarIcon filled={form.favorite} />
              Favorite
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary min-w-[7rem]" disabled={busy || !form.password}>
            {saving && <Spinner />}
            {saving ? 'Encrypting…' : item ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
