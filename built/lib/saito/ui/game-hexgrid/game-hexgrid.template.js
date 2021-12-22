module.exports = GameHexGridTemplate = function (height, width, mode) {
    if (mode === void 0) { mode = []; }
    var html = "\n    <style type=\"text/css\">\n      .hex {\n        width: ".concat(100 / width, "%\n      }\n      \n      .hex:nth-child(9n+6) {\n        margin-left: ").concat((100 / width) / 2, "%\n      }\n    </style>\n  ");
    html += '<div id="game-hexgrid-container" class="game-hexgrid-container"><ul id="game-hexgrid" class="game-hexgrid">';
    html += "\n";
    // rendering problem fix -- empty top row
    /*if ((height+1)%2 == 0) {
      for (let i = 0; i < width-1; i++) { html += '<li id="" class="hex"></li>'; }
    } else {
      for (let i = 0; i < width; i++) { html += '<li id="" class="hex"></li>'; }
    }*/
    var hexnum = 0;
    var width_adjustment = 0;
    for (var h = 1, hid = 1; h <= height; h++, hid++) {
        /*
          Mode has alternating arrays of length, width and width-1
          Widdy is the adjusted width (array length)
        */
        var widdy = (h % 2 == 0) ? width - 1 : width;
        /*
         We want to shift the index once past the widest part of the hexagon to facilitate adjacency
        */
        if (h > (height + 1) / 2) {
            width_adjustment++;
        }
        for (var w = 1, wid = 1; w <= widdy; w++) {
            if (mode.length > 0) {
                if (mode[hexnum] == 1) {
                    var id = (hid + "_" + (wid + width_adjustment));
                    html += "<li id=\"".concat(id, "\" class=\"hex\">\n\t                 <div class=\"hexIn\" id=\"hexIn_").concat(id, "\">\n                  <div class=\"hexLink\" id=\"hexLink_").concat(id, "\">\n            \t \t  <div class=\"hex_bg\" id=\"hex_bg_").concat(id, "\">\n            \t\t  </div></div></div>\n            \t    </li>");
                    wid++;
                }
                else {
                    html += "<li id=\"\" class=\"hex\"></li>";
                }
                hexnum++;
            }
            else {
                var id = (hid + "_" + wid);
                html += "<li id=\"".concat(id, "\" class=\"hex\">\n\t               <div class=\"hexIn\" id=\"hexIn_").concat(id, "\">\n              \t <div class=\"hexLink\" id=\"hexLink_").concat(id, "\">\n              \t <div class=\"hex_bg\" id=\"hex_bg_").concat(id, "\">\n              \t </div></div></div>\n                 </li>");
                wid++;
            }
        }
    }
    // rendering problem fix -- empty bottom row
    /*if ((height+1)%2 == 0) {
      for (let i = 0; i < width-1; i++) { html += '<li id="" class="hex"></li>'; }
    } else {
      for (let i = 0; i < width; i++) { html += '<li id="" class="hex"></li>'; }
    }*/
    html += "\n";
    html += '</ul></div>';
    return html;
};
//# sourceMappingURL=game-hexgrid.template.js.map