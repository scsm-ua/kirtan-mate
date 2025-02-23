const axios = require('axios');

async function createAccount(shortName, author_name, author_url) {
    const url = 'https://api.telegra.ph/createAccount';
    const params = {
        short_name: shortName,
        author_name: author_name,
        author_url: author_url
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
        const account = await createAccount('kirtan.site', 'kirtan.site', 'https://kirtan.site');
        console.log('Access Token:', account.access_token);
    } catch (error) {
        console.error(error.message);
    }
})();
