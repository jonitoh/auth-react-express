import { useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const [value, _setValue] = useState(() => {
    if (typeof window !== "undefined") {
      const savedValue = JSON.parse(window.localStorage.getItem(key));
      return savedValue || initialValue;
    }
    return initialValue;
  });

  const setValue = (v) => {
    const newValue = v instanceof Function ? v(value) : v;
    _setValue(newValue);
    if (typeof window !== undefined) {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, setValue];
}

export function useAdvancedLocalStorage(
  key,
  initialValue,
  updateValue = (value) => null,
  updateValueAtInitial = (value) => null
) {
  // initial state implementation
  const [storedValue, _setStoredValue] = useState(() => {
    let chosenValue = initialValue;
    // is there a storage ?
    if (typeof window !== "undefined") {
      try {
        const savedValue = JSON.parse(window.localStorage.getItem(key));
        chosenValue = savedValue || chosenValue;
      } catch (error) {
        console.log(error);
      }
      updateValueAtInitial(chosenValue);
      return chosenValue;
    }
  });

  // Wrapped setter with upadte functionalities added.
  const setStoredValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      _setStoredValue(valueToStore);
      // Save to our global store
      updateValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setStoredValue];
}
