/*
State management for token persistence in the application mainly ACCESSTOKEN.
*/

export default function tokenSlice(set, get) {
  return {
    //states
    accessToken: "",

    //actions
    setAccessToken: (accessToken) => set({ accessToken }),
    _clearAccessToken: () => set({ accessToken: "" }),
    _initiateAccessToken: () => null,
    // persist options
    _persistToken: {
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
      merge: (persistedState, currentState) => {
        const { accessToken } = persistedState;
        return {
          ...currentState,
          ...{
            accessToken,
          },
        };
      },
    },
  };
}
