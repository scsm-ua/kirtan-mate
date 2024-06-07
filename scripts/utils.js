const path = require('path');
const { PATHS } = require('./constants');


/**
 *
 */
function getNavigationPaths(bookId) {
    return {
        A_Z: '/' + bookId + PATHS.PAGES.A_Z,
        BOOK_LIST: '/' + bookId + PATHS.PAGES.BOOK_LIST,
        CONTENTS: '/' + bookId + PATHS.PAGES.CONTENTS,
        SEARCH: '/' + bookId + PATHS.PAGES.SEARCH
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
