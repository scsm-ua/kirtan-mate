const path = require('path');

const OUTPUT_DIR = 'docs';
const contentItems = 'contentItems.json';
const indexListJson = 'index-list.json';

const PATHS = {
    BUILD: {
        CSS_FILES: OUTPUT_DIR + '/css',
        HTML_FILES: OUTPUT_DIR + '/html',
        ICON_FILES: OUTPUT_DIR + '/icons',
        JSON_FILES: OUTPUT_DIR + '/json',
        // `resolve` to use with `require`.
        INDEX_FILE: path.resolve(OUTPUT_DIR + '/json/' + contentItems),
        INDEX_LIST_FILE: path.resolve(OUTPUT_DIR + '/json/' + indexListJson),
        ROOT: OUTPUT_DIR
    },
    FILES: {
        EJS: {
            INDEX: 'index.ejs',
            INDEX_LIST: 'index-list-page.ejs',
            SONG_PAGE: 'song-page.ejs'
        },
        HTML: {
            INDEX: 'index.html',
            INDEX_LIST: 'index-list-page.html'
        },
        JSON: {
            INDEX: contentItems,
            INDEX_LIST: indexListJson
        }
    },
    SRC: {
        CSS_FILES: 'src/styles',
        EJS_FILES: 'src/templates',
        EJS_PARTIALS_FILES: 'src/templates/partials',
        HTML_FILES: 'src/html',
        ICON_FILES: 'src/icons',
        MD_FILES: 'src/md',
        MD_INDEX_FILE: 'src/meta/index.md',
        JSON_CATEGORIES_FILE: 'src/meta/categories.json',
        JSON_INDEX_LIST_FILE: 'src/meta/index-list.json'
    },
    PAGES: {
        INDEX: '/',
        INDEX_LIST: '/index_list.html'
    }
};

/**/
module.exports = { PATHS };
