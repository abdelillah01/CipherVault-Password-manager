import Link from 'next/link';
import { Logo } from '@/components/ui';
import { ArrowLeftIcon } from '@/components/icons';

export const metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col px-4 py-6 sm:px-8">
      <Logo />
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-mono text-xs text-accent">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-fg">Nothing stored at this address.</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          The page you are looking for does not exist, or it was never encrypted in the first place.
        </p>
        <Link href="/" className="btn-secondary mt-8">
          <ArrowLeftIcon />
          Back to home
        </Link>
      </main>
    </div>
  );
}
