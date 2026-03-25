'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallContextValue {
  /** Whether the browser has fired `beforeinstallprompt` and the app is installable */
  canInstall: boolean;
  /** Whether the app is already running in standalone / installed mode */
  isInstalled: boolean;
  /** Whether the user has dismissed the install banner this session (persisted in localStorage) */
  isDismissed: boolean;
  /** Trigger the native install prompt. Returns true if user accepted. */
  promptInstall: () => Promise<boolean>;
  /** Dismiss the install banner and persist the preference */
  dismissBanner: () => void;
}

const DISMISS_KEY = 'pwa-install-banner-dismissed';

const PwaInstallContext = createContext<PwaInstallContextValue>({
  canInstall: false,
  isInstalled: false,
  isDismissed: false,
  promptInstall: async () => false,
  dismissBanner: () => {},
});

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check installed / standalone state on mount
  useEffect(() => {
    // Check standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(isStandalone);

    // Check persisted dismiss state
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // localStorage not available
    }

    // Listen for display-mode changes (user installs via browser UI)
    const mql = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mql.addEventListener('change', handleChange);

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const installHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch {
      // prompt() can throw if already called
    }

    return false;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // localStorage not available
    }
  }, []);

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      canInstall: deferredPrompt !== null,
      isInstalled,
      isDismissed,
      promptInstall,
      dismissBanner,
    }),
    [deferredPrompt, isInstalled, isDismissed, promptInstall, dismissBanner],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  return useContext(PwaInstallContext);
}
