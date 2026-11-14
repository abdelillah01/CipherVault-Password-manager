'use client';
import { useState } from 'react';
import { Logo } from './ui';
import { CheckIcon, EyeIcon, EyeOffIcon } from './icons';

export default function AuthShell({ title, subtitle, children, footer, aside }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,560px)]">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[380px]">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-fg">{title}</h1>
            <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-muted">{footer}</div>}
          </div>
        </div>
        <p className="font-mono text-2xs text-faint">Keys are derived and kept in this tab only.</p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-surface lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgb(var(--line)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-end p-12">{aside}</div>
      </aside>
    </div>
  );
}

export function AsideList({ heading, items }) {
  return (
    <div>
      <p className="eyebrow">{heading}</p>
      <ul className="mt-5 space-y-4">
        {items.map(([title, body]) => (
          <li key={title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <CheckIcon className="h-3 w-3 text-accent" />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Field({ label, hint, children, id }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="label">{label}</label>
        {hint && <span className="text-2xs text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function PasswordInput({ id, value, onChange, placeholder, autoComplete, disabled, minLength, mono }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={`input pr-10 ${mono && show ? 'font-mono' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        minLength={minLength}
        required
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-faint hover:text-fg"
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger">
      {children}
    </div>
  );
}
