// Password strength scoring and secure generation (client-side only).

const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';

/**
 * Score a password as 'weak' | 'medium' | 'strong' ('' when empty).
 * Length dominates; character variety adds on top.
 */
export function getStrength(password) {
  if (!password) return '';
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (password.length < 8 || variety <= 1) return 'weak';
  if (password.length < 12 && variety <= 2) return 'weak';
  if (password.length >= 12 && variety >= 3) return 'strong';
  if (password.length >= 16 && variety >= 2) return 'strong';
  return 'medium';
}

export const STRENGTH_META = {
  weak: { label: 'Weak', bars: 1, text: 'text-danger', fill: 'bg-danger' },
  medium: { label: 'Fair', bars: 2, text: 'text-warn', fill: 'bg-warn' },
  strong: { label: 'Strong', bars: 3, text: 'text-accent', fill: 'bg-accent' },
};

/** Uniform random integer in [0, max) using rejection sampling over crypto.getRandomValues. */
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

/**
 * Generate a password with a CSPRNG. Guarantees at least one character
 * from each enabled class, then shuffles (Fisher–Yates).
 */
export function generatePassword({ length = 20, lower = true, upper = true, digits = true, symbols = true } = {}) {
  const sets = [
    lower && 'abcdefghijkmnopqrstuvwxyz',
    upper && 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    digits && '23456789',
    symbols && SYMBOLS,
  ].filter(Boolean);
  if (sets.length === 0) return '';

  const all = sets.join('');
  const chars = sets.map((s) => s[randomInt(s.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, length).join('');
}
