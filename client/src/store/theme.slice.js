/*
State management for theming in the application.
*/
import { themes } from "../theme";
import { useAdvancedLocalStorage } from "hooks/useLocalStorage";

export default function themeSlice(set, get) {
  return {
    //states
    themes,
    theme: process.env.THEME || "summer-splash",
    themeTagName: "current-theme",

    //actions
    getChakraTheme: (theme) =>
      get().themes.find(({ name }) => name === theme)?.theme,
    getAllThemesAsLists: () => get().themes.map(({ name }) => name),
    getAllThemesAsOptions: () =>
      get().themes.map(({ name, label }) => ({
        value: name,
        label,
      })),
    updateTheme: (theme) => {
      document.documentElement.setAttribute(get().themeTagName, theme);
      return set({ theme });
    },
    useTheme: () =>
      useAdvancedLocalStorage(
        get().themeTagName,
        get().theme,
        get().updateTheme
      ),
    removeTheme: () => window.localStorage.removeItem(get().themeTagName),
  };
}
