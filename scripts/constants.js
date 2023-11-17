const path = require('path');

const OUTPUT_DIR = 'docs';

const PATHS = {
  BUILD: {
    CSS_FILES: OUTPUT_DIR + '/css',
    HTML_FILES: OUTPUT_DIR + '/html',
    ICON_FILES: OUTPUT_DIR + '/icons',
    JSON_FILES: OUTPUT_DIR + '/json',
    // `resolve` to use with `require`.
    INDEX_FILE: path.resolve(OUTPUT_DIR + '/json/contentItems.json'),
    ROOT: OUTPUT_DIR
  },
  FILES: {
    EJS: {
      INDEX: 'index.ejs',
      SONG_PAGE: 'song-page.ejs'
    },
    HTML: {
      INDEX: 'index.html'
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
    JSON_CATEGORIES_FILE: 'src/meta/categories.json'
  }
};

/**/
module.exports = { PATHS };
