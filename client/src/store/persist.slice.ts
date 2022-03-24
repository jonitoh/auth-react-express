/*
State management for handling data persistence with the middleware persist from zustand in the application.
*/
import { StoreFromSlice, PersistOptionsSlice } from '../utils/store';

export interface PersistSlice {
  // states
  _hasHydrated: boolean;
  // actions
  setHasHydrated: (state: boolean) => void;
  // partial actions
  _clearPersist: () => void;
  // persist options
  _persistPersist: PersistOptionsSlice<PersistSlice>;
}

export default function createPersistSlice<IStore extends PersistSlice = PersistSlice>(
  ...[set]: Parameters<StoreFromSlice<IStore, PersistSlice>>
): ReturnType<StoreFromSlice<IStore, PersistSlice>> {
  return {
    // states
    _hasHydrated: false,
    // actions
    setHasHydrated: (state: boolean) => {
      set({
        _hasHydrated: state,
      });
    },
    // partial actions
    _clearPersist: () => set({ _hasHydrated: false }),
    // persist options
    _persistPersist: {
      onRehydrateStorage: () => (state, error) => state?.setHasHydrated(true),
    },
  };
}
