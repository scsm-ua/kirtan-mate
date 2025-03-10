const { getEmbedCode } = require('./embeds');

class Song {
    constructor({json, text}) {
        this.json = json;
        this.text = text;

        if (this.text && !this.json) {
            this.json = convertSongToJSON(text);
        }
    }

    getPageTitle() {
        let pageTitle = this.json.title.join(' ');

        if (this.json.author?.length) {
            pageTitle += '. ' + this.json.author[0];
        }
    
        if (this.json.subtitle?.length) {
            pageTitle += '. ' + this.json.subtitle.join(' ');
        }

        return pageTitle;
    }

    getPageDescription() {
        var text = this.json.verses[0];
        return `${text[0]}\n${text[1]}...`;
    }

    //===

    hasWordByWord() {
        return !!this.json.verses.find(v => v.word_by_word?.length);
    }

    //===

    getAuthors() {
        return this.json.author || [];
    }

    getSubtitles() {
        return this.json.subtitle || [];
    }

    getTitles() {
        return this.json.title || [];
    }

    getVerses() {
        return this.json.verses;
    }

    getVersesForWeb() {
        if (!this.versesForWeb) {
            this.versesForWeb = this.json.verses.map((verse) => ({
                ...verse,
                text: processTextForWeb(verse, verse.text, this.json.attributes),
                translation: processTranslation(verse.translation),
                word_by_word: processTranslation(verse.word_by_word)
            }));
        }
        return this.versesForWeb;
    }

    getVersesForTelegraph() {
        if (!this.versesForWeb) {
            this.versesForWeb = this.json.verses.map((verse) => ({
                ...verse,
                text: processTextForTelegraph(verse, verse.text, this.json.attributes),
                translation: processTranslationForTelegraph(verse.translation),
                word_by_word: processTranslationForTelegraph(verse.word_by_word)
            }));
        }
        return this.versesForWeb;
    }

    getTitleWordByWordForWeb() {
        return processTranslation(this.json.word_by_word);
    }

    getTitleWordByWord() {
        return processTranslationForTelegraph(this.json.word_by_word);
    }
}

/**
 *
 * @param text
 * @param prefix
 * @return {string}
 */
function getLineIndentClass(text) {
    var m = text.match(/^\s+/);
    if (m) {
        var count = Math.floor(m[0].length / 4);
        if (count > 4) {
            count = 4;
        }
        if (count) {
            return 'SongVerse__line_indent_' + count;
        }
    }
    return '';
}

/**
 *
 * @type {RegExp}
 */
const TAG_RE = /<[^>]+>/gi;
const PARANTHESES_RE = /(\([^\)]+\))/gi;
const PARANTHESES_START_RE = /(\([^\)]+)\s*$/gi;    // ) End in next line.
const PARANTHESES_END_RE = /^(\s*)([^\)]+\))/gi;    // ( Start in prev line.


/**
 * EJS trims lines even despite 'rmWhitespace: false'.
 * But we want some verse lines have extra space in the beginning.
 */
function transformLineForWeb(verse, text, attributes) {

    // Cleanup tags for safaty.
    text = text.replace(TAG_RE, '')

    if (attributes && attributes['verse parentheses'] === 'non bold') {
        text = text.replace(PARANTHESES_RE,  '<span class="SongVerse__light">$1</span>')
        text = text.replace(PARANTHESES_START_RE,  '<span class="SongVerse__light">$1</span>')
        text = text.replace(PARANTHESES_END_RE,  '$1<span class="SongVerse__light">$2</span>')
    
    } else if (attributes && attributes['inline verse'] === 'non bold' && !verse.number) {
        text = `<span class="SongVerse__light">${ text }</span>`;
    }

    // Try fix with indents.
    // Remove starting indent (as its fixed by `getLineIndentClass`).
    text = text.replace(/^\s+/, '');
    // Replace inner tabs.
    text = text.replace(/\s{4}/gi, '<span class="SongVerse__space">&nbsp;&nbsp;&nbsp;&nbsp;</span>');

    return text;
}

function transformLineForTelegraph(verse, text, attributes) {
    // Cleanup tags for safaty.
    text = text.replace(TAG_RE, '')

    if (attributes && attributes['verse parentheses'] === 'non bold') {

        text = text.replace(/\(/, '</strong>(');
        text = text.replace(/\)/, ')<strong>');

        // Text: "line)..." -> "</strong>line)..."

        text = text.replace(/^[^\(\)]*\)/, '</strong>$&');
        
        // Text: "...(line" -> "...(line<strong>"

        text = text.replace(/\([^\(\)]*$/, '$&<strong>');

        
    } else if (attributes && attributes['inline verse'] === 'non bold' && !verse.number) {
        text = `</strong>${ text }<strong>`;
    }

    // Try fix with indents.
    text = text.replace(/^\s+/, (match) => '&nbsp;'.repeat(match.length));
    // Replace inner tabs.
    text = text.replace(/\s{4}/gi, '&nbsp;&nbsp;&nbsp;&nbsp;');

    text = `<strong>${text}</strong>`;

    // Skip epmty blocks.
    // ! Keep <strong>, this fixes newlines issue on telegraph markup.
    // text = text.replace(/<strong>((?:&nbsp;)*)<\/strong>/g, '$1');

    return text;
}

const NOTE_MD_REGEX = /\*\*\*(.*?)\*\*\*/gm;
const TERM_MD_REGEX = /\*{1,2}(.*?)\*{1,2}/gm;
const A1_MD_REGEX = /\*(.*?)\*/gm;
const A2_MD_REGEX = /\*\*(.*?)\*\*/gm;

/**
 * Handles 'hindi' terms, soft line breaks and notes.
 * @param lines: string[]
 * @return {string[]}
 */
function processTranslation(lines) {
    if (!lines) {
        return [];
    }
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
 * Handles 'hindi' terms, soft line breaks and notes.
 * @param lines: string[]
 * @return {string[]}
 */
function processTranslationForTelegraph(lines) {
    if (!lines) {
        return [];
    }
    return lines
        .join('\n')
        // Cleanup tags for safaty.
        .replace(TAG_RE, '')
        .replace(NOTE_MD_REGEX, '<strong><em>$1</em></strong>\n')
        .replace(A2_MD_REGEX, '<strong><em>$1</em></strong>\n')
        .replace(A1_MD_REGEX, '<em>$1</em>')
        .replaceAll('\\\n', '<br />')
        .split(/\n/);
}

function processTextForWeb(verse, lines, attributes) {
    return lines.map(line => {
        return {
            text: transformLineForWeb(verse, line, attributes),
            css_class: getLineIndentClass(line)
        };
    });
}

function processTextForTelegraph(verse, lines, attributes) {
    lines = lines.map(line => {
        return transformLineForTelegraph(verse, line, attributes);
    });

    var str = lines.join('\n');
    str = str.replace(/<\/strong>\n<strong>/g, '\n');
    return str.split('\n');
}

/**
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
                    create_new: last_line_id === 'translation' || last_line_id === 'word_by_word'
                }).text.push(line_value);
                break;
            case 'word_by_word':
                if (song.verses.length === 0) {
                    song.word_by_word = song.word_by_word || [];
                    song.word_by_word.push(line_value);
                } else {
                    var verse = getLastVerse();
                    verse.word_by_word = verse.word_by_word || [];
                    verse.word_by_word.push(line_value);
                }
                break;
            case 'translation':
                getLastVerse().translation.push(line_value);
                break;
            case 'embed_link':
                var embed_url = line_match[2];
                var embed_code = getEmbedCode(embed_url);
                if (embed_code) {
                    song.embeds = song.embeds || [];
                    song.embeds.push({
                        title: line_value,
                        embed_url: embed_url,
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
                    var attr_key = bits[0].trim();
                    var attr_value = bits[1].trim();

                    if (attr_value) {
                        if (song.attributes[attr_key] && !Array.isArray(song.attributes[attr_key])) {
                            // Convert to array.
                            song.attributes[attr_key] = [song.attributes[attr_key]];
                        }
    
                        if (Array.isArray(song.attributes[attr_key])) {
                            song.attributes[attr_key].push(attr_value);
                        } else {
                            song.attributes[attr_key] = attr_value;
                        }
                    }
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

const song_line_types = {
    title: /^# (.+)/,
    subtitle: /^## (.+)/,
    author: /^### (.+)/,
    verse_number: /^#### (.+)/,
    verse_text: /^    (.+)/,
    attribute: /^> (.+ =.*)/,
    word_by_word: /^> (.+)/,
    embed_link: /^\[([^\]]+)\]\(([^\)]+)\)/,    // Before translation.
    translation: /^([^\s#].+)/
};

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

module.exports = {
    Song: Song
};
