module.exports = elParser = function (domstring) {
    var html = new DOMParser().parseFromString(domstring, 'text/html');
    return html.body.firstChild;
};
//# sourceMappingURL=el_parser.js.map