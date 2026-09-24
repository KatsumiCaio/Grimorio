export type ThemeMode = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'grimorio_theme_mode';

type ThemeListener = (isDark: boolean, mode: ThemeMode) => void;
const listeners = new Set<ThemeListener>();

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const themeService = {
  getThemeMode(): ThemeMode {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'dark';
  },

  isDark(): boolean {
    const mode = this.getThemeMode();
    if (mode === 'system') {
      return getSystemPrefersDark();
    }
    return mode === 'dark';
  },

  setThemeMode(mode: ThemeMode): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    this.applyTheme(mode);
  },

  toggleTheme(): ThemeMode {
    const currentIsDark = this.isDark();
    const nextMode: ThemeMode = currentIsDark ? 'light' : 'dark';
    this.setThemeMode(nextMode);
    return nextMode;
  },

  applyTheme(mode?: ThemeMode): void {
    if (typeof window === 'undefined') return;
    const currentMode = mode || this.getThemeMode();
    const isDark = currentMode === 'system' ? getSystemPrefersDark() : currentMode === 'dark';

    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    // Update meta theme-color for mobile address bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#09090b' : '#f8fafc');
    }

    // Notify listeners
    listeners.forEach((listener) => {
      try {
        listener(isDark, currentMode);
      } catch (err) {
        console.error('Error in theme listener:', err);
      }
    });
  },

  subscribe(listener: ThemeListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  init(): () => void {
    if (typeof window === 'undefined') return () => {};

    // Apply on startup
    this.applyTheme();

    // Listen for OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (this.getThemeMode() === 'system') {
        this.applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleSystemChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } else {
        mediaQuery.removeListener(handleSystemChange);
      }
    };
  },
};
