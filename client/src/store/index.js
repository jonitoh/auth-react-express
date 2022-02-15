/*
Global state management in the application.
*/
import create from "zustand";
import themeSlice from "./theme.slice";

export const useStore = create((set, get) => ({
  ...themeSlice(set, get),
}));
