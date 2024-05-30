const { PATHS, ORIGIN } = require('./constants');

/**
 * Note: the title and description do NOT get escaped.
 * @param title: string - this will get suffixed with ' | Kirtan Mate'.
 * @param description: string - no special symbols!
 * @param path: string - no leading or trailing slashes!
 * @param is404: boolean
 */
function createHeadParts({ title, description, path, is404 }) {
    const imgSrc = PATHS.FILES.SHARING_BANNER;
    const _title = title + ' | Kirtan Mate';

    var render = `
        <title>${_title}</title>`;

    if (!is404) {
        render += `
        <link rel="canonical" href="${path}" />`;
    }

    render += `
        <meta name="description" content="${description}" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:url" content="${path}" />
        <meta property="og:locale" content="ua_UA" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Kirtan Mate" />
        <meta property="og:image" content="${imgSrc}" />
        <meta property="og:image:width" content="648" />
        <meta property="og:image:height" content="488" />
        <meta property="og:image:type" content="image/png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="${imgSrc}" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />

        ${getSchema(path, title)}
    `;

    return render;
}

/**
 *
 */
function getSchema(path, title) {
    const content = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': ORIGIN + '/#website',
                'url': ORIGIN + '/',
                'name': 'Kirtan Mate',
                'description': 'Вайшнавські пісні',
                'inLanguage': 'ua-UA'
            },
            {
                '@type': 'CollectionPage',
                '@id': path,
                'url': path,
                'name': title,
                'isPartOf': {
                    '@id': ORIGIN + '/#website'
                }
            }
        ]
    };

    const sch = JSON.stringify(content).replace('&quot;', '"');
    return `<script type="application/ld+json">${sch}</script>`;
}

function getItemXML(path, priority) {
    return `
        <url>
            <loc>${encodeURI(path)}</loc>
            <changefreq>weekly</changefreq>
            <priority>${priority}</priority>
        </url>
    `;
}

/**
 * Converts the list of categories into the list of song related XML parts.
 * @param categories: TCategory[]
 * @returns {string}
 */
function createSongXMLParts(songbook_id, categories) {
    let indexes = getItemXML(PATHS.PAGES.getIndexPath(songbook_id), 1)
                + getItemXML(PATHS.PAGES.getIndexAZPath(songbook_id), 1);

    let songs = categories
        .flatMap((cat) => cat.items)
        .map((item) => getItemXML(PATHS.RELATIVE.toSongs(songbook_id) + '/' + item.fileName, 1))
        .join('\n');

    return indexes + songs;
}


/**/
module.exports = {
    createHeadParts: createHeadParts,
    createSongXMLParts: createSongXMLParts
};
