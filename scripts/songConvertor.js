const ejs = require('ejs');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream');

/**/
const { convertMDToJSON, getContentsJSON, getIndexJSON } = require('./indexGenerator');
const { createHeadParts } = require('./createHeadParts');
const { ORIGIN, PATHS } = require('./constants');
const { BUILD, FILES, PAGES, SRC } = PATHS;


/*** JSON to HTML song conversion. ***/

/**
 *
 */
function makeSongHTML(templatePromise) {
    return new Transform({
        objectMode: true,

        transform(file, encoding, callback) {
            try {
                const htmlString = fillTemplate(
                    templatePromise,
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
function fillTemplate(template, content, filePath) {
    const { author, title, verses } = content;
    const { text } = verses[0];

    const headParts = {
        title: author ? title + '. ' + author : title,
        description: `${text[0]}\n${text[1]}...`,
        path: '/html/' + path.parse(filePath).name + '.html'
    };

    const paths = {
        toCss: path.relative(BUILD.HTML_FILES, BUILD.CSS_FILES),
        toImages: path.relative(BUILD.HTML_FILES, BUILD.IMG_FILES),
        toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES),
        toPages: {
            index: PAGES.INDEX,
            index_list: PAGES.INDEX_LIST
        }
    };

    return ejs.render(template, {
        author: author,
        contentItems: JSON.stringify(require(BUILD.CONTENTS_FILE)),
        functions: {
            transformLine: transformLine
        },
        headParts: createHeadParts(headParts),
        paths: paths,
        title: title,
        verses: verses
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
function getJSONContentsStream() {
    const stream = VinylStream(FILES.JSON.CONTENTS);
    stream.end(JSON.stringify(getContentsJSON(), null, 2));
    return stream;
}

/****************************/
/* Generate JSON index      */
/****************************/

/**
 *
 */
function getJSONIndexStream() {
    const stream = VinylStream(FILES.JSON.INDEX);
    stream.end(JSON.stringify(getIndexJSON(), null, 2));
    return stream;
}

/**/
module.exports = {
    getJSONContentsStream: getJSONContentsStream,
    getJSONIndexStream: getJSONIndexStream,
    makeSongHTML,
    md2jsonConvertor: md2json,
};
