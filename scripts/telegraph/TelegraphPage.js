class TelegraphPage {
    constructor({path, url, title, description, author_name, author_url, image_url, content, views}) {
        // Path to the Telegraph page, used to access the page within the Telegraph platform 
        // (read-only)
        this.path = path;
        // Full URL of the Telegraph page, which can be shared and accessed via a web browser 
        // (read-only)
        this.url = url;
        // Brief description of the Telegraph page, providing a summary of the content
        // ? (read-only)
        this.description = description;
        // URL of the main image associated with the Telegraph page, often displayed as a thumbnail
        // ? (read-only)
        this.image_url = image_url;
        // Number of times the Telegraph page has been viewed by users 
        // (read-only)
        this.views = views;

        // Title of the Telegraph page, displayed at the top of the page and in search results
        this.title = title;
        // Name of the author who created the Telegraph page
        this.author_name = author_name;
        // URL to the author's profile or personal page, if available
        this.author_url = author_url;
        // Main content of the Telegraph page, typically in HTML format
        this.content = content;
    }
}

module.exports = {
    TelegraphPage
};
