const path = require('path');

const OUTPUT_DIR = 'docs';
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
    BUILD: {
        CSS_FILES: OUTPUT_DIR + '/css',
        HTML_FILES: OUTPUT_DIR + '/html',
        IMG_FILES: OUTPUT_DIR + '/images',
        JSON_FILES: OUTPUT_DIR + '/json',
        // `resolve` to use with `require`.
        CONTENTS_FILE: path.resolve(OUTPUT_DIR + '/json/' + contentItems),
        INDEX_FILE: path.resolve(OUTPUT_DIR + '/json/' + indexItems),
        ROOT: OUTPUT_DIR
    },
    FILES: {
        EJS: {
            INDEX: 'index.ejs',
            INDEX_LIST: 'index-list-page.ejs',
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
        SHARING_BANNER: (process.env.HOME_BASE_URL || '') + '/images/' + sharingBanner,
        XML: {
            SITEMAP: 'sitemap.xml'
        }
    },
    SRC: {
        CSS_FILES: 'src/styles',
        EJS_FILES: 'src/templates',
        EJS_PARTIALS_FILES: 'src/templates/partials',
        HTML_FILES: 'src/html',
        IMG_FILES: 'src/images'
    },
    PAGES: {
        INDEX: ORIGIN + (process.env.EXPLICIT_INDEX ? ('/' + indexPath) : ''),
        INDEX_LIST: ORIGIN + '/' + indexListPath
    }
};

/**/
module.exports = { ORIGIN, PATHS };
