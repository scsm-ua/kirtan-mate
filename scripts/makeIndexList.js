const deburr = require('lodash.deburr');


/**
 * Converts the list of categories into the index list. The primary letters
 * and the alias names are sorted alphabetically.
 * @param categories: TCategory[]
 * @returns {TCategory[]}
 */
function makeIndexList(categories, index) {
    const list = new Map();

    makeLineVersions(
        categories.flatMap((cat) => cat.items),
        index
    ).sort((a, b) =>
        getAliasCleaned(a).localeCompare(getAliasCleaned(b))
    )
    .forEach((item) => {
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
            items: items.map(({ aliasName, fileName, name }) => ({
                // Swapping `aliasName` and `name`.
                aliasName: name,
                fileName: fileName,
                name: aliasName
            }))
        }));
}

/**
 * Checking for the aliasNames that are prefixed with words
 * in brackets, such as `(кіба) джая...`. Making duplicates for them.
 * @param items: TCategoryItem[]
 * @returns {TCategoryItem[]}
 */
function makeLineVersions(items, index) {
    const arr = [];

    items.forEach((item) => {

        var alias;

        if (index[item.id]) {
            alias = item.id;
        } else {
            alias = processLineEnding(item.aliasName);
        }

        arr.push({
            ...item,
            aliasName: alias
        })

        // Do not put empty alias when all word in braces.
        const idx = alias.indexOf(')');
        if (idx > -1 && idx < alias.length - 1) {
            arr.push({
                ...item,
                aliasName: alias.slice(idx + 1).trim()
            })
        }
    });

    return arr;
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
    return item.aliasName.startsWith('(')
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
        .replace(/[,\-'()\s]/g, '');
}


/**/
module.exports = { makeIndexList };
