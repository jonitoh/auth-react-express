import { GetState, Mutate, StateCreator, StoreApi, SetState } from 'zustand';

// persist options slice
interface PersistOptionsSlice<StateType = Object, PersistedType = Object> {
  serialize?: (state: StateType) => string | Promise<string>;
  deserialize?: (str: string) => Object | Promise<Object>;
  partialize?: (state: StateType) => Object;
  // eslint-disable-next-line no-shadow
  onRehydrateStorage?: (state: StateType) => ((state?: StateType, error?: Error) => void) | void;
  migrate?: (persistedState: PersistedType, version: number) => Object | Promise<Object>;
  merge?: (persistedState: PersistedType, currentState: StateType) => Object;
  toMerge?: (persistedState: PersistedType, currentState: StateType) => Object;
}

// cf. https://2ality.com/2020/04/typing-functions-typescript.html#checking-function-declarations-(extravagant)
type StoreFromSlice<IStore extends Object, Slice> = (
  set: SetState<IStore>, // NamedSet<IStore>,
  get: GetState<IStore>,
  api: StoreApi<IStore>
) => Slice;

type PersistStoreApi<IStore extends Object> = Mutate<
  StoreApi<IStore>,
  [['zustand/persist', Partial<IStore>]]
>;

type PersistStateCreator<IStore extends Object> = StateCreator<
  IStore,
  SetState<IStore>,
  GetState<IStore>,
  PersistStoreApi<IStore> | PersistStoreApi<IStore>
>;

export { PersistOptionsSlice, StoreFromSlice, PersistStoreApi, PersistStateCreator };
