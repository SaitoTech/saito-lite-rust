const AdvancedOverlayTemplate = require('./advanced-overlay.template');

/*
* For some reason we need a slightly different version of lib/saito/ui/gameOverlay or lib/saito/ui/saitoOverlay
* changing selectors to #advanced so it doesn't block gameoverlay (since it gets embedded in an element that gets hidden)
*/
class AdvancedOverlay {

    constructor(app) {
      this.app = app;
    }

    render(app, mod) {
      if (!document.querySelector("#advanced-overlay-backdrop")) { app.browser.addElementToDom(AdvancedOverlayTemplate(), "game-wizard-advanced-options-overlay"); }

      //
      // advanced options loaded, even if never shown
      //
      let overlay_el = document.querySelector("#advanced-overlay");
      overlay_el.style.display = "none";
      overlay_el.innerHTML = mod.returnGameOptionsHTML();     

    }

    attachEvents(app, game_mod) {
    }

    show(app, game_mod, html, mycallback=null) {
      this.render(app, game_mod);

      let overlay_self = this;

      let overlay_el = document.querySelector("#advanced-overlay");
      let overlay_backdrop_el = document.querySelector("#advanced-overlay-backdrop");
      overlay_el.innerHTML = html;
      overlay_el.style.display = "block";
      overlay_backdrop_el.style.display = "block";
      overlay_backdrop_el.style.opacity = 1;
      overlay_backdrop_el.style.backgroundColor = "#111";

      overlay_backdrop_el.onclick = (e) => {
        overlay_self.hide(mycallback);
      }

    }

    hide(mycallback=null) {

      let overlay_el = document.querySelector("#advanced-overlay");
      let overlay_backdrop_el = document.querySelector("#advanced-overlay-backdrop");
      overlay_el.style.display = "none";
      overlay_backdrop_el.style.display = "none";

      if (mycallback != null) { 
        try{
          mycallback();
        }catch(err){
          console.error(err);
        }
      }

    }
}

module.exports = AdvancedOverlay

