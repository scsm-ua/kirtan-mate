/**
 *
 */
function auxTransform(htmlString) {
    const a = removeDraftMark(htmlString);
    const b = wrapText(a);
    return b;
}

/**
 *
 */
function removeDraftMark(htmlString) {
    const headingPosition = htmlString.indexOf('<h1>');
    return htmlString.substr(headingPosition);
}

/**
 * Wrap everything that follows the title-author.
 */
function wrapText(htmlString) {
    const index = htmlString.indexOf('<h5 class="Song__number">');
    const top = htmlString.slice(0, index);
    const wrapped = htmlString.slice(index);

    return `
    <div class="Song__header">${top}</div>
    <div class="Song__body">${wrapped}</div>
  `;
}

/**
 *
 */
module.exports = { auxTransform };
