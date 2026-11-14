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

export const metadata = {
  title: 'CipherVault — Zero-knowledge password manager',
  description:
    'A password manager that encrypts everything in your browser with AES-256-GCM. The server only ever stores ciphertext.',
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
