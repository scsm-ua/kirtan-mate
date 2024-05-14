const path = require('path');
const { PATHS } = require('./constants');

exports.getTemplatePaths = function(songbook_id, options) {
    
    var contentsPath = PATHS.PAGES.getIndex(songbook_id);
    var rootPath = options?.root_to_songbook ? contentsPath : PATHS.PAGES.INDEX

    return {
        toJs: PATHS.RELATIVE.JS,
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toSongs: PATHS.RELATIVE.toSongs(songbook_id),
        toPages: {
            root: rootPath,
            // TODO: rename
            index: contentsPath,
            // TODO: rename
            index_list: PATHS.PAGES.getIndexList(songbook_id)
        }
    };
};
