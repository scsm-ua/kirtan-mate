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

function deepCleanObject(obj, whitelist) {
    if (Array.isArray(obj)) {
        return obj.map(item => deepCleanObject(item, whitelist));
    } else if (typeof obj === 'object' && obj !== null) {
        let newObj = {};
        for (let key of Object.keys(obj)) {
            if (whitelist.includes(key)) {
                newObj[key] = deepCleanObject(obj[key], whitelist);
            }
        }
        return newObj;
    }
    return obj; // Return primitive values as is
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
                        
                        const isEqual = deepEqual(page, loaded_page, { 
                            strict: false,
                            // TODO: not working.
                            skipEmptyArrays: true,
                            skipEmptyObjects: true 
                        });

                        // console.log('-file', JSON.stringify(page, null, 4));
                        // console.log('-web', JSON.stringify(loaded_page, null, 4))
                        // console.log('---isEqual', isEqual);

                        if (!isEqual) {

                            // fs.writeFileSync('new_page.json', JSON.stringify(page, null, 4));
                            // fs.writeFileSync('exist_page.json', JSON.stringify(loaded_page, null, 4));
                            
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
    getExistingTelegraphPageHref
};
