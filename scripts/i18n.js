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

        return value || getTranslationsBy()(keyChain) || '';
    };
}


/**
 *
 */
module.exports = {
    getTranslationsBy
};
