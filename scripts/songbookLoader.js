const path = require('path');
const fs = require('fs');

var songbooks = {};

function findSongbooks() {
    var modulesRootPath = path.resolve(__dirname, '../node_modules');
    var modules_listing = fs.readdirSync(modulesRootPath).map(module_name => path.resolve(modulesRootPath, module_name));
    
    for (const modulePath of modules_listing) {
        var songbookInfoPath = path.resolve(modulePath, 'songbook.json');
        if (fs.existsSync(songbookInfoPath)) {
            var songbookInfo = require(songbookInfoPath);
            songbookInfo.path = modulePath;
            songbooks[songbookInfo.slug] = songbookInfo;

            console.log('--- Loaded songbook:', modulePath)
        }
    }
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

function getSongbooki18n(songbook_id) {
    return songbooks[songbook_id].i18n;
}

function getSongbookIdList() {
    return Object.keys(songbooks);
}

findSongbooks();

module.exports = {
    getContentsFilePath: getContentsFilePath,
    getIndexFilePath: getIndexFilePath,
    getSongsPath: getSongsPath,
    getSongbooki18n: getSongbooki18n,
    getSongbookIdList: getSongbookIdList
};