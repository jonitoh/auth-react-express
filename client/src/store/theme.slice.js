/*
State management for theming in the application.
*/
import { themes, names } from "../theme";
console.log("thems", themes);

const themeSlice = (set, get) => ({
  //states
  themes,
  theme: process.env.THEME || "summer-splash", //names[0],
  themeTagName: "data-theme",

  //actions
  getChakraTheme: () =>
    get().themes.find(({ name }) => name === get().theme)?.theme,
  getAllThemesAsLists: () => get().themes.map(({ name }) => name),
  getAllThemesAsOptions: () =>
    get().themes.map(({ name, label }) => ({
      value: name,
      label,
    })),
  updateTheme: (theme) => set({ theme }),
  setDocumentTheme: () =>
    document.documentElement.setAttribute(get().themeTagName, get().theme),
  setLocalStorageTheme: () =>
    localStorage.setItem(get().themeTagName, JSON.stringify(get().theme)),
  setTheme: (theme) => {
    get().updateTheme(theme);
    get().setDocumentTheme();
    get().setLocalStorageTheme();
  },
  initiateTheme: () => {
    if (!localStorage.getItem(get().themeTagName)) {
      get().setLocalStorageTheme(get().theme);
    } else {
      get().updateTheme(JSON.parse(localStorage.getItem(get().themeTagName)));
    }
    get().setDocumentTheme();
  },
});

export default themeSlice;
