const path = require('path');
const fs = require('fs');

var songbookPath;
var songbookInfo;

function findSongbook() {
    var modulesRootPath = path.resolve(__dirname, '../node_modules');
    var modules_listing = fs.readdirSync(modulesRootPath).map(module_name => path.resolve(modulesRootPath, module_name));
    
    for (const modulePath of modules_listing) {
        var songbookInfoPath = path.resolve(modulePath, 'songbook.json');
        if (fs.existsSync(songbookInfoPath)) {
            songbookInfo = require(songbookInfoPath);
            songbookPath = modulePath;
            console.log('--- Loading songbook:', modulePath)
            return;
        }
    }
}

function getContentsFilePath() {
    return songbookPath + '/contents.md';
}

function getIndexFilePath() {
    return songbookPath + '/index.md';
}

function getSongsPath() {
    return songbookPath + '/songs';
}

findSongbook();

module.exports = {
    getContentsFilePath: getContentsFilePath,
    getIndexFilePath: getIndexFilePath,
    getSongsPath: getSongsPath,
    songbookInfo: songbookInfo
};