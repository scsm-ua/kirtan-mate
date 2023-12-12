/**
 * Note: the title and description do NOT get escaped.
 * @param title: string - this will get suffixed with ' | Kirtan Mate'.
 * @param description: string - no special symbols!
 * @param origin: string - location origin.
 * @param path: string - no leading or trailing slashes!
 * @param imgSrc: string - the banner image source.
 */
function createHeadParts({
    title,
    description,
    origin,
    path,
    imgSrc
}) {
    const _title = title + ' | Kirtan Mate';
    const canonical = origin + path;

    return `
        <title>${_title}</title>
        <link rel="canonical" href="${canonical}" />
        <meta name="description" content="${description}" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:url" content="${canonical}" />
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

        ${getSchema(origin, path, title)}
    `;
}

/**
 *
 */
function getSchema(origin, path, title) {
    const content = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': origin + '/#website',
                'url': origin + '/',
                'name': 'Kirtan Mate',
                'description': 'Вайшнавські пісні',
                'inLanguage': 'ua-UA'
            },
            {
                '@type': 'CollectionPage',
                '@id': origin + '/' + path,
                'url': origin + '/' + path,
                'name': title,
                'isPartOf': {
                    '@id': origin + '/#website'
                }
            }
        ]
    };

    const sch = JSON.stringify(content).replace('&quot;', '"');
    return `<script type="application/ld+json">${sch}</script>`;
}


/**/
module.exports = {
    createHeadParts: createHeadParts
};
