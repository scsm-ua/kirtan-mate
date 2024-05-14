const fs = require('fs');
const path = require('path');

const { PATHS } = require('../scripts/constants');
const { getContentsFilePath, getSongsPath, getIndexFilePath, getSongbookIdList } = require('./songbookLoader');
const { getEmbedCode } = require('./embeds');

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
    
    // Song template.
    var song = {
        title: [],
        author: [],
        subtitle: [],
        verses: []
    };

    function getLastVerse(options) {
        if ((options && options.create_new) || !song.verses.length) {
            // Verse template.
            song.verses.push({
                number: null,
                text: [],
                translation: [],
            });
        }

        return song.verses[song.verses.length - 1];
    }

    var last_line_id;
    var verse_separator;

    // TODO: shikshastakam first verse has no number
    lines.forEach((line) => {
        var { line_id, line_value, line_match } = getSongLineInfo(line);
        if (line_id && line_id !== 'verse_text') {
            // Disable empty verse line.
            verse_empty_line = false;
        }
        switch (line_id) {
            case 'title':
                song.title.push(line_value);
                break;
            case 'author':
                song.author.push(line_value);
                break;
            case 'subtitle':
                if (song.verses.length === 0) {
                    song.subtitle.push(line_value);
                } else {
                    var verse = getLastVerse({ create_new: last_line_id !== 'subtitle' });
                    verse.subtitle = verse.subtitle || [];
                    verse.subtitle.push(line_value);
                }
                break;
            case 'verse_number':
                getLastVerse({ create_new: true }).number = line_value;
                break;
            case 'verse_text':
                if (verse_empty_line) {
                    verse_empty_line = false;
                    getLastVerse({
                        create_new: false
                    }).text.push('');
                }
                getLastVerse({
                    create_new: last_line_id === 'translation'
                }).text.push(line_value);
                break;
            case 'translation':
                getLastVerse().translation.push(line_value);
                break;
            case 'embed_link':
                var embed_code = getEmbedCode(line_match[2]);
                if (embed_code) {
                    song.embeds = song.embeds || [];
                    song.embeds.push({
                        title: line_value,
                        embed_code: embed_code
                    });
                } else {
                    console.warn('Unrecognized embed link', line)
                }
                break;
            case 'attribute':
                var bits = line_value.split(/=/);
                if (bits.length !== 2) {
                    console.error("Can't recognize attribute", line);
                } else {
                    song.attributes = song.attributes || {};
                    song.attributes[bits[0].trim()] = bits[1].trim();
                }
                break;
            default:
                if (!line.trim()) {
                    // Empty line.
                    if (last_line_id === 'verse_text') {
                        verse_empty_line = true;
                    }
                } else {
                    // TODO: better errors processing.
                    console.error("Can't recognize line id", line_id, line);
                }
        }
        if (line_id) {
            // Skip empty lines.
            last_line_id = line_id;
        }
    });

    return song;
}

/**/
const song_line_types = {
    title: /^# (.+)/,
    subtitle: /^## (.+)/,
    author: /^### (.+)/,
    verse_number: /^#### (.+)/,
    verse_text: /^    (.+)/,
    attribute: /^> (.+)/,
    embed_link: /^\[([^\]]+)\]\(([^\)]+)\)/,    // Before translation.
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
const TAG_RE = /<[^>]+>/gm;
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
        // Cleanup tags for safaty.
        .replace(TAG_RE, '')
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
                line_value: m[1].trimEnd(),
                line_match: m
            };
        }
    }
    return {
        line_id: null,
        line_value: null,
        line_match: null
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
        var { line_id, name, filename } = getIndexLineInfo(line);
        switch (line_id) {
            case 'name':
                var cateogory = getLastCategory({ create_new: true });
                cateogory.name = name;
                break;
            case 'song':
                getLastCategory().items.push({
                    id: filename,
                    title: name,
                    name: getSongName(songbook_id, filename),
                    // TODO: trim
                    // TODO: replace tabs
                    // TODO: trim -
                    aliasName: getSongFirstLine(songbook_id, filename),
                    fileName: filename + '.html',
                    page: getSongPage(songbook_id, filename),
                    embeds: getSongEmbedsTitles(songbook_id, filename)
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
    getSongJSON: getSongJSON
};