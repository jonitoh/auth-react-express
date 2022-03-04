/*
State management for handling data persistence with the middleware persist from zustand in the application.
*/

export default function persistSlice(set, get) {
  return {
    //states
    _hasHydrated: false,
    //actions
    setHasHydrated: (state) => {
      set({
        _hasHydrated: state,
      });
    },
    // partial actions
    _clearPersist: () => set({ _hasHydrated: false }),
    // persist options
    _persistPersist: {
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
    },
  };
}
