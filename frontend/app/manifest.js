export default function manifest() {
  return {
    name: 'CipherVault',
    short_name: 'CipherVault',
    description: 'Zero-knowledge password manager with client-side AES-256-GCM encryption.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#090a0c',
    theme_color: '#090a0c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
