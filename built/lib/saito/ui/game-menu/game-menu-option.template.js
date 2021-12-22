module.exports = GameMenuOptionTemplate = function (options, sub_options) {
    if (sub_options === void 0) { sub_options = []; }
    var classname = "";
    if (options.class) {
        classname = options.class;
    }
    var html = "<li id=\"".concat(options.id, "\" class=\"game-menu-option ").concat(classname, "\">").concat(options.text);
    if (sub_options.length > 0) {
        html += '<ul class="game-menu-sub-options">';
        for (var z = 0; z < sub_options.length; z++) {
            classname = "";
            if (sub_options[z].class) {
                classname = sub_options[z].class;
            }
            html += "<li id=\"".concat(sub_options[z].id, "\" class=\"game-menu-sub-option ").concat(classname, "\">").concat(sub_options[z].text, "</li>");
        }
        html += '</ul>';
    }
    html += '</li>';
    return html;
};
//# sourceMappingURL=game-menu-option.template.js.map