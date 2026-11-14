import localFont from 'next/font/local';
import './globals.css';

const sans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
});

const mono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  weight: '100 900',
  display: 'swap',
});

const description =
  'A zero-knowledge password manager. Every secret is encrypted in your browser with AES-256-GCM; the server only stores ciphertext.';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'CipherVault — Zero-knowledge password manager',
    template: '%s · CipherVault',
  },
  description,
  applicationName: 'CipherVault',
  keywords: ['password manager', 'zero-knowledge', 'AES-256-GCM', 'end-to-end encryption', 'Next.js', 'Django'],
  openGraph: {
    type: 'website',
    siteName: 'CipherVault',
    title: 'CipherVault — Zero-knowledge password manager',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CipherVault — Zero-knowledge password manager',
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#090a0c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
