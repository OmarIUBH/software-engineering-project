import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationDE from './locales/de/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
    en: {
        translation: translationEN
    },
    de: {
        translation: translationDE
    },
    ar: {
        translation: translationAR
    }
};

i18n
    // detect user language
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,
        
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        }
    });

// Handle RTL direction switching for HTML document globally
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = i18n.dir(lng);
    document.documentElement.lang = lng;
});

// Set initial direction based on detected language
document.documentElement.dir = i18n.dir();

export default i18n;
