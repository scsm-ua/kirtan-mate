const TelegraphPage = require('./TelegraphPage');

function pushPage(page) {
    if (!(page instanceof TelegraphPage)) {
        throw new Error('Invalid page object');
    }
    // ...existing code...
    console.log(`Pushing page: ${page.title}`);
    // ...existing code...
}

