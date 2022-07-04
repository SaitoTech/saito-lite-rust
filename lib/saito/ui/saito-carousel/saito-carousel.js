const SaitoCarouselTemplate = require('./templates/saito-carousel.template');
const SaitoGameCarouselLeafTemplate = require('./templates/saito-sarousel-leaf.template');

//TODO: Break out general carousel css(e.g. animations) from specific stuff in /arcade/carousel.css
class SaitoCarousel {

    constructor(app) {
      this.app = app;
      this.numLeaves = 0;
    }

    // Carousel will be inserted into the dom as the first child of elem with 
    // id = id. Modules that wish to be included in the carousel should
    // respondTo "${type}-carousel" with an object like 
    // "{title: ..., background: ...}". css should be placed at /${type}/carousel.css
    render(app, mod, type = "arcade", id) {
      if (!document.getElementById("saito-carousel")) {
        app.browser.prependElementToDom(SaitoCarouselTemplate(), document.getElementById(id));
      }
      this.numLeaves = 0;
      this.addLeaves(app, type);
      
    }

    attachEvents(app, mod) {
      try{
        document.querySelector("#saito-carousel").onclick = () => {
          app.browser.logMatomoEvent("UXError", "ArcadeUXError", "CarouselClickAttempt");
        }

        //Change css to reflect the number of games we cycle through
        $(".carousel-wrapper > div.leaf").css("animation",`rightToLeft ${10*(this.numLeaves-1)}s linear infinite 0s`);
        for (let i = 1; i < this.numLeaves; i++){
          $(`.carousel-wrapper div.leaf:nth-child(${i+1})`).css("animation-delay", `${10*i}s`);
        }

      }catch(err){}
    }

    addLeaves(app, type = "arcade") {
      carouselElem = document.querySelector(".carousel-wrapper");
      let carouselHTML = "";
      
      app.modules.respondTo(type + "-carousel").forEach((mod, i) => {
        let response = mod.respondTo(type + "-carousel")
        if(response) {
           this.numLeaves++;
           carouselHTML += SaitoGameCarouselLeafTemplate(mod, response);
        }
      });
      carouselElem.innerHTML = sanitize(carouselHTML);

    }

}

module.exports = SaitoCarousel

