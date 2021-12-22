var GameOverlayTemplate = require('./game-overlay.template');
var GameOverlay = /** @class */ (function () {
    function GameOverlay(app) {
        this.app = app;
    }
    GameOverlay.prototype.render = function (app, mod) {
        if (!document.querySelector(".game-overlay-backdrop")) {
            app.browser.addElementToDom(GameOverlayTemplate());
        }
    };
    GameOverlay.prototype.attachEvents = function (app, game_mod) {
    };
    GameOverlay.prototype.showOverlay = function (app, game_mod, html, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        this.render(app, game_mod);
        var overlay_self = this;
        var overlay_el = document.querySelector(".game-overlay");
        var overlay_backdrop_el = document.querySelector(".game-overlay-backdrop");
        overlay_el.innerHTML = html;
        overlay_el.style.display = "block";
        overlay_backdrop_el.style.display = "block";
        overlay_backdrop_el.onclick = function (e) {
            overlay_self.hideOverlay(mycallback);
        };
    };
    GameOverlay.prototype.blockClose = function () {
        var overlay_backdrop_el = document.querySelector(".game-overlay-backdrop");
        overlay_backdrop_el.onclick = function (e) { };
    };
    GameOverlay.prototype.hideOverlay = function (mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        var overlay_el = document.querySelector(".game-overlay");
        var overlay_backdrop_el = document.querySelector(".game-overlay-backdrop");
        if (overlay_el) {
            overlay_el.style.display = "none";
        }
        if (overlay_backdrop_el) {
            overlay_backdrop_el.style.display = "none";
        }
        if (mycallback != null) {
            mycallback();
        }
    };
    GameOverlay.prototype.showCardSelectionOverlay = function (app, game_mod, cards, options, mycallback) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (mycallback === void 0) { mycallback = null; }
        var html = '';
        var wrapper_style = "";
        if (options.backgroundImage) {
            wrapper_style += "background-image: url(".concat(options.backgroundImage, "); background-size: cover;");
        }
        if (options.padding) {
            wrapper_style += "padding:".concat(options.padding, ";");
        }
        if (options.textAlign) {
            wrapper_style += "text-align:".concat(options.textAlign, ";");
        }
        html += "<div style=\"".concat(wrapper_style, "\">");
        var has_continue_button = 1;
        var has_close_button = 1;
        var has_button = 0;
        var has_card_select = 1;
        var has_open = 1;
        var cardlist_row_gap = "1em";
        var cardlist_column_gap = "1em";
        var cardlist_container_height = "80vh";
        var cardlist_container_width = "80vw";
        var unselectable_cards = [];
        if (!options.onContinue) {
            options.onContinue = function () { };
            has_continue_button = 0;
        }
        if (!options.onClose) {
            options.onClose = function () { };
            has_close_button = 0;
        }
        if (!options.onCardSelect) {
            options.onCardSelect = function () { };
            has_card_select = 0;
        }
        if (!options.onOpen) {
            options.onOpen = function () { };
            has_open = 0;
        }
        if (has_continue_button || has_close_button) {
            has_button = 1;
        }
        if (options.rowGap) {
            cardlist_row_gap = options.rowGap;
        }
        if (options.columnGap) {
            cardlist_column_gap = options.columnGap;
        }
        if (options.title) {
            html += "<div class=\"game-overlay-cardlist-title\">".concat(options.title, "</div>");
        }
        if (options.subtitle) {
            html += "<div class=\"game-overlay-cardlist-subtitle\">".concat(options.subtitle, "</div>");
        }
        if (options.cardlistHeight) {
            cardlist_container_height = options.cardlistHeight;
        }
        if (options.cardlistWidth) {
            cardlist_container_width = options.cardlistWidth;
        }
        if (options.unselectableCards) {
            unselectable_cards = options.unselectableCards;
        }
        html += '<div class="game-overlay-cardlist-container">';
        for (var i in cards) {
            var is_card_selectable = 1;
            var thishtml = '<div class="game-overlay-cardlist-card">';
            if (cards[i] != undefined) {
                var x = 0;
                if (typeof cards[i] === 'object' && !Array.isArray(cards[i]) && cards[i] != null) {
                    if (cards[i].returnCardImage != 'undefined' && cards[i].returnCardImage != null) {
                        thishtml += cards[i].returnCardImage();
                        x = 1;
                    }
                }
                if (x == 0) {
                    if (Array.isArray(cards)) {
                        thishtml += game_mod.returnCardImage(cards[i]);
                    }
                    else {
                        thishtml += game_mod.returnCardImage(i);
                    }
                }
            }
            else {
                thishtml += game_mod.returnCardImage(i);
            }
            thishtml += '</div>';
            //
            // is this unselectable?
            //
            for (var p = 0; p < unselectable_cards.length; p++) {
                if (JSON.stringify(unselectable_cards[p]) === JSON.stringify(cards[i])) {
                    is_card_selectable = 0;
                    thishtml = thishtml.replace(/game-overlay-cardlist-card/g, 'game-overlay-cardlist-card game-overlay-cardlist-unselectable');
                }
            }
            html += thishtml;
        }
        html += '</div>';
        if (has_button) {
            html += '<div class="game-overlay-button-container">';
            if (has_continue_button) {
                html += "<div class=\"game-overlay-button-continue button game-overlay-cardlist-button\">continue</div>";
            }
            if (has_close_button) {
                html += "<div class=\"game-overlay-button-close button super game-overlay-cardlist-button\">close</div>";
            }
            html += '</div>';
        }
        // wrapper div
        html += '</div>';
        this.showOverlay(app, game_mod, html, function () {
            options.onClose();
        });
        //
        // allow post-overlay show events in obj if wanted
        //
        options.onOpen();
        //
        // set min height of cardlist card elements
        //
        document.querySelectorAll('.game-overlay-cardlist-card').forEach(function (el) {
            if (el.children) {
                el.style.height = _this.calculateElementHeight(el.children[0]);
            }
        });
        //
        // set width/height
        //
        document.querySelector(".game-overlay-cardlist-container").style.width = cardlist_container_width;
        document.querySelector(".game-overlay-cardlist-container").style.height = "auto";
        document.querySelector(".game-overlay-cardlist-container").style.maxWidth = cardlist_container_width;
        document.querySelector(".game-overlay-cardlist-container").style.maxHeight = cardlist_container_height;
        //
        // right-align left card if only 2
        //
        if (cards.length == 2) {
            var el = document.querySelector(".game-overlay-cardlist-container");
            if (el) {
                el.style.justifyItems = "unset";
                var el2 = el.children[0];
                if (el2) {
                    var el3 = el2.children[0];
                    if (el3) {
                        el3.style.float = "right";
                    }
                }
            }
        }
        else {
            var el = document.querySelector(".game-overlay-cardlist-container");
            if (el) {
                el.style.justifyItems = "center";
            }
        }
        //
        // center single card
        //
        if (cards.length == 1) {
            var el = document.querySelector(".game-overlay-cardlist-card");
            el.style.marginRight = "auto";
            el.style.marginLeft = "auto";
        }
        //
        // buttons
        //
        if (has_continue_button) {
            document.querySelector(".game-overlay-button-continue").onclick = function (e) {
                options.onContinue();
            };
        }
        if (has_close_button) {
            document.querySelector(".game-overlay-button-close").onclick = function (e) {
                options.onClose();
            };
        }
        //
        // if cards are selectable
        //
        if (has_card_select) {
            document.querySelectorAll('.game-overlay-cardlist-card').forEach(function (el) {
                el.onclick = function (e) {
                    var cardname = el.getAttribute("id");
                    if (cardname == null) {
                        if (el.children) {
                            cardname = el.children[0].getAttribute("id");
                        }
                    }
                    options.onCardSelect(cardname);
                };
            });
            document.querySelectorAll('.game-overlay-cardlist-unselectable').forEach(function (el) {
                el.onclick = function (e) { };
            });
        }
        // update number shown
        if (options.columns > 0) {
            var x = "1fr ";
            for (var y = 1; y < options.columns; y++) {
                x += "1fr ";
            }
            document.querySelector(".game-overlay-cardlist-container").style.gridTemplateColumns = x;
        }
        else {
            document.querySelector(".game-overlay-cardlist-container").style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        }
    };
    // copy of gamehud function
    GameOverlay.prototype.calculateElementHeight = function (elm) {
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
    return GameOverlay;
}());
module.exports = GameOverlay;
//# sourceMappingURL=game-overlay.js.map