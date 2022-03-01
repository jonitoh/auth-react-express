/*
Global state management in the application.
*/
import create from "zustand";
import shallow from "zustand/shallow";

import themeSlice from "./theme.slice";
import userSlice from "./user.slice";
import navSlice from "./nav.slice";

export const useStore = create((set, get) => ({
  ...themeSlice(set, get),
  ...userSlice(set, get),
  ...navSlice(set, get),
}));

export function useStoreFromSelector(selector) {
  return useStore(selector, shallow);
}
