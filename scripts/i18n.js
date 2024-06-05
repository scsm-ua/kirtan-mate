const { getSongbooki18n } = require('./songbookLoader');
const { isObject } = require('./ioHelpers');
const translations = require('../src/translations.json');


const DEFAULT_LANGUAGE = 'en';

/**
 *
 */
function i18n(songbook_id) {

    var i18n_dict = getSongbooki18n(songbook_id);

    return function(text) {
        if (i18n_dict && text in i18n_dict) {
            return i18n_dict[text];
        } else {
            return text;
        }
    }
}


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
function getTranslationsFor(lang) {
    return function (keyChain) {
        const keys = keyChain.split('.');
        let value = getLanguageSet(lang);

        keys.forEach((k) =>
            value = isObject(value) ? value[k] : (value || '')
        );

        return value || getTranslationsFor()(keyChain) || '';
    };
}


/**
 *
 */
module.exports = {
    getTranslationsFor,
    i18n
};
