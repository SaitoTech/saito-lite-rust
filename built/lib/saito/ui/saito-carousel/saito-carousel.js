var SaitoCarouselTemplate = require('./templates/saito-carousel.template');
var SaitoGameCarouselLeafTemplate = require('./templates/saito-sarousel-leaf.template');
//TODO: Break out general carousel css(e.g. animations) from specific stuff in /arcade/carousel.css
var SaitoCarousel = /** @class */ (function () {
    function SaitoCarousel(app) {
        this.app = app;
    }
    // Carousel will be inserted into the dom as the first child of elem with 
    // id = id. Modules that wish to be included in the carousel should
    // respondTo "${type}-carousel" with an object like 
    // "{title: ..., background: ...}". css should be placed at /${type}/carousel.css
    SaitoCarousel.prototype.render = function (app, mod, type, id) {
        if (type === void 0) { type = "arcade"; }
        if (!document.getElementById("saito-carousel")) {
            app.browser.prependElementToDom(SaitoCarouselTemplate(), document.getElementById(id));
        }
        this.addLeaves(app, type);
        document.querySelector("#saito-carousel").onclick = function () {
            app.browser.logMatomoEvent("UXError", "ArcadeUXError", "CarouselClickAttempt");
        };
    };
    SaitoCarousel.prototype.attachEvents = function (app, mod) {
    };
    SaitoCarousel.prototype.addLeaves = function (app, type) {
        if (type === void 0) { type = "arcade"; }
        carouselElem = document.querySelector(".carousel-wrapper");
        carouselElem.innerHTML += "";
        app.modules.respondTo(type + "-carousel").forEach(function (mod, i) {
            var response = mod.respondTo(type + "-carousel");
            if (response) {
                carouselElem.innerHTML += SaitoGameCarouselLeafTemplate(mod, response);
            }
        });
    };
    return SaitoCarousel;
}());
module.exports = SaitoCarousel;
//# sourceMappingURL=saito-carousel.js.map