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

/**
 * Preserve user choice of show/hide song verses/translation.
 * Value:	1 - show only verses,
 * 				2 - show only translation,
 * 				3 - show both (default).
 */
const SONG_DISPLAY_MODE = 'SONG_DISPLAY_MODE'

/**/
function getSongDisplayMode() {
		const val = localStorage.getItem(SONG_DISPLAY_MODE);
		return val ? parseInt(val) : 3;
}

/**/
function setSongDisplayMode(value) {
		localStorage.setItem(SONG_DISPLAY_MODE, value);
}
