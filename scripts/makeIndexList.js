const deburr = require('lodash.deburr');
const { getSongbookInfo } = require('./songbookLoader');
const { PATHS } = require('./constants');
const { getSongsContents, getSongJSON } = require('./indexGenerator');

/**
 * Converts the list of categories into the index list. The primary letters
 * and the alias names are sorted alphabetically.
 * @param categories: TCategory[]
 * @param index
 * @returns {TCategory[]}
 */
function makeIndexList(songbook_id) {

    const categories = getSongsContents(songbook_id);
    const index = require(PATHS.BUILD.getIndexFile(songbook_id))

    const list = new Map();

    makeLineVersions(
        categories.flatMap((cat) => cat.items),
        index
    ).sort((a, b) =>
        getAliasCleaned(a).localeCompare(getAliasCleaned(b))
    )
    .forEach((item) => {
        // Skip intro from index.
        if (item.fileName === 'intro.html') {
            return;
        }

        const firstLetter = getFirstLetter(item);

        if (!firstLetter) {
            console.warn('No first letter in', item);
        }

        if (!list.has(firstLetter)) {
            return list.set(firstLetter, [item]);
        }

        const arr = list.get(firstLetter);
        list.set(firstLetter, [...arr, item]);
    });

    return Array.from(list.entries())
        .sort(((a, b) => a[0].localeCompare(b[0])))
        .map(([letter, items]) => ({
            name: letter.toUpperCase(),
            items: items.map(item => {
                const { aliasName, name } = item;
                return {...item, ...{
                    // Swapping `aliasName` and `name`.
                    aliasName: name,
                    title: aliasName
                }};
            })
        }));
}

function makeAuthorsList(songbook_id) {

    const categories = getSongsContents(songbook_id);
    // const index = require(PATHS.BUILD.getIndexFile(songbook_id))

    const authors_dict = {};
    const unique_ids = {};

    categories.flatMap((cat) => cat.items).forEach((item) => {
        // Skip intro from index.
        if (item.fileName === 'intro.html') {
            return;
        }

        if (item.id in unique_ids) {
            return;
        }

        var song = getSongJSON(songbook_id, item.id);

        var author = song.meta?.author;
        if (!author) {
            if (!song.meta || !song.meta['no-author']) {
                console.log('No author in', songbook_id, item.id, item.title)
            }
            return;
        }

        var author_songs = authors_dict[author] = authors_dict[author] || [];
        author_songs.push(item);
        unique_ids[item.id] = true;
    });

    return Object.keys(authors_dict).sort().map(author => ({
        name: author,
        // TODO: sort items
        // TODO: get correct first line.
        items: authors_dict[author]
    })).sort((a, b) => {
        var l1 = a.items.length;
        var l2 = b.items.length;
        var result = l2 - l1;
        if (!result) {
            return a.name.localeCompare(b.name);
        } else {
            return result;
        }
    });
}

/**
 * Checking for the aliasNames that are prefixed with words
 * in brackets, such as `(кіба) джая...`. Making duplicates for them.
 * @param items: TCategoryItem[]
 * @param index
 * @returns {TCategoryItem[]}
 */
function makeLineVersions(items, index) {
    const result = [];
    const unique_ids = {};

    items.forEach((item) => {

        if (item.id in unique_ids) {
            return;
        }
        unique_ids[item.id] = true;

        var alias;

        if (index[item.id]) {
            alias = index[item.id];
        } else {
            alias = processLineEnding(item.aliasName);
        }

        result.push({
            ...item,
            aliasName: alias
        })

        // Do not put empty alias when all word in braces.
        const idx = alias.indexOf(')');
        if (idx > -1 && idx < alias.length - 1) {
            result.push({
                ...item,
                aliasName: alias.slice(idx + 1).trim()
            })
        }
    });

    return result;
}

/**
 * Some lines (alisNames) may end with a comma or hyphen which need to be removed.
 * @param line: string
 * @returns {string}
 */
function processLineEnding(line) {
    const len = line.length - 1;
    let idx = line.lastIndexOf('-');
    if (idx === len) return line.slice(0, idx);

    idx = line.lastIndexOf(',');
    if (idx === len) return line.slice(0, idx);

    return line;
}

/**
 * Some lines may start with a bracket, e.g. `(кіба) джая...`.
 * @param item: TCategoryItem
 * @returns {string}
 */
function getFirstLetter(item) {
    return (item.aliasName.startsWith('(')
            || item.aliasName.startsWith('‘')
            || item.aliasName.startsWith('«'))
        ? item.aliasName[1]
        : item.aliasName[0];
}

/**
 * For the sake of correct comparison some symbols should be omitted.
 * @param item: TCategoryItem
 * @returns {string}
 */
function getAliasCleaned(item) {
    return deburr(item.aliasName)
        .replace(/[«,\-'()\s]/g, '');
}


/**/
module.exports = { makeIndexList, makeAuthorsList };
