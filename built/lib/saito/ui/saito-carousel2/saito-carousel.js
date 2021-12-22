var SaitoCarouselTemplate = require('./templates/saito-carousel.template.js');
module.exports = SaitoCarousel = {
    render: function (app, mod) {
        if (!document.getElementById("saito-carousel")) {
            app.browser.addElementToDom(SaitoCarouselTemplate(), id);
        }
    },
    attachEvents: function (app, data) {
    },
    addLeaf: function (el) {
        if (!document.getElementById("saito-carousel")) {
            app.browser.addElementToDom(SaitoCarouselTemplate());
        }
        document.getElementById("saito-carousel").appendChild(el);
    }
};
//# sourceMappingURL=saito-carousel.js.map