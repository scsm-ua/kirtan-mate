const axios = require('axios');
const { TelegraphPage } = require('./TelegraphPage');

async function createTelegraphPage(accessToken, page, returnContent) {
    if (!(page instanceof TelegraphPage)) {
        throw new Error('Invalid page object');
    }

    const url = 'https://api.telegra.ph/createPage';
    const data = {
        access_token: accessToken,
        title: page.title,
        author_name: page.author_name,
        author_url: page.author_url,
        content: page.content,
        return_content: returnContent,
        path: page.path
    };

    const content_length = JSON.stringify(data).length;
    console.log(' - Create page content_length', content_length)
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
        author_name: page.author_name,
        author_url: page.author_url,
        content: page.content,
        return_content: returnContent,
        path: page.path
    };

    const content_length = JSON.stringify(data).length;
    console.log(' - Update page content_length', content_length)

    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Error updating Telegraph page:', error);
        throw error;
    }
}

async function loadAllTelegraphPages(accessToken) {
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
            if (response.data.error) {
                throw response.data.error;
            }
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

async function getTelegraphPage(path, returnContent = false) {
    const url = `https://api.telegra.ph/getPage/${path}`;
    const params = {
        return_content: returnContent
    };

    try {
        const response = await axios.get(url, { params });
        return new TelegraphPage(response.data.result);
    } catch (error) {
        console.error('Error getting Telegraph page:', error);
        throw error;
    }
}

module.exports = {
    createTelegraphPage,
    updateTelegraphPage,
    loadAllTelegraphPages,
    getTelegraphPage
};
