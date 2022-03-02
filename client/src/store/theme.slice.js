/*
State management for theming in the application.
*/
import { themes } from "../theme";

export default function themeSlice(set, get) {
  return {
    //states
    themes,
    theme: process.env.THEME || "summer-splash",
    themeTagName: "current-theme",

    //actions
    getChakraTheme: (theme) =>
      get().themes.find(({ name }) => name === theme)?.theme,
    getThemesAsList: () => get().themes.map(({ name }) => name),
    getThemesAsOptions: () =>
      get().themes.map(({ name, label }) => ({
        value: name,
        label,
      })),
    setTheme: (theme) => get().updateTheme(theme) && set({ theme }),
    updateTheme: (theme) =>
      document.documentElement.setAttribute(get().themeTagName, theme),
    _clearTheme: () => set({ theme: process.env.THEME || "summer-splash" }),
    _initiateTheme: () => null,
    // persist options
    _persistTheme: {
      partialize: (state) => ({ theme: state.theme }),
      merge: (persistedState, currentState) => {
        const { theme } = persistedState;
        currentState.updateTheme(theme);
        return { ...currentState, ...{ theme } };
      },
    },
  };
}
