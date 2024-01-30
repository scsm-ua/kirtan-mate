const ejs = require('gulp-ejs');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const runSequence = require('gulp4-run-sequence');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');

// Load local env.
require('dotenv').config();

/**/
const { createHeadParts, createSongXMLParts } = require('./scripts/createHeadParts');
const {
    getJSONContentsStream,
    getJSONIndexStream,
    makeSongHTML,
    md2jsonConvertor
} = require('./scripts/songConvertor');
const { makeIndexList } = require('./scripts/makeIndexList');
const { PATHS, ORIGIN } = require('./scripts/constants');
const { readFile } = require('./scripts/ioHelpers');
const { getSongsPath } = require('./scripts/songbookLoader');
const { BUILD, FILES, PAGES, SRC } = PATHS;

/**
 *
 */
gulp.task('sass', () => {
    return gulp
        .src(SRC.CSS_FILES + '/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(BUILD.CSS_FILES));
});

/**
 *
 */
gulp.task('copy-font', () => {
    return gulp
        .src(SRC.CSS_FILES + '/**/*.woff')
        .pipe(gulp.dest(BUILD.CSS_FILES));
});

/**
 *
 */
gulp.task('copy-img', () => {
    return gulp.src(SRC.IMG_FILES + '/**/*').pipe(gulp.dest(BUILD.IMG_FILES));
});

/**
 *
 */
gulp.task('html-folder', shell.task('mkdir -p ' + BUILD.HTML_FILES));

/**
 *
 */
gulp.task('html', async () => {
    const templatePromise = await readFile(
        SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE
    );

    return gulp
        .src([
            BUILD.JSON_FILES + '/*.json',
            '!' + BUILD.CONTENTS_FILE,
            '!' + BUILD.INDEX_FILE
        ])
        .pipe(makeSongHTML(templatePromise))
        .pipe(
            rename({
                extname: '.html'
            })
        )
        .pipe(gulp.dest(BUILD.HTML_FILES));
});

/**
 *
 */
gulp.task('md2json', (done) => {
    // TODO: had to use 'fs' to provide 'done' callback without async.
    var fs = require('fs');
    const templatePromise = fs.readFileSync(
        SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE
    );
    return gulp
        .src(getSongsPath() + '/*.md')
        .pipe(md2jsonConvertor(templatePromise))
        .pipe(
            rename({
                extname: '.json'
            })
        )
        .pipe(gulp.dest(BUILD.JSON_FILES), done);
});

/**
 *
 */
gulp.task('generate-contents', (done) => {
    return getJSONContentsStream().pipe(gulp.dest(BUILD.JSON_FILES), done);
});

/**
 *
 */
gulp.task('generate-index', (done) => {
    return getJSONIndexStream().pipe(gulp.dest(BUILD.JSON_FILES), done);
});

/**
 *
 */
gulp.task('index', () => {
    const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.INDEX} ${BUILD.ROOT}/${FILES.HTML.INDEX}`;

    const headParts = {
        title: 'Зміст',
        description: 'Сайт вайшнавських пісень',
        path: '/'
    };

    const paths = {
        toCss: path.relative(BUILD.ROOT, BUILD.CSS_FILES),
        toImages: path.relative(BUILD.ROOT, BUILD.IMG_FILES),
        toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES),
        toPages: {
            index: PAGES.INDEX,
            index_list: PAGES.INDEX_LIST
        }
    };

    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.INDEX)
        .pipe(
            ejs({
                categories: require(BUILD.CONTENTS_FILE),
                headParts: createHeadParts(headParts),
                paths: paths
            }).on('error', console.error)
        )
        .pipe(gulp.dest(BUILD.ROOT))
        .pipe(shell([extChangeCmd]));
});

/**
 *
 */
gulp.task('index-list', () => {
    const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.INDEX_LIST} ${BUILD.ROOT}/${FILES.HTML.INDEX_LIST}`;

    const headParts = {
        title: 'Індекс А-Я',
        description: 'Сайт вайшнавських пісень',
        path: '/' + FILES.HTML.INDEX_LIST
    };

    const paths = {
        toCss: path.relative(BUILD.ROOT, BUILD.CSS_FILES),
        toImages: path.relative(BUILD.ROOT, BUILD.IMG_FILES),
        toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES),
        toPages: {
            index: PAGES.INDEX,
            index_list: PAGES.INDEX_LIST
        }
    };

    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.INDEX_LIST)
        .pipe(
            ejs({
                items: makeIndexList(require(BUILD.CONTENTS_FILE), require(BUILD.INDEX_FILE)),
                headParts: createHeadParts(headParts),
                paths: paths
            }).on('error', console.error)
        )
        .pipe(gulp.dest(BUILD.ROOT))
        .pipe(shell([extChangeCmd]));
});

/**
 *
 */
gulp.task('sitemap', () => {
    const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.SITEMAP} ${BUILD.ROOT}/${FILES.XML.SITEMAP}`;

    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.SITEMAP)
        .pipe(
            ejs({
                indexListPagePath: encodeURI(ORIGIN + '/' + FILES.HTML.INDEX_LIST),
                indexPagePath: encodeURI(ORIGIN + '/' + FILES.HTML.INDEX),
                songList: createSongXMLParts(require(BUILD.CONTENTS_FILE))
            }).on('error', console.error)
        )
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
    runSequence(
        'clean',
        'md2json',
        'generate-contents',
        'generate-index',
        'index-list',
        ['html-folder', 'copy-img', 'copy-font'],
        ['sass', 'html', 'index', 'sitemap'],
        done
    );
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
