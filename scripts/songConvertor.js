const ejs = require('ejs');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream');

/**/
const { convertMDToJSON, getContentsJSON, getIndexJSON, getSongJSON, getSongsOrderedList } = require('./indexGenerator');
const { createHeadParts } = require('./createHeadParts');
const { getSongbookIdList, getSongbookInfo } = require('./songbookLoader');
const { getTemplatePaths } = require('./utils');
const { getTranslationsBy, getTranslationOrigin, getStrictTranslation, isDefaultLanguage } = require('./i18n');
const { PATHS, ORIGIN } = require('./constants');
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

function getPrevNextData(paths, orderedSongs, currentSongIndex) {
    
    var prevSong;
    var nextSong;
    var nextSongParam = '';
    var prevSongParam = '';
    if (currentSongIndex > -1) {
        if (currentSongIndex > 0) {
            prevSong = orderedSongs[currentSongIndex - 1];
            if (prevSong.duplicates 
                // Skip for first.
                && prevSong.duplicates[0].idx !== currentSongIndex - 1) {

                    prevSongParam = `?p=${ prevSong.page_number }`;
            }
        }
        if (currentSongIndex < orderedSongs.length - 1) {
            nextSong = orderedSongs[currentSongIndex + 1];
            if (nextSong.duplicates 
                // Skip for first.
                && nextSong.duplicates[0].idx !== currentSongIndex + 1) {

                    nextSongParam = `?p=${ nextSong.page_number }`;
            }
        }
    }

    var result = {};

    if (prevSong) {
        result.prev = {
            href: `${ paths.toSongs }/${ prevSong.fileName }${ prevSongParam }`,
            title: prevSong.title
        };
    }

    if (nextSong) {
        result.next = {
            href: `${ paths.toSongs }/${ nextSong.fileName }${ nextSongParam }`,
            title: nextSong.title
        };
    }

    return result;
}


/**
 * @param songbook_id
 * @param template: string;
 * @param content: TSongJSON;
 * @param filePath: string;
 * @return {string}
 */
function fillTemplate(songbook_id, template, content, filePath) {

    const { author, subtitle, title, verses, attributes, word_by_word } = content;
    const page = content.attributes?.page;

    if (!verses) {
        console.warn('No verse in ' + filePath);
        return '';
    }

    const { text } = verses[0];
    let { embeds } = content;
    let pageTitle = title;

    if (author && author.length) {
        pageTitle += '. ' + author[0];
    }

    if (subtitle && subtitle.length) {
        pageTitle += '. ' + subtitle.join(' ');
    }

    const filename = path.parse(filePath).name;

    const headParts = {
        title: pageTitle,
        description: `${text[0]}\n${text[1]}...`,
        path: '/' + songbook_id + '/' + filename + '.html'
    };

    const alternativeTranslationBooks /* TSongBookAsOption */ = [];

    getSongbookIdList().forEach((a_songbook_id) => {
        const song = getSongJSON(a_songbook_id, filename, true);

        if (song) {
            const info /* TSongBookInfo */ = getSongbookInfo(a_songbook_id);
            const tr = getTranslationsBy(a_songbook_id);

            alternativeTranslationBooks.push({
                href: ORIGIN + '/' + a_songbook_id + '/' + filename + '.html',
                i18n: tr,
                isSelected: songbook_id === a_songbook_id,
                slug: a_songbook_id,
                subtitle: info.subtitle,
                title: info.title
            });

            // Get embeds from other songbook.
            if (songbook_id !== a_songbook_id 
                && song.embeds 
                && song.embeds.length) {

                // Load embeds from other songbooks.
                var other_embeds = song.embeds.map(embed => {
                    var embed_title = embed.title;

                    var origin_embed_title = getTranslationOrigin(a_songbook_id, embed_title);

                    // Use english title as default.
                    if (!origin_embed_title && isDefaultLanguage(a_songbook_id)) {
                        origin_embed_title = embed_title;
                    }

                    if (!origin_embed_title) {
                        console.error(`No translation origin for ${embed_title} in ${a_songbook_id}`);
                    } else {
                        embed_title = getStrictTranslation(songbook_id, origin_embed_title);
                    }

                    return Object.assign({}, embed, {
                        title: embed_title,
                    });
                });

                embeds = (embeds || []).concat(other_embeds);
            }

            // Check embeds overriding from different songbooks.
            // if (songbook_id !== a_songbook_id 
            //     && song.embeds 
            //     // Use `content` to check origin (not overidden value).
            //     && content.embeds 
            //     && content.embeds.length) {
            //     console.warn('Overriding song embeds for ${songbook_id} from ${a_songbook_id} in ${filePath}`);
            // }
        }
    });

    const currentSongbook = alternativeTranslationBooks.find((option) => option.isSelected);

    const paths = getTemplatePaths(songbook_id, { root_to_songbook: true });

    // Nex prev links.

    // Get file slug:
    // `json/es/udilo-aruna-puraba-bhage.json` -> `udilo-aruna-puraba-bhage`.
    const fileId = filePath.split(/[\/\.]/).slice(-2)[0];
    const orderedSongs = getSongsOrderedList(songbook_id);
    const currentSongIndex = orderedSongs.findIndex((item) => item.id === fileId);

    var navigation = getPrevNextData(paths, orderedSongs, currentSongIndex);

    // Find duplicated in contents songs.
    const currentSongs = orderedSongs.filter((item, idx) => currentSongIndex !== idx && item.id === fileId);
    if (currentSongs.length) {
        // Same song on other pages.
        navigation.pages = Object.fromEntries(currentSongs.map(song => [song.page_number, getPrevNextData(paths, orderedSongs, song.idx)]));
    }

    return ejs.render(template, {
        author: author,
        page: page,
        page_number: orderedSongs[currentSongIndex].page_number,
        subtitle: subtitle,
        word_by_word: word_by_word,
        has_word_by_word: !!verses.find(v => v.word_by_word?.length),
        navigation: navigation,
        headParts: createHeadParts(headParts),
        paths: paths,
        title: title,
        verses: verses,
        embeds: embeds,
        attributes: attributes,
        i18n: currentSongbook.i18n,
        transformLine: transformLine,
        getLineIndentClass: getLineIndentClass,
        songbooksAsOptions: alternativeTranslationBooks,
        currentSongbook: currentSongbook
    });
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
 *
 * @param text
 * @param prefix
 * @return {string}
 */
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
function transformLine(verse, text, attributes) {

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
