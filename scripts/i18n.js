const { getSongbooki18n } = require("./songbookLoader");

module.exports.i18n = function(songbook_id) {

    var i18n_dict = getSongbooki18n(songbook_id);

    return function(text) {
        if (i18n_dict && text in i18n_dict) {
            return i18n_dict[text];
        } else {
            return text;
        }
    }
}
