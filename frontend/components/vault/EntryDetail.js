'use client';
import { useEffect, useState } from 'react';
import { CryptoService } from '@/lib/crypto';
import { Monogram, StrengthMeter, useToast } from '../ui';
import {
  ArrowLeftIcon,
  CopyIcon,
  EditIcon,
  ExternalIcon,
  EyeIcon,
  EyeOffIcon,
  FolderIcon,
  LockIcon,
  ShieldCheckIcon,
  StarIcon,
  TrashIcon,
  AlertIcon,
} from '../icons';

const rtf = typeof Intl !== 'undefined' ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;

function relative(date) {
  if (!date || !rtf) return '—';
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'just now';
}

function siteUrl(website) {
  if (!website) return null;
  const w = website.trim();
  if (/^https?:\/\//i.test(w)) return w;
  return /^[\w-]+(\.[\w-]+)+/.test(w) ? `https://${w}` : null;
}

export default function EntryDetail({ item, masterKey, strength, onBack, onEdit, onDelete, onToggleFavorite }) {
  const toast = useToast();
  const [plain, setPlain] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Drop any decrypted value when the selection changes or the pane unmounts.
  useEffect(() => {
    setPlain(null);
    setRevealed(false);
  }, [item?.id]);

  if (!item) {
    return (
      <div className="hidden flex-1 flex-col items-center justify-center p-8 text-center lg:flex">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-surface">
          <LockIcon className="h-5 w-5 text-faint" />
        </span>
        <p className="mt-4 text-sm text-fg">Select an item</p>
        <p className="mt-1 text-xs text-muted">Passwords are decrypted only when you open them.</p>
      </div>
    );
  }

  const decrypt = async () => {
    if (plain !== null) return plain;
    try {
      const value = await CryptoService.decrypt(item.encrypted_data, item.iv, masterKey);
      setPlain(value);
      return value;
    } catch {
      toast('Could not decrypt this item', 'error');
      return null;
    }
  };

  const toggleReveal = async () => {
    if (revealed) return setRevealed(false);
    if ((await decrypt()) !== null) setRevealed(true);
  };

  const copy = async (text, label) => {
    if (text == null) return;
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied`);
    } catch {
      toast('Clipboard unavailable', 'error');
    }
  };

  const url = siteUrl(item.website);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-bg">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-3 lg:px-6">
        <button className="btn-ghost -ml-1 h-8 px-2 lg:hidden" onClick={onBack}>
          <ArrowLeftIcon />
          Back
        </button>
        <span className="hidden font-mono text-2xs text-faint lg:inline">item · {String(item.id).padStart(4, '0')}</span>
        <div className="flex items-center gap-1">
          <button
            className={`icon-btn ${item.favorite ? 'text-warn hover:text-warn' : ''}`}
            onClick={() => onToggleFavorite(item)}
            title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={item.favorite}
          >
            <StarIcon filled={item.favorite} />
          </button>
          <button className="btn-secondary h-8 px-3" onClick={() => onEdit(item)}>
            <EditIcon />
            Edit
          </button>
          <button className="icon-btn hover:text-danger" onClick={() => onDelete(item)} title="Delete" aria-label="Delete item">
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
          {/* Heading */}
          <div className="flex items-center gap-4">
            <Monogram name={item.website || '?'} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-[-0.01em] text-fg">{item.website || 'Untitled'}</h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                {item.folder ? (
                  <span className="inline-flex items-center gap-1.5">
                    <FolderIcon className="h-3.5 w-3.5 text-faint" />
                    {item.folder}
                  </span>
                ) : (
                  <span className="text-faint">No folder</span>
                )}
                <span className="text-faint">·</span>
                <span>Updated {relative(item.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="panel mt-8 divide-y divide-line">
            <FieldRow label="Username">
              <span className="truncate text-sm text-fg">{item.username || <span className="text-faint">—</span>}</span>
              {item.username && (
                <RowButton label="Copy username" onClick={() => copy(item.username, 'Username')}>
                  <CopyIcon />
                </RowButton>
              )}
            </FieldRow>

            <FieldRow label="Password">
              <span
                className={`min-w-0 flex-1 break-all font-mono text-sm ${revealed ? 'text-fg' : 'tracking-[0.2em] text-muted'}`}
              >
                {revealed ? plain : '••••••••••••'}
              </span>
              <RowButton label={revealed ? 'Hide password' : 'Reveal password'} onClick={toggleReveal}>
                {revealed ? <EyeOffIcon /> : <EyeIcon />}
              </RowButton>
              <RowButton label="Copy password" onClick={async () => copy(await decrypt(), 'Password')}>
                <CopyIcon />
              </RowButton>
            </FieldRow>

            <FieldRow label="Website">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-w-0 items-center gap-1.5 truncate text-sm text-fg underline-offset-4 hover:underline"
                >
                  <span className="truncate">{item.website}</span>
                  <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                </a>
              ) : (
                <span className="truncate text-sm text-fg">{item.website || <span className="text-faint">—</span>}</span>
              )}
            </FieldRow>
          </div>

          {/* Health */}
          <div className="panel mt-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {strength === 'weak' ? (
                  <AlertIcon className="h-4 w-4 text-warn" />
                ) : (
                  <ShieldCheckIcon className={`h-4 w-4 ${strength ? 'text-accent' : 'text-faint'}`} />
                )}
                <div>
                  <p className="text-sm font-medium text-fg">Password strength</p>
                  <p className="text-xs text-muted">
                    {strength === 'weak'
                      ? 'Short or predictable. Replace it with a generated one.'
                      : strength === 'medium'
                      ? 'Acceptable, but longer would be better.'
                      : strength === 'strong'
                      ? 'Long and varied. Nothing to do.'
                      : 'Checked locally after decryption.'}
                  </p>
                </div>
              </div>
              <StrengthMeter strength={strength} showLabel={false} />
            </div>
            {strength === 'weak' && (
              <button className="btn-secondary mt-4 h-8 w-full text-xs" onClick={() => onEdit(item, { regenerate: true })}>
                Generate a stronger password
              </button>
            )}
          </div>

          {/* Encryption metadata */}
          <dl className="mt-8 space-y-2 font-mono text-2xs">
            <Meta k="cipher" v="AES-256-GCM" />
            <Meta k="iv" v={item.iv} />
            <Meta k="ciphertext" v={`${item.encrypted_data.slice(0, 28)}…`} />
            <Meta k="created" v={item.created_at ? new Date(item.created_at).toLocaleString() : '—'} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 px-4 py-2">
      <span className="w-20 shrink-0 text-xs text-muted">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-1">{children}</div>
    </div>
  );
}

function RowButton({ label, onClick, children }) {
  return (
    <button className="icon-btn shrink-0" onClick={onClick} title={label} aria-label={label}>
      {children}
    </button>
  );
}

function Meta({ k, v }) {
  return (
    <div className="flex gap-4">
      <dt className="w-20 shrink-0 text-faint">{k}</dt>
      <dd className="truncate text-muted">{v}</dd>
    </div>
  );
}
