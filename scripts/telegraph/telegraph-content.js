const cheerio = require('cheerio');

const SUPPORTED_ELEMENTS = [
    'a',          // Anchor (link)
    'aside',      // Sidebar content
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
    return filterSupportedElements($('body').get(0));
}

function filterSupportedElements(node) {
    if (node.type === 'text') {
        return node.data;
    }

    if (!SUPPORTED_ELEMENTS.includes(node.name)) {
        console.warn(`Unsupported element found: ${node.name}`);
        return null;
    }

    const element = {
        tag: node.name,
        children: []
    };

    node.children.forEach(child => {
        const childElement = filterSupportedElements(child);
        if (childElement) {
            element.children.push(childElement);
        }
    });

    return element;
}

