/*
Class handling global state management in the application.
*/
import create from "zustand";
import shallow from "zustand/shallow";
import { persist } from "zustand/middleware";

import { isEmpty, getFromNestedObject, capitalize } from "utils/function";
import persistSlice from "./persist.slice";

// BIG CONSTANTS
const PERSIST_OPTIONS = {
  name: "default-local-storage",
  getStorage: () => localStorage,
  serialize: (state) => JSON.stringify(state), //: (state: Object) => string | Promise<string>
  deserialize: (str) => JSON.parse(str), // (str: string) => Object | Promise<Object>
  partialize: (state) => state, // (state: Object) => Object
  onRehydrateStorage: (state) => null, //(state) => () => null, //(state: Object) => ((state?: Object, error?: Error) => void) | void
  version: 0, // number
  migrate: (persistedState, version) => persistedState, // (persistedState: Object, version: number) => Object | Promise<Object>
  merge: (persistedState, currentState) => ({
    ...currentState,
    ...persistedState,
  }), // (persistedState: Object, currentState: Object) => Object
};

const ADVANCED_PERSIST_OPTIONS = [
  {
    key: "partialize",
    format: (s) => `_persist${capitalize(s)}.partialize`,
    wrapper: (funcs) => (state) =>
      funcs
        .map((f) => f(state))
        .reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            ...currentValue,
          }),
          {}
        ),
  },
  {
    key: "migrate",
    format: (s) => `_persist${capitalize(s)}.migrate`,
    wrapper: (funcs) => (persistedState, version) =>
      funcs
        .map((f) => f(persistedState, version))
        .reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            ...currentValue,
          }),
          {}
        ),
  },
  {
    key: "merge",
    format: (s) => `_persist${capitalize(s)}.toMerge`,
    wrapper: (funcs) => (persistedState, currentState) => {
      if (isEmpty(persistedState)) {
        console.log("no storage");
        return { ...currentState, ...persistedState };
      }
      return {
        ...currentState,
        ...funcs
          .map((f) => f(persistedState, currentState))
          .reduce(
            (previousValue, currentValue) => ({
              ...previousValue,
              ...currentValue,
            }),
            {}
          ),
      };
    },
  },
  {
    key: "onRehydrateStorage",
    format: (s) => `_persist${capitalize(s)}.onRehydrateStorage`,
    wrapper: (state, sliceOrder, keyFormatter) => () =>
      executeFunctionsFromOrder(state, sliceOrder, keyFormatter, null, null)(),
  },
];

const createMainSlice = function (slices) {
  return (set, get) =>
    slices
      .map((slice) => slice(set, get))
      .reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          ...currentValue,
        }),
        {}
      );
};

const extractAuxiliaryFunctions = function (arg) {
  let first;
  let last;

  if (arg instanceof Function) {
    last = arg;
  }

  if (arg && arg.length && arg.length === 2) {
    first = arg[0];
    last = arg[1];
  }

  if ("first" in arg || "last" in arg) {
    first = arg.first;
    last = arg.last;
  }
  return [first, last];
};

const getFunctionsFromState = function (state, sliceOrder, keyFormatter) {
  // create list of functions
  return sliceOrder
    .map((key) => getFromNestedObject(state, keyFormatter(key)))
    .map((l) => (l.length > 0 ? l[0] : undefined))
    .filter((f) => f instanceof Function);
};

const executeFunctionsFromOrder = function (
  globalStore,
  state,
  sliceOrder,
  keyFormatter,
  firstFunction,
  lastFunction
) {
  // create list of functions
  const functions = getFunctionsFromState(state, sliceOrder, keyFormatter);

  return (args) => {
    // execute list of function
    if (firstFunction instanceof Function) {
      firstFunction({ ...args, state, globalStore });
    }
    for (let index = 0; index < functions.length; index++) {
      functions[index]();
    }
    if (lastFunction instanceof Function) {
      lastFunction({ ...args, state, globalStore });
    }
  };
};

export default class GlobalStore {
  constructor({
    slices,
    sliceOrder,
    debugMode = true,
    persistOptions = {},
    createPersistOptions = false,
    initiate = (store, hydrate) => null,
    clear = (store) => null,
  }) {
    // check if we must use the middleware persist
    const isPersisting = !isEmpty(persistOptions) || createPersistOptions;
    this.isPersisting = isPersisting;

    // create globalSlice;
    if (isPersisting) {
      slices = slices.concat([persistSlice]);
      sliceOrder = sliceOrder.concat(["persist"]);
    }
    const globalSlice = createMainSlice(slices);

    // create store;
    const store = isPersisting
      ? create(persist(globalSlice, {}))
      : create(globalSlice);

    const state = store.getState();
    //console.log("@@@@@state", state);

    console.log("@@@@@ global initial");
    // create _globalInitiate //initiate: ({rehydrate}) => initiate({store, rehydrate})
    const initiateKeyFormatter = (key) => `_initiate${capitalize(key)}`;
    const [initiateFirstFunction, initiateLastFunction] =
      extractAuxiliaryFunctions(initiate);
    this._globalInitiate = executeFunctionsFromOrder(
      this,
      state,
      sliceOrder,
      initiateKeyFormatter,
      initiateFirstFunction,
      initiateLastFunction
    );
    //console.log("@@@@@this._globalInitiate", this._globalInitiate);

    console.log("@@@@@ global clear");
    // create _globalClear //clear: () => clear({store})
    const clearKeyFormatter = (key) => `_clear${capitalize(key)}`;
    const [clearFirstFunction, clearLastFunction] =
      extractAuxiliaryFunctions(clear);
    this._globalClear = executeFunctionsFromOrder(
      this,
      state,
      sliceOrder,
      clearKeyFormatter,
      clearFirstFunction,
      clearLastFunction
    );
    //console.log("@@@@@this._globalClear", this._globalClear);

    console.log("@@@@@ global isinitialvalue fake");
    // create method linked to persisting functionalities
    let isInitialValue = () => false;
    if (isPersisting) {
      // create isInitialValue _isInitialValueAs
      const isInitialValueKeyFormatter = (key) =>
        `_isInitialValueAs${capitalize(key)}`;
      console.log("@@@@@ ++ global isinitialvalue fake");
      isInitialValue = executeFunctionsFromOrder(
        this,
        state,
        sliceOrder,
        isInitialValueKeyFormatter,
        null,
        null
      );

      // create the advancedPersistOptions
      let advancedPersistOptions = {};
      if (createPersistOptions) {
        for (let index = 0; index < ADVANCED_PERSIST_OPTIONS.length; index++) {
          const { key, format, wrapper } = ADVANCED_PERSIST_OPTIONS[index];
          let func = undefined;
          if (key === "onRehydrateStorage") {
            func = wrapper(state, sliceOrder, format);
          } else {
            const funcs = getFunctionsFromState(state, sliceOrder, format);
            func = wrapper(funcs);
          }

          advancedPersistOptions[key] = func;
        }
      }
      store.persist.setOptions({
        ...PERSIST_OPTIONS,
        ...advancedPersistOptions,
        ...persistOptions,
      });
    }

    this.isInitialValue = isInitialValue;
    //console.log("@@@@@this.isInitialValue", this.isInitialValue);
    this.use = store;
    //console.log("@@@@@this.use", this.use);
  }

  initiate(rehydrate) {
    this._globalInitiate({ rehydrate });
  }

  clear() {
    this._globalClear();
  }

  fromSelector(selector) {
    return this.use(selector, shallow);
  }
}
