/*
State management for user persistence regarding custom choices and authorization in the application.
*/
const capitalize = (string) =>
  string
    .trim()
    .toLowerCase()
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

export default function makeLocalStorageSlice(
  stateName,
  tagName = undefined,
  defaultState = null
) {
  if (typeof stateName !== "string") {
    throw new Error(
      `stateName should be a 'string'. Instead it's a ${typeof stateName}`
    );
  }
  const state = stateName.toLowerCase();
  const _state = capitalize(state);

  const localStorageSlice = (set, get) => ({
    //states
    [state]: defaultState,
    [`${state}TagName`]: tagName || state,

    //actions
    [`update${_state}`]: (item) => set({ [state]: item }),
    [`setDocument${_state}`]: () =>
      document.documentElement.setAttribute(
        get()[`${state}TagName`],
        get()[state]
      ),
    [`setLocalStorage${_state}`]: () =>
      window.localStorage.setItem(
        get()[`${state}TagName`],
        JSON.stringify(get()[state])
      ),
    [`set${_state}`]: (item) => {
      get()[`update${_state}`](item);
      get()[`setDocument${_state}`]();
      get()[`setLocalStorage${_state}`]();
    },
    [`initiate${_state}`]: () => {
      if (!window.localStorage.getItem(get()[`${state}TagName`])) {
        get()[`setLocalStorage${_state}`](get()[state]);
      } else {
        get()[`update${_state}`](
          JSON.parse(window.localStorage.getItem(get()[`${state}TagName`]))
        );
      }
      get()[`setDocument${_state}`]();
    },
  });
  return localStorageSlice;
}
