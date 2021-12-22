var GameCardboxTemplate = require('./game-cardbox.template');
var GameCardbox = /** @class */ (function () {
    function GameCardbox(app, height, width) {
        if (height === void 0) { height = 480; }
        if (width === void 0) { width = 640; }
        this.app = app;
        this.height = height;
        this.width = width;
        this.cards = [];
        this.cardfan = 0; // obsolete
        this.cardbox_lock = 0; // 1 = mouseover does not remove popup
        this.skip_card_prompt = 0; // 1 = don't prompt for action, just execute
        this.card_types = []; // associative array of css / text / callback
        this.game_mod = null;
    }
    GameCardbox.prototype.render = function (app, game_mod) {
        this.game_mod = game_mod;
        if (!document.getElementById("game-cardbox")) {
            app.browser.addElementToDom(GameCardboxTemplate());
            // push behind all
            document.getElementById("game-cardbox").style.zindex = -10; //push behind 
        }
    };
    GameCardbox.prototype.attachEvents = function (app, game_mod) {
    };
    GameCardbox.prototype.attachCardEvents = function (app, game_mod) {
        var _this = this;
        try {
            var _loop_1 = function (i) {
                var card_css = this_1.card_types[i].css;
                var card_action = this_1.card_types[i].action;
                var card_callback = this_1.card_types[i].mycallback;
                Array.from(document.getElementsByClassName(card_css)).forEach(function (card) {
                    card.onmouseover = function (e) {
                        try {
                            if (_this.cardbox_lock == 1) {
                                return;
                            }
                            _this.showCardbox(e.currentTarget.id);
                        }
                        catch (err) { }
                    };
                    card.onmouseout = function (e) {
                        try {
                            _this.hideCardbox();
                        }
                        catch (err) { }
                    };
                    card.onclick = function (e) {
                        _this.cardbox_lock = 1;
                        if (card_action != "" && card_callback != null) {
                            _this.showCardbox(e.currentTarget.id, card_action, card_callback);
                        }
                        else {
                            _this.showCardbox(e.currentTarget.id);
                        }
                    };
                });
            };
            var this_1 = this;
            for (var i = 0; i < this.card_types.length; i++) {
                _loop_1(i);
            }
            //
            // force-close card popup
            //
            var cardbox_exit_btn = document.getElementById("cardbox-exit");
            cardbox_exit_btn.onclick = function (e) {
                _this.hideCardbox(1);
            };
        }
        catch (err) {
        }
    };
    GameCardbox.prototype.showCardboxHTML = function (card, html, action, mycallback) {
        var _this = this;
        if (action === void 0) { action = ""; }
        if (mycallback === void 0) { mycallback = null; }
        // non-graphical cards trigger automatically
        if (html == "" || html == null || html.indexOf("noncard") > -1 || html.indexOf("nocard") > -1) {
            if (mycallback != null) {
                mycallback(card);
                this.hideCardbox(1);
            }
            return;
        }
        // otherwise we handle the card individually
        if (this.cardfan == 0) {
            // replace the card
            document.getElementById("cardbox-card").innerHTML = html;
        }
        else {
            html = "";
            for (var i = 0; i < this.cards.length; i++) {
                html += this.game_mod.returnCardImage(this.cards[i], action, mycallback);
            }
            document.getElementById("cardbox-card").innerHTML = html;
        }
        // hide cardbox AFTER callback so cards available in game callback
        if (this.skip_card_prompt == 1 && mycallback != null) {
            mycallback(card);
            this.hideCardbox(1);
            return;
        }
        if (action != "") {
            this.cardbox_lock = 1;
            document.getElementById("cardbox-menu").style.display = "block";
            document.getElementById("cardbox-menu").innerHTML = action;
            document.getElementById("cardbox-menu").onclick = function (e) {
                if (mycallback != null) {
                    mycallback(card);
                }
                _this.hideCardbox(1);
            };
            document.getElementById("cardbox-exit").style.display = "block";
        }
        if (this.cardbox_lock == 1) {
            document.getElementById("cardbox-exit").style.display = "block";
            document.getElementById("cardbox-exit-background").style.display = "block";
        }
        document.getElementById("game-cardbox").style.zIndex = 250;
        document.getElementById("game-cardbox").style.display = "block";
        document.getElementById("cardbox-card").style.display = "block";
    };
    GameCardbox.prototype.showCardbox = function (card, action, mycallback) {
        if (action === void 0) { action = ""; }
        if (mycallback === void 0) { mycallback = null; }
        if (card == "undefined" || card == "") {
            return;
        }
        // this.cardfan = 1
        if (!this.cards.includes(card)) {
            this.cards.push(card);
        }
        // card and returnCardImage(card) only used in this.cardfan=0 mode
        this.showCardboxHTML(card, this.game_mod.returnCardImage(card), action, mycallback);
    };
    GameCardbox.prototype.hideCardbox = function (force) {
        if (force === void 0) { force = 0; }
        try {
            if (this.cardbox_lock == 1 && force == 0) {
                return;
            }
            this.cards = [];
            document.getElementById("game-cardbox").style.zindex = -10; //push behind 
            document.getElementById("game-cardbox").style.display = "none";
            document.getElementById("cardbox-card").style.display = "none";
            document.getElementById("cardbox-menu").style.display = "none";
            document.getElementById("cardbox-exit").style.display = "none";
            document.getElementById("cardbox-exit-background").style.display = "none";
            this.cardbox_lock = 0;
            document.getElementById("game-cardbox").style.zIndex = -1;
        }
        catch (err) { }
    };
    GameCardbox.prototype.addCardType = function (css_name, action_text, mycallback) {
        for (var i = 0; i < this.card_types.length; i++) {
            if (this.card_types[i].css === css_name) {
                return;
            }
        }
        this.card_types.push({
            css: css_name,
            action: action_text,
            mycallback: mycallback
        });
    };
    return GameCardbox;
}());
module.exports = GameCardbox;
//# sourceMappingURL=game-cardbox.js.map