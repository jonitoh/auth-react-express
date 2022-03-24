/*
State management for theming in the application.
*/
import { themes, Theme } from '../theme';
import { StoreFromSlice, PersistOptionsSlice } from '../utils/store';

export interface ThemeSlice {
  // states
  themes: Theme[];
  theme: string;
  themeTagName: string;

  // actions
  getChakraTheme: (theme: string) => Theme['theme'] | undefined;
  getThemesAsList: () => string[];
  getThemesAsOptions: () => { value: string; label: string }[];
  setTheme: (theme: string) => void;
  updateTheme: (theme: string) => void;
  // partial actions
  _clearTheme: () => void;
  _isInitialValueAsTheme: () => boolean;
  // persist options
  _persistTheme: PersistOptionsSlice<ThemeSlice, PersistedThemeSlice>;
}

interface PersistedThemeSlice {
  // states
  theme: string;
}

export default function createThemeSlice<IStore extends ThemeSlice = ThemeSlice>(
  ...[set, get]: Parameters<StoreFromSlice<IStore, ThemeSlice>>
): ReturnType<StoreFromSlice<IStore, ThemeSlice>> {
  return {
    // states
    themes,
    theme: process.env.THEME || 'summer-splash',
    themeTagName: 'current-theme',

    // actions
    getChakraTheme: (theme: string) =>
      (get().themes as Theme[]).find(({ name }) => name === theme)?.theme,
    getThemesAsList: () => (get().themes as Theme[]).map(({ name }) => name),
    getThemesAsOptions: () =>
      (get().themes as Theme[]).map(({ name, label }) => ({
        value: name,
        label,
      })),
    setTheme: (theme: string) => {
      get().updateTheme(theme);
      set({ theme });
    },
    updateTheme: (theme: string) =>
      document.documentElement.setAttribute(get().themeTagName, theme),
    // partial actions
    _clearTheme: () => set({ theme: process.env.THEME || 'summer-splash' }),
    _isInitialValueAsTheme: () => get().theme === (process.env.THEME || 'summer-splash'),
    // persist options
    _persistTheme: {
      partialize: (state: ThemeSlice) => ({ theme: state.theme }),
      toMerge: (persistedState: PersistedThemeSlice, currentState: ThemeSlice) => {
        const { theme } = persistedState;
        currentState.updateTheme(theme);
        return { theme };
      },
    },
  };
}
