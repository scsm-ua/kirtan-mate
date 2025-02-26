const path = require('path');
const { PATHS } = require('./constants');
const { getExistingTelegraphPageHref } = require('./telegraph/utils');


/**
 *
 */
function getNavigationPaths(bookId) {
    return {
        // TODO: use constants methods:
        A_Z: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.A_Z,
        BOOK_LIST: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.BOOK_LIST,
        CONTENTS: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.CONTENTS,
        ORIGIN: PATHS.ORIGIN,
        SEARCH: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.SEARCH,

        // TODO: good place?
        PUBLIC_CONTENTS: getExistingTelegraphPageHref(PATHS.PUBLIC_ORIGIN + '/' + bookId + PATHS.PAGES.CONTENTS),
        PUBLIC_SEARCH: getExistingTelegraphPageHref(PATHS.PUBLIC_ORIGIN + '/' + bookId + PATHS.PAGES.SEARCH),
        PUBLIC_A_Z: getExistingTelegraphPageHref(PATHS.PUBLIC_ORIGIN + '/' + bookId + PATHS.PAGES.A_Z),
    };
}


/**
 *
 */
function getTemplatePaths(songbook_id) {
    return {
        toJs: PATHS.RELATIVE.JS,
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toSongs: PATHS.RELATIVE.toSongs(songbook_id),
        toPages: getNavigationPaths(songbook_id)
    };
}


function getTelegraphTemplatePaths(songbook_id) {
    return {
        toImages: PATHS.RELATIVE.TELEGRAPH_IMG,
        toSongs: PATHS.RELATIVE.toTelegraphSongs(songbook_id),
        toPages: getNavigationPaths(songbook_id),
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_TELEGRAPH_PARTIALS_FILES),
    };
}

/**/
module.exports = {
    getNavigationPaths,
    getTemplatePaths,
    getTelegraphTemplatePaths
};
