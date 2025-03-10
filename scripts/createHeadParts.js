const { getNavigationPaths } = require('./utils');
const { PATHS, ORIGIN } = require('./constants');

/**
 * Note: the title and description do NOT get escaped.
 * @param title: string - this will get suffixed with ' | Kirtan Site'.
 * @param description: string - no special symbols!
 * @param url: string - no leading or trailing slashes!
 * @param is404: boolean
 */
function createHeadParts({ title, description, path, is404, songbook_id }) {
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
