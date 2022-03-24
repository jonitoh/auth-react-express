/*
Global state management in the application.
*/
import GlobalStore from './factory';

import createThemeSlice, { ThemeSlice } from './theme.slice';
import createUserSlice, { UserSlice } from './user.slice';
import createTokenSlice, { TokenSlice } from './token.slice';
import createNavSlice, { NavSlice } from './nav.slice';
import createNotificationSlice, { NotificationSlice } from './notification.slice';
import { PersistSlice } from './persist.slice';

export interface GlobalState
  extends ThemeSlice,
    TokenSlice,
    UserSlice,
    NavSlice,
    NotificationSlice,
    PersistSlice {}

const globalStore = new GlobalStore<GlobalState>({
  slicesCreator: [
    createThemeSlice,
    createTokenSlice,
    createUserSlice,
    createNavSlice,
    createNotificationSlice,
  ],
  slicesOrder: ['theme', 'accessToken', 'user', 'navigation', 'notifications'],
  optionsToPersist: { name: 'auth__local-storage' },
  mustPersist: true,
  // eslint-disable-next-line no-shadow
  initiate({ globalStore, hydrate }): void {
    console.info('hydratation phase');
    const rehydratePhase =
      globalStore.isPersisting &&
      !globalStore.use.getState()._hasHydrated &&
      hydrate &&
      globalStore.isInitialValue();
    if (!rehydratePhase) {
      return;
    }
    globalStore.persist.rehydrate();
    globalStore.use.getState().setHasHydrated(true);
  },
  // eslint-disable-next-line no-shadow
  clear({ globalStore }) {
    globalStore.persist?.clearStorage();
  },
});

export default globalStore;
