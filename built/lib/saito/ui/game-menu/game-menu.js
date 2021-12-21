var GameMenuTemplate = require('./game-menu.template');
var GameMenuIconTemplate = require('./game-menu-icon.template');
var GameMenuOptionTemplate = require('./game-menu-option.template');
var GameMenu = /** @class */ (function () {
    function GameMenu(app) {
        this.app = app;
        this.icons = [];
        this.options = [];
        this.sub_options = [];
        this.sub_menu_open = "";
    }
    GameMenu.prototype.render = function (app, mod) {
        if (!document.querySelector(".game-menu")) {
            app.browser.addElementToDom(GameMenuTemplate());
        }
        var html = '<ul>';
        for (var i = 0; i < this.icons.length; i++) {
            html += GameMenuIconTemplate(this.icons[i]);
        }
        for (var i = 0; i < this.options.length; i++) {
            html += GameMenuOptionTemplate(this.options[i], this.sub_options[i]);
        }
        html += '</ul>';
        var menu = document.querySelector(".game-menu");
        menu.innerHTML = html;
        menu.style.display = "block";
    };
    GameMenu.prototype.hide = function () {
        try {
            document.querySelector('.game-menu').style.display = "none";
        }
        catch (err) {
        }
    };
    GameMenu.prototype.attachEvents = function (app, game_mod) {
        var _this = this;
        //
        // callbacks in game-menu-option
        //
        for (var i = 0; i < this.options.length; i++) {
            var divname = "#" + this.options[i].id;
            var menu = document.querySelector(divname);
            menu.ontouch = function (e) {
                var id = e.currentTarget.id;
                for (var i_1 = 0; i_1 < _this.options.length; i_1++) {
                    if (_this.options[i_1].id === id) {
                        if (_this.sub_menu_open === id) {
                            _this.hideSubMenus();
                            e.stopPropagation();
                            return;
                        }
                        if (_this.options[i_1].callback != undefined) {
                            _this.options[i_1].callback(app, game_mod);
                            e.stopPropagation();
                        }
                    }
                }
                return;
            };
            menu.onclick = function (e) {
                var id = e.currentTarget.id;
                for (var i_2 = 0; i_2 < _this.options.length; i_2++) {
                    if (_this.options[i_2].id === id) {
                        if (_this.sub_menu_open === id) {
                            _this.hideSubMenus();
                            e.stopPropagation();
                            return;
                        }
                        if (_this.options[i_2].callback != undefined) {
                            _this.options[i_2].callback(app, game_mod);
                            e.stopPropagation();
                        }
                    }
                }
            };
        }
        //
        // sub-menu
        //
        for (var i = 0; i < this.sub_options.length; i++) {
            for (var ii = 0; ii < this.sub_options[i].length; ii++) {
                var divname = "#" + this.sub_options[i][ii].id;
                var menu = document.querySelector(divname);
                menu.ontouch = function (e) {
                    var id = e.currentTarget.id;
                    for (var iii = 0; iii < _this.sub_options.length; iii++) {
                        for (var iv = 0; iv < _this.sub_options[iii].length; iv++) {
                            if (_this.sub_options[iii][iv].id === id) {
                                if (_this.sub_options[iii][iv].callback != undefined) {
                                    _this.sub_options[iii][iv].callback(app, game_mod);
                                    e.stopPropagation();
                                }
                            }
                        }
                    }
                    return;
                };
                menu.onclick = function (e) {
                    var id = e.currentTarget.id;
                    for (var iii = 0; iii < _this.sub_options.length; iii++) {
                        for (var iv = 0; iv < _this.sub_options[iii].length; iv++) {
                            if (_this.sub_options[iii][iv].id === id) {
                                if (_this.sub_options[iii][iv].callback != undefined) {
                                    _this.sub_options[iii][iv].callback(app, game_mod);
                                    e.stopPropagation();
                                }
                            }
                        }
                    }
                };
            }
        }
        //
        // callbacks in game-menu-icon
        //
        for (var i = 0; i < this.icons.length; i++) {
            var divname = "#" + this.icons[i].id;
            var menu = document.querySelector(divname);
            menu.onclick = function (e) {
                var id = e.currentTarget.id;
                for (var i_3 = 0; i_3 < _this.icons.length; i_3++) {
                    if (_this.icons[i_3].id === id) {
                        if (_this.icons[i_3].callback != undefined) {
                            _this.icons[i_3].callback(app, game_mod);
                            e.stopPropagation();
                        }
                    }
                }
            };
            menu.ontouch = function (e) {
                var id = e.currentTarget.id;
                for (var i_4 = 0; i_4 < _this.icons.length; i_4++) {
                    if (_this.icons[i_4].id === id) {
                        if (_this.icons[i_4].callback != undefined) {
                            _this.icons[i_4].callback(app, game_mod);
                            e.stopPropagation();
                        }
                    }
                }
            };
        }
    };
    GameMenu.prototype.addMenuOption = function (options) {
        if (options === void 0) { options = {}; }
        for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].id == options.id) {
                return;
            }
        }
        this.options.push(options);
        this.sub_options.push([]);
    };
    GameMenu.prototype.addSubMenuOption = function (parent_id, options) {
        if (options === void 0) { options = {}; }
        for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].id == parent_id) {
                if (this.sub_options[i]) {
                    for (var z = 0; z < this.sub_options[i].length; z++) {
                        if (this.sub_options[i][z].id === options.id) {
                            return;
                        }
                    }
                    this.sub_options[i].push(options);
                }
            }
        }
    };
    GameMenu.prototype.addMenuIcon = function (options) {
        if (options === void 0) { options = {}; }
        for (var i = 0; i < this.icons.length; i++) {
            if (this.icons[i].id == options.id) {
                return;
            }
        }
        this.icons.push(options);
    };
    GameMenu.prototype.showSubMenu = function (parent_id) {
        if (this.sub_menu_open != "") {
            this.hideSubMenus();
        }
        this.sub_menu_open = parent_id;
        var el = document.querySelector("#" + parent_id + " > ul");
        el.style.display = "block";
    };
    GameMenu.prototype.hideSubMenus = function () {
        this.sub_menu_open = "";
        for (var i = 0; i < this.options.length; i++) {
            var divname = "#" + this.options[i].id + " > ul";
            var el = document.querySelector(divname);
            if (el) {
                el.style.display = "none";
            }
        }
    };
    return GameMenu;
}());
module.exports = GameMenu;
//# sourceMappingURL=game-menu.js.map