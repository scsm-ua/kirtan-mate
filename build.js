const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));

/**/
const { MdConverter } = require('./scripts/MdConverter');
// const { ScssConverter } = require('./scripts/ScssConverter');

/**/
const PUBLIC_DIR = '/public';

/**
 *
 */
const MD_FILES_DIR = '/md';
const HTML_FILES_DIR = '/html';
const TEMPLATE_FILES_PATH = '/templates/song-page.ejs';

new MdConverter({
  inputDir: path.join(__dirname, MD_FILES_DIR),
  outputDir: path.join(__dirname, PUBLIC_DIR, HTML_FILES_DIR),
  templateFile: path.join(__dirname, TEMPLATE_FILES_PATH)
});

/**
 *
 */
const SCSS_FILES_DIR = '/styles';
const CSS_FILES_DIR = '/css';
const VENDOR_STYLE_FILE = './node_modules/bootstrap/dist/css/bootstrap.css';
buildStyles();

function buildStyles() {
  const sassOptions = { includePaths: [VENDOR_STYLE_FILE] };
  return gulp.src(path.join(__dirname, SCSS_FILES_DIR, '**/*.scss'))
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(gulp.dest(path.join(__dirname, PUBLIC_DIR, CSS_FILES_DIR)));
}

// new ScssConverter({
//   inputDir: path.join(__dirname, SCSS_FILES_DIR),
//   outputDir: path.join(__dirname, PUBLIC_DIR, CSS_FILES_DIR)
// });
