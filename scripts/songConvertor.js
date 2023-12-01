const ejs = require('ejs');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream');

/**/
const { convertMDToJSON, getIndexJSON } = require('../scripts/indexGenerator');
const { PATHS } = require('../scripts/constants');
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
                    JSON.parse(file.contents.toString())
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
 * @return {string}
 */
function fillTemplate(template, content) {
    const { author, title, verses } = content;

    const paths = {
        toCss: path.relative(BUILD.HTML_FILES, BUILD.CSS_FILES),
        toIcons: path.relative(BUILD.HTML_FILES, BUILD.ICON_FILES),
        toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES),
        toPages: {
            index: process.env.HOME_URL || PAGES.INDEX,
            index_list: PAGES.INDEX_LIST
        }
    };

    return ejs.render(template, {
        author: author,
        // contentItems: JSON.stringify(require(BUILD.INDEX_FILE)),
        functions: {
            transformLine: transformLine
        },
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
        .replaceAll('    ', '<span class="SongVerse__space">    </span>')
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
    getJSONIndexStream: getJSONIndexStream,
    makeSongHTML,
    md2jsonConvertor: md2json,
};
