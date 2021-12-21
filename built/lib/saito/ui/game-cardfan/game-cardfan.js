var GameCardfanTemplate = require('./game-cardfan.template');
var dragElement = require('../../../helpers/drag_element');
var GameCardfan = /** @class */ (function () {
    function GameCardfan(app, dimensions) {
        this.app = app;
        this.dimensions = dimensions;
    }
    GameCardfan.prototype.render = function (app, data, cards_html) {
        if (cards_html === void 0) { cards_html = ""; }
        try {
            if (!document.getElementById('cardfan')) {
                document.body.append(app.browser.htmlToElement(GameCardfanTemplate()));
            }
            if (cards_html == "") {
                var _a = data.game.deck[0], cards_1 = _a.cards, hand = _a.hand;
                var cards_in_hand = hand.map(function (key) { return cards_1[key]; });
                cards_html = cards_in_hand
                    .map(function (card) { return "<img class=\"card\" src=\"".concat(data.card_img_dir, "/").concat(card.name, "\">"); })
                    .join('');
            }
            document.getElementById('cardfan').innerHTML = cards_html;
            document.getElementById('cardfan').style.display = "block";
        }
        catch (err) {
        }
    };
    GameCardfan.prototype.hide = function () {
        try {
            document.getElementById('cardfan').style.display = "none";
        }
        catch (err) {
        }
    };
    GameCardfan.prototype.addClass = function (classname) {
        try {
            document.getElementById('cardfan').classList.add(classname);
        }
        catch (err) { }
    };
    GameCardfan.prototype.prependCard = function (app, data, cards_html) {
        if (cards_html === void 0) { cards_html = ""; }
        document.getElementById('cardfan').innerHTML = cards_html + document.getElementById('cardfan').innerHTML;
    };
    GameCardfan.prototype.addCard = function (app, data, cards_html) {
        if (cards_html === void 0) { cards_html = ""; }
        document.getElementById('cardfan').innerHTML += cards_html;
    };
    GameCardfan.prototype.attachEvents = function (app, data) {
        try {
            var cardfan = document.getElementById('cardfan');
            dragElement(cardfan);
            //        cardfan.addEventListener('mousedown', () => cardfan.style.width = '100vw');
        }
        catch (err) {
        }
    };
    return GameCardfan;
}());
module.exports = GameCardfan;
//# sourceMappingURL=game-cardfan.js.map