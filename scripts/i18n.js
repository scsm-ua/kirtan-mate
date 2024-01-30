const { songbookInfo } = require("./songbookLoader");

module.exports.i18n = function(text) {
    if (songbookInfo.i18n && text in songbookInfo.i18n) {
        return songbookInfo.i18n[text];
    } else {
        return text;
    }
}
