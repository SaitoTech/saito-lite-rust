var GameHudTemplate = require('./game-hud.template');
var dragElement = require('../../../helpers/drag_element');
var _a = require('./game-hud-types'), DESKTOP = _a.DESKTOP, MOBILE_PORTRAIT = _a.MOBILE_PORTRAIT, MOBILE_LANDSCAPE = _a.MOBILE_LANDSCAPE;
var GameHud = /** @class */ (function () {
    function GameHud(app) {
        this.app = app;
        this.game_mod = null;
        this.status = "";
        this.initial_render = 0;
        this.mode = 0; // 0 transparent
        // 1 classic (square)
        // 2 vertical
        this.use_cardbox = 1;
        this.use_cardfan = 1;
        this.use_board_sizer = 1;
        this.card_types = [];
    }
    GameHud.prototype.render = function (app, game_mod) {
        this.game_mod = game_mod;
        if (game_mod.browser_active == 1) {
            if (this.initial_render == 0) {
                if (!document.querySelector(".hud")) {
                    app.browser.addElementToDom(GameHudTemplate());
                }
                var hud = document.querySelector(".hud");
                var hud_body = document.querySelector('.hud-body');
                var hud_header = document.querySelector('.hud-header');
                //
                // handle preferred display mode
                //
                if (this.mode == 0) {
                    hud.classList.add("hud-long");
                    hud.appendChild(hud_header);
                    hud.appendChild(hud_body);
                }
                if (this.mode == 1) {
                    hud.classList.add("hud-square");
                    hud.appendChild(hud_header);
                    hud.appendChild(hud_body);
                }
                if (this.mode == 2) {
                    hud.classList.add("hud-vertical");
                    hud.appendChild(hud_header);
                    hud.appendChild(hud_body);
                }
                if (this.use_cardbox == 1) {
                    game_mod.cardbox.render(app, game_mod);
                }
                //
                // avoid adding to DOM
                //
                this.initial_render = 1;
                this.resizeHudHeight();
                this.resizeHudWidth();
            }
            //
            //
            //
            document.querySelector('.hud').style.display = "block";
        }
    };
    GameHud.prototype.hide = function () {
        try {
            document.getElementById('hud').style.display = "none";
        }
        catch (err) {
        }
    };
    GameHud.prototype.attachEvents = function (app, game_mod) {
        var _this = this;
        try {
            var myself_1 = this;
            //
            // "card" items become clickable / cardboxable
            //
            // this function is permanent refernce to changeable_callback
            //
            this.addCardType("card", "select", game_mod.cardbox_callback);
            //
            // hud is draggable
            //
            app.browser.makeDraggable("hud", "hud-header", function () { myself_1.resizeHudHeight(); });
        }
        catch (err) {
        }
        //
        // hud popup / popdown
        //
        try {
            var hud_toggle_button_1 = document.getElementById('hud-toggle-button');
            hud_toggle_button_1.onclick = function (e) {
                e.stopPropagation();
                switch (_this.checkSizeAndOrientation()) {
                    case DESKTOP:
                        hud.classList.toggle("hud-hidden-vertical");
                        hud_toggle_button_1.classList.toggle("fa-caret-up");
                        hud_toggle_button_1.classList.toggle("fa-caret-down");
                }
            };
        }
        catch (err) { }
    };
    GameHud.prototype.attachCardEvents = function (app, game_mod) {
        if (game_mod.browser_active == 0) {
            return;
        }
        //
        // cardbox events
        //
        if (this.use_cardbox == 1) {
            // cardbox needs to manage clicks
            game_mod.cardbox.hideCardbox();
            game_mod.cardbox.cardbox_lock = 0;
            game_mod.cardbox.attachCardEvents(app, game_mod);
        }
        else {
            var _loop_1 = function (i) {
                var card_css = this_1.card_types[i].css;
                var card_action = this_1.card_types[i].action;
                var card_callback = this_1.card_types[i].mycallback;
                Array.from(document.getElementsByClassName(card_css)).forEach(function (card) {
                    card.onmouseover = function (e) { };
                    card.onmouseout = function (e) { };
                    card.onclick = function (e) {
                        card_callback(e.currentTarget.id);
                    };
                });
            };
            var this_1 = this;
            // we manage directly
            for (var i = 0; i < this.card_types.length; i++) {
                _loop_1(i);
            }
        }
        //
        // resize hud width if transparent/long mode
        //
        if (this.mode == 0) {
            this.resizeHudWidth();
        }
    };
    GameHud.prototype.renderStatus = function (app, game_mod) {
        try {
            var status_1 = document.getElementById('status');
            if (status_1) {
                var status_div = document.getElementById('status');
                var status_overlay_div = document.getElementById('status-overlay');
                if (status_overlay_div) {
                    if (status_overlay_div.style.display != "none") {
                        document.getElementById('status-overlay').style.display = 'none';
                        status_1.style.display = 'block';
                    }
                }
                if (status_1.innerHTML !== this.status) {
                    status_1.innerHTML = this.status;
                }
                if (this.status_callback != null) {
                    this.status_callback();
                }
            }
        }
        catch (err) {
        }
    };
    GameHud.prototype.resizeHudCards = function () {
        try {
            var image_width_1 = document.querySelector(".cardimg-hud").width;
            var image_height_1 = this.game_mod.returnCardHeight(image_width_1);
            document.querySelector(".status-cardbox").height = "unset";
            Array.from(document.querySelectorAll(".status-cardbox .card")).forEach(function (card) {
                card.style.height = image_height_1 + "px";
                card.style.width = image_width_1 + "px";
            });
        }
        catch (err) {
            console.log("ERR: " + err);
        }
    };
    GameHud.prototype.updateStatus = function (status_html, callback) {
        if (callback === void 0) { callback = null; }
        this.status = status_html;
        this.status_callback = callback;
        this.renderStatus();
        //
        // card events
        //
        // we always attach events to the cardbox, as it may be toggleable
        // and needs submission of game_mod and app to function later if 
        // enabled.
        //
        if (this.game_mod != null) {
            if (this.use_cardbox == 1) {
                //
                // unlock cardbox
                //
                this.game_mod.cardbox.hideCardbox();
                this.game_mod.cardbox_lock = 0;
                this.game_mod.cardbox.attachCardEvents(this.app, this.game_mod);
            }
        }
    };
    GameHud.prototype.updateStatusMessage = function (status_message_txt, callback) {
        if (callback === void 0) { callback = null; }
        this.updateStatus('<div id="status-message" class="status-message">' + status_message_txt + '</div>', callback);
    };
    GameHud.prototype.updateStatusMessageAndShowCards = function (status_message_txt, hand, cards, callback) {
        if (callback === void 0) { callback = null; }
        //
        // unlock cardbox
        //
        if (this.game_mod != null) {
            if (this.use_cardbox == 1) {
                //
                // unlock cardbox
                //
                this.game_mod.cardbox.hideCardbox();
                this.game_mod.cardbox_lock = 0;
                this.game_mod.cardbox.attachCardEvents(this.app, this.game_mod);
            }
        }
        var html = "\n        <div id=\"status-message\" class=\"status-message\">".concat(status_message_txt, "</div>\n        ").concat(this.returnCardList(hand, cards), "\n      ");
        this.updateStatus(html, callback);
        this.attachCardEvents(this.app, this.game_mod);
        this.resizeHudWidth();
        this.resizeHudCards(); // cards before height as height is set from width
        this.resizeHudHeight();
    };
    GameHud.prototype.onCardClick = function (onCardClickFunction) {
        if (onCardClickFunction === void 0) { onCardClickFunction = null; }
        this.game_mod.changeable_callback = onCardClickFunction;
        this.attachCardEvents(this.app, this.game_mod);
    };
    GameHud.prototype.returnCardList = function (hand, cards) {
        if (hand === void 0) { hand = []; }
        var html = "";
        if (this.mode == 0) {
            for (i = 0; i < hand.length; i++) {
                html += this.returnCardItem(hand[i], cards);
            }
            html = "\n          <div class=\"status-cardbox\" id=\"status-cardbox\">\n            ".concat(html, "\n          </div>");
        }
        else {
            html = '<ul class="status-cardbox">';
            for (i = 0; i < hand.length; i++) {
                html += this.returnCardItem(hand[i], cards);
            }
            html += '</ul>';
        }
        return html;
    };
    GameHud.prototype.returnCardItem = function (card, cards) {
        if (this.mode == 0) {
            return "<div id=\"".concat(card.replace(/ /g, ''), "\" class=\"card showcard cardbox-hud cardbox-hud-status\">").concat(this.returnCardImage(card, cards, 1), "</div>");
        }
        else {
            return '<li class="card showcard" id="' + card + '">' + cards[card].name + '</li>';
        }
    };
    GameHud.prototype.returnCardImage = function (card, cards, hud) {
        if (hud === void 0) { hud = 0; }
        var cardclass = "cardimg";
        if (hud == 1) {
            cardclass = "cardimg-hud";
        }
        return "<img class=\"".concat(cardclass, "\" src=\"").concat(cards[card].img, "\" />");
    };
    GameHud.prototype.toggleHud = function (hud, hud_toggle_button) {
        switch (this.checkSizeAndOrientation()) {
            case DESKTOP:
                hud.style.top = null;
                hud.style.left = null;
                break;
            case MOBILE_PORTRAIT:
            //          hud.classList.toggle('hud-hidden-vertical');
            //          hud_toggle_button.classList.toggle('fa-caret-up');
            //          hud_toggle_button.classList.toggle('fa-caret-down');
            //          break;
            case MOBILE_LANDSCAPE:
            //          hud.classList.toggle('hud-hidden-horizontal');
            //          hud_toggle_button.classList.toggle('fa-caret-right');
            //          hud_toggle_button.classList.toggle('fa-caret-left');
            //          break;
        }
    };
    GameHud.prototype.checkSizeAndOrientation = function () {
        if (window.matchMedia("(orientation: landscape)").matches && window.innerHeight <= 700) {
            return MOBILE_LANDSCAPE;
        }
        if (window.matchMedia("(orientation: portrait)").matches && window.innerWidth <= 600) {
            return MOBILE_PORTRAIT;
        }
        return DESKTOP;
    };
    GameHud.prototype.addCardType = function (css_name, action_text, mycallback) {
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
        this.game_mod.cardbox.addCardType(css_name, action_text, mycallback);
    };
    GameHud.prototype.resizeHudHeight = function () {
        try {
            var hud = document.getElementById('hud');
            var hud_header = document.getElementById('hud-header');
            var hud_body = document.getElementById('hud-body');
            var wheight = window.innerHeight;
            var hud_rect = hud.getBoundingClientRect();
            var hud_header_rect = hud_header.getBoundingClientRect();
            var hud_body_rect = hud_body.getBoundingClientRect();
            var hud_header_height = hud_header_rect.bottom - hud_header_rect.top;
            var hud_body_height = hud_body_rect.bottom - hud_body_rect.top;
            var hud_height = hud_rect.bottom - hud_rect.top;
            var hub_body_cutoff = hud_height - hud_header_height;
            try {
                // set the height of the hud_body based on the contents / cardbox
                if (document.querySelector(".hud-body .status") && document.querySelector(".status-cardbox")) {
                    var status_box = document.querySelector(".hud-body .status");
                    var status_box_rect = status_box.getBoundingClientRect();
                    var status_box_height = status_box_rect.bottom - status_box_rect.top;
                    hud_body.style.height = status_box_height + "px";
                    hud_body.style.minHeight = status_box_height + "px";
                    hud_body.style.maxHeight = status_box_height + "px";
                    hud = document.getElementById('hud');
                    hud_header = document.getElementById('hud-header');
                    hud_body = document.getElementById('hud-body');
                    hud_rect = hud.getBoundingClientRect();
                    hud_body_rect = hud_body.getBoundingClientRect();
                    hud_body_height = hud_body_rect.bottom - hud_body_rect.top;
                    //hud_height = hud_rect.bottom - hud_rect.top;
                    hud_height = status_box_height + hud_header_height;
                }
            }
            catch (err) {
            }
            var new_height = wheight - hud_body_rect.top;
            var max_height = hud_rect.bottom - hud_rect.top;
            if (new_height < max_height) {
                //hud_body.style.height = (hud_height - hud_header_height) + "px";
                //hud_body.style.minHeight = (hud_height - hud_header_height) + "px";
                //hud_body.style.maxHeight = (hud_height - hud_header_height) + "px";
                hud_body.style.height = hud_height + "px";
                hud_body.style.minHeight = hud_height + "px";
                hud_body.style.maxHeight = hud_height + "px";
            }
            else {
                hud_body.style.height = hud_height + "px";
                hud_body.style.minHeight = hud_height + "px";
                hud_body.style.maxHeight = hud_height + "px";
            }
            //
            // if hud_body and hud header are bigger than hud, shrink hud
            //
            var hudbh = parseInt(this.calculateElementHeight(document.getElementById("hud-body")));
            var hudhh = parseInt(this.calculateElementHeight(document.getElementById("hud-header")));
            var hudh = parseInt(this.calculateElementHeight(document.getElementById("hud")));
            if ((hudbh + hudhh) > hudh) {
                var adj_hudbh = hudh - hudhh;
                hud_body.style.height = adj_hudbh + "px";
                hud_body.style.minHeight = adj_hudbh + "px";
                hud_body.style.maxHeight = adj_hudbh + "px";
            }
        }
        catch (err) {
        }
    };
    GameHud.prototype.resizeHudWidth = function () {
        var _this = this;
        var hud = document.getElementById('hud');
        var status_cardbox = document.querySelector('.status-cardbox');
        var cards = document.querySelectorAll(".cardbox-hud");
        if (!cards) {
            return;
        }
        if (!cards[0]) {
            return;
        }
        //
        // check that cards are visible
        //
        // card-box should ideally take only 80% of the screen at max.
        //
        var wwidth = window.innerWidth;
        wwidth *= 0.8;
        var ideal_width = wwidth / cards.length;
        if (ideal_width > 220) {
            ideal_width = 220;
            // cardbox popups means we can go smaller
            if (this.use_cardbox == 1) {
                ideal_width = 150;
            }
        }
        Array.from(document.querySelectorAll(".status-cardbox .card")).forEach(function (card) {
            card.style.width = ideal_width + "px";
            card.style.height = _this.game_mod.returnCardHeight(ideal_width) + "px";
        });
        var card_width = Math.floor(cards[0].getBoundingClientRect().width * 1.1);
        if (status_cardbox) {
            var cards_visible = status_cardbox.childElementCount;
            var new_width = card_width * cards_visible;
            // status has 5 pixel padding
            if (new_width < 510) {
                new_width = 510;
            }
            hud.style.width = new_width + "px";
            //hud.style.minWidth = new_width + "px";
            //hud.style.maxWidth = new_width + "px";
        }
    };
    // copy of gamehud function
    GameHud.prototype.calculateElementHeight = function (elm) {
        if (document.all) { // IE
            elmHeight = elm.currentStyle.height;
            elmMargin = parseInt(elm.currentStyle.marginTop, 10) + parseInt(elm.currentStyle.marginBottom, 10);
        }
        else { // Mozilla
            elmHeight = document.defaultView.getComputedStyle(elm, '').getPropertyValue('height');
            elmMargin = parseInt(document.defaultView.getComputedStyle(elm, '').getPropertyValue('margin-top')) + parseInt(document.defaultView.getComputedStyle(elm, '').getPropertyValue('margin-bottom'));
        }
        return (parseInt(elmHeight) + parseInt(elmMargin) + "px");
    };
    return GameHud;
}());
module.exports = GameHud;
//# sourceMappingURL=game-hud.js.map