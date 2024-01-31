const fs = require('fs');
const path = require('path');

const { PATHS } = require('../scripts/constants');
const { getContentsFilePath, getSongsPath, getIndexFilePath } = require('./songbookLoader');

// Songs.

function readSongs() {
    var songs = {};
    fs.readdirSync(getSongsPath()).forEach((file) => {
        var song_path = path.resolve(getSongsPath(), file);
        songs[file] = processSong(song_path);
    });

    console.log(JSON.stringify(songs, null, 4));
}

function processSong(filename) {
    var data = fs.readFileSync(filename);
    var text = data.toString();
    return convertSongToJSON(text);
}

/**
 *
 * @param text: string
 * @return {TSongJSON}
 */
function convertSongToJSON(text) {
    var lines = text.split(/\n/);
    // Filter empty lines.
    lines = lines.filter((i) => i.trim());

    // Song template.
    var song = {
        title: null,
        author: null,
        verses: []
    };

    function getLastVerse(options) {
        if ((options && options.create_new) || !song.verses.length) {
            // Verse template.
            song.verses.push({
                number: null,
                text: [],
                translation: []
            });
        }

        return song.verses[song.verses.length - 1];
    }

    var last_line_id;

    // TODO: shikshastakam first verse has no number
    lines.forEach((line) => {
        var { line_id, line_value } = getSongLineInfo(line);
        switch (line_id) {
            case 'title':
                song.title = line_value;
                break;
            case 'author':
                song.author = line_value;
                break;
            case 'verse_number':
                getLastVerse({ create_new: true }).number = line_value;
                break;
            case 'verse_text':
                getLastVerse({
                    create_new: last_line_id === 'translation'
                }).text.push(line_value);
                break;
            case 'translation':
                getLastVerse().translation.push(line_value);
                break;
            default:
                // TODO: better errors processing.
                console.error("Can't recognize line id", line_id, line_value);
        }
        last_line_id = line_id;
    });

    return song;
}

/**/
const song_line_types = {
    title: /^# (.+)/,
    author: /^## (.+)/,
    verse_number: /^#### (.+)/,
    verse_text: /^    (.+)/,
    translation: /^([^\s#].+)/
};

/**
 * @param text: string
 * @return {TSongJSON}
 */
function convertSong(text) {
    return postProcessSong(convertSongToJSON(text));
}

/**
 * @param song: TSongJSON
 * @returns {TSongJSON}
 */
function postProcessSong(song) {
    return {
        ...song,
        verses: song.verses.map((verse) => ({
            ...verse,
            translation: processTranslation(verse.translation)
        }))
    };
}

/**/
const NOTE_MD_REGEX = /\*\*\*(.*?)\*\*\*/gm;
const TERM_MD_REGEX = /\*{1,2}(.*?)\*{1,2}/gm;

/**
 * Handles 'hindi' terms, soft line breaks and notes.
 * @param lines: string[]
 * @return {string[]}
 */
function processTranslation(lines) {
    return lines
        .join('\n')
        .replace(NOTE_MD_REGEX, '<i class="SongVerse__note">$1</i>\n')
        .replace(TERM_MD_REGEX, '<i class="SongVerse__term">$1</i>')
        .replaceAll('\\\n', '<br class="SongVerse__break" />')
        .split(/\n/);
}

/**
 *
 */
function getSongLineInfo(line) {
    for (var id in song_line_types) {
        var m = line.match(song_line_types[id]);
        if (m) {
            return {
                line_id: id,
                line_value: m[1].trimEnd()
            };
        }
    }
    return {
        line_id: null,
        line_value: null
    };
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
        var { line_id, name } = getIndexLineInfo(line);
        switch (line_id) {
            case 'name':
                var cateogory = getLastCategory({ create_new: true });
                cateogory.name = name;
                break;
            case 'song':
                getLastCategory().items.push({
                    id: name,
                    name: getSongName(songbook_id, name),
                    // TODO: trim
                    // TODO: replace tabs
                    // TODO: trim -
                    aliasName: getSongFirstLine(songbook_id, name),
                    fileName: name + '.html'
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
    song: /^\s?- \[[^\]]+\]\(songs\/([^\)]+)\.md\)/
};

function getIndexLineInfo(line) {
    for (var id in index_line_types) {
        var m = line.match(index_line_types[id]);
        if (m) {
            return {
                line_id: id,
                name: m[1]
            };
        }
    }
    return {
        line_id: null,
        name: null
    };
}


var songs_cache = {};

function getSongJSON(songbook_id, filename) {
    if (songs_cache[filename]) {
        return songs_cache[filename];
    }

    var filepath = path.resolve(PATHS.BUILD.getJsonPath(songbook_id), filename + '.json');
    if (!fs.existsSync(filepath)) {
        // TODO: better errors processing.
        console.error('Song JSON not found', filepath);
        return;
    }

    songs_cache[filename] = require(filepath);
    return songs_cache[filename];
}

function getSongName(songbook_id, filename) {
    var song_json = getSongJSON(songbook_id, filename);
    if (!song_json) {
        return;
    }
    return song_json.title;
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

/**
 * Debug.
 */
//readSongs();
//getIndexJSON();

/**/
module.exports = {
    convertMDToJSON: convertSong,
    getContentsJSON: getContentsJSON,
    getIndexJSON: getIndexJSON
};