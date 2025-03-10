const ejs = require('ejs');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream');

/**/
const { convertMDToJSON, getContentsJSON, getIndexJSON, getSongJSON, getSongsOrderedList } = require('./indexGenerator');
const { createHeadParts } = require('./createHeadParts');
const { getSongbookIdList, getSongbookInfo } = require('./songbookLoader');
const { getTemplatePaths, getTelegraphTemplatePaths } = require('./utils');
const { getTranslationsBy, getTranslationOrigin, getStrictTranslation, isDefaultLanguage } = require('./i18n');
const { PATHS, ORIGIN } = require('./constants');
const { Song } = require('./Song');
const { getExistingTelegraphPageHref, getExistingTelegraphPage } = require('./telegraph/utils');
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

function getPrevNextData(paths, telegraph_paths, orderedSongs, currentSongIndex) {
    
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
            // TODO: prevSongParam
            telegraph_href: getExistingTelegraphPageHref(`${ telegraph_paths.toSongs }/${ prevSong.fileName }`),
            title: prevSong.title
        };
    }

    if (nextSong) {
        result.next = {
            href: `${ paths.toSongs }/${ nextSong.fileName }${ nextSongParam }`,
            // TODO: nextSongParam
            telegraph_href: getExistingTelegraphPageHref(`${ telegraph_paths.toSongs }/${ nextSong.fileName }`),
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

    let song = new Song({json: content});

    if (!song.json.verses) {
        console.warn('No verse in ' + filePath);
        return '';
    }

    let { embeds } = content;

    const filename = path.parse(filePath).name;

    const headParts = {
        title:          song.getPageTitle(),
        description:    song.getPageDescription(),
        path: '/' + songbook_id + '/' + filename + '.html',
        songbook_id
    };

    const alternativeTranslationBooks /* TSongBookAsOption */ = [];

    getSongbookIdList().forEach((a_songbook_id) => {
        const song = getSongJSON(a_songbook_id, filename, true);

        if (song) {
            const info /* TSongBookInfo */ = getSongbookInfo(a_songbook_id);
            const tr = getTranslationsBy(a_songbook_id);

            alternativeTranslationBooks.push({
                href: ORIGIN + '/' + a_songbook_id + '/' + filename + '.html',
                telegraph_href: getExistingTelegraphPageHref(`${ PATHS.RELATIVE.toPublicSongs(a_songbook_id) }/${ filename }.html`),
                i18n: tr,
                isSelected: songbook_id === a_songbook_id,
                slug: a_songbook_id,
                subtitle: info.subtitle,
                title: info.title,
                hidden: info.hidden
            });

            // Get embeds from other songbook.
            if (!info.hidden
                && songbook_id !== a_songbook_id 
                && song.embeds 
                && song.embeds.length) {

                // Load embeds from other songbooks.
                var other_embeds = song.embeds.map(embed => {

                    var existing_embed = (embeds || []).find(existing => {
                        return existing.embed_url === embed.embed_url;
                    });
                    if (existing_embed) {
                        // TODO: show warning?
                        return;
                    }

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
                }).filter(i => i);

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

    const paths = getTemplatePaths(songbook_id);
    const telegraph_paths = getTelegraphTemplatePaths(songbook_id);

    // Nex prev links.

    // Get file slug:
    // `json/es/udilo-aruna-puraba-bhage.json` -> `udilo-aruna-puraba-bhage`.
    const fileId = filePath.split(/[\/\.]/).slice(-2)[0];
    const orderedSongs = getSongsOrderedList(songbook_id);
    const currentSongIndex = orderedSongs.findIndex((item) => item.id === fileId);

    const contentsSongData = orderedSongs[currentSongIndex];

    var navigation = getPrevNextData(paths, telegraph_paths, orderedSongs, currentSongIndex);

    // Find duplicated in contents songs.
    const currentSongs = orderedSongs.filter((item, idx) => currentSongIndex !== idx && item.id === fileId);
    if (currentSongs.length) {
        // Same song on other pages.
        navigation.pages = Object.fromEntries(currentSongs.map(song => [song.page_number, getPrevNextData(paths, telegraph_paths, orderedSongs, song.idx)]));
    }

    const telegraphPage = getExistingTelegraphPage(`${ telegraph_paths.toSongs }/${ contentsSongData.fileName }`);
    const telegraph_href = telegraphPage && `${PATHS.TELEGRAPH_BASE}/${telegraphPage.path}`;

    const songbooksAsOptions = alternativeTranslationBooks.filter(info => !info.hidden);

    return ejs.render(template, {
        song,
        page: content.attributes?.page,
        page_number: orderedSongs[currentSongIndex].page_number,
        has_word_by_word: song.hasWordByWord(),
        navigation,
        headParts: createHeadParts(headParts),
        paths,
        telegraph_paths,
        embeds,
        i18n: currentSongbook.i18n,
        songbooksAsOptions: songbooksAsOptions,
        hasOtherTranslations: songbooksAsOptions.filter(s => !s.isSelected).length > 0,
        currentSongbook,
        telegraph_href: telegraph_href
    });
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
