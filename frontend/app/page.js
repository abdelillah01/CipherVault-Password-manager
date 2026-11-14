'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Logo } from '@/components/ui';
import {
  ArrowRightIcon,
  CheckIcon,
  DeviceIcon,
  GithubIcon,
  KeyIcon,
  LockIcon,
  ServerIcon,
  AlertIcon,
} from '@/components/icons';

const REPO_URL = 'https://github.com/abdelillah01/CipherVault-Password-manager';

export default function Home() {
  const router = useRouter();
  const { user, masterKey } = useAuthStore();

  useEffect(() => {
    if (user && masterKey) router.replace('/dashboard');
  }, [user, masterKey, router]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Backdrop />
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <WhereDataLives />
        <TradeOffs />
        <Spec />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--line)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[-280px] h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.10] blur-3xl"
        style={{ background: 'rgb(var(--accent))' }}
      />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {[
            ['#how', 'How it works'],
            ['#storage', 'Storage'],
            ['#spec', 'Spec'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="btn-ghost h-8 px-3 text-[13px]">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost h-8 px-3 text-[13px]">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary h-8 px-3 text-[13px]">
            Create vault
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pl-1.5 pr-3">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-2xs font-medium text-accent">
            AES-256-GCM
          </span>
          <span className="text-xs text-muted">Encrypted in your browser</span>
        </div>

        <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-fg sm:text-6xl">
          Your passwords,
          <br />
          <span className="text-muted">sealed before they</span>
          <br />
          <span className="text-muted">leave your device.</span>
        </h1>

        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
          CipherVault derives a key from your master password locally and encrypts every entry before it
          is sent. The server stores ciphertext it has no way to read.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/register" className="btn-primary h-10 px-4">
            Create your vault
            <ArrowRightIcon />
          </Link>
          <Link href="/login" className="btn-secondary h-10 px-4">
            Sign in
          </Link>
        </div>

        <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
          {[
            ['Cipher', 'AES-256'],
            ['KDF rounds', '100,000'],
            ['Plaintext stored', 'None'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow">{k}</dt>
              <dd className="mt-1.5 font-mono text-sm text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <TwoViews />
    </section>
  );
}

/** The same vault entry, as seen on the device and as stored on the server. */
function TwoViews() {
  return (
    <div className="relative">
      <div className="panel overflow-hidden shadow-2xl shadow-black/50">
        {/* Device view */}
        <div className="border-b border-line p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-fg">
              <DeviceIcon className="h-4 w-4 text-accent" />
              On your device
            </span>
            <span className="font-mono text-2xs text-accent">decrypted</span>
          </div>
          <div className="space-y-2.5 font-mono text-[13px]">
            <Row k="website" v="github.com" />
            <Row k="username" v="ada@lovelace.dev" />
            <Row k="password" v="v7#Qe!m2Lr9@xTb4" highlight />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-3 border-b border-line bg-bg/60 px-5 py-2.5">
          <LockIcon className="h-3.5 w-3.5 text-faint" />
          <span className="font-mono text-2xs text-faint">AES-GCM(key, iv) → base64</span>
        </div>

        {/* Server view */}
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-fg">
              <ServerIcon className="h-4 w-4 text-muted" />
              What the server stores
            </span>
            <span className="font-mono text-2xs text-faint">ciphertext</span>
          </div>
          <div className="space-y-2.5 font-mono text-[13px]">
            <Row k="encrypted_data" v="k3J9xQ0vT2mWb8LZpA1e/Hc7uR+5yNdq4fGs6oViE=" dim />
            <Row k="iv" v="Zt8fP2nK0qYwHc1r" dim />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-2xs text-faint">Same entry, two places.</p>
    </div>
  );
}

function Row({ k, v, highlight, dim }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-[7.5rem] shrink-0 text-faint">{k}</span>
      <span className={`truncate ${highlight ? 'text-accent' : dim ? 'text-muted' : 'text-fg'}`}>{v}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Section({ id, eyebrow, title, intro, children }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-fg sm:text-3xl">{title}</h2>
          {intro && <p className="mt-3 text-[15px] leading-relaxed text-muted">{intro}</p>}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: KeyIcon,
      title: 'Derive',
      body: 'Your master password and a random salt go through PBKDF2 to produce a 256-bit key. The key is held in memory only.',
      code: 'key = PBKDF2(master, salt, 100k)',
    },
    {
      icon: LockIcon,
      title: 'Encrypt',
      body: 'Each password is sealed with AES-256-GCM using a fresh random IV, which also authenticates it against tampering.',
      code: 'ct = AES-GCM(key, iv, password)',
    },
    {
      icon: ServerIcon,
      title: 'Store',
      body: 'Only the ciphertext and IV are sent. Decryption happens back in your browser, on demand.',
      code: 'POST /api/items { ct, iv }',
    },
  ];
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title="Three steps, all on your side of the wire."
      intro="The server does authentication and storage. Everything that touches a plaintext secret runs in your browser through the Web Crypto API."
    >
      <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col bg-surface p-6">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-accent" />
              <span className="font-mono text-2xs text-faint">0{i + 1}</span>
            </div>
            <h3 className="mt-6 text-base font-semibold text-fg">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.body}</p>
            <code className="mt-6 block truncate rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs text-muted">
              {s.code}
            </code>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function WhereDataLives() {
  const rows = [
    ['Master password', 'Never stored', 'device', 'Used once to derive the key, then discarded.'],
    ['Encryption key', 'Memory only', 'device', 'Cleared on lock, logout, refresh or 10 min idle.'],
    ['Salt', 'localStorage', 'device', 'Random 16 bytes, generated at registration.'],
    ['Login hash', 'Argon2id', 'server', 'Verifies who you are. Cannot decrypt anything.'],
    ['Ciphertext + IV', 'Database', 'server', 'Useless without the key that never leaves you.'],
  ];
  return (
    <Section
      id="storage"
      eyebrow="Where your data lives"
      title="A breach of the server leaks nothing readable."
      intro="Here is every piece of state involved, and which side of the connection it lives on."
    >
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_2fr] gap-4 border-b border-line bg-surface px-5 py-3 md:grid">
          {['Item', 'Form', 'Location', 'Why'].map((h) => (
            <span key={h} className="eyebrow">{h}</span>
          ))}
        </div>
        {rows.map(([item, form, where, why]) => (
          <div
            key={item}
            className="grid gap-1 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[1.2fr_1fr_0.8fr_2fr] md:items-center md:gap-4"
          >
            <span className="text-sm font-medium text-fg">{item}</span>
            <span className="font-mono text-xs text-muted">{form}</span>
            <span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-2xs ${
                  where === 'device' ? 'bg-accent/10 text-accent' : 'bg-raised text-muted'
                }`}
              >
                {where === 'device' ? <DeviceIcon className="h-3 w-3" /> : <ServerIcon className="h-3 w-3" />}
                {where}
              </span>
            </span>
            <span className="text-sm text-muted">{why}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TradeOffs() {
  const good = [
    'A database leak exposes only ciphertext.',
    'The operator cannot read, reset or hand over your secrets.',
    'Every entry has its own random IV; identical passwords encrypt differently.',
    'Login is rate-limited and hashed with Argon2id.',
  ];
  const know = [
    'No recovery. A forgotten master password means lost data.',
    'The salt lives in this browser. Clearing site data locks you out.',
    'Refreshing the page drops the key; you sign in again.',
    'This is an educational project, not an audited product.',
  ];
  return (
    <Section id="tradeoffs" eyebrow="Trade-offs" title="What you gain, and what it costs.">
      <div className="grid gap-4 md:grid-cols-2">
        <List title="You get" items={good} icon={<CheckIcon className="h-3.5 w-3.5 text-accent" />} />
        <List title="Keep in mind" items={know} icon={<AlertIcon className="h-3.5 w-3.5 text-warn" />} />
      </div>
    </Section>
  );
}

function List({ title, items, icon }) {
  return (
    <div className="panel p-6">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted">
            <span className="mt-[3px] shrink-0">{icon}</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Spec() {
  const spec = [
    ['Encryption', 'AES-256-GCM'],
    ['IV', '96-bit, crypto.getRandomValues'],
    ['Key derivation', 'PBKDF2-HMAC-SHA256'],
    ['Iterations', '100,000'],
    ['Salt', '128-bit, per user'],
    ['Login hashing', 'Argon2id (server)'],
    ['Session', 'HTTP-only cookie'],
    ['Auto-lock', '10 min inactivity'],
  ];
  return (
    <Section id="spec" eyebrow="Spec" title="For the curious.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <dl className="panel divide-y divide-line">
          {spec.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="text-right font-mono text-xs text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="ml-2 font-mono text-2xs text-faint">lib/crypto.js</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-muted">
            <code>
              <span className="text-faint">{'// 1. derive a non-extractable AES key\n'}</span>
              <span className="text-fg">{'const '}</span>{'key = '}<span className="text-fg">{'await '}</span>{'crypto.subtle.deriveKey(\n'}
              {'  { name: '}<span className="text-accent">{"'PBKDF2'"}</span>{', salt, iterations: '}<span className="text-warn">{'100000'}</span>{', hash: '}<span className="text-accent">{"'SHA-256'"}</span>{' },\n'}
              {'  passwordKey, { name: '}<span className="text-accent">{"'AES-GCM'"}</span>{', length: '}<span className="text-warn">{'256'}</span>{' }, '}<span className="text-warn">{'false'}</span>{', [...]\n);\n\n'}
              <span className="text-faint">{'// 2. encrypt with a fresh IV per entry\n'}</span>
              <span className="text-fg">{'const '}</span>{'iv = crypto.getRandomValues('}<span className="text-fg">{'new '}</span>{'Uint8Array('}<span className="text-warn">{'12'}</span>{'));\n'}
              <span className="text-fg">{'const '}</span>{'ct = '}<span className="text-fg">{'await '}</span>{'crypto.subtle.encrypt({ name: '}<span className="text-accent">{"'AES-GCM'"}</span>{', iv }, key, data);\n\n'}
              <span className="text-faint">{'// 3. only ciphertext + iv go over the wire\n'}</span>
              {'api.post('}<span className="text-accent">{"'/items/'"}</span>{', { encrypted_data, iv, website, username });'}
            </code>
          </pre>
        </div>
      </div>
    </Section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-fg">Open the vault.</h2>
          <p className="mt-2 text-[15px] text-muted">Pick a master password you will not forget. There is no reset.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/register" className="btn-primary h-10 px-4">
            Create your vault
            <ArrowRightIcon />
          </Link>
          <Link href="/login" className="btn-secondary h-10 px-4">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-faint sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline">·</span>
          <span>An educational zero-knowledge demo.</span>
        </div>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
          <GithubIcon />
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
