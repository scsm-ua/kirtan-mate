const fs = require('fs');
const path = require('path');

const { PATHS } = require('./constants');
const { BUILD } = PATHS;
const { getContentsFilePath, getIndexFilePath, getSongbookIdList } = require('./songbookLoader');
const { getExistingTelegraphPage } = require('./telegraph/utils');

const { Song } = require('./Song');

/**
 * Exported.
 * 
 * @param text: string
 * @return {TSongJSON}
 */
function convertSong(text) {
    var song = new Song({text});
    return song.json;
}

// Index.
function getContentsJSON(songbook_id) {
    var data = fs.readFileSync(getContentsFilePath(songbook_id));
    var text = data.toString();
    var categories = convertContentsToJSON(songbook_id, text);

    // Filter empty categories.
    categories = categories.filter((category) => category.items.length > 0);

    //console.log(JSON.stringify(categories, null, 4));
    return categories;
}

function getIndexJSON(songbook_id) {
    var indexFilePath = getIndexFilePath(songbook_id);
    if (fs.existsSync(indexFilePath)) {
        var data = fs.readFileSync(indexFilePath);
        var text = data.toString();
        var index = convertIndexToJSON(text);
    
        // console.log(JSON.stringify(index, null, 4));
        return index;
    } else {
        // Fallback to empty.
        return convertIndexToJSON('');
    }
}

function convertIndexToJSON(text) {
    var lines = text.split(/\n/).filter(i => !!i);
    var songs = {};

    lines.forEach((line) => {

        var match = line.match(/^\s?- \[([^\]]+)\]\(songs\/([^\)]+)\.md\)/);

        if (match) {
            var song_alias = match[1];
            var song_id = match[2];
            if (!(song_id in songs)) {
                songs[song_id] = song_alias;
            } else {
                console.warn('- Duplicate index line', line);
            }
        } else {
            console.warn('- No match in index for line', line);
        }
    });

    return songs;
}

function convertContentsToJSON(songbook_id, text) {
    var lines = text.split(/\n/);
    var categories = [];
    var last_line_id;

    function getLastCategory(options) {
        if ((options && options.create_new) || !categories.length) {
            // Category template.
            categories.push({
                name: null,
                items: []
            });
        }

        return categories[categories.length - 1];
    }

    lines.forEach((line) => {
        var { line_id, name, filename } = getIndexLineInfo(line);
        switch (line_id) {
            case 'name':
                var cateogory = getLastCategory({ create_new: true });
                cateogory.name = name;
                break;
            case 'song':
                var fileName = filename + '.html';
                var pageRelativePath = `${ PATHS.RELATIVE.toPublicSongs(songbook_id) }/${ fileName }`;
                getLastCategory().items.push({
                    id: filename,
                    title: name,
                    name: getSongName(songbook_id, filename),
                    // TODO: trim
                    // TODO: replace tabs
                    // TODO: trim -
                    aliasName: getSongFirstLine(songbook_id, filename),
                    fileName: fileName,
                    page: getSongPage(songbook_id, filename),
                    embeds: getSongEmbedsTitles(songbook_id, filename),
                    telegraphPath: getExistingTelegraphPage(pageRelativePath)?.path
                });
                break;
            default:
            // Silent. Too much non used lines.
        }
        last_line_id = line_id;
    });

    return categories;
}

const index_line_types = {
    name: /^### (.+)/,
    // Extract only filename without extension.
    song: /^\s?- \[([^\]]+)\]\(songs\/([^\)]+)\.md\)/
};

function getIndexLineInfo(line) {
    for (var id in index_line_types) {
        var m = line.match(index_line_types[id]);
        if (m) {
            return {
                line_id: id,
                name: m[1],
                filename: m[2]
            };
        }
    }
    return {
        line_id: null,
        name: null,
        filename: null
    };
}


var songbooks_cache = {};

function getSongJSON(songbook_id, filename, silent) {

    var songbook_cache = songbooks_cache[songbook_id] = songbooks_cache[songbook_id] || {};

    if (songbook_cache[filename]) {
        return songbook_cache[filename];
    }

    var filepath = path.resolve(PATHS.BUILD.getJsonPath(songbook_id), filename + '.json');
    if (!fs.existsSync(filepath)) {
        // TODO: better errors processing.
        if (!silent) {
            console.error('Song JSON not found', filepath);
        }
        return;
    }

    songbook_cache[filename] = require(filepath);
    return songbook_cache[filename];
}

function getSongName(songbook_id, filename) {
    var song_json = getSongJSON(songbook_id, filename);
    if (!song_json) {
        return;
    }
    return song_json.title[0];
}

function getSongPage(songbook_id, filename) {
    var song_json = getSongJSON(songbook_id, filename);
    if (!song_json) {
        return;
    }
    return song_json.attributes?.page;
}

function getSongFirstLine(songbook_id, filename) {
    var song_json = getSongJSON(songbook_id, filename);
    if (!song_json) {
        return;
    }
    var first_verse = song_json.verses.find((verse) => verse.number);
    if (!first_verse) {
        // Get first verse if no numbers.
        first_verse = song_json.verses[0];
    }
    var first_line = first_verse?.text && first_verse.text[0];
    if (!first_line) {
        // TODO: better errors processing.
        console.error('Song first line not found', filename);
        return;
    }
    return first_line.trim();
}

function getSongEmbedsTitles(songbook_id, filename) {
    var embeds;
    getSongbookIdList().find(a_songbook_id => {
        var song_json = getSongJSON(a_songbook_id, filename, true);
        if (!song_json) {
            return;
        }
        if (song_json.embeds?.length) {
            embeds = song_json.embeds?.map(i => i.title);
        }
        return embeds;
    });
    return embeds;
}

function getContentSongPageNumber(song) {
    if (song.page) {
        if (Array.isArray(song.page)) {
            if (!song.duplicates) {
                console.warn('Incorrect pages and duplicates', song.page);
                return song.page[0];
                } else {
                var songOrder = song.duplicates.findIndex(s => s.idx === song.idx);
                if (songOrder > -1 && songOrder < song.page.length) {
                    return song.page[songOrder];
                } else {
                    console.warn('Incorrect pages and duplicates', song.page, song.duplicates);
                }
            }
        } else {
            return song.page;
        }
    }
}

var contents_cache = {};
var ordered_contents_cache = {};

function getSongsContents(songbook_id) {

    if (!(songbook_id in contents_cache)) {
        contents_cache[songbook_id] = require(BUILD.getContentsFile(songbook_id));

        // Store flat list in cache.
        var list = ordered_contents_cache[songbook_id] = contents_cache[songbook_id].flatMap((cat) => cat.items);
        // Put idx.
        list.forEach((item, idx) => {
            item.idx = idx;
            var duplicates = list.filter(i => i.id === item.id);
            if (duplicates.length > 1) {
                item.duplicates = duplicates;
            }
        });
        list.forEach(item => {
            item.page_number = getContentSongPageNumber(item);
        });

        list.forEach(item => {
            var pageHref = `${ PATHS.RELATIVE.toPublicSongs(songbook_id) }/${ item.fileName }`;
            var page = getExistingTelegraphPage(pageHref);
            if (page) {
                item.telegraph_views = page.views;
            }
        });
    }

    return contents_cache[songbook_id];
}

function getSongsOrderedList(songbook_id) {
    // Fill cache.
    getSongsContents(songbook_id);
    return ordered_contents_cache[songbook_id];
}

/**
 * Debug.
 */
//readSongs();
//getIndexJSON();

/**/
module.exports = {
    convertMDToJSON: convertSong,
    getContentsJSON: getContentsJSON,
    getIndexJSON: getIndexJSON,
    getSongJSON: getSongJSON,
    getSongsContents: getSongsContents,
    getSongsOrderedList: getSongsOrderedList
};
