/*
Global state management in the application.
*/
import GlobalStore from "./factory";

import themeSlice from "./theme.slice";
import userSlice from "./user.slice";
import tokenSlice from "./token.slice";
import navSlice from "./nav.slice";
import notificationSlice from "./notification.slice";

const globalStore = new GlobalStore({
  slices: [themeSlice, tokenSlice, userSlice, navSlice, notificationSlice],
  sliceOrder: ["theme", "accessToken", "user", "navigation", "notifications"],
  //debugMode: true,
  persistOptions: { name: "auth__local-storage" },
  createPersistOptions: true,
  initiate: function ({ globalStore, store, rehydrate }) {
    console.log("hydratation phase");
    const rehydratePhase =
      globalStore.isPersisting &&
      !store.getState()._hasHydrated &&
      rehydrate &&
      globalStore.isInitialValue();
    if (!rehydratePhase) {
      return;
    }
    store.use.persist.rehydrate();
    store.getState().setHasHydrated(true);
  },
  clear: function ({ store }) {
    store.persist?.clearStorage();
  },
});

export default globalStore;
