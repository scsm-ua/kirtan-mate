const path = require('path');
const fs = require('fs');

var songbookPath;

function findSongbook() {
    var modulesRootPath = path.resolve(__dirname, '../node_modules');
    var modules_listing = fs.readdirSync(modulesRootPath).map(module_name => path.resolve(modulesRootPath, module_name));
    
    for (const modulePath of modules_listing) {
        var songbookInfoPath = path.resolve(modulePath, 'songbook.json');
        if (fs.existsSync(songbookInfoPath)) {
            songbookPath = modulePath;
            console.log('--- Loading songbook:', modulePath)
            return;
        }
    }
}

function getContentsFilePath() {
    return songbookPath + '/contents.md';
}

function getSongsPath() {
    return songbookPath + '/songs';
}

findSongbook();

module.exports = {
    getContentsFilePath: getContentsFilePath,
    getSongsPath: getSongsPath
};