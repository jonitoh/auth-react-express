/*
State management for token persistence in the application mainly ACCESSTOKEN.
*/

export default function tokenSlice(set, get) {
  return {
    //states
    accessToken: "",

    //actions
    setAccessToken: (accessToken) => set({ accessToken }),
    // partial actions
    _clearAccessToken: () => set({ accessToken: "" }),
    _isInitialValueAsAccessToken: () => get().accessToken === "",
    // persist options
    _persistToken: {
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
      toMerge: (persistedState, currentState) => {
        const { accessToken } = persistedState;
        return {
          accessToken,
        };
      },
    },
  };
}
