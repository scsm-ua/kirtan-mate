const fs = require('fs');
const path = require('path');

const { PATHS } = require('../scripts/constants');
const categories_meta = require(path.resolve(PATHS.SRC.JSON_CATEGORIES_FILE));

// Songs.

function readSongs() {
    var songs = {};
    fs.readdirSync(PATHS.SRC.MD_FILES).forEach((file) => {
        var song_path = path.resolve(PATHS.SRC.MD_FILES, file);
        songs[file] = processSong(song_path);
    });

    console.log(JSON.stringify(songs, null, 4));
}

function processSong(filename) {
    var data = fs.readFileSync(filename);
    var text = data.toString();
    return convertSongToJSON(text);
}

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

const song_line_types = {
    title: /^# (.+)/,
    author: /^## (.+)/,
    verse_number: /^#### (.+)/,
    verse_text: /^    (.+)/,
    translation: /^([^\s#].+)/
};

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

function getIndexJSON() {
    var data = fs.readFileSync(PATHS.SRC.MD_INDEX_FILE);
    var text = data.toString();
    var categories = convertIndexToJSON(text);

    // Filter empty categories.
    categories = categories.filter((category) => category.items.length > 0);

    //console.log(JSON.stringify(categories, null, 4));
    return categories;
}

function convertIndexToJSON(text) {
    var lines = text.split(/\n/);

    var categories = [];

    function getLastCategory(options) {
        if ((options && options.create_new) || !categories.length) {
            // Category template.
            categories.push({
                name: null,
                icon: null,
                items: []
            });
        }

        return categories[categories.length - 1];
    }

    var last_line_id;

    lines.forEach((line) => {
        var { line_id, name } = getIndexLineInfo(line);
        switch (line_id) {
            case 'name':
                var cateogory = getLastCategory({ create_new: true });
                cateogory.name = name;
                cateogory.icon = getCategoryIcon(name);
                break;
            case 'song':
                getLastCategory().items.push({
                    name: getSongName(name),
                    // TODO: trim
                    // TODO: replace tabs
                    // TODO: trim -
                    aliasName: getSongFirstLine(name),
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
    song: /^\s?- \[[^\]]+\]\(songs\/([^\)]+)\.md\)$/
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

function getCategoryIcon(name) {
    var caterory_meta_info = categories_meta.find((i) => i.name === name);
    var icon = caterory_meta_info?.icon || '';
    if (!icon) {
        // TODO: better errors processing.
        console.error('No category icon for', name);
    }
    return icon;
}

var songs_cache = {};

function getSongJSON(filename) {
    if (songs_cache[filename]) {
        return songs_cache[filename];
    }

    var filepath = path.resolve(PATHS.BUILD.JSON_FILES, filename + '.json');
    if (!fs.existsSync(filepath)) {
        // TODO: better errors processing.
        console.error('Song JSON not found', filepath);
        return;
    }

    songs_cache[filename] = require(filepath);
    return songs_cache[filename];
}

function getSongName(filename) {
    var song_json = getSongJSON(filename);
    if (!song_json) {
        return;
    }
    return song_json.title;
}

function getSongFirstLine(filename) {
    var song_json = getSongJSON(filename);
    if (!song_json) {
        return;
    }
    var first_verse = song_json.verses.find((verse) => verse.number);
    var first_line = first_verse?.text && first_verse.text[0];
    if (!first_line) {
        // TODO: better errors processing.
        console.error('Song first line not found', filename);
        return;
    }
    return first_line;
}

/**
 * Debug.
 */
//readSongs();
//getIndexJSON();

/**/
module.exports = {
    convertMDToJSON: convertSongToJSON,
    getIndexJSON: getIndexJSON
};
