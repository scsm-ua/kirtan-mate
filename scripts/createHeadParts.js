const { getNavigationPaths } = require('./utils');
const { PATHS, ORIGIN } = require('./constants');

/**
 * Note: the title and description do NOT get escaped.
 * @param title: string - this will get suffixed with ' | Kirtan Site'.
 * @param description: string - no special symbols!
 * @param url: string - no leading or trailing slashes!
 * @param is404: boolean
 */
function createHeadParts(options) {

    var { title, description, path, is404, songbook_id, translations } = options;

    var imgSrc;
    if (songbook_id) {
        imgSrc = `${ PATHS.RELATIVE.IMG }/banner/banner-${ songbook_id }@2.png`;
    } else {
        imgSrc = PATHS.FILES.SHARING_BANNER;
    }

    const _title = title + ' | Kirtan Site';
    
    var url;
    // Some urls rendered with origin.
    if (path.indexOf(ORIGIN) !== 0) {
        url = ORIGIN + path;
    } else {
        url = path;
    }

    options.url = url;

    let render = `
        <title>${_title}</title>`;

    if (!is404) {
        render += `
        <link rel="canonical" href="${url}" />`;
    }

    let translations_hrefs = '';
    if (translations && translations.length) {
        function hreflang(hreflang, href) {
            return `<link rel="alternate" hreflang="${hreflang}" href="${href}" />\n`;
        }
        translations_hrefs = translations.map(t => hreflang(t.hreflang, t.href)).join('');
        // Default. Use first, its order by sort_order.
        translations_hrefs += hreflang('x-default', translations[0].href);
    }

    render += `
        <meta name="description" content="${description}" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:locale" content="ua_UA" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Kirtan Site" />
        <meta property="og:image" content="${imgSrc}" />
        <meta property="og:image:width" content="648" />
        <meta property="og:image:height" content="488" />
        <meta property="og:image:type" content="image/png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="${imgSrc}" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />

${translations_hrefs}

        ${getSchema(options)}
        
        <link rel="apple-touch-icon" sizes="57x57" href="${PATHS.RELATIVE.FAVICON}/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="${PATHS.RELATIVE.FAVICON}/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="${PATHS.RELATIVE.FAVICON}/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="${PATHS.RELATIVE.FAVICON}/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="${PATHS.RELATIVE.FAVICON}/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="${PATHS.RELATIVE.FAVICON}/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="${PATHS.RELATIVE.FAVICON}/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="${PATHS.RELATIVE.FAVICON}/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="${PATHS.RELATIVE.FAVICON}/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192"  href="${PATHS.RELATIVE.FAVICON}/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="${PATHS.RELATIVE.FAVICON}/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="${PATHS.RELATIVE.FAVICON}/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="${PATHS.RELATIVE.FAVICON}/favicon-16x16.png">
        <link rel="manifest" href="${PATHS.RELATIVE.FAVICON}/manifest.json">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="${PATHS.RELATIVE.FAVICON}/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">
    `;

    return render;
}

/**
 *
 */
function getSchema({url, title, description, song, embeds, i18n}) {

    var sch;

    if (!song) {

        const content = {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebSite',
                    '@id': ORIGIN + '/#website',
                    'url': ORIGIN + '/',
                    'name': 'Kirtan Site',
                    'description': description,
                    'inLanguage': 'en-GB'
                },
                {
                    '@type': 'CollectionPage',
                    '@id': url,
                    'url': url,
                    'name': title,
                    'isPartOf': {
                        '@id': ORIGIN + '/#website'
                    }
                }
            ]
        };
        sch = JSON.stringify(content).replace('&quot;', '"');
        
    } else {

        const MusicComposition = {
            "@type": "MusicComposition",
            "@id": url + "#composition",
            "url": url,
            "name": song.getTitleAuthor(),
            "alternateName": [song.first_line],
            "composer": {
                "@type": "Person",
                "name": song.getUnifiedAurhor()
            },
            "lyrics": {
                "@type": "CreativeWork",
                "inLanguage": "bn",
                "hasPart": [],
                "workTranslation": {
                    "@type": "CreativeWork",
                    "name": i18n('META.TRANSLATION_NAME'),
                    "inLanguage": song.language,
                    "hasPart": [],
                },
            },
            "isPartOf": {
                "@id": ORIGIN + '/#website',
            },
            "about": [
                { "@type": "Thing", "name": "Bhakti Yoga" },
                { "@type": "Thing", "name": "Gaudiya Vaishnavism" }
            ],
            "genre": ["Devotional", "Bhajan", "Kirtan"],
            "mainEntityOfPage": {
                "@id": url
            }
        };
    
        const song_content = {
            "@context": "https://schema.org",
            "@graph": [
                // TOOD: in contents pages.
                // {
                //     "@type": "Organization",
                //     "@id": "https://scsmath.com/#organization",
                //     "name": "Sri Chaitanya Saraswat Math",
                //     "url": "https://scsmath.com/"
                // },
                // {
                //     "@type": "WebSite",
                //     '@id': ORIGIN + '/#website',
                //     'url': ORIGIN + '/',
                //     "name": "Kirtan Site",
                //     "description": "A digital Vaishnava songbook with lyrics and translations.",
                //     "inLanguage": song.language,
                //     "publisher": {
                //         "@id": "https://scsmath.com/#organization",
                //     }
                // },
                {
                    "@type": "CollectionPage",
                    "@id": url,
                    "url": url,
                    "name": title,
                    // TODO:
                    // "description": "Bengali devotional song with translations.",
                    "isPartOf": {
                        '@id': ORIGIN + '/#website',
                    }
                },
                MusicComposition
            ]
        };
    
        song.getVerses().forEach((verse, idx) => {
            var lytics_part = {
                "@type": "CreativeWork",
                "position": idx + 1,
                "name": verse.number,
                "text": verse.text.join('\n') || '---'
            };
            if (!lytics_part.name) {
                delete lytics_part.name;
            }
            if (lytics_part.position == lytics_part.name) {
                delete lytics_part.name;
            }
            var translation_part = {
                "@type": "CreativeWork",
                "position": idx + 1,
                "name": verse.number,
                "text": verse.translation.join('\n') || '---'
            };
            if (!translation_part.name) {
                delete translation_part.name;
            }
            if (translation_part.position == translation_part.name) {
                delete translation_part.name;
            }
    
            MusicComposition.lyrics.hasPart.push(lytics_part);
            MusicComposition.lyrics.workTranslation.hasPart.push(translation_part);
        });
    
        embeds?.forEach(item => {
            var audio = {
                "@type": "MusicRecording",
                "name": song.getTitleAuthor(),
                "url": item.embed_url,
                "byArtist": {
                    "@type": "Person",
                    "name": item.title
                },
                "audio": {
                    "@type": "AudioObject",
                    "embedUrl": item.iframe_url
                }
            };
    
            if (MusicComposition.audio && !Array.isArray(MusicComposition.audio)) {
                // Make it array.
                MusicComposition.audio = [MusicComposition.audio];
            }
    
            if (Array.isArray(MusicComposition.audio)) {
                MusicComposition.audio.push(audio);
            } else {
                MusicComposition.audio = audio;
            }
        });
    
        sch = JSON.stringify(song_content, null, 4).replace('&quot;', '"');
    }

    return `<script type="application/ld+json">${sch}</script>`;
}

/**
 *
 * @param url
 * @param priority
 * @param period
 * @return {string}
 */
function getItemXML(url, priority, period = 'weekly') {
    return `
    <url>
        <loc>${encodeURI(url)}</loc>
        <changefreq>${period}</changefreq>
        <priority>${priority}</priority>
    </url>
    `;
}

/**
 * Converts the list of categories into the list of song related XML parts.
 * @param songbook_id
 * @param categories: TCategory[]
 * @returns {string}
 */
function createSongXMLParts(songbook_id, categories) {
    const { A_Z, BOOK_LIST, CONTENTS } = getNavigationPaths(songbook_id);

    const indexes = getItemXML(BOOK_LIST, 0.9, 'monthly') +
        getItemXML(CONTENTS, 1) +
        getItemXML(A_Z, 1);

    const songs = categories
        .flatMap((cat) => cat.items)
        .map((item) =>
            getItemXML(
                PATHS.RELATIVE.toSongs(songbook_id) + '/' + item.fileName,
                0.8,
                'monthly'
            )
        )
        .join('');

    return indexes + songs + '\n';
}


/**/
module.exports = {
    createHeadParts: createHeadParts,
    createSongXMLParts: createSongXMLParts
};
