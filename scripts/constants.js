const path = require('path');

/**
 *
 */
const BASE_FILE_NAMES = {
    A_Z: 'a-z',
    BOOK_LIST: 'index',
    CONTENTS: 'contents',
    NOT_FOUND: '404',
    SEARCH: 'search'
};

const OUTPUT_DIR = 'docs';
const JS_DIR = 'js';
const CSS_DIR = 'css';
const IMG_DIR = 'css';
const contentItems = 'contentItems.json';
const contentsPage = BASE_FILE_NAMES.CONTENTS + '.html';
const indexItems = 'indexItems.json';
const indexPath = BASE_FILE_NAMES.BOOK_LIST + '.html';
const indexAZPath = BASE_FILE_NAMES.A_Z + '.html';
const notFoundPage = BASE_FILE_NAMES.NOT_FOUND + '.html';
const searchPage = BASE_FILE_NAMES.SEARCH + '.html';
const sharingBanner = 'sharing-banner.png';
const sitemapName = 'sitemap.xml';

/**/
const ORIGIN = (process.env.HOME_BASE_URL || '');

/**/
const SEARCH_CONST = {
    ACCOUNT_ID: 'f0691c438c8d24df4',
    SEARCH_API_KEY: 'AIzaSyCt4jPTSY3LKh14RrS7SmQPfguyhQ_y2vU'
};

/**
 *
 */
const PATHS = {
    RELATIVE: {
        JS: ORIGIN + '/' + JS_DIR,
        CSS: ORIGIN + '/' + CSS_DIR,
        IMG: ORIGIN + '/' + IMG_DIR,
        toSongs: (songbook_id) => ORIGIN + '/' + songbook_id
    },
    BUILD: {
        JS_FILES: OUTPUT_DIR + '/' + JS_DIR,
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
            // todo rename to index.ejs
            BOOK_LIST_PAGE: 'songbooks.ejs',
            // TODO: rename
            CONTENTS_PAGE: 'index.ejs',
            // TODO: rename
            A_Z_PAGE: 'a-z-page.ejs',
            NOT_FOUND_PAGE: '404.ejs',
            REDIRECT_PAGE: 'redirect-page.ejs',
            ROBOTS: process.env.DISABLE_ROBOTS ? 'robots-disallow.ejs' : 'robots.ejs',
            SEARCH_PAGE: 'search-page.ejs',
            SITEMAP: 'sitemap.ejs',
            SONG_PAGE: 'song-page.ejs'
        },
        HTML: {
            INDEX_PAGE: indexPath,
            INDEX_A_Z_PAGE: indexAZPath
        },
        JSON: {
            CONTENTS: contentItems,
            INDEX: indexItems
        },
        SHARING_BANNER: ORIGIN + '/images/' + sharingBanner,
        XML: {
            SITEMAP: sitemapName
        }
    },
    SRC: {
        CSS_FILES: 'src/styles',
        EJS_FILES: 'src/templates',
        EJS_PARTIALS_FILES: 'src/templates/partials',
        IMG_FILES: 'src/images',
        JS_FILES: 'src/js'
    },
    PAGES: {
        A_Z: '/' + indexAZPath,
        BOOK_LIST: '/',
        CONTENTS: '/' + contentsPage,
        NOT_FOUND: '/' + notFoundPage,
        SEARCH: '/' + searchPage,
        SITEMAP: ORIGIN  + '/' + sitemapName,
        INDEX: ORIGIN  + (process.env.EXPLICIT_INDEX ? ('/' + indexPath) : ''),
        // TODO: rename
        getIndexPath: (songbook_id) => ORIGIN + '/' + songbook_id + (process.env.EXPLICIT_INDEX ? ('/' + indexPath) : ''),
        // TODO: rename
        getIndexAZPath: (songbook_id) => ORIGIN + '/' + songbook_id + '/' + indexAZPath,
        getSearchPath: (songbook_id) => '/' + songbook_id + '/' + searchPage
    }
};


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


/**/
module.exports = {
    BASE_FILE_NAMES,
    ORIGIN,
    PATHS,
    SEARCH_CONST,
    getNavigationPaths
};
