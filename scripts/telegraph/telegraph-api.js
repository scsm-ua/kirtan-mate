const axios = require('axios');
const TelegraphPage = require('./TelegraphPage');

async function createTelegraphPage(accessToken, page, returnContent) {
    if (!(page instanceof TelegraphPage)) {
        throw new Error('Invalid page object');
    }

    const url = 'https://api.telegra.ph/createPage';
    const data = {
        access_token: accessToken,
        title: page.title,
        author_name: page.authorName,
        author_url: page.authorUrl,
        content: page.content,
        return_content: returnContent,
        path: page.path
    };

    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Error creating Telegraph page:', error);
        throw error;
    }
}

async function updateTelegraphPage(accessToken, page, returnContent) {
    if (!(page instanceof TelegraphPage)) {
        throw new Error('Invalid page object');
    }

    const url = 'https://api.telegra.ph/editPage/' + page.path;
    const data = {
        access_token: accessToken,
        title: page.title,
        author_name: page.authorName,
        author_url: page.authorUrl,
        content: page.content,
        return_content: returnContent,
        path: page.path
    };

    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Error updating Telegraph page:', error);
        throw error;
    }
}

async function getAllTelegraphPages(accessToken) {
    const url = 'https://api.telegra.ph/getPageList';
    const data = {
        access_token: accessToken,
        offset: 0,
        limit: 200
    };

    let allPages = [];
    let hasMore = true;

    try {
        while (hasMore) {
            const response = await axios.post(url, data);
            const pages = response.data.result.pages;
            allPages = allPages.concat(pages);
            hasMore = pages.length === data.limit;
            data.offset += data.limit;
        }
        return allPages;
    } catch (error) {
        console.error('Error getting Telegraph pages:', error);
        throw error;
    }
}
