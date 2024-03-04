import en from './en';

let currStringSource = en; // default

/**
 * Localize a string (given a key)
 * in the currently selected language
 * (English by default).
 * @param {string} strKey - the key of the string to localize
 * @returns string - the localized string
 */
export function t(strKey) {
  return currStringSource[strKey];
}
