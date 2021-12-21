var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
module.exports = AddressMenuTemplate = function (elements, coords) {
    var elements_html = "";
    // fuck map
    try {
        elements_html = Object.entries(elements).map(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return "<li style=\"text-align: center;line-height: 2em; cursor: pointer;\" id=\"".concat(key, "\">").concat(value.name, "</li>");
        });
    }
    catch (err) {
        return "";
    }
    elements_html = elements_html.join('');
    var width = 240;
    var height = 120;
    var left = coords.left + ((coords.width - width) / 2);
    var top = coords.top - (height / 2) - 70;
    return "\n    <div id=\"address-menu\" style=\"\n      position: absolute;\n      top: ".concat(top, "px;\n      left: ").concat(left, "px;\n      height: ").concat(height, "px;\n      width: ").concat(width, "px;\n      padding: 10px;\n      background: whitesmoke;\n      color: black;\n      font-family: \"visuelt-light\", \"Microsoft Yahei\", \"Hiragino Sans GB\";\n        \">\n      <ul style=\"list-style-type: none\">\n        ").concat(elements_html, "\n      </ul>\n    </div>\n  ");
};
//# sourceMappingURL=address-menu.template.js.map