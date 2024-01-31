const path = require('path');
const { PATHS } = require('./constants');

exports.getTemplatePaths = function(songbook_id) {
    return {
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toSongs: PATHS.RELATIVE.toSongs(songbook_id),
        toPages: {
            index: PATHS.PAGES.getIndex(songbook_id),
            index_list: PATHS.PAGES.getIndexList(songbook_id)
        }
    };
};