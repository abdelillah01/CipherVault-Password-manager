'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { errorMessage } from '@/lib/api';
import { CryptoService } from '@/lib/crypto';
import { getStrength } from '@/lib/password';
import AuthShell, { AsideList, Field, FormError, PasswordInput } from '@/components/AuthShell';
import { Spinner, StrengthMeter } from '@/components/ui';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [ack, setAck] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const strength = getStrength(form.password);
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('The two passwords do not match.');
    if (!ack) return setError('Please confirm you understand there is no password recovery.');

    setBusy(true);
    try {
      await api.post('/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      const salt = CryptoService.generateSalt();
      localStorage.setItem(`salt_${form.username}`, btoa(String.fromCharCode(...salt)));

      router.push('/login');
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your vault"
      subtitle="Your master password is the only key. Choose it carefully."
      footer={
        <>
          Already have a vault?{' '}
          <Link href="/login" className="font-medium text-fg underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
      aside={
        <AsideList
          heading="Before you start"
          items={[
            ['Use a long passphrase', 'Four or more random words beat a short complex password.'],
            ['It cannot be reset', 'Nobody, including the server, can recover a lost master password.'],
            ['This browser holds your salt', 'Clearing site data for this app will lock the vault for good.'],
          ]}
        />
      }
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <FormError>{error}</FormError>

        <Field label="Username" id="username">
          <input
            id="username"
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            autoFocus
            required
            disabled={busy}
          />
        </Field>

        <Field label="Email" hint="Optional" id="email">
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            disabled={busy}
          />
        </Field>

        <Field label="Master password" hint="8+ characters" id="password">
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
          />
          <StrengthMeter strength={strength} className="mt-2.5" showLabel={!!form.password} />
        </Field>

        <Field label="Confirm master password" id="confirm">
          <PasswordInput
            id="confirm"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            autoComplete="new-password"
            disabled={busy}
          />
          {mismatch && <p className="mt-1.5 text-xs text-danger">Passwords do not match</p>}
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface p-3">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]"
            disabled={busy}
          />
          <span className="text-xs leading-relaxed text-muted">
            I understand that if I forget my master password, my vault <span className="text-fg">cannot be recovered</span>.
          </span>
        </label>

        <button type="submit" className="btn-primary h-10 w-full" disabled={busy}>
          {busy && <Spinner />}
          {busy ? 'Creating vault…' : 'Create vault'}
        </button>
      </form>
    </AuthShell>
  );
}
