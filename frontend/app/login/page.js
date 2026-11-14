'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { errorMessage } from '@/lib/api';
import { CryptoService } from '@/lib/crypto';
import { useAuthStore } from '@/lib/store';
import AuthShell, { AsideList, Field, FormError, PasswordInput } from '@/components/AuthShell';
import { Spinner } from '@/components/ui';

export default function Login() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [stage, setStage] = useState(null); // null | 'auth' | 'derive'

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const saltString = localStorage.getItem(`salt_${form.username}`);
    if (!saltString) {
      setError(
        'No encryption salt for this username in this browser. Vaults can only be unlocked in the browser they were created in.'
      );
      return;
    }

    try {
      setStage('auth');
      await api.post('/login/', form);

      setStage('derive');
      const salt = Uint8Array.from(atob(saltString), (c) => c.charCodeAt(0));
      const masterKey = await CryptoService.deriveKey(form.password, salt);

      setAuth(form.username, masterKey, salt);
      router.push('/dashboard');
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed'));
      setStage(null);
    }
  };

  const busy = stage !== null;

  return (
    <AuthShell
      title="Unlock your vault"
      subtitle="Sign in with your username and master password."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-medium text-fg underline-offset-4 hover:underline">
            Create a vault
          </Link>
        </>
      }
      aside={
        <AsideList
          heading="What happens when you sign in"
          items={[
            ['Server checks an Argon2id hash', 'Your password is verified, then the server forgets it.'],
            ['Your browser derives the key', 'PBKDF2 turns password and salt into an AES-256 key, in memory only.'],
            ['Entries decrypt locally', 'Ciphertext is fetched and opened on this device, on demand.'],
          ]}
        />
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
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

        <Field label="Master password" id="password">
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            disabled={busy}
          />
        </Field>

        <button type="submit" className="btn-primary h-10 w-full" disabled={busy}>
          {busy && <Spinner />}
          {stage === 'auth' ? 'Verifying…' : stage === 'derive' ? 'Deriving key…' : 'Unlock'}
        </button>
      </form>
    </AuthShell>
  );
}
