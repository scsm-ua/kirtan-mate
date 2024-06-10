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
const { getContentsJSON } = require('./scripts/indexGenerator');
const {
    getJSONContentsStream,
    getJSONIndexStream,
    makeSongHTML,
    md2jsonConvertor
} = require('./scripts/songConvertor');
const { getNavigationPaths, getTemplatePaths } = require('./scripts/utils');
const { getSongsPath, getSongbookIdList, getSongbookInfo } = require('./scripts/songbookLoader');
const { getTranslationsBy } = require('./scripts/i18n');
const { makeIndexList } = require('./scripts/makeIndexList');
const { PATHS, SEARCH_CONST, BASE_FILE_NAMES } = require('./scripts/constants');
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

        task.displayName = 'html ' + songbook_id;
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
function getCommonPageContext(bookId) {
    const tr = getTranslationsBy(bookId);

    const songbooks = getSongbookIdList().map((songbook_id) => {
        const info = getSongbookInfo(songbook_id);
        const songsCount =  getContentsJSON(songbook_id)
            .flatMap((cat) => cat.items).length;

        return {
            href: getNavigationPaths(songbook_id).CONTENTS,
            isSelected: false,
            slug: songbook_id,
            songsCount: songsCount,
            subtitle: info.subtitle,
            title: info.title
        };
    });

    const paths = {
        toJs: PATHS.RELATIVE.JS,
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toPages: getNavigationPaths(bookId)
    };

    return {
        i18n: tr,
        paths: paths,
        songbooks: songbooks,
        songbooksAsOptions: songbooks
    };
}


/**
 * Path `/{bookId}/index.html`;
 * */
gulp.task('songbook-list', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const headParts = createHeadParts({
            title: tr('BOOK_LIST_PAGE.HEAD.TITLE'),
            description: tr('BOOK_LIST_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).BOOK_LIST
        });

        const values = {
            headParts: headParts,
            ...getCommonPageContext(songbook_id)
        };

        const task = (done) => gulp
            .src([SRC.EJS_FILES + '/' + FILES.EJS.BOOK_LIST_PAGE])
            .pipe(
                ejs(values).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.BOOK_LIST,
                    dirname: songbook_id,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done);

        task.displayName = 'index ' + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })();
});


/**
 *  Path `/{bookId}/404.html`;
 */
gulp.task('404', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);

        const headParts = createHeadParts({
            title: tr('NOT_FOUND_PAGE.HEAD.TITLE'),
            description: tr('NOT_FOUND_PAGE.HEAD.DESCRIPTION'),
            path: PATHS.PAGES.NOT_FOUND,
            is404: true
        });

        const values = {
            headParts: headParts,
            ...getCommonPageContext(songbook_id)
        };

        const task = (done) => gulp
            .src([SRC.EJS_FILES + '/' + FILES.EJS.NOT_FOUND_PAGE])
            .pipe(
                ejs(values).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.NOT_FOUND,
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
 * Path `/{bookId}/search.html`;
 */
gulp.task('search-page', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const headParts = {
            title: tr('SEARCH_PAGE.HEAD.TITLE'),
            description: tr('SEARCH_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).SEARCH
        };

        const pages = getContentsJSON(songbook_id)
            .flatMap(({ items }) =>
                items.map((item) => ({
                    page: item.page,
                    path: item.fileName,
                    title: item.title
                }))
            )
            .filter(page => page.page)
            .sort((a, b) =>
                parseFloat(a.page) - parseFloat(b.page)
            );

        const task = (taskDone) => gulp
                .src([SRC.EJS_FILES + '/' + FILES.EJS.SEARCH_PAGE])
                .pipe(
                    ejs({
                        headParts: createHeadParts(headParts),
                        i18n: tr,
                        pages: pages,
                        paths: getTemplatePaths(songbook_id),
                        search: SEARCH_CONST
                    }).on('error', console.error)
                )
                .pipe(
                    rename({
                        basename: BASE_FILE_NAMES.SEARCH,
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
 * Path `/{bookId}/contents.html`;
 * */
gulp.task('songbook-contents', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const info = getSongbookInfo(songbook_id);

        const headParts = {
            title: tr('CONTENTS_PAGE.HEAD.TITLE'),
            description: tr('CONTENTS_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).CONTENTS
        };

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.CONTENTS_PAGE)
            .pipe(
                ejs({
                    categories: require(BUILD.getContentsFile(songbook_id)),
                    headParts: createHeadParts(headParts),
                    i18n: tr,
                    paths: getTemplatePaths(songbook_id),
                    songbook_id: songbook_id,
                    subtitle: info.subtitle,
                    title: info.title
                }).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.CONTENTS,
                    dirname: songbook_id,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done);

        task.displayName = 'songbook-contents ' + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })();
});


/**
 * Path `/{bookId}/a-z.html`;
 */
gulp.task('songbook-a-z', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const info = getSongbookInfo(songbook_id);

        const headParts = {
            title: tr('A_Z_PAGE.HEAD.TITLE'),
            description: tr('A_Z_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).A_Z
        };

        const items = makeIndexList(
            require(BUILD.getContentsFile(songbook_id)),
            require(BUILD.getIndexFile(songbook_id))
        );

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.A_Z_PAGE)
            .pipe(
                ejs({
                    headParts: createHeadParts(headParts),
                    i18n: tr,
                    items: items,
                    paths: getTemplatePaths(songbook_id),
                    songbook_id: songbook_id,
                    subtitle: info.subtitle,
                    title: info.title
                }).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.A_Z,
                    dirname: songbook_id,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done)

        task.displayName = 'songbook-a-z ' + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })();
});


/**
 * Paths:
 *  `/a-z.html`         A_Z
 *  `/index.html`       BOOK_LIST
 *  `/contents.html`    CONTENTS
 *  `/404.html`         NOT_FOUND
 *  `/search.html`      SEARCH
 */
gulp.task('redirect-pages', (done) => {
    const bookIdList = getSongbookIdList().join(',');

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
                ejs({
                    bookIdList: bookIdList,
                    pagePath: pagePath
                }).on('error', console.error)
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
 * Path `/{bookId}/sitemap.xml`;
 */
gulp.task('sitemap', (done) => {
    let content = '';

    getSongbookIdList().forEach((bookId) =>
        content += createSongXMLParts(
            bookId,
            require(BUILD.getContentsFile(bookId))
        )
    );

    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.SITEMAP)
        .pipe(
            ejs({
                content: content
            }).on('error', console.error)
        )
        .pipe(
            rename({
                basename: BASE_FILE_NAMES.SITEMAP,
                extname: '.xml'
            })
        )
        .pipe(gulp.dest(BUILD.ROOT), done);
});


/**
 *
 */
gulp.task('robots', (done) => {
    return gulp
        .src(SRC.EJS_FILES + '/' + FILES.EJS.ROBOTS)
        .pipe(
            ejs({
                sitemap: encodeURI(FILES.SITEMAP)
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
        'songbook-list',
        '404',
        'redirect-pages',
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
        [SRC.EJS_FILES + '/**/*.ejs'],
        gulp.series(['html', 'songbook-contents', 'songbook-a-z', 'songbooks'])
    );
});
