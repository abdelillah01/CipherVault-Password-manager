import { create } from 'zustand';

// The derived AES key lives only in memory. A refresh, logout or auto-lock drops it.
export const useAuthStore = create((set) => ({
  user: null,
  masterKey: null,
  salt: null,
  setAuth: (user, key, salt) => set({ user, masterKey: key, salt }),
  clearAuth: () => set({ user: null, masterKey: null, salt: null }),
}));
