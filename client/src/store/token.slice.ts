/*
State management for token persistence in the application mainly ACCESSTOKEN.
*/
import { StoreFromSlice, PersistOptionsSlice } from '../utils/store';

export interface TokenSlice {
  // states
  accessToken: string;

  // actions
  setAccessToken: (accessToken: string) => void;
  // partial actions
  _clearAccessToken: () => void;
  _isInitialValueAsAccessToken: () => boolean;
  // persist options
  _persistToken: PersistOptionsSlice<TokenSlice, PersistedTokenSlice>;
}

interface PersistedTokenSlice {
  // states
  accessToken: string;
}

export default function createTokenSlice<IStore extends TokenSlice = TokenSlice>(
  ...[set, get]: Parameters<StoreFromSlice<IStore, TokenSlice>>
): ReturnType<StoreFromSlice<IStore, TokenSlice>> {
  return {
    // states
    accessToken: '',

    // actions
    setAccessToken: (accessToken: string) => set({ accessToken }),
    // partial actions
    _clearAccessToken: () => set({ accessToken: '' }),
    _isInitialValueAsAccessToken: () => get().accessToken === '',
    // persist options
    _persistToken: {
      partialize: (state: TokenSlice) => ({
        accessToken: state.accessToken,
      }),
      toMerge: (persistedState: PersistedTokenSlice, currentState: TokenSlice) => {
        const { accessToken } = persistedState;
        return {
          accessToken,
        };
      },
    },
  };
}
