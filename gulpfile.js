const fs = require('fs');

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
const { PATHS, SEARCH_CONST, BASE_FILE_NAMES, getNavigationPaths } = require('./scripts/constants');
const { getSongsPath, getSongbookIdList, getSongbookInfo } = require('./scripts/songbookLoader');
const { i18n, getTranslationsFor } = require('./scripts/i18n');
const { getTemplatePaths } = require('./scripts/utils');
const { getContentsJSON } = require('./scripts/indexGenerator');
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

gulp.task('copy-js', (done) => {
    return gulp.src(SRC.JS_FILES + '/**/*').pipe(gulp.dest(BUILD.JS_FILES), done);
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

/**
 *
 */
function getSongooksRenderContext(options) {
    const songbooks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsFor(songbook_id);

        const info = getSongbookInfo(songbook_id);
        const songsCount =  getContentsJSON(songbook_id)
            .flatMap((cat) => cat.items).length;

        return {
            href: PATHS.PAGES.getIndexPath(songbook_id),
            isSelected: false,
            i18n: tr,
            slug: songbook_id,
            songsCount: songsCount,
            subtitle: info.subtitle,
            title: info.title
        };
    });

    const headParts = {
        // TODO: ??
        title: 'Vaishnava Songbook',
        // TODO: ??
        description: 'Vaishnava Songbook',
        path: PATHS.PAGES.INDEX,
        is404: !!options?.is404
    };

    const paths = {
        toJs: PATHS.RELATIVE.JS,
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toPages: {
            bookList: PATHS.PAGES.BOOK_LIST,
            search: PATHS.PAGES.SEARCH
        }
    };

    return {
        songbooks: songbooks,
        songbooksAsOptions: songbooks,
        headParts: createHeadParts(headParts),
        paths: paths
    };
}

/**
 *
 */
function getCommonPageContext(bookId, options = {}) {
    const tr = getTranslationsFor(bookId);

    const songbooks = getSongbookIdList().map((songbook_id) => {
        const info = getSongbookInfo(songbook_id);
        const songsCount =  getContentsJSON(songbook_id)
            .flatMap((cat) => cat.items).length;

        return {
            href: PATHS.PAGES.getIndexPath(songbook_id),
            isSelected: false,
            slug: songbook_id,
            songsCount: songsCount,
            subtitle: info.subtitle,
            title: info.title
        };
    });

    const headParts = {
        title: tr('NOT_FOUND.HEAD.TITLE'),
        description: tr('NOT_FOUND.HEAD.DESCRIPTION'),
        path: PATHS.PAGES.INDEX,
        is404: options.is404
    };

    const paths = {
        toJs: PATHS.RELATIVE.JS,
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toPages: getNavigationPaths(bookId)
    };

    return {
        headParts: createHeadParts(headParts),
        i18n: tr,
        paths: paths,
        songbooks: songbooks,
        songbooksAsOptions: songbooks
    };
}


/**
 *
 */
gulp.task('songbooks', (done) => {
    return gulp
            .src([SRC.EJS_FILES + '/' + FILES.EJS.BOOK_LIST_PAGE])
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
    const tasks = getSongbookIdList().map((songbook_id) => {
        const task = (done) => gulp
            .src([SRC.EJS_FILES + '/' + FILES.EJS.NOT_FOUND_PAGE])
            .pipe(
                ejs(getCommonPageContext(
                    songbook_id,
                    { is404: true }
                )).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: '404',
                    dirname: songbook_id,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done);

        task.displayName = '404 ' + songbook_id;
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
gulp.task('search-page', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        // const current_i18n = i18n(songbook_id);
        // const info /* TSongBookInfo */ = getSongbookInfo(songbook_id);
        // console.log(info);

        const headParts = {
            // TODO: ??
            title: 'Search Page',
            // TODO: ??
            description: 'Search Page',
            path: PATHS.PAGES.getSearchPath(songbook_id)
        };

        const pages = getContentsJSON(songbook_id)
            .flatMap(({ items }) =>
                items.map((item) => ({
                    page: item.page,
                    path: item.fileName,
                    title: item.title
                }))
            )
            .sort((a, b) => parseFloat(a.page) - parseFloat(b.page));

        const task = (taskDone) =>
            gulp
                .src([SRC.EJS_FILES + '/' + FILES.EJS.SEARCH_PAGE])
                .pipe(
                    ejs({
                        headParts: createHeadParts(headParts),
                        i18n: getTranslationsFor(songbook_id),
                        pages: pages,
                        paths: getTemplatePaths(songbook_id),
                        search: SEARCH_CONST
                    }).on('error', console.error)
                )
                .pipe(
                    rename({
                        basename: 'search-page',
                        dirname: songbook_id,
                        extname: '.html'
                    })
                )
                .pipe(gulp.dest(BUILD.ROOT), taskDone);

        task.displayName = 'search-page ' + songbook_id;
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
gulp.task('songbook-contents', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {

        const current_i18n = i18n(songbook_id);
        const info = getSongbookInfo(songbook_id);

        const headParts = {
            title: current_i18n('Contents'),
            description: current_i18n('Vaishnava Songbook'),
            path: PATHS.PAGES.getIndexPath(songbook_id)
        };

        const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.CONTENTS_PAGE} ${BUILD.ROOT}/${songbook_id}/${FILES.HTML.INDEX_PAGE}`;

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.CONTENTS_PAGE)
            .pipe(
                ejs({
                    categories: require(BUILD.getContentsFile(songbook_id)),
                    headParts: createHeadParts(headParts),
                    i18n: current_i18n,
                    paths: getTemplatePaths(songbook_id),
                    songbook_id: songbook_id,
                    subtitle: info.subtitle,
                    title: info.title
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
gulp.task('songbook-a-z', (done) => {
    const tasks = getSongbookIdList().map(songbook_id => {

        const headParts = {
            title: i18n(songbook_id)('Index'),
            description: i18n(songbook_id)('Vaishnava Songbook'),
            path: PATHS.PAGES.getIndexAZPath(songbook_id)
        };

        const info = getSongbookInfo(songbook_id);
        const extChangeCmd = `mv ${BUILD.ROOT}/${FILES.EJS.A_Z_PAGE} ${BUILD.ROOT}/${songbook_id}/${FILES.HTML.INDEX_A_Z_PAGE}`;

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.A_Z_PAGE)
            .pipe(
                ejs({
                    headParts: createHeadParts(headParts),
                    i18n: i18n(songbook_id),
                    items: makeIndexList(require(BUILD.getContentsFile(songbook_id)), require(BUILD.getIndexFile(songbook_id))),
                    paths: getTemplatePaths(songbook_id),
                    songbook_id: songbook_id,
                    subtitle: info.subtitle,
                    title: info.title
                }).on('error', console.error)
            )
            .pipe(gulp.dest(BUILD.ROOT + ''))
            // TODO: use rename?
            .pipe(shell([extChangeCmd]), done);

        task.displayName = "songbook-a-z " + songbook_id;
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
gulp.task('redirect-pages', (done) => {
    const pagePaths = [
        PAGES.A_Z,
        PAGES.BOOK_LIST,
        PAGES.CONTENTS,
        PAGES.NOT_FOUND,
        PAGES.SEARCH
    ];

    const nameMap = {
        [PAGES.A_Z]: BASE_FILE_NAMES.A_Z,
        [PAGES.BOOK_LIST]: BASE_FILE_NAMES.BOOK_LIST,
        [PAGES.CONTENTS]: BASE_FILE_NAMES.CONTENTS,
        [PAGES.NOT_FOUND]: BASE_FILE_NAMES.NOT_FOUND,
        [PAGES.SEARCH]: BASE_FILE_NAMES.SEARCH
    };

    const tasks = pagePaths.map((pagePath) => {
        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.REDIRECT_PAGE)
            .pipe(
                ejs({ pagePath: pagePath }).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: nameMap[pagePath],
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done);

        task.displayName = 'redirect-page ' + pagePath;
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
                basename: 'robots',
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
        'copy-js',
        'copy-img',
        'copy-font',
        'sass',
        'md2json',
        'generate-contents',
        'generate-index',
        'html',
        'search-page',
        'songbook-contents',
        'songbook-a-z',
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
        gulp.series(['html', 'songbook-contents', 'songbook-a-z', 'songbooks'])
    );
});
