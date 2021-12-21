module.exports = GameMenuIconTemplate = function (options) {
    var classname = "";
    if (options.class != undefined) {
        classname = options.class;
    }
    return "<li id=\"".concat(options.id, "\" class=\"game-menu-icon ").concat(classname, "\">").concat(options.text, "</li>");
};
//# sourceMappingURL=game-menu-icon.template.js.map