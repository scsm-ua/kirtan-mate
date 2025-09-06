const path = require('path');
const { PATHS } = require('./constants');
const { PAGES } = PATHS;
const { getExistingTelegraphPageHref } = require('./telegraph/utils');


/**
 *
 */
function getNavigationPaths(bookId) {
    return {
        AUTHORS: PAGES.getAuthors(bookId),
        A_Z: PAGES.getA_Z(bookId),
        BOOK_LIST: PAGES.getBookList(bookId),
        CONTENTS: PAGES.getContents(bookId),
        ORIGIN: PATHS.ORIGIN,
        SEARCH: PAGES.getSearch(bookId),

        // TODO: good place?
        PUBLIC_AUTHORS: getExistingTelegraphPageHref(PAGES.getAuthors(bookId)),
        PUBLIC_A_Z: getExistingTelegraphPageHref(PAGES.getA_Z(bookId)),
        PUBLIC_BOOK_LIST: getExistingTelegraphPageHref(PAGES.getBookList(bookId)),
        PUBLIC_CONTENTS: getExistingTelegraphPageHref(PAGES.getContents(bookId)),
        PUBLIC_SEARCH: getExistingTelegraphPageHref(PAGES.getSearch(bookId)),
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
        toSongs: PATHS.RELATIVE.toPublicSongs(songbook_id),
        toPages: getNavigationPaths(songbook_id),
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_TELEGRAPH_PARTIALS_FILES),

        PUBLIC_BOOK_LIST: getExistingTelegraphPageHref(PATHS.PUBLIC_ORIGIN + '/' + songbook_id + PATHS.PAGES.BOOK_LIST),
    };
}

/**/
module.exports = {
    getNavigationPaths,
    getTemplatePaths,
    getTelegraphTemplatePaths
};
