const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream');

/**/
const { convertMDToJSON, getContentsJSON, getIndexJSON } = require('./indexGenerator');
const { createHeadParts } = require('./createHeadParts');
const { PATHS, ORIGIN } = require('./constants');
const { i18n } = require('./i18n');
const { getTemplatePaths } = require('./utils');
const { getSongbookIdList } = require('./songbookLoader');
const { BUILD, FILES } = PATHS;


/*** JSON to HTML song conversion. ***/

/**
 *
 */
function makeSongHTML(songbook_id, template) {
    return new Transform({
        objectMode: true,

        transform(file, encoding, callback) {
            try {
                const htmlString = fillTemplate(
                    songbook_id,
                    template,
                    JSON.parse(file.contents.toString()),
                    file.path
                );

                file.contents = Buffer.from(htmlString, 'utf8');
                this.push(file);
                callback();

            } catch (error) {
                callback(error);
            }
        }
    });
}

function getSongsOrderedList(songbook_id) {
    var contents = require(BUILD.getContentsFile(songbook_id));
    var items = contents.flatMap((cat) => cat.items);
    return items.map(i => i.fileName);
}

/**
 * @param template: string;
 * @param content: TSongJSON;
 * @param filePath: string;
 * @return {string}
 */
function fillTemplate(songbook_id, template, content, filePath) {
    // TODO: subtitle.
    const { author, subtitle, title, verses, attributes, embeds } = content;

    if (!verses) {
        console.warn('No verse in ' + filePath);
        return '';
    }

    const { text } = verses[0];

    var pageTitle = title;
    if (author && author.length) {
        pageTitle += '. ' + author[0];
    }
    // TODO: questionable
    if (subtitle && subtitle.length) {
        pageTitle += '. ' + subtitle[0];
    }

    const headParts = {
        title: pageTitle,
        description: `${text[0]}\n${text[1]}...`,
        path: ORIGIN + '/' + songbook_id + '/' + path.parse(filePath).name + '.html'
    };

    var variants = [];
    if (process.env.DEV) {
        getSongbookIdList().forEach(a_songbook_id => {
            var filepath = path.resolve(PATHS.BUILD.getJsonPath(a_songbook_id), path.parse(filePath).name + '.json');
            if (fs.existsSync(filepath)) {
                variants.push({
                    href: ORIGIN + '/' + a_songbook_id + '/' + path.parse(filePath).name + '.html',
                    title: a_songbook_id,
                    selected: songbook_id === a_songbook_id
                });
            }
        });
    }

    return ejs.render(template, {
        author: author,
        subtitle: subtitle,
        orderedSongs: JSON.stringify(getSongsOrderedList(songbook_id)),
        headParts: createHeadParts(headParts),
        paths: getTemplatePaths(songbook_id, {root_to_songbook: true}),
        title: title,
        verses: verses,
        embeds: embeds,
        attributes: attributes,
        i18n: i18n(songbook_id),
        transformLine: transformLine,
        getLineIndentClass: getLineIndentClass,
        variants: variants
    });
}

const TAG_RE = /<[^>]+>/gi;
const PARANTHESES_RE = /(\([^\)]+\))/gi;
const PARANTHESES_START_RE = /(\([^\)]+)\s*$/gi;    // ) End in next line.
const PARANTHESES_END_RE = /^(\s*)([^\)]+\))/gi;    // ( Start in prev line.


function getLineIndentClass(text, prefix) {
    var m = text.match(/^\s+/);
    if (m) {
        var count = Math.floor(m[0].length / 4);
        if (count > 4) {
            count = 4;
        }
        if (count) {
            return prefix + '_indent_' + count;
        }
    }
    return '';
}

/**
 * EJS trims lines even despite 'rmWhitespace: false'.
 * But we want some verse lines have extra space in the beginning.
 */
function transformLine(text, attributes) {

    // Cleanup tags for safaty.
    text = text.replace(TAG_RE, '')

    if (attributes && attributes['verse parentheses'] === 'non bold') {
        text = text.replace(PARANTHESES_RE,  '<span class="SongVerse__light">$1</span>')
        text = text.replace(PARANTHESES_START_RE,  '<span class="SongVerse__light">$1</span>')
        text = text.replace(PARANTHESES_END_RE,  '$1<span class="SongVerse__light">$2</span>')
    }

    // Try fix with indents.
    // Remove starting indent (as its fixed by `getLineIndentClass`).
    text = text.replace(/^\s+/, '');
    // Replace inner tabs.
    text = text.replace(/\s{4}/gi, '<span class="SongVerse__space">&nbsp;&nbsp;&nbsp;&nbsp;</span>');

    return text;
}

/****************************/
/* Markdown to JSON section */
/****************************/

/**
 *
 */
function md2json() {
    return new Transform({
        objectMode: true,

        transform(file, encoding, callback) {
            try {
                const jsonString = JSON.stringify(
                    convertMDToJSON(file.contents.toString()),
                    null,
                    2
                );
                file.contents = Buffer.from(jsonString, 'utf8');

                this.push(file);
                callback();
            } catch (error) {
                callback(error);
            }
        }
    });
}

/****************************/
/* Generate JSON contents      */
/****************************/

/**
 *
 */
function getJSONContentsStream(songbook_id) {
    const stream = VinylStream(FILES.JSON.CONTENTS);
    stream.end(JSON.stringify(getContentsJSON(songbook_id), null, 2));
    return stream;
}

/****************************/
/* Generate JSON index      */
/****************************/

/**
 *
 */
function getJSONIndexStream(songbook_id) {
    const stream = VinylStream(FILES.JSON.INDEX);
    stream.end(JSON.stringify(getIndexJSON(songbook_id), null, 2));
    return stream;
}

/**/
module.exports = {
    getJSONContentsStream: getJSONContentsStream,
    getJSONIndexStream: getJSONIndexStream,
    makeSongHTML,
    md2jsonConvertor: md2json,
};
