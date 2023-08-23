const OUTPUT_DIR = 'docs';

const PATHS = {
  BUILD: {
    CSS_FILES: OUTPUT_DIR + '/css',
    HTML_FILES: OUTPUT_DIR + '/html',
    ROOT: OUTPUT_DIR
  },
  SRC: {
    CSS_FILES: 'src/styles',
    EJS_FILES: 'src/templates',
    HTML_FILES: 'src/html',
    MD_FILES: 'src/md',
    SONG_TEMPLATE_FILE: 'src/templates/song-page.ejs'
  }
};

/**/
module.exports = { PATHS };
