const del = require('del');
const gulp = require('gulp');
const runSequence = require('gulp4-run-sequence');
const sass = require('gulp-sass')(require('sass'));

/**/
const { MdConverter } = require('./scripts/MdConverter');
const { PATHS } = require('./scripts/constants');

/**
 *
 */
gulp.task('sass', () => {
  return gulp.src(PATHS.SRC.CSS_FILES + '/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(PATHS.BUILD.CSS_FILES));
});

/**
 *
 */
gulp.task('html-folder', () => {
  return gulp.src('*.*', { read: false })
    .pipe(gulp.dest(PATHS.BUILD.HTML_FILES));
});

/**
 *
 */
gulp.task('html', () => {
  new MdConverter({
    inputDir: PATHS.SRC.MD_FILES,
    outputDir: PATHS.BUILD.HTML_FILES,
    templateFile: PATHS.SRC.SONG_TEMPLATE_FILE
  });
  
  return gulp.src('.', { allowEmpty: true });
});

/**
 *
 */
gulp.task('clean', () => {
  return del(PATHS.BUILD.ROOT);
});

/**
 *
 */
gulp.task('build', (done) => {
  runSequence('clean', 'html-folder', ['sass', 'html'], done);
});

/**
 *
 */
// gulp.task('browser-sync', () => {
//   browserSync.init({
//     server: {
//       baseDir: PATHS.BUILD.ROOT
//     },
//     port: PORT,
//     open: false,
//     notify: false
//   });
// })

/**
 *
 */
gulp.task('watch', () => {
  gulp.watch(PATHS.SRC.CSS_FILES + '/**/*.scss', gulp.series(['sass']));
  gulp.watch(
    [PATHS.SRC.MD_FILES + '/**/*.md', PATHS.SRC.EJS_FILES + '/**/*.ejs'],
    gulp.series(['html'])
  );
});
