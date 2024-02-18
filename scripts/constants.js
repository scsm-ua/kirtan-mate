const path = require('path');

const OUTPUT_DIR = 'docs';
const CSS_DIR = 'css';
const IMG_DIR = 'css';
const contentItems = 'contentItems.json';
const indexItems = 'indexItems.json';
const indexPath = 'index.html';
const indexListPath = 'index-list-page.html';
const sharingBanner = 'sharing-banner.png';

/**/
const ORIGIN = (process.env.HOME_BASE_URL || '');

/**
 *
 */
const PATHS = {
    RELATIVE: {
        CSS: ORIGIN + '/' + CSS_DIR,
        IMG: ORIGIN + '/' + IMG_DIR,
        toSongs: (songbook_id) => ORIGIN + '/' + songbook_id
    },
    BUILD: {
        CSS_FILES: OUTPUT_DIR + '/' + CSS_DIR,
        HTML_FILES: OUTPUT_DIR + '/html',
        IMG_FILES: OUTPUT_DIR + '/' + IMG_DIR,
        getJsonPath: (songbook_id) => OUTPUT_DIR + '/json/' + songbook_id,
        getSongbookRoot: (songbook_id) => OUTPUT_DIR + '/' + songbook_id,
        getContentsFile: function(songbook_id) {
            return path.resolve(OUTPUT_DIR, 'json', songbook_id, contentItems);
        },
        getIndexFile: function(songbook_id) {
            return path.resolve(OUTPUT_DIR, 'json', songbook_id, indexItems);
        },
        ROOT: OUTPUT_DIR
    },
    FILES: {
        EJS: {
            // TODO: rename
            CONTENTS: 'index.ejs',
            // TODO: rename
            INDEX_LIST: 'index-list-page.ejs',
            SONGBOOKS: 'songbooks.ejs',
            NOT_FOUND: '404.ejs',
            SITEMAP: 'sitemap.ejs',
            SONG_PAGE: 'song-page.ejs'
        },
        HTML: {
            INDEX: indexPath,
            INDEX_LIST: indexListPath
        },
        JSON: {
            CONTENTS: contentItems,
            INDEX: indexItems
        },
        SHARING_BANNER: ORIGIN + '/images/' + sharingBanner,
        XML: {
            SITEMAP: 'sitemap.xml'
        }
    },
    SRC: {
        CSS_FILES: 'src/styles',
        EJS_FILES: 'src/templates',
        EJS_PARTIALS_FILES: 'src/templates/partials',
        IMG_FILES: 'src/images'
    },
    PAGES: {
        INDEX: ORIGIN  + (process.env.EXPLICIT_INDEX ? ('/' + indexPath) : ''),
        // TODO: rename
        getIndex: (songbook_id) => ORIGIN + '/' + songbook_id + (process.env.EXPLICIT_INDEX ? ('/' + indexPath) : ''),
        // TODO: rename
        getIndexList: (songbook_id) => ORIGIN + '/' + songbook_id + '/' + indexListPath
    }
};

/**/
module.exports = { ORIGIN, PATHS };
