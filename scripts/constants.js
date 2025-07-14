const path = require('path');

/**
 *
 */
const BASE_FILE_NAMES = {
    A_Z: 'a-z',
    AUTHORS: 'authors',
    BOOK_LIST: 'index',
    CONTENTS: 'contents',
    NOT_FOUND: '404',
    SEARCH: 'search',
    SITEMAP: 'sitemap'
};

const OUTPUT_DIR = 'docs';
const JS_DIR = 'js';
const CSS_DIR = 'css';
const IMG_DIR = 'css';

const contentItems = 'contentItems.json';
const contentsPage = BASE_FILE_NAMES.CONTENTS + '.html';
const indexItems = 'indexItems.json';
const indexAZPath = BASE_FILE_NAMES.A_Z + '.html';
const authorsPath = BASE_FILE_NAMES.AUTHORS + '.html';
const notFoundPage = BASE_FILE_NAMES.NOT_FOUND + '.html';
const searchPage = BASE_FILE_NAMES.SEARCH + '.html';
const sharingBanner = 'sharing-banner.png';
const sitemapName = 'sitemap.xml';

/**/
const ORIGIN = (process.env.HOME_BASE_URL || '');

/**/
const SEARCH_CONST = {
    ACCOUNT_ID: process.env.SEARCH_ACCOUNT_ID,
    SEARCH_API_KEY: process.env.SEARCH_API_KEY
};

const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN;

/**
 *
 */
const PATHS = {
    ORIGIN: ORIGIN,
    PUBLIC_ORIGIN: PUBLIC_ORIGIN,
    TELEGRAPH_BASE: 'https://telegra.ph',
    RELATIVE: {
        JS: ORIGIN + '/' + JS_DIR,
        CSS: ORIGIN + '/' + CSS_DIR,
        IMG: ORIGIN + '/' + IMG_DIR,
        TELEGRAPH_IMG: PUBLIC_ORIGIN + '/' + IMG_DIR,
        FAVICON: ORIGIN + '/' + IMG_DIR + '/favicon',
        toSongs: (songbook_id) => ORIGIN + '/' + songbook_id,
        toPublicSongs: (songbook_id) => PUBLIC_ORIGIN + '/' + songbook_id
    },
    BUILD: {
        JS_FILES: OUTPUT_DIR + '/' + JS_DIR,
        CSS_FILES: OUTPUT_DIR + '/' + CSS_DIR,
        HTML_FILES: OUTPUT_DIR + '/html',
        IMG_FILES: OUTPUT_DIR + '/' + IMG_DIR,
        getJsonPath: (songbook_id) => OUTPUT_DIR + '/json/' + songbook_id,
        getSongbookRoot: (songbook_id) => OUTPUT_DIR + '/' + songbook_id,
        getTelegraphHtmlRoot: (songbook_id) => OUTPUT_DIR + '/telegraph/html/' + songbook_id,
        getTelegraphJsonRoot: (songbook_id) => OUTPUT_DIR + '/telegraph/json/' + songbook_id,
        getContentsFile: (songbook_id) =>
            path.resolve(OUTPUT_DIR, 'json', songbook_id, contentItems),
        getIndexFile: (songbook_id) =>
            path.resolve(OUTPUT_DIR, 'json', songbook_id, indexItems),
        ROOT: OUTPUT_DIR
    },
    FILES: {
        EJS: {
            BOOK_LIST_PAGE: 'index-page.ejs',
            CONTENTS_PAGE: 'contents-page.ejs',
            A_Z_PAGE: 'a-z-page.ejs',
            NOT_FOUND_PAGE: '404.ejs',
            REDIRECT_PAGE: 'redirect-page.ejs',
            ROBOTS: process.env.DISABLE_ROBOTS ? 'robots-disallow.ejs' : 'robots.ejs',
            SEARCH_PAGE: 'search-page.ejs',
            SITEMAP: 'sitemap.ejs',
            SONG_PAGE: 'song-page.ejs'
        },
        JSON: {
            CONTENTS: contentItems,
            INDEX: indexItems
        },
        SHARING_BANNER: ORIGIN + '/' + IMG_DIR + '/' + sharingBanner,
        SITEMAP: ORIGIN  + '/' + sitemapName,
        HTML: {
            CONTENTS_PAGE: contentsPage,
            A_Z_PAGE: indexAZPath
        }
    },
    SRC: {
        CSS_FILES: 'src/styles',
        EJS_FILES: 'src/templates',
        EJS_PARTIALS_FILES: 'src/templates/partials',
        EJS_TELEGRAPH_PARTIALS_FILES: 'src/templates/telegraph/partials',
        IMG_FILES: 'src/images',
        JS_FILES: 'src/js'
    },
    PAGES: {
        AUTHORS: '/' + authorsPath,
        A_Z: '/' + indexAZPath,
        BOOK_LIST: process.env.EXPLICIT_INDEX ? '/index.html' : '/',
        CONTENTS: '/' + contentsPage,
        NOT_FOUND: '/' + notFoundPage,
        SEARCH: '/' + searchPage
    }
};


/**/
module.exports = {
    BASE_FILE_NAMES,
    ORIGIN,
    PATHS,
    SEARCH_CONST
};
