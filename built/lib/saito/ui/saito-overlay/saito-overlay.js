var SaitoOverlayTemplate = require('./saito-overlay.template');
var SaitoOverlay = /** @class */ (function () {
    function SaitoOverlay(app) {
        this.app = app;
        this.closebox = true;
    }
    SaitoOverlay.prototype.render = function (app, mod) {
        if (!document.querySelector(".saito-overlay-backdrop")) {
            app.browser.addElementToDom(SaitoOverlayTemplate(this.closebox));
        }
    };
    SaitoOverlay.prototype.attachEvents = function (app, saito_mod) {
    };
    SaitoOverlay.prototype.showOverlay = function (app, saito_mod, html, mycallback) {
        var _this = this;
        if (mycallback === void 0) { mycallback = null; }
        this.render(app, saito_mod);
        var overlay_self = this;
        var overlay_el = document.querySelector(".saito-overlay");
        var overlay_backdrop_el = document.querySelector(".saito-overlay-backdrop");
        var closebox_el = document.querySelector(".saito-overlay-closebox");
        if (closebox_el) {
            overlay_el.innerHTML = closebox_el.outerHTML + html;
        }
        else {
            overlay_el.innerHTML = html;
        }
        overlay_el.style.display = "block";
        overlay_backdrop_el.style.display = "block";
        overlay_backdrop_el.onclick = function (e) {
            overlay_self.hideOverlay(mycallback);
        };
        closebox_el = document.querySelector(".saito-overlay-closebox");
        if (closebox_el) {
            closebox_el.style.display = "block";
            closebox_el.onclick = function (e) {
                _this.hideOverlay(mycallback);
            };
        }
    };
    SaitoOverlay.prototype.showOverlayBlocking = function (app, game_mod, html, mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        this.showOverlay(app, game_mod, html, mycallback = null);
        var overlay_closebox_el = document.querySelector(".saito-overlay-closebox");
        overlay_closebox_el.style.display = "none";
    };
    SaitoOverlay.prototype.hideOverlay = function (mycallback) {
        if (mycallback === void 0) { mycallback = null; }
        var overlay_el = document.querySelector(".saito-overlay");
        var overlay_backdrop_el = document.querySelector(".saito-overlay-backdrop");
        var closebox_el = document.querySelector(".saito-overlay-closebox");
        overlay_el.style.display = "none";
        overlay_backdrop_el.style.display = "none";
        if (closebox_el) {
            closebox_el.style.display = "none";
        }
        if (mycallback != null) {
            mycallback();
        }
    };
    return SaitoOverlay;
}());
module.exports = SaitoOverlay;
//# sourceMappingURL=saito-overlay.js.map