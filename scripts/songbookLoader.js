const path = require('path');
const fs = require('fs');


var songbooks = {};
var publicSongbooks = {};

/**
 *
 */
function findSongbooks() {
    var modulesRootPath = path.resolve(__dirname, '../node_modules');
    var modules_listing = fs.readdirSync(modulesRootPath).map(module_name => path.resolve(modulesRootPath, module_name));

    for (const modulePath of modules_listing) {
        var songbookInfoPath = path.resolve(modulePath, 'songbook.json');
        if (fs.existsSync(songbookInfoPath)) {
            var songbookInfo = require(songbookInfoPath);
            songbookInfo.path = modulePath;
            songbooks[songbookInfo.slug] = songbookInfo;

            songbookInfo.sort_order = songbookInfo.sort_order || 0;

            console.log('--- Loaded songbook:', modulePath)
        }
    }

    var songbookSortedEntries = Object.entries(songbooks).sort(([, a], [, b]) => a.sort_order - b.sort_order);

    songbooks = Object.fromEntries(songbookSortedEntries);

    publicSongbooks = Object.fromEntries(songbookSortedEntries.filter(([, songbook]) => !songbook.hidden));

    console.log('--- All songbooks order:', getSongbookIdList())
    console.log('--- Public songbooks order:', getSongbookIdList({public: true}))
    
}

function getContentsFilePath(songbook_id) {
    return songbooks[songbook_id].path + '/contents.md';
}

function getIndexFilePath(songbook_id) {
    return songbooks[songbook_id].path + '/index.md';
}

function getSongsPath(songbook_id) {
    return songbooks[songbook_id].path + '/songs';
}

function getSongbookIdList(options) {

    var public = options?.public;

    // Filter hidden.
    if (public) {
        return Object.keys(publicSongbooks);
    } else {
        return Object.keys(songbooks);
    }
}

function getSongbookInfo(songbook_id) {
    return songbooks[songbook_id];
}

findSongbooks();


/**
 *
 */
module.exports = {
    getContentsFilePath: getContentsFilePath,
    getIndexFilePath: getIndexFilePath,
    getSongsPath: getSongsPath,
    getSongbookIdList: getSongbookIdList,
    getSongbookInfo: getSongbookInfo
};
