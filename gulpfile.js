const ejs = require('gulp-ejs');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const runSequence = require('gulp4-run-sequence');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell')

/**/
const contentItems = require('./src/data/contentItems.json');
const { md2jsonConvertor, songConvertor } = require('./scripts/songConvertor');
const { PATHS } = require('./scripts/constants');
const { readFile } = require('./scripts/ioHelpers');
const { BUILD, FILES, SRC } = PATHS;

/**
 *
 */
gulp.task('sass', () => {
  return gulp.src(SRC.CSS_FILES + '/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(BUILD.CSS_FILES));
});

/**
 *
 */
gulp.task('copy-font', () => {
  return gulp.src(SRC.CSS_FILES + '/**/*.woff')
    .pipe(gulp.dest(BUILD.CSS_FILES))
});


/**
 *
 */
gulp.task('copy-icons', () => {
  return gulp.src(SRC.ICON_FILES + '/**/*')
    .pipe(gulp.dest(BUILD.ICON_FILES))
});

/**
 *
 */
gulp.task('html-folder', shell.task('mkdir -p ' + BUILD.HTML_FILES));

/**
 *
 */
gulp.task('html', async () => {
  const templatePromise = await readFile(SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE);
  
  return gulp.src(SRC.MD_FILES + '/**/*.md')
    .pipe(songConvertor(templatePromise))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(BUILD.HTML_FILES));
});

/**
 *
 */
gulp.task('md2json', async () => {
  const templatePromise = await readFile(SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE);
  
  return gulp.src(SRC.MD_FILES + '/**/*.md')
    .pipe(md2jsonConvertor(templatePromise))
    .pipe(rename({
      extname: '.json'
    }))
    .pipe(gulp.dest(BUILD.JSON_FILES));
});

/**
 *
 */
gulp.task('index', () => {
  const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.INDEX} ${BUILD.ROOT}/${FILES.HTML.INDEX}`;
  
  const paths = {
    toCss: path.relative(BUILD.ROOT, BUILD.CSS_FILES),
    toIcons: path.relative(BUILD.ROOT, BUILD.ICON_FILES),
    toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES)
  };
  
  return gulp.src(SRC.EJS_FILES + '/' + FILES.EJS.INDEX)
    .pipe(ejs({
      categories: contentItems,
      paths: paths
    }).on('error', console.error))
    .pipe(gulp.dest(BUILD.ROOT))
    .pipe(shell([extChangeCmd]));
});

/**
 *
 */
gulp.task('clean', shell.task('rm -rf docs'));

/**
 *
 */
gulp.task('build', (done) => {
  runSequence('clean', ['html-folder', 'copy-icons', 'copy-font'], ['sass', 'html', 'index'], done);
});

/**
 *
 */
gulp.task('watch', () => {
  gulp.watch(SRC.CSS_FILES + '/**/*.scss', gulp.series(['sass']));
  gulp.watch(
    [SRC.MD_FILES + '/**/*.md', SRC.EJS_FILES + '/**/*.ejs'],
    gulp.series(['html', 'index'])
  );
});
