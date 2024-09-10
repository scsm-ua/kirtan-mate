/**
 * Preserve user choice of the Book ID in the Local storage.
 */
function handleBookChoice({ target }) {
    try {
        localStorage.setItem(
            'CURRENT_BOOK_ID',
            target.closest('li').dataset.bookId
        );
    } catch (e) {
        console.error(e);
    }
}
