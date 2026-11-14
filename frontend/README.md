# CipherVault — frontend

Next.js 14 (App Router) client for CipherVault. All encryption and decryption happens here, in the browser; the Django API only ever receives ciphertext. See the [root README](../README.md) for the full project overview and security model.

## Run

```bash
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

The Django API must be running on `http://localhost:8000` (see the root README).

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Base URL of the Django API |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Absolute URL used for Open Graph and Twitter preview images |

Put overrides in `.env.local`.

## Layout

```
app/
  layout.js            fonts, metadata, theme colour
  page.js              landing page
  login/  register/    auth pages
  dashboard/           vault: data loading, filtering, shortcuts, auto-lock
  not-found.js         404 page
  manifest.js          web app manifest
  icon.svg  favicon.ico  apple-icon.png  opengraph-image.png  twitter-image.png
components/
  vault/               Sidebar, EntryList, EntryDetail, EntryEditor
  AuthShell.js         shared auth layout and form fields
  ui.js                logo, dialog, toast, strength meter, monogram, spinner
  icons.js             stroke icon set
lib/
  crypto.js            PBKDF2 key derivation, AES-256-GCM encrypt/decrypt
  password.js          strength scoring and CSPRNG password generator
  api.js               axios instance and error helper
  store.js             in-memory auth store (Zustand)
public/icons/          manifest icons (192, 512, maskable)
```

## Design tokens

Colours are defined once as RGB triplets in `app/globals.css` and exposed to Tailwind in `tailwind.config.js` (`bg`, `surface`, `raised`, `line`, `fg`, `muted`, `faint`, `accent`, `danger`, `warn`), so opacity modifiers like `bg-accent/10` work. The UI is dark only.
