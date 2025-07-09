const fs = require('fs');

const ejs = require('gulp-ejs');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const runSequence = require('gulp4-run-sequence');
const sass = require('gulp-sass')(require('sass'));
const shell = require('gulp-shell');
const shelljs = require('shelljs');

// Load local env.
require('dotenv').config();

/**/
const { createHeadParts, createSongXMLParts } = require('./scripts/createHeadParts');
const { getSongsContents, getSongsOrderedList } = require('./scripts/indexGenerator');
const {
    getJSONContentsStream,
    getJSONIndexStream,
    makeSongHTML,
    md2jsonConvertor
} = require('./scripts/songConvertor');
const { getNavigationPaths, getTemplatePaths, getTelegraphTemplatePaths } = require('./scripts/utils');
const { getSongsPath, getSongbookIdList, getSongbookInfo } = require('./scripts/songbookLoader');
const { getTranslationsBy } = require('./scripts/i18n');
const { makeIndexList, makeAuthorsList } = require('./scripts/makeIndexList');
const version = require('./package.json').version;

const { PATHS, SEARCH_CONST, BASE_FILE_NAMES } = require('./scripts/constants');
const { makeTelegraphElements, getAllTelegraphPages, createOrUpdateTelegraphPage } = require('./scripts/telegraph/utils');
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
 * Loads all telegraph pages from account in local memory.
 */
gulp.task('telegraph-load-existing-pages', (done) => {
    getAllTelegraphPages((err, pages) => {
        if (err) {
            console.error('Telegraph pages loading error:', err);
        } else {
            console.log('Telegraph pages loaded:', pages.length);
        }
        done();
    });
});

/**
 *
 */
gulp.task('telegraph-html', (done) => {
    const template = fs.readFileSync(
        SRC.EJS_FILES + '/telegraph/' + FILES.EJS.SONG_PAGE
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
                .pipe(gulp.dest(BUILD.getTelegraphHtmlRoot(songbook_id)), done);

        task.displayName = 'telegraph-html ' + songbook_id;
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
gulp.task('telegraph-elements', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        var task = (done) => gulp
                .src([
                    BUILD.getTelegraphHtmlRoot(songbook_id) + '/*.html'
                ])
                .pipe(makeTelegraphElements(songbook_id))
                .pipe(
                    rename({
                        extname: '.json'
                    })
                )
                .pipe(gulp.dest(BUILD.getTelegraphJsonRoot(songbook_id)), done);

        task.displayName = 'telegraph-elements ' + songbook_id;
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
gulp.task('telegraph-songs-push', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        var task = (done) => gulp
                .src([
                    BUILD.getTelegraphJsonRoot(songbook_id) + '/*.json'
                ])
                .pipe(createOrUpdateTelegraphPage(), done);

        task.displayName = 'telegraph-songs-push ' + songbook_id;
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
        const task = (done) => getJSONIndexStream(songbook_id).pipe(gulp.dest(BUILD.getJsonPath(songbook_id)), done);
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

    const allSongbooks = getSongbookIdList({public: true}).map((songbook_id) => {
        const info = getSongbookInfo(songbook_id);
        const songsCount = getSongsOrderedList(songbook_id).length;

        const paths = getNavigationPaths(songbook_id);

        return {
            href: paths.CONTENTS,
            telegraph_href: paths.PUBLIC_CONTENTS,
            booklist_telegraph_href: paths.PUBLIC_BOOK_LIST,
            isSelected: bookId === songbook_id,
            slug: songbook_id,
            songsCount: songsCount,
            subtitle: info.subtitle,
            title: info.title
        };
    });

    const languages = allSongbooks.filter(({ slug }) => slug.indexOf('-') === -1);

    const songbooks = [
        ...allSongbooks.filter(({ slug }) => slug === bookId),
        ...allSongbooks.filter(({ slug }) => slug !== bookId)
    ];

    const paths = {
        toJs: PATHS.RELATIVE.JS,
        toCss: PATHS.RELATIVE.CSS,
        toImages: PATHS.RELATIVE.IMG,
        toTelegraphImages: PATHS.RELATIVE.TELEGRAPH_IMG,
        toPartials: path.join(process.cwd(), PATHS.SRC.EJS_PARTIALS_FILES),
        toPages: getNavigationPaths(bookId)
    };

    return {
        i18n: tr,
        paths: paths,
        songbooks: songbooks,
        languages: languages
    };
}


/**
 * Path `/{bookId}/index.html`;
 * */
gulp.task('songbook-list', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const buildInfo = {
            builtAt: new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC',
            commitHash: shelljs.exec("git log --pretty=format:'%h' -n 1").stdout,
            version: version
        };

        const headParts = createHeadParts({
            title: tr('BOOK_LIST_PAGE.HEAD.TITLE'),
            description: tr('BOOK_LIST_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).BOOK_LIST
        });

        const values = {
            buildInfo: JSON.stringify(buildInfo),
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

gulp.task('telegraph-songbook-list', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);

        const context = getCommonPageContext(songbook_id);

        context.subtitle = tr('BOOK_LIST_PAGE.HEAD.TITLE');

        const task = (done) => gulp
            .src([SRC.EJS_FILES + '/telegraph/' + FILES.EJS.BOOK_LIST_PAGE])
            .pipe(
                ejs(context).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.BOOK_LIST,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.getTelegraphHtmlRoot(songbook_id)), done);

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
            is404: true,
            songbook_id
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
        const info = getSongbookInfo(songbook_id);
        const tr = getTranslationsBy(songbook_id);

        const headParts = {
            title: tr('SEARCH_PAGE.HEAD.TITLE'),
            description: tr('SEARCH_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).SEARCH,
            songbook_id
        };

        const pagesDict = {};

        getSongsOrderedList(songbook_id)
            .flatMap((item) => {
                if (Array.isArray(item.page)) {
                    // Multiple pages.
                    return item.page.map((p, idx) => ({
                        page: p,
                        path: item.fileName + (idx > 0 ? `?p=${ p }` : ''),
                        title: item.title
                    }))
                } else {
                    return {
                        page: item.page,
                        path: item.fileName,
                        title: item.title
                    };
                }
            })
            .filter(page => page.page)
            .sort((a, b) =>
                parseFloat(a.page) - parseFloat(b.page)
            )
            .forEach(item => {
                // Get unique pages.
                pagesDict[item.page] = item;
            });

        const pages = Object.values(pagesDict);

        const task = (taskDone) => gulp
                .src([SRC.EJS_FILES + '/' + FILES.EJS.SEARCH_PAGE])
                .pipe(
                    ejs({
                        headParts: createHeadParts(headParts),
                        i18n: tr,
                        pages: pages,
                        paths: getTemplatePaths(songbook_id),
                        search: SEARCH_CONST,
                        songbook_id: songbook_id,
                        subtitle: info.subtitle,
                        title: info.title
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

gulp.task('telegraph-search-page', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const info = getSongbookInfo(songbook_id);
        const tr = getTranslationsBy(songbook_id);

        const pagesDict = {};

        getSongsOrderedList(songbook_id)
            .flatMap((item) => {
                if (Array.isArray(item.page)) {
                    // Multiple pages.
                    return item.page.map((p, idx) => ({
                        page: p,
                        path: item.fileName + (idx > 0 ? `?p=${ p }` : ''),
                        // TODO: mutlipages?
                        telegraphPath: item.telegraphPath,
                        title: item.title
                    }))
                } else {
                    return {
                        page: item.page,
                        path: item.fileName,
                        telegraphPath: item.telegraphPath,
                        title: item.title
                    };
                }
            })
            .filter(page => page.page)
            .sort((a, b) =>
                parseFloat(a.page) - parseFloat(b.page)
            )
            .forEach(item => {
                // Get unique pages.
                pagesDict[item.page] = item;
            });

        const pages = Object.values(pagesDict);

        const task = (taskDone) => gulp
                .src([SRC.EJS_FILES + '/telegraph/' + FILES.EJS.SEARCH_PAGE])
                .pipe(
                    ejs({
                        i18n: tr,
                        items: pages,
                        paths: getTelegraphTemplatePaths(songbook_id),
                        songbook_id: songbook_id,
                        subtitle: info.subtitle,
                        title: info.title
                    }).on('error', console.error)
                )
                .pipe(
                    rename({
                        basename: BASE_FILE_NAMES.SEARCH,
                        extname: '.html'
                    })
                )
                .pipe(gulp.dest(BUILD.getTelegraphHtmlRoot(songbook_id)), taskDone);

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
            path: getNavigationPaths(songbook_id).CONTENTS,
            songbook_id
        };

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.CONTENTS_PAGE)
            .pipe(
                ejs({
                    categories: getSongsContents(songbook_id),
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
 * Path `/{bookId}/contents.html`;
 * */
gulp.task('telegraph-songbook-contents', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const info = getSongbookInfo(songbook_id);

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/telegraph/' + FILES.EJS.CONTENTS_PAGE)
            .pipe(
                ejs({
                    categories: getSongsContents(songbook_id),
                    i18n: tr,
                    paths: getTelegraphTemplatePaths(songbook_id),
                    songbook_id: songbook_id,
                    songbooks_count: getSongbookIdList({public: true}).length,
                    subtitle: info.subtitle,
                    title: info.title,
                    render: {
                        page_number: !info.render || info.render["tg.contents.page_number"] !== false,
                        first_line: !info.render || info.render["tg.contents.first_line"] !== false
                    }
                }).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.CONTENTS,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.getTelegraphHtmlRoot(songbook_id)), done);

        task.displayName = 'songbook-contents-telegraph ' + songbook_id;
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
            path: getNavigationPaths(songbook_id).A_Z,
            songbook_id
        };

        const items = makeIndexList(songbook_id);

        const sections = items.map((item) => ({
            page: item.name,
            path: `#section-${item.name}`,
            title: item.name
        }));

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.A_Z_PAGE)
            .pipe(
                ejs({
                    headParts: createHeadParts(headParts),
                    i18n: tr,
                    items: items,
                    paths: getTemplatePaths(songbook_id),
                    sections: sections,
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


gulp.task('telegraph-songbook-a-z', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const info = getSongbookInfo(songbook_id);

        const items = makeIndexList(songbook_id);

        const sections = items.map((item) => ({
            page: item.name,
            title: item.name
        }));

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/telegraph/' + FILES.EJS.A_Z_PAGE)
            .pipe(
                ejs({
                    i18n: tr,
                    items: items,
                    paths: getTelegraphTemplatePaths(songbook_id),
                    sections: sections,
                    songbook_id: songbook_id,
                    songbooks_count: getSongbookIdList({public: true}).length,
                    subtitle: info.subtitle,
                    title: info.title,
                    render: {
                        embed_exists: !info.render || info.render["tg.a-z.embeds"] !== false,
                        short_page_number: !info.render || info.render["tg.a-z.pages.short"] === true
                    }
                }).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.A_Z,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.getTelegraphHtmlRoot(songbook_id)), done);

        task.displayName = 'songbook-a-z ' + songbook_id;
        return task;
    });

    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })();
});

/**
 * Path `/{bookId}/authors.html`;
 */
gulp.task('songbook-authors', (done) => {
    const tasks = getSongbookIdList().map((songbook_id) => {
        const tr = getTranslationsBy(songbook_id);
        const info = getSongbookInfo(songbook_id);

        const headParts = {
            title: tr('AUTHORS_PAGE.HEAD.TITLE'),
            description: tr('AUTHORS_PAGE.HEAD.DESCRIPTION'),
            path: getNavigationPaths(songbook_id).A_Z,
            songbook_id
        };

        const items = makeAuthorsList(songbook_id);

        const sections = items.map((item) => ({
            type: 'author',
            page: `${item.name} (${item.items.length})`,
            path: `#section-${item.name}`,
            title: item.name
        }));

        const task = (done) => gulp
            .src(SRC.EJS_FILES + '/' + FILES.EJS.A_Z_PAGE)
            .pipe(
                ejs({
                    headParts: createHeadParts(headParts),
                    i18n: tr,
                    items: items,
                    paths: getTemplatePaths(songbook_id),
                    sections: sections,
                    songbook_id: songbook_id,
                    subtitle: info.subtitle,
                    title: info.title
                }).on('error', console.error)
            )
            .pipe(
                rename({
                    basename: BASE_FILE_NAMES.AUTHORS,
                    dirname: songbook_id,
                    extname: '.html'
                })
            )
            .pipe(gulp.dest(BUILD.ROOT), done)

        task.displayName = 'songbook-authors ' + songbook_id;
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
    const bookIdList = getSongbookIdList({public: true}).join(',');

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
                    origin: PATHS.ORIGIN,
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

    getSongbookIdList({public: true}).forEach((bookId) =>
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
        'telegraph-load-existing-pages',
        'generate-contents',
        'generate-index',
        'html',
        'search-page',
        'songbook-contents',
        'songbook-a-z',
        'songbook-authors',
        'sitemap',
        'songbook-list',
        '404',
        'redirect-pages',
        'robots',
        done
    );
});

gulp.task('build-tg', (done) => {
    runSequence(
        'clean',
        'md2json',
        'telegraph-load-existing-pages',
        'generate-contents',
        'generate-index',
        'telegraph-html',    // Comment to update contents only.
        'telegraph-songbook-contents',
        'telegraph-songbook-a-z',
        'telegraph-search-page',
        'telegraph-songbook-list',
        'telegraph-elements',
        'telegraph-songs-push',
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
