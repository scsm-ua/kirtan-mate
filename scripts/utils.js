const path = require('path');
const { PATHS } = require('./constants');
const { PAGES } = PATHS;
const { getExistingTelegraphPageHref } = require('./telegraph/utils');


/**
 *
 */
function getNavigationPaths(bookId) {
    const publicBase = PATHS.PUBLIC_ORIGIN + '/' + bookId;
    return {
        AUTHORS: PAGES.getAuthors(bookId),
        A_Z: PAGES.getA_Z(bookId),
        BOOK_LIST: PAGES.getBookList(bookId),
        CONTENTS: PAGES.getContents(bookId),
        ORIGIN: PATHS.ORIGIN,
        SEARCH: PAGES.getSearch(bookId),
        // PUBLIC_* keys resolve against PUBLIC_ORIGIN via the Telegraph cache so
        // that <a href="…"> written into Telegraph pages matches the stored
        // author_url. Safe to expose to the regular build — templates there
        // simply ignore them.
        PUBLIC_AUTHORS: getExistingTelegraphPageHref(publicBase + PAGES.AUTHORS),
        PUBLIC_A_Z: getExistingTelegraphPageHref(publicBase + PAGES.A_Z),
        PUBLIC_BOOK_LIST: getExistingTelegraphPageHref(publicBase + PAGES.BOOK_LIST),
        PUBLIC_CONTENTS: getExistingTelegraphPageHref(publicBase + PAGES.CONTENTS),
        PUBLIC_SEARCH: getExistingTelegraphPageHref(publicBase + PAGES.SEARCH),
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
        toTelegraphImages: PATHS.RELATIVE.TELEGRAPH_IMG,
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
