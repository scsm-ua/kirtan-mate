const path = require('path');
const { PATHS } = require('./constants');


/**
 *
 */
function getNavigationPaths(bookId) {
    return {
        A_Z: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.A_Z,
        BOOK_LIST: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.BOOK_LIST,
        CONTENTS: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.CONTENTS,
        ORIGIN: PATHS.ORIGIN,
        SEARCH: PATHS.ORIGIN + '/' + bookId + PATHS.PAGES.SEARCH
    }
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


/**/
module.exports = {
    getNavigationPaths,
    getTemplatePaths
};
