module.exports = SaitoOverlayTemplate = function (closebox) {
    if (closebox) {
        return "  \n      <div id=\"saito-overlay\" class=\"saito-overlay\">\n        <div id=\"saito-overlay-closebox\" class=\"saito-overlay-closebox\"><i class=\"fas fa-times-circle saito-overlay-closebox-btn\"></i></div>\n      </div>\n      <div id=\"saito-overlay-backdrop\" class=\"saito-overlay-backdrop\"></div>\n    ";
    }
    else {
        return "  \n      <div id=\"saito-overlay\" class=\"saito-overlay\"></div>\n      <div id=\"saito-overlay-backdrop\" class=\"saito-overlay-backdrop\"></div>\n    ";
    }
};
//# sourceMappingURL=saito-overlay.template.js.map