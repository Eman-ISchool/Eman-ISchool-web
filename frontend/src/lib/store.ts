import { create } from 'zustand';
import type { GuestSession, DrinkType } from '../../../shared/types';
import { getStoredToken, storeToken, clearStoredToken } from '../services/api';

// ─── Session Store ──────────────────────────────────────────────

interface SessionState {
  session: GuestSession | null;
  token: string | null;
  drinkType: DrinkType | null;
  topic: string | null;
}

interface SessionActions {
  setSession: (session: GuestSession) => void;
  setToken: (token: string) => void;
  setPreferences: (drinkType: DrinkType, topic: string) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>((set) => ({
  // ─── State ──────────────────────────────────────────────────
  session: null,
  token: null,
  drinkType: null,
  topic: null,

  // ─── Actions ────────────────────────────────────────────────
  setSession: (session) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('coffee_session', JSON.stringify(session));
    }
    set({ session });
  },

  setToken: (token) => {
    storeToken(token);
    set({ token });
  },

  setPreferences: (drinkType, topic) => set({ drinkType, topic }),

  clearSession: () => {
    clearStoredToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('coffee_session');
    }
    set({ session: null, token: null, drinkType: null, topic: null });
  },

  hydrate: () => {
    const token = getStoredToken();
    if (token) {
      set({ token });
    }
    // Restore session object if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('coffee_session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          set({ session });
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  },
}));
