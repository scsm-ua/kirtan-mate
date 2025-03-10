const cheerio = require('cheerio');

const SUPPORTED_ELEMENTS = [
    'a',          // Anchor (link)
    'aside',      // Sidebar content
    // TODO: Forbid to use because of autotocoversion on their side?
    'b',          // Bold text
    'blockquote', // Quoted block of text
    'br',         // Line break
    'code',       // Inline code
    'em',         // Emphasized text
    'figcaption', // Caption for a figure
    'figure',     // Self-contained content, like illustrations
    'h3',         // Heading level 3
    'h4',         // Heading level 4
    'hr',         // Horizontal rule
    // TODO: Forbid to use because of autotocoversion on their side?
    'i',          // Italic text
    'iframe',     // Inline frame
    'img',        // Image
    'li',         // List item
    'ol',         // Ordered list
    'p',          // Paragraph
    'pre',        // Preformatted text
    's',          // Strikethrough text
    'strong',     // Strong importance text
    'u',          // Underlined text
    'ul',         // Unordered list
    'video'       // Video content
];

// Function to convert HTML string into a tree of supported elements
function convertHtmlToElementTree(htmlString) {
    const $ = cheerio.load(htmlString);
    const body = $('body').get(0);
    const elements = body.children.map(child => {
        return filterSupportedElements(child, true, true);
    }).filter(i => i);
    return {
        // Get title from h3 element.
        // TODO: error if no title.
        title: elements.find(e => e.tag === 'h3')?.children[0].trim(),
        // All elements except title h3.
        elements: elements.filter(e => e.tag !== 'h3')
    };
}

const WHITELIST_ATTRS = ['href', 'src'];

function filterSupportedElements(node, trimStart, trimEnd) {
    if (node.type === 'text') {
        var result = node.data;
        if (trimStart) {
            result = result.replace(/^[ \n]+/g, '');
        }
        if (trimEnd) {
            result = result.replace(/[ \n]+$/g, '');
        }
        return result;
    }

    if (!SUPPORTED_ELEMENTS.includes(node.name)) {
        console.warn(`Unsupported element found: ${node.name}`);
        return null;
    }

    const element = {
        tag: node.name,
        children: []
    };

    // Add logic to parse element attributes
    if (node.attribs) {
        element.attrs = {};
        for (const [key, value] of Object.entries(node.attribs)) {
            if (WHITELIST_ATTRS.indexOf(key) > -1) {
                element.attrs[key] = value;
            }
        }
    }

    node.children.forEach((child, idx) => {

        var trimS = false;
        var trimE = false;
        if (node.name === 'p') {
            if (idx === 0) {
                trimS = true;
            }
            if (idx === node.children.length - 1) {
                trimE = true;
            }
        }

        const childElement = filterSupportedElements(child, trimS, trimE);
        if (childElement) {
            element.children.push(childElement);
        }
    });

    // Fix comparision with saved version.
    if (element.tag === 'h4') {
        element.attrs.id = element.children.join('');
    }

    if (!Object.keys(element.attrs).length) {
        delete element.attrs;
    }

    if (!element.children.length) {
        delete element.children;
    }

    return element;
}

module.exports = {
    convertHtmlToElementTree
};
