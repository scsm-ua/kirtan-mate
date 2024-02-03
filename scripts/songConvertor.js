const ejs = require('ejs');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream');

/**/
const { convertMDToJSON, getContentsJSON, getIndexJSON } = require('./indexGenerator');
const { createHeadParts } = require('./createHeadParts');
const { PATHS, ORIGIN } = require('./constants');
const { i18n } = require('./i18n');
const { getTemplatePaths } = require('./utils');
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

/**
 * @param template: string;
 * @param content: TSongJSON;
 * @param filePath: string;
 * @return {string}
 */
function fillTemplate(songbook_id, template, content, filePath) {
    // TODO: subtitle.
    const { author, subtitle, title, verses } = content;

    if (!verses) {
        console.warn('No verse in ' + filePath);
        return '';
    }

    const { text } = verses[0];

    var pageTitle = title;
    if (author && author.length) {
        pageTitle += '. ' + author[0];
    }
    if (subtitle) {
        pageTitle += '. ' + subtitle;
    }

    const headParts = {
        title: pageTitle,
        description: `${text[0]}\n${text[1]}...`,
        path: ORIGIN + '/' + songbook_id + '/' + path.parse(filePath).name + '.html'
    };

    return ejs.render(template, {
        author: author,
        subtitle: subtitle,
        contentItems: JSON.stringify(require(BUILD.getContentsFile(songbook_id))),
        headParts: createHeadParts(headParts),
        paths: getTemplatePaths(songbook_id),
        title: title,
        verses: verses,
        i18n: i18n(songbook_id),
        transformLine: transformLine
    });
}

/**
 * EJS trims lines even despite 'rmWhitespace: false'.
 * But we want some verse lines have extra space in the beginning.
 */
function transformLine(text) {
    return text
        .replaceAll('    ', '<span class="SongVerse__space">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span>')
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
