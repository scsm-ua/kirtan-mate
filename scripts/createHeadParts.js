const { PATHS, ORIGIN } = require('./constants');

/**
 * Note: the title and description do NOT get escaped.
 * @param title: string - this will get suffixed with ' | Kirtan Mate'.
 * @param description: string - no special symbols!
 * @param path: string - no leading or trailing slashes!
 */
function createHeadParts({ title, description, path }) {
    const imgSrc = PATHS.FILES.SHARING_BANNER;
    const _title = title + ' | Kirtan Mate';

    return `
        <title>${_title}</title>
        <link rel="canonical" href="${path}" />
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

/**
 * Converts the list of categories into the list of song related XML parts.
 * @param categories: TCategory[]
 * @returns {string}
 */
function createSongXMLParts(songbook_id, categories) {
    let result = '';

    categories
        .flatMap((cat) => cat.items)
        .forEach((item) => (
            result += `
                <url>
                    <loc>${encodeURI(ORIGIN + '/' + songbook_id + '/' + item.fileName)}</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
            `
        ));

    return result;
}


/**/
module.exports = {
    createHeadParts: createHeadParts,
    createSongXMLParts: createSongXMLParts
};
