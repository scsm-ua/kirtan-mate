const fs = require('fs');
const path = require('path');

const { PATHS } = require('../scripts/constants');

function readSongs() {
    var songs = {};
    fs.readdirSync(PATHS.SRC.MD_FILES).forEach(file => {
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
    lines = lines.filter(i => i.trim());

    // Song template.
    var song = {
        title: null,
        author: null,
        verses: []
    };

    function getLastVerse(options) {
        if (options && options.create_new || !song.verses.length) {

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
    lines.forEach(line => {
        var { line_id, line_value } = getLineInfo(line);
        switch(line_id) {
            case 'title':
                song.title = line_value;
                break;
            case 'author':
                song.author = line_value;
                break;
            case 'verse_number':
                getLastVerse({create_new: true}).number = line_value;
                break;
            case 'verse_text':
                getLastVerse({create_new: last_line_id === 'translation'}).text.push(line_value);
                break;
            case 'translation':
                getLastVerse().translation.push(line_value);
                break;
            default:
                console.error("Can't recognize line id", line_id, line_value);
        }
        last_line_id = line_id;
    });

    return song;
}

const line_types = {
    title:          /^# (.+)/,
    author:         /^## (.+)/,
    verse_number:   /^#### (.+)/,
    verse_text:     /^    (.+)/,
    translation:    /^([^\s#].+)/,
}

function getLineInfo(line) {
    for(var id in line_types) {
        var m = line.match(line_types[id]);
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

/**
 *
 */
readSongs();

/**/
module.exports = {
  convertMDToJSON: convertSongToJSON
};
