/*
State management for navigation persistence in the application.
*/
import { StoreFromSlice } from '../utils/store';

export interface NavSlice {
  // states
  section: string;
  // actions
  setSection: (section: string) => void;
  isSectionActive: (section: string) => boolean;
}

export default function createNavSlice<IStore extends NavSlice = NavSlice>(
  ...[set, get]: Parameters<StoreFromSlice<IStore, NavSlice>>
): ReturnType<StoreFromSlice<IStore, NavSlice>> {
  return {
    // states
    section: 'calendar', // "/",

    // actions
    setSection: (section: string) => set({ section }),
    isSectionActive: (section: string) => section === get().section,
  };
}
