'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { STRENGTH_META } from '@/lib/password';
import { CheckIcon, XIcon } from './icons';

/* ---------- Brand ---------- */

export function LogoMark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="rgb(var(--surface))" stroke="rgb(var(--line-strong))" />
      <path
        d="M16 7.5 9.5 10v5.2c0 4.1 2.8 7.4 6.5 8.3 3.7-.9 6.5-4.2 6.5-8.3V10z"
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="14.6" r="1.7" fill="rgb(var(--accent))" />
      <path d="M16 16.3v2.6" stroke="rgb(var(--accent))" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = '/', className = '' }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-fg">CipherVault</span>
    </Link>
  );
}

/* ---------- Strength meter ---------- */

export function StrengthMeter({ strength, showLabel = true, className = '' }) {
  const meta = STRENGTH_META[strength];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 w-6 rounded-full transition-colors duration-200 ${
              meta && i <= meta.bars ? meta.fill : 'bg-line-strong'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${meta ? meta.text : 'text-faint'}`}>
          {meta ? meta.label : 'Not checked'}
        </span>
      )}
    </div>
  );
}

/* ---------- Monogram avatar ---------- */

const HUES = [158, 190, 215, 250, 285, 330, 20, 42];

export function Monogram({ name = '', size = 'md' }) {
  const label = (name.replace(/^https?:\/\/(www\.)?/i, '').trim()[0] || '?').toUpperCase();
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = HUES[h % HUES.length];
  const dims = size === 'lg' ? 'h-11 w-11 text-base rounded-lg' : 'h-8 w-8 text-xs rounded-md';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-mono font-semibold ${dims}`}
      style={{
        color: `hsl(${hue} 70% 72%)`,
        background: `hsl(${hue} 40% 14%)`,
        boxShadow: `inset 0 0 0 1px hsl(${hue} 40% 22%)`,
      }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

/* ---------- Dialog ---------- */

export function Dialog({ open, onClose, children, labelledBy, className = 'max-w-md' }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && closeRef.current?.();
    window.addEventListener('keydown', onKey);
    const root = ref.current;
    (root?.querySelector('[data-autofocus]') || root?.querySelector('input, button'))?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full ${className} panel shadow-2xl shadow-black/60 animate-rise-in rounded-b-none sm:rounded-lg max-h-[92vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Dialog open={open} onClose={onCancel} labelledBy="confirm-title" className="max-w-sm">
      <div className="p-5">
        <h2 id="confirm-title" className="text-[15px] font-semibold text-fg">{title}</h2>
        <p className="mt-1.5 text-sm text-muted leading-relaxed">{body}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
        <button className="btn-ghost" onClick={onCancel} disabled={busy} data-autofocus>
          Cancel
        </button>
        <button className="btn bg-danger text-white hover:bg-danger/90" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- Toasts ---------- */

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2 rounded-md border border-line-strong bg-raised px-3 py-2 text-sm text-fg shadow-xl shadow-black/50 animate-rise-in"
          >
            {t.tone === 'error' ? (
              <XIcon className="h-4 w-4 text-danger" />
            ) : (
              <CheckIcon className="h-4 w-4 text-accent" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- Spinner ---------- */

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
