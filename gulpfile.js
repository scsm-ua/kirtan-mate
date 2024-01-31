var fs = require('fs');

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
const { getSongsPath, getSongbookIdList } = require('./scripts/songbookLoader');
const { i18n } = require('./scripts/i18n');
const { getTemplatePaths } = require('./scripts/utils');
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
gulp.task('html', async (done) => {
    const templatePromise = await readFile(
        SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE
    );

    const tasks = getSongbookIdList().map((songbook_id) => {
        var task = (done) => gulp
                .src([
                    BUILD.getJsonPath(songbook_id) + '/*.json',
                    '!**/' + FILES.JSON.CONTENTS,
                    '!**/' + FILES.JSON.INDEX
                ])
                .pipe(makeSongHTML(songbook_id, templatePromise))
                .pipe(
                    rename({
                        extname: '.html'
                    })
                )
                .pipe(gulp.dest(BUILD.getSongbookRoot(songbook_id)), done);
        
        task.displayName = "html " + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })(); 
});

/**
 *
 */
gulp.task('md2json', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {
        const templatePromise = fs.readFileSync(
            SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE
        );
        var task = (done) =>
            gulp
            .src(getSongsPath(songbook_id) + '/*.md')
            .pipe(md2jsonConvertor(templatePromise))
            .pipe(
                rename({
                    extname: '.json'
                })
            )
            .pipe(gulp.dest(BUILD.getJsonPath(songbook_id)), done);
            task.displayName = "md2json " + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })(); 
});

/**
 *
 */
gulp.task('generate-contents', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {
        var task = (done) => getJSONContentsStream(songbook_id).pipe(gulp.dest(BUILD.getJsonPath(songbook_id)), done);
        task.displayName = "generate-contents " + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })(); 
});

/**
 *
 */
gulp.task('generate-index', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {
        var task = (done) => getJSONIndexStream(songbook_id).pipe(gulp.dest(BUILD.getJsonPath(songbook_id)), done);
        task.displayName = "generate-index " + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })(); 
});

/**
 *
 */
gulp.task('index', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {

        var current_i18n = i18n(songbook_id);

        const headParts = {
            title: current_i18n('Contents'),
            description: current_i18n('Vaishnava Songbook'),
            path: PATHS.PAGES.getIndex(songbook_id)
        };

        const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.INDEX} ${BUILD.ROOT}/${songbook_id}/${FILES.HTML.INDEX}`;
    
        var task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.INDEX)
            .pipe(
                ejs({
                    categories: require(BUILD.getContentsFile(songbook_id)),
                    headParts: createHeadParts(headParts),
                    paths: getTemplatePaths(songbook_id),
                    i18n: current_i18n
                }).on('error', console.error)
            )
            .pipe(gulp.dest(BUILD.ROOT))
            .pipe(shell([extChangeCmd]), done);
        task.displayName = "index " + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })(); 
});

/**
 *
 */
gulp.task('index-list', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {

        const headParts = {
            title: i18n(songbook_id)('Index'),
            description: i18n(songbook_id)('Vaishnava Songbook'),
            path: PATHS.PAGES.getIndexList(songbook_id)
        };

        const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.INDEX_LIST} ${BUILD.ROOT}/${songbook_id}/${FILES.HTML.INDEX_LIST}`;

        var task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.INDEX_LIST)
            .pipe(
                ejs({
                    items: makeIndexList(require(BUILD.getContentsFile(songbook_id)), require(BUILD.getIndexFile(songbook_id))),
                    headParts: createHeadParts(headParts),
                    paths: getTemplatePaths(songbook_id),
                    i18n: i18n(songbook_id)
                }).on('error', console.error)
            )
            .pipe(gulp.dest(BUILD.ROOT + ''))
            .pipe(shell([extChangeCmd]), done);
        task.displayName = "index-list " + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })(); 
});

/**
 *
 */
gulp.task('sitemap', () => {
    const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.SITEMAP} ${BUILD.ROOT}/${FILES.XML.SITEMAP}`;

    var songList = getSongbookIdList().map(songbook_id => {
        return createSongXMLParts(songbook_id, require(BUILD.getContentsFile(songbook_id)))
    }).join('\n');

    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.SITEMAP)
        .pipe(
            ejs({
                indexListPagePath: encodeURI(ORIGIN + '/' + FILES.HTML.INDEX_LIST),
                indexPagePath: encodeURI(ORIGIN + '/' + FILES.HTML.INDEX),
                songList: songList,
                i18n: i18n
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
        ['copy-img', 'copy-font'],
        ['sass', 'html', 'sitemap'],
        ['index', 'index-list'],
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
