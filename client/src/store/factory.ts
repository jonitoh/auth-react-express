/*
Class handling global state management in the application.
*/
import create, { UseBoundStore, SetState, GetState, StoreApi, StateSelector } from 'zustand';
import shallow from 'zustand/shallow';
import { persist, PersistOptions } from 'zustand/middleware';
import createPersistSlice from './persist.slice';
import { isEmpty, getFromNestedObject, capitalize } from '../utils/main';
import { StoreFromSlice, PersistStoreApi, PersistStateCreator } from '../utils/store';

type CustomPersistOptions<S extends Object, PersistedState extends Partial<S> = Partial<S>> = {
  name: string;
  getStorage: () => typeof localStorage;
  serialize: (state: S) => string | Promise<string>;
  deserialize: (str: string) => PersistedState | Promise<PersistedState>;
  partialize: (state: S) => Object;
  // eslint-disable-next-line no-shadow
  onRehydrateStorage: (state: S) => ((state?: S, error?: Error) => void) | void;
  version: number;
  migrate: (persistedState: any, version: number) => S | Promise<S>;
  merge: (persistedState: any, currentState: S) => S;
};

function generateDefaultPersistOptions<
  S extends Object,
  PersistedState extends Partial<S> = Partial<S>
>(): Partial<CustomPersistOptions<S, PersistedState>> {
  return {
    getStorage: () => localStorage,
    serialize: (state) => JSON.stringify(state),
    deserialize: (str) => JSON.parse(str),
    partialize: (state) => state,
    onRehydrateStorage(state) {},
    version: 0,
    migrate: (persistedState, version) => persistedState,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState,
    }),
  };
}

type AdvancedOption = {
  key: string;
  format: (s: string) => string;
  wrapper: Function;
};

const ADVANCED_PERSIST_OPTIONS: AdvancedOption[] = [
  {
    key: 'partialize',
    format: (s) => `_persist${capitalize(s)}.partialize`,
    wrapper: (funcs: Function[]) => (state: Object) =>
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
    key: 'migrate',
    format: (s) => `_persist${capitalize(s)}.migrate`,
    wrapper: (funcs: Function[]) => (persistedState: Object, version: number) =>
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
    key: 'merge',
    format: (s) => `_persist${capitalize(s)}.toMerge`,
    wrapper: (funcs: Function[]) => (persistedState: Object, currentState: Object) => {
      if (isEmpty(persistedState)) {
        console.info('no storage');
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
    key: 'onRehydrateStorage',
    format: (s) => `_persist${capitalize(s)}.onRehydrateStorage`,
    wrapper:
      (
        globalStore: Object,
        state: Object,
        sliceOrder: string[],
        keyFormatter: (s: string) => string
      ) =>
      () =>
        executeFunctionsFromOrder(globalStore, state, sliceOrder, keyFormatter, null, null)({}),
  },
];

function createUnifiedSlice<IStore>(slices: Function[]): StoreFromSlice<IStore, IStore> {
  return (set, get, api) =>
    slices
      .map((createSlice) => createSlice(set, get, api))
      .reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          ...currentValue,
        }),
        {}
      );
}

function extractAuxiliaryFunctions(
  arg: Function | Function[] | { first: Function; last: Function }
): (undefined | Function)[] {
  let first: undefined | Function;
  let last: undefined | Function;

  if (arg instanceof Function) {
    last = arg;
  }

  if (arg instanceof Array && arg.length && arg.length === 2) {
    [first, last] = arg;
  }

  if ('first' in arg || 'last' in arg) {
    first = arg.first;
    last = arg.last;
  }
  return [first, last];
}

function getFunctionsFromState(
  state: Object,
  sliceOrder: string[],
  keyFormatter: (s: string) => string
): Function[] {
  // create list of functions
  return sliceOrder
    .map((key) => getFromNestedObject(state, keyFormatter(key)))
    .map((l) => (l.length > 0 ? l[0] : undefined))
    .filter((f) => f instanceof Function)
    .map((f) => f as Function); // added only for typing purpose
}

function executeFunctionsFromOrder(
  globalStore: Object,
  state: Object,
  sliceOrder: string[],
  keyFormatter: (s: string) => string,
  firstFunction: unknown,
  lastFunction: unknown
) {
  // create list of functions
  const functions: Function[] = getFunctionsFromState(state, sliceOrder, keyFormatter);

  return (args: Object) => {
    // execute list of function
    if (firstFunction instanceof Function) {
      firstFunction({ ...args, state, globalStore });
    }
    for (let index = 0; index < functions.length; index += 1) {
      functions[index]();
    }
    if (lastFunction instanceof Function) {
      lastFunction({ ...args, state, globalStore });
    }
  };
}
interface ArgsType<SType = Object, GSType = Object> {
  store: SType;
  globalStore: GSType;
  [key: string]: any;
}
export default class GlobalStore<StoreType extends Object> {
  private PERSIST_NAME_STORAGE: string = 'default-local-storage';

  public isPersisting: boolean;

  public isInitialValue: () => boolean;

  public use: UseBoundStore<StoreType, StoreApi<StoreType> | PersistStoreApi<StoreType>>;

  private _globalInitiate: (args: Object) => void;

  private _globalClear: (args: Object) => void;

  public constructor({
    slicesCreator,
    slicesOrder,
    optionsToPersist = {},
    mustPersist = false,
    initiate = function genericInitiate({ hydrate, ...rest }) {},
    clear = function genericClear(args) {},
  }: {
    slicesCreator: Function[];
    slicesOrder: string[];
    optionsToPersist: Partial<PersistOptions<StoreType, Partial<StoreType>>>; // { name: PersistOptions['name'] } & Partial<PersistOptions>;
    mustPersist: boolean;
    initiate: (
      args: ArgsType<
        UseBoundStore<StoreType, StoreApi<StoreType> | PersistStoreApi<StoreType>>,
        GlobalStore<StoreType>
      > & { hydrate: boolean }
    ) => void; // TODO: store type
    clear: (
      args: ArgsType<
        UseBoundStore<StoreType, StoreApi<StoreType> | PersistStoreApi<StoreType>>,
        GlobalStore<StoreType>
      >
    ) => void; // TODO: store type
  }) {
    // to avoid confusion in type with isPersisting option
    let store: UseBoundStore<StoreType, StoreApi<StoreType> | PersistStoreApi<StoreType>>;
    let ourSlicesCreator: any[];
    let ourSlicesOrder: string[];

    // check if we must use the middleware persist
    const isPersisting: boolean = !isEmpty(optionsToPersist) || mustPersist;
    this.isPersisting = isPersisting;

    if (isPersisting) {
      ourSlicesCreator = slicesCreator.concat([createPersistSlice]);
      ourSlicesOrder = slicesOrder.concat(['persist']);

      type TypedPersist = (
        config: PersistStateCreator<StoreType>,
        options: PersistOptions<StoreType>
      ) => PersistStateCreator<StoreType>;

      store = create<
        StoreType,
        SetState<StoreType>,
        GetState<StoreType>,
        PersistStoreApi<StoreType>
      >(
        (persist as TypedPersist)(createUnifiedSlice<StoreType>(ourSlicesCreator), {
          name: optionsToPersist.name || this.PERSIST_NAME_STORAGE,
        })
      ); // as UseBoundStore<StoreType, PersistStoreApi<StoreType>>;
    } else {
      ourSlicesCreator = slicesCreator;
      ourSlicesOrder = slicesOrder;
      store = create<StoreType>(createUnifiedSlice<StoreType>(ourSlicesCreator));
    }

    // establish our use property
    this.use = store;
    const state = store.getState();

    // create _globalInitiate
    const initiateKeyFormatter = (key: string) => `_initiate${capitalize(key)}`;
    // Reminder: initiate: ({rehydrate}) => initiate({store, rehydrate})
    const [initiateFirstFunction, initiateLastFunction] = extractAuxiliaryFunctions(initiate);
    this._globalInitiate = executeFunctionsFromOrder(
      this,
      state,
      ourSlicesOrder,
      initiateKeyFormatter,
      initiateFirstFunction,
      initiateLastFunction
    );

    // create _globalClear
    const clearKeyFormatter = (key: string) => `_clear${capitalize(key)}`;
    // Reminder: clear: () => clear({store})
    const [clearFirstFunction, clearLastFunction] = extractAuxiliaryFunctions(clear);
    this._globalClear = executeFunctionsFromOrder(
      this,
      state,
      ourSlicesOrder,
      clearKeyFormatter,
      clearFirstFunction,
      clearLastFunction
    );

    // create method linked to persisting functionalities
    let isInitialValue = () => false;
    if (isPersisting) {
      // create isInitialValue _isInitialValueAs
      const isInitialValueKeyFormatter = (key: string) => `_isInitialValueAs${capitalize(key)}`;
      const isInitialValueFuncs = getFunctionsFromState(
        state,
        ourSlicesOrder,
        isInitialValueKeyFormatter
      );
      isInitialValue = () => isInitialValueFuncs.every((f) => f() === true);

      // create the advancedPersistOptions
      const advancedPersistOptions: Record<string, Function> = {};
      if (mustPersist) {
        for (let index = 0; index < ADVANCED_PERSIST_OPTIONS.length; index += 1) {
          const { key, format, wrapper } = ADVANCED_PERSIST_OPTIONS[index];
          let func: Function;
          if (key === 'onRehydrateStorage') {
            func = wrapper(state, ourSlicesOrder, format);
          } else {
            const funcs = getFunctionsFromState(state, ourSlicesOrder, format);
            func = wrapper(funcs);
          }
          advancedPersistOptions[key] = func;
        }
      }
      const persistOptions: PersistOptions<StoreType, Partial<StoreType>> = {
        ...(generateDefaultPersistOptions<StoreType>() as unknown as PersistOptions<
          StoreType,
          Partial<StoreType>
        >),
        ...(advancedPersistOptions as Omit<PersistOptions<StoreType, Partial<StoreType>>, 'name'>),
        ...optionsToPersist,
      };

      this.persist.setOptions(
        // eslint-disable-next-line no-undef
        persistOptions as unknown as Parameters<typeof this.persist.setOptions>[0]
      );
    }

    this.isInitialValue = isInitialValue;
  }

  public get persist() {
    if (this.isPersisting) {
      return (this.use as UseBoundStore<StoreType, PersistStoreApi<StoreType>>).persist;
    }
    throw new Error("No functionality named 'persist'");
  }

  public initiate(rehydrate: boolean) {
    this._globalInitiate({ rehydrate });
  }

  public clear() {
    this._globalClear({});
  }

  public fromSelector<U>(selector: StateSelector<StoreType, U>): U {
    return this.use(selector, shallow);
  }
}
