const resources = require('songbook-resources/resources.json');
const persons = require('songbook-resources/persons.json');
const { getEmbedCode } = require('./embeds');
const { getSongbookInfo } = require('./songbookLoader');

const personsById = Object.fromEntries(persons.map(p => [p.id, p]));

const DEFAULT_LANG = 'en';

/**
 * Maps a songbook id to the language key used in `persons.json` (`en`, `ru`, `ua`).
 * Uses the songbook `slug` root (e.g. `ru-kdm` -> `ru`, `en-pe` -> `en`).
 */
function getPersonsLangKey(songbook_id) {
    const info = getSongbookInfo(songbook_id);
    const slug = info?.slug || songbook_id || '';
    return slug.split('-')[0] || DEFAULT_LANG;
}

function getPersonName(person_id, songbook_id) {
    const person = personsById[person_id];
    if (!person) {
        console.warn(`Unknown performer id: "${person_id}"`);
        return person_id;
    }
    const key = getPersonsLangKey(songbook_id);
    return person.i18n?.[key] || person.i18n?.[DEFAULT_LANG] || person_id;
}

function getSongAudio(song_id) {
    return resources[song_id]?.audio || [];
}

function hasSongAudio(song_id) {
    return getSongAudio(song_id).length > 0;
}

/**
 * Returns embed entries for a song, translated for the given songbook.
 * @return {{title: string, embed_url: string, iframe_url: string, embed_code: string}[]}
 */
function getSongEmbeds(songbook_id, song_id) {
    return getSongAudio(song_id).map(({ title, embed_url }) => {
        const embed = getEmbedCode(embed_url);
        if (!embed) {
            console.warn('Unrecognized embed link', embed_url);
            return null;
        }
        return {
            title: getPersonName(title, songbook_id),
            embed_url,
            iframe_url: embed.embed_url,
            embed_code: embed.embed_code
        };
    }).filter(Boolean);
}

module.exports = {
    getSongEmbeds,
    hasSongAudio
};
