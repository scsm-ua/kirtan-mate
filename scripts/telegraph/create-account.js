const axios = require('axios');

async function createAccount(shortName, authorName, authorUrl) {
    const url = 'https://api.telegra.ph/createAccount';
    const params = {
        short_name: shortName,
        author_name: authorName,
        author_url: authorUrl
    };

    try {
        const response = await axios.post(url, params);
        if (response.data.ok) {
            return response.data.result;
        } else {
            throw new Error(response.data.error);
        }
    } catch (error) {
        throw new Error(`Failed to create account: ${error.message}`);
    }
}

// Example usage
(async () => {
    try {
        const account = await createAccount('shortNameExample', 'Author Name', 'https://author.url');
        console.log('Access Token:', account.access_token);
    } catch (error) {
        console.error(error.message);
    }
})();
