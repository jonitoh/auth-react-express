import { useState } from 'react';

export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, _setValue] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const unparsedValue: string | null = window.localStorage.getItem(key);
      if (unparsedValue === null) {
        return initialValue;
      }
      return JSON.parse(unparsedValue) || initialValue;
    }
    return initialValue;
  });

  const setValue = (v: unknown) => {
    const newValue = v instanceof Function ? v(value) : v;
    _setValue(newValue);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, setValue];
}

export function useAdvancedLocalStorage<T>(
  key: string,
  initialValue: T,
  updateValue = function (value: T) {},
  updateValueAtInitial = function (value: T) {}
) {
  // initial state implementation
  const [storedValue, _setStoredValue] = useState<T>(() => {
    let chosenValue = initialValue;
    // is there a storage ?
    if (typeof window !== 'undefined') {
      try {
        const unparsedValue: string | null = window.localStorage.getItem(key);
        if (unparsedValue === null) {
          chosenValue = initialValue;
        } else {
          chosenValue = JSON.parse(unparsedValue) || chosenValue;
        }
      } catch (error) {
        console.error(error);
      }
      updateValueAtInitial(chosenValue);
    }
    return chosenValue;
  });

  // Wrapped setter with upadte functionalities added.
  const setStoredValue = (value: unknown) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      _setStoredValue(valueToStore);
      // Save to our global store
      updateValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setStoredValue];
}
