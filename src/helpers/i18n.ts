import i18next from 'i18next';

let currentlang: string = 'en';

const languages: Record<string, string> = {
  en: 'English',
};

i18next.init({
  lng: currentlang,
  fallbackLng: 'en',
  resources: {},
});

const t = (key: string): string => {
  return key;
};

const setLanguage = (lang: string) => {
  currentlang = lang || 'en';
  i18next.changeLanguage(currentlang);
};

const getCurrentLanguagenName = () => {
  return languages[currentlang];
};

export default { setLanguage, t, getCurrentLanguagenName, languages };
