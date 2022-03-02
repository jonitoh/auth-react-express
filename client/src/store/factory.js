/*
Global state management in the application.
*/
import create from "zustand";
import shallow from "zustand/shallow";
import { persist } from "zustand/middleware";

import { isEmpty } from "utils/function";

import themeSlice from "./theme.slice";
import userSlice from "./user.slice";
import tokenSlice from "./token.slice";
import navSlice from "./nav.slice";
import notificationSlice from "./notification.slice";
import persistSlice from "./persist.slice";

/* Find a way to create a factory -- createStore -- */
const mainSlice = (set, get) => ({
  ...themeSlice(set, get),
  ...tokenSlice(set, get),
  ...userSlice(set, get),
  ...navSlice(set, get),
  ...notificationSlice(set, get),
  ...persistSlice(set, get),
});
/* list of imports  map to la function  puis reduce pour etre dans le meme object */

/*interface Storage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
}*/

const defaultPersistOptions = {
  name: "",
  getStorage: () => localStorage,
  serialize: (state) => JSON.stringify(state), //: (state: Object) => string | Promise<string>
  deserialize: (str) => JSON.parse(str), // (str: string) => Object | Promise<Object>
  partialize: (state) => state, // (state: Object) => Object
  onRehydrateStorage: (state) => {
    console.log("hydration starts");

    // optional
    return (state, error) => {
      if (error) {
        console.log("an error happened during hydration", error);
      } else {
        console.log("hydration finished");
      }
    };
  }, //(state) => () => null, //(state: Object) => ((state?: Object, error?: Error) => void) | void
  version: 0, // number
  migrate: (persistedState, version) => persistedState, // (persistedState: Object, version: number) => Object | Promise<Object>
  merge: (persistedState, currentState) => ({
    ...currentState,
    ...persistedState,
  }), // (persistedState: Object, currentState: Object) => Object
};

const persistOptions = {
  name: "auth__local-storage",
  partialize: (state) => {
    //console.log("Par-theme?", state._persistTheme.partialize(state));
    return {
      ...state._persistTheme.partialize(state),
      ...state._persistToken.partialize(state),
      ...state._persistUser.partialize(state),
      ...state._persistNotification.partialize(state),
    };
  },
  merge: (persistedState, currentState) => {
    if (isEmpty(persistedState)) {
      console.log("no storage");
      return { ...currentState, ...persistedState };
    }
    console.log("there is a storage");
    console.log("pers", persistedState);
    console.log("curr", currentState);
    console.log("pfff");
    const c1 = currentState._persistTheme.merge(persistedState, currentState);
    console.log("1", c1);
    console.log(
      "2",
      currentState._persistToken.merge(persistedState, currentState)
    );
    console.log(
      "3",
      currentState._persistUser.merge(persistedState, currentState)
    );
    console.log(
      "4",
      currentState._persistNotification.merge(persistedState, currentState)
    );
    const end = {
      ...currentState._persistTheme.merge(persistedState, currentState),
      ...currentState._persistToken.merge(persistedState, currentState),
      ...currentState._persistUser.merge(persistedState, currentState),
      ...currentState._persistNotification.merge(persistedState, currentState),
    };
    console.log("end?", end);
    return end;
  },
  onRehydrateStorage: () => (state) => {
    state.setHasHydrated(true);
  },
};
/* check si il y a une kay _persist et puis du map reduce */

const initiate = (store) => {
  console.log("start big initialisation");
  store.getState()._initiateNotifications();
  store.getState()._initiateTheme();
  store.getState()._initiateAccessToken();
  store.getState()._initiateUser();
};
/* check si il y a une kay _initiate et puis du map reduce */

const clear = (store) => {
  console.log("start big cleansing");
  store.getState()._clearNotifications();
  store.getState()._clearTheme();
  store.getState()._clearAccessToken();
  store.getState()._clearUser();
  store.persist?.clearStorage();
};
/* check si il y a une kay _clear et puis du map reduce */

const wrapSlice = function (
  slice,
  persistOptions = {},
  initiate = (store) => null,
  clear = (store) => null
) {
  const store = isEmpty(persistOptions)
    ? create(slice)
    : create(persist(slice, persistOptions));
  return {
    use: store,
    fromSelector: (selector) => store(selector, shallow),
    initiate: () => initiate(store),
    clear: () => clear(store),
  };
};

const createStore = (slices, debugMode = false) => {
  const store = ((slices) => slices)(slices);
  return wrapSlice(store);
};
export default wrapSlice(mainSlice, persistOptions, initiate, clear);
