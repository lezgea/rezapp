import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import es from './es';
import ru from './ru';

const LANGUAGES = [
  {id:'en', name:'English', src:en},
  {id:'es', name:'Español', src:es},
  {id:'ru', name:'Русский', src:ru},
];

const LANGS_BY_ID = {};
for (const lang of LANGUAGES) {
  LANGS_BY_ID[lang.id] = lang;
}

let currLangId = 'en'; // TODO: read from system or storage

loadLangFromStorage();

async function loadLangFromStorage() {
  const langId = await AsyncStorage.getItem('lang');
  return switchToLang(langId);
}

/**
 * Localize a string (given a key)
 * in the currently selected language
 * (English by default).
 * @param {string} strKey - the key of the string to localize
 * @returns string - the localized string
 */
export function t(strKey) {
  const src = LANGS_BY_ID[currLangId].src;
  return src[strKey];
}

export function* getSupportedLanguages() {
  for (const {id, name} of LANGUAGES) {
    yield {id, name};
  }
}

export function getCurrentLangId() {
  return currLangId;
}

export function switchToLang(langId) {
  if (langId in LANGS_BY_ID) {
    currLangId = langId;
    AsyncStorage.setItem('lang', langId); // no need to await
    return true;
  }

  return false;
}
