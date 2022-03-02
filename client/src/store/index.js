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

/* Find a way to create a factory -- createStore -- */
const mainSlice = (set, get) => ({
  ...themeSlice(set, get),
  ...tokenSlice(set, get),
  ...userSlice(set, get),
  ...navSlice(set, get),
  ...notificationSlice(set, get),
});

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
      return { ...currentState, ...persistedState };
    }
    return {
      ...currentState._persistTheme.merge(persistedState, currentState),
      ...currentState._persistToken.merge(persistedState, currentState),
      ...currentState._persistUser.merge(persistedState, currentState),
      ...currentState._persistNotification.merge(persistedState, currentState),
    };
  },
};

const initiate = (store) => {
  console.log("start big initialisation");
  store.getState()._initiateNotifications();
  store.getState()._initiateTheme();
  store.getState()._initiateAccessToken();
  store.getState()._initiateUser();
};

const clear = (store) => {
  console.log("start big cleansing");
  store.getState()._clearNotifications();
  store.getState()._clearTheme();
  store.getState()._clearAccessToken();
  store.getState()._clearUser();
  store.persist?.clearStorage();
};

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

export default wrapSlice(mainSlice, persistOptions, initiate, clear);
