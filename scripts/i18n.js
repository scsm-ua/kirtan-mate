const { isObject } = require('./ioHelpers');
const translations = require('../src/translations.json');

const DEFAULT_LANGUAGE = 'en';

/**
 *
 */
function getLanguageSet(language = '') {
    const lang = language.slice(0, 2);
    return translations[lang] || translations[DEFAULT_LANGUAGE];
}

function getLanguageSetNotDefault(language) {
    const lang = language.slice(0, 2);
    return translations[lang];
}


/**
 *
 */
function getTranslationsBy(lang) {
    return function (keyChain) {
        const keys = keyChain.split('.');
        let value = getLanguageSet(lang);

        keys.forEach((k) =>
            value = isObject(value) ? value[k] : (value || '')
        );

        return value || (lang && getTranslationsBy()(keyChain)) || '';
    };
}

function getTranslationOrigin(lang, text) {
    let data = getLanguageSetNotDefault(lang);
    if (data?.i18n) {
        for (const [key, value] of Object.entries(data.i18n)) {
            if (value === text) {
                return key;
            }
        }
    }
}

function getStrictTranslation(lang, text) {
    let data = getLanguageSetNotDefault(lang);
    return data?.i18n && data.i18n[text] || text;
}

function isDefaultLanguage(language) {
    const lang = language.slice(0, 2);
    return lang === DEFAULT_LANGUAGE;
}

/**
 *
 */
module.exports = {
    getTranslationsBy,
    getTranslationOrigin: getTranslationOrigin,
    getStrictTranslation: getStrictTranslation,
    isDefaultLanguage: isDefaultLanguage
};
