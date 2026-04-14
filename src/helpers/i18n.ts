const t = (key: string): string => key;
const setLanguage = (_lang: string) => {};
const getCurrentLanguagenName = () => 'English';
const languages: Record<string, string> = { en: 'English' };

export default { setLanguage, t, getCurrentLanguagenName, languages };
