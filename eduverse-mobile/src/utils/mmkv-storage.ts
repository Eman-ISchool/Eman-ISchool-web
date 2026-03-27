import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkvStorage = createMMKV({ id: 'eduverse-store' });

export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string) => {
    mmkvStorage.remove(name);
  },
};
