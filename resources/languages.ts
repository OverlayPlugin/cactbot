export const languages = ['en', 'de', 'fr', 'ja', 'cn', 'tc', 'ko'] as const;

export type Lang = typeof languages[number];

export type NonEnLang = Exclude<Lang, 'en'>;

export const langMap: { [lang in Lang]: { [lang in Lang]: string } } = {
  en: {
    en: 'English',
    de: 'German',
    fr: 'French',
    ja: 'Japanese',
    cn: 'Chinese',
    ko: 'Korean',
    tc: 'Traditional Chinese',
  },
  de: {
    en: 'Englisch',
    de: 'Deutsch',
    fr: 'Französisch',
    ja: 'Japanisch',
    cn: 'Chinesisch',
    ko: 'Koreanisch',
    tc: 'Traditionelles Chinesisch',
  },
  fr: {
    en: 'Anglais',
    de: 'Allemand',
    fr: 'Français',
    ja: 'Japonais',
    cn: 'Chinois',
    ko: 'Coréen',
    tc: 'Chinois traditionnel',
  },
  ja: {
    en: '英語',
    de: 'ドイツ語',
    fr: 'フランス語',
    ja: '日本語',
    cn: '中国語',
    ko: '韓国語',
    tc: '中国語(繁体字)',
  },
  cn: {
    en: '英文',
    de: '德文',
    fr: '法文',
    ja: '日文',
    cn: '中文',
    ko: '韩文',
    tc: '繁体中文',
  },
  ko: {
    en: '영어',
    de: '독일어',
    fr: '프랑스어',
    ja: '일본어',
    cn: '중국어',
    ko: '한국어',
    tc: '중국어(번체)',
  },
  tc: {
    en: '英文',
    de: '德文',
    fr: '法文',
    ja: '日文',
    cn: '中文',
    ko: '韓文',
    tc: '繁體中文',
  },
} as const;

export const isLang = (lang?: string): lang is Lang => {
  const langStrs: readonly string[] = languages;
  if (lang === undefined)
    return false;
  return langStrs.includes(lang);
};

export const langToLocale = (lang: Lang): string => {
  return {
    en: 'en',
    de: 'de',
    fr: 'fr',
    ja: 'ja',
    cn: 'zh-CN',
    ko: 'ko',
    tc: 'zh-TW',
  }[lang];
};

export const browserLanguagesToLang = (languagesArr: readonly string[]): Lang => {
  // languagesArr receives only `navigator.languages` as input
  const mapLanguage = (lang: string): string => {
    // Handle Chinese variants
    if (lang.startsWith('zh-')) {
      const region = lang.slice(3).toUpperCase();
      switch (region) {
        case 'HK':
        case 'MO':
        case 'TW':
        case 'HANT':
          return 'tc';
        default:
          return 'cn';
      }
    }
    return lang.slice(0, 2);
  };
  const lang = [...languagesArr, 'en']
    .map(mapLanguage)
    .filter((l) => languages.includes(l as Lang))[0];
  return isLang(lang) ? lang : 'en';
};
