const { PATHS, ORIGIN } = require('./constants');
const { getNavigationPaths } = require("./utils");

/**
 * Note: the title and description do NOT get escaped.
 * @param title: string - this will get suffixed with ' | Kirtan Site'.
 * @param description: string - no special symbols!
 * @param url: string - no leading or trailing slashes!
 * @param is404: boolean
 */
function createHeadParts({ title, description, path, is404 }) {
    const imgSrc = PATHS.FILES.SHARING_BANNER;
    const _title = title + ' | Kirtan Site';
    const url = ORIGIN + path;

    let render = `
        <title>${_title}</title>`;

    if (!is404) {
        render += `
        <link rel="canonical" href="${url}" />`;
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

        ${getSchema(url, title, description)}
    `;

    return render;
}

/**
 *
 */
function getSchema(url, title, description) {
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

    const sch = JSON.stringify(content).replace('&quot;', '"');
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

    const indexes = getItemXML(ORIGIN + BOOK_LIST, 0.9, 'monthly') +
        getItemXML(ORIGIN + CONTENTS, 1) +
        getItemXML(ORIGIN + A_Z, 1);

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
