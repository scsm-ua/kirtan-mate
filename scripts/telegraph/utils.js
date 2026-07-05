const { Transform, PassThrough } = require('stream');
const { convertHtmlToElementTree } = require('./telegraph-content');
const { PATHS } = require('../constants');
const path = require('path');
const { loadAllTelegraphPages, updateTelegraphPage, createTelegraphPage, getTelegraphPage } = require('./telegraph-api');
const { TelegraphPage } = require('./TelegraphPage');
const deepEqual = require('deep-equal');
const fs = require('fs');

function convertHtmlToTelegraphElements(songbook_id, content, file_path) {
    if (!PATHS.PUBLIC_ORIGIN) {
        throw new Error('PUBLIC_ORIGIN required')
    }
    var { title, elements } = convertHtmlToElementTree(content);
    const filename = path.parse(file_path).name;
    return {
        title: title,
        author_name: 'kirtan.site',
        author_url: PATHS.PUBLIC_ORIGIN + '/' + songbook_id + '/' + filename + '.html',
        content: elements
    };
}

function makeTelegraphElements(songbook_id) {
    return new Transform({
        objectMode: true,

        transform(file, encoding, callback) {
            try {
                const elements = convertHtmlToTelegraphElements(
                    songbook_id,
                    file.contents.toString(),
                    file.path
                );

                const htmlString = JSON.stringify(elements, null, 4);

                file.contents = Buffer.from(htmlString, 'utf8');
                this.push(file);
                callback();

            } catch (error) {
                callback(error);
            }
        }
    });
}

const updated_attrs = ['title', 'author_name', 'author_url', 'content'];

function isEmptyContainer(value) {
    if (Array.isArray(value)) return value.length === 0;
    if (value && typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

function deepCleanObject(obj, whitelist) {
    if (Array.isArray(obj)) {
        return obj.map(item => deepCleanObject(item, whitelist));
    } else if (typeof obj === 'object' && obj !== null) {
        let newObj = {};
        for (let key of Object.keys(obj).sort()) {
            if (!whitelist.includes(key)) continue;
            const cleaned = deepCleanObject(obj[key], whitelist);
            // Drop empty attrs/children so file and Telegraph-returned trees normalize the same way
            // (e.g. h4 attrs holding only a stripped `id`, or elements with no children).
            if (isEmptyContainer(cleaned)) continue;
            newObj[key] = cleaned;
        }
        return newObj;
    }
    return obj; // Return primitive values as is
}

function describeValue(v) {
    if (v === undefined) return '<undefined>';
    if (v === null) return '<null>';
    if (typeof v === 'string') return `str(${v.length}) ${JSON.stringify(v)}`;
    if (Array.isArray(v)) return `array(${v.length})`;
    if (typeof v === 'object') {
        const keys = Object.keys(v).sort().join(',');
        const tag = v.tag ? ` <${v.tag}>` : '';
        const href = v.attrs && v.attrs.href ? ` href=${JSON.stringify(v.attrs.href)}` : '';
        return `object{${keys}}${tag}${href}`;
    }
    return JSON.stringify(v);
}

function findFirstDiff(a, b, path = '$') {
    if (a === b) return null;
    if (typeof a !== typeof b || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
        return { path, a: describeValue(a), b: describeValue(b) };
    }
    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            return {
                path: path + '.length',
                a: a.length,
                b: b.length,
                sample_a: describeValue(a[Math.min(a.length, b.length)]),
                sample_b: describeValue(b[Math.min(a.length, b.length)])
            };
        }
        for (let i = 0; i < a.length; i++) {
            const d = findFirstDiff(a[i], b[i], `${path}[${i}]`);
            if (d) return d;
        }
        return null;
    }
    if (typeof a === 'object') {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of keys) {
            const d = findFirstDiff(a[k], b[k], `${path}.${k}`);
            if (d) return d;
        }
        return null;
    }
    return { path, a: describeValue(a), b: describeValue(b) };
}

function generatePageData(data) {
    var result = updated_attrs.reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
    }, {});

    result.content = deepCleanObject(result.content, ['tag', 'children', 'attrs', 'href', 'src']);

    return result;
}

function createOrUpdateTelegraphPage() {
    return new PassThrough({
        objectMode: true,

        transform(file, encoding, callback) {
            try {

                // if (file.path.indexOf('parama-karuna-pahu-dui-jana') === -1) {
                //     callback();
                //     return;
                // }

                const data = JSON.parse(file.contents.toString());

                // Copy only `updated_attrs` from elements.
                const page = generatePageData(data);

                const existingTelegraphPageJson = getExistingTelegraphPage(page.author_url);

                if (existingTelegraphPageJson) {

                    getTelegraphPage(existingTelegraphPageJson.path, true).then(loaded_page => {

                        loaded_page = generatePageData(loaded_page);

                        const isEqual = deepEqual(page, loaded_page, { strict: true });

                        if (!isEqual) {

                            // Debug: log the first diff and optionally dump both trees for offline inspection.
                            // const diff = findFirstDiff(page, loaded_page);
                            // console.log('Diff for', existingTelegraphPageJson.path, '->', JSON.stringify(diff));
                            // if (process.env.TELEGRAPH_DEBUG_DIFF) {
                            //     const songSlug = path.parse(file.path).name;
                            //     fs.writeFileSync(`debug_new_${songSlug}.json`, JSON.stringify(page, null, 4));
                            //     fs.writeFileSync(`debug_loaded_${songSlug}.json`, JSON.stringify(loaded_page, null, 4));
                            // }

                            // Extend `getExistingTelegraphPageJson` with `page` properties.
                            Object.assign(existingTelegraphPageJson, page);

                            // Prevent FLOOD_WAIT.
                            setTimeout(function() {
                                updateTelegraphPage(process.env.TELEGRAPH_ACCESS_TOKEN, new TelegraphPage(existingTelegraphPageJson)).then(response => {
                                    console.log('Updated Telegraph page:', response.error && file.path || '', response);

                                    if (response.error === 'CONTENT_TOO_BIG') {
                                        console.log('   -- skipping');
                                        return callback();
                                    }

                                    callback(response.error);
                                }).catch(error => {
                                    console.error('Error updating Telegraph page:', file.path, error);
                                    callback(error);
                                });
                            }, 1000);

                        } else {
                            console.log('Skip non updated page:', existingTelegraphPageJson.path);    
                            callback();
                        }
                    }).catch(error => {
                        console.error('Error getting Telegraph page:', file.path, error);
                        callback(error);
                    });

                } else {

                    // Prevent FLOOD_WAIT.
                    setTimeout(function() {
                        createTelegraphPage(process.env.TELEGRAPH_ACCESS_TOKEN, new TelegraphPage(page)).then(response => {
                            console.log('Created Telegraph page:', response.error && file.path || '', response);

                            if (response.error === 'CONTENT_TOO_BIG') {
                                console.log('   -- skipping');
                                return callback();
                            }

                            callback(response.error);
                        }).catch(error => {
                            console.error('Error creating Telegraph page:', file.path, error);
                            callback(error);
                        });
                    }, 1000);
                }
                
            } catch (error) {
                callback(error);
            }
        }
    });
}

var pagesCache;

function getAllTelegraphPages(cb) {
    if (pagesCache) {
        cb(null, pagesCache);
        return;
    }
    loadAllTelegraphPages(process.env.TELEGRAPH_ACCESS_TOKEN).then(pages => {
        pagesCache = pages;
        cb(null, pages)
    }).catch(err => {
        cb(err);
    });
}

const TELEGRAPH_EXPORT_FIELDS = ['path', 'url', 'title', 'author_url'];

function saveTelegraphPagesToJson(filePath, cb) {
    // Force refresh: pages may have been created/updated during this build.
    pagesCache = null;
    getAllTelegraphPages((err, pages) => {
        if (err) return cb(err);
        try {
            const minimal = pages
                .map(page => TELEGRAPH_EXPORT_FIELDS.reduce((acc, key) => {
                    if (page[key] !== undefined) acc[key] = page[key];
                    return acc;
                }, {}))
                .sort((a, b) => (a.path || '').localeCompare(b.path || ''));

            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(minimal, null, 2) + '\n', 'utf8');
            cb(null, minimal.length);
        } catch (writeErr) {
            cb(writeErr);
        }
    });
}

function getExistingTelegraphPage(author_url) {
    if (!pagesCache) {
        return;
    }
    return pagesCache.find(page => {
        return page.author_url === author_url;
    });
}

function getExistingTelegraphPageHref(url) {
    var path = getExistingTelegraphPage(url)?.path;
    if (path) {
        return '/' + path;
    }

    return url;
}

module.exports = {
    makeTelegraphElements,
    getAllTelegraphPages,
    createOrUpdateTelegraphPage,
    getExistingTelegraphPage,
    getExistingTelegraphPageHref,
    saveTelegraphPagesToJson
};
