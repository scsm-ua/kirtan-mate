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
const { PATHS } = require('./scripts/constants');
const { getSongsPath, getSongbookIdList, getSongbookInfo } = require('./scripts/songbookLoader');
const { i18n } = require('./scripts/i18n');
const { getTemplatePaths } = require('./scripts/utils');
const { BUILD, FILES, PAGES, SRC } = PATHS;

/**
 *
 */
gulp.task('sass', (done) => {
    return gulp
        .src(SRC.CSS_FILES + '/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(BUILD.CSS_FILES), done);
});

/**
 *
 */
gulp.task('copy-font', (done) => {
    return gulp
        .src(SRC.CSS_FILES + '/**/*.woff')
        .pipe(gulp.dest(BUILD.CSS_FILES), done);
});

/**
 *
 */
gulp.task('copy-img', (done) => {
    return gulp.src(SRC.IMG_FILES + '/**/*').pipe(gulp.dest(BUILD.IMG_FILES), done);
});

/**
 *
 */
gulp.task('html', (done) => {
    const template = fs.readFileSync(
        SRC.EJS_FILES + '/' + FILES.EJS.SONG_PAGE
    ).toString();

    const tasks = getSongbookIdList().map((songbook_id) => {
        var task = (done) => gulp
                .src([
                    BUILD.getJsonPath(songbook_id) + '/*.json',
                    '!**/' + FILES.JSON.CONTENTS,
                    '!**/' + FILES.JSON.INDEX
                ])
                .pipe(makeSongHTML(songbook_id, template))
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

function getSongooksRenderContext() {
    var songbooks = getSongbookIdList().map(songbook_id => {
        return {
            title: getSongbookInfo(songbook_id).title,
            subtitle: getSongbookInfo(songbook_id).subtitle,
            contentsPath: PATHS.PAGES.getIndex(songbook_id)
        };
    });

    const headParts = {
        // TODO: ??
        title: 'Vaishnava Songbook',
        // TODO: ??
        description: 'Vaishnava Songbook',
        path: PATHS.PAGES.INDEX
    };

    const paths = {
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toPages: {
            index: PATHS.PAGES.INDEX
        }
    };

    return {
        songbooks: songbooks,
        headParts: createHeadParts(headParts),
        paths: paths
    };
}

/**
 *
 */
gulp.task('songbooks', (done) => {
    return gulp
            .src([SRC.EJS_FILES + '/' + FILES.EJS.SONGBOOKS])
            .pipe(
                ejs(getSongooksRenderContext()).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: 'index',
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done);
});

/**
 *
 */
gulp.task('404', (done) => {
    return gulp
            .src([SRC.EJS_FILES + '/' + FILES.EJS.NOT_FOUND])
            .pipe(
                ejs(getSongooksRenderContext()).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: '404',
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done);
});

/**
 *
 */
gulp.task('songbook-contents', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {

        var current_i18n = i18n(songbook_id);

        const headParts = {
            title: current_i18n('Contents'),
            description: current_i18n('Vaishnava Songbook'),
            path: PATHS.PAGES.getIndex(songbook_id)
        };

        const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.CONTENTS} ${BUILD.ROOT}/${songbook_id}/${FILES.HTML.INDEX}`;
    
        var task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.CONTENTS)
            .pipe(
                ejs({
                    categories: require(BUILD.getContentsFile(songbook_id)),
                    headParts: createHeadParts(headParts),
                    paths: getTemplatePaths(songbook_id),
                    i18n: current_i18n
                }).on('error', console.error)
            )
            .pipe(gulp.dest(BUILD.ROOT))
            // TODO: use rename?
            .pipe(shell([extChangeCmd]), done);
        task.displayName = "songbook-contents " + songbook_id;
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
gulp.task('songbook-index', (done) => {
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
            // TODO: use rename?
            .pipe(shell([extChangeCmd]), done);
        task.displayName = "songbook-index " + songbook_id;
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
gulp.task('sitemap', (done) => {
    const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.SITEMAP} ${BUILD.ROOT}/${FILES.XML.SITEMAP}`;

    var songList = getSongbookIdList().map(songbook_id => {
        return createSongXMLParts(songbook_id, require(BUILD.getContentsFile(songbook_id)))
    }).join('\n');

    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.SITEMAP)
        .pipe(
            ejs({
                root: encodeURI(PATHS.PAGES.INDEX),
                songList: songList,
                i18n: i18n
            }).on('error', console.error)
        )
        .pipe(gulp.dest(BUILD.ROOT))
        .pipe(shell([extChangeCmd]), done);
});

/**
 *
 */
gulp.task('robots', (done) => {
    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.ROBOTS)
        .pipe(
            ejs({
                sitemap: encodeURI(PATHS.PAGES.SITEMAP)
            }).on('error', console.error)
        )
        .pipe(
            rename({
                extname: '.txt'
            })
        )
        .pipe(gulp.dest(BUILD.ROOT), done);
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
        'copy-img',
        'copy-font',
        'sass',
        'md2json',
        'generate-contents',
        'generate-index',
        'html',
        'songbook-contents',
        'songbook-index',
        'sitemap',
        'songbooks',
        '404',
        'robots',
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
        gulp.series(['html', 'songbook-contents', 'songbook-index', 'songbooks'])
    );
});
