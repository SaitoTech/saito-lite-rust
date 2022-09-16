const AdvancedOverlayTemplate = require('./game-create-advance-options.template');

/*
* For some reason we need a slightly different version of lib/saito/ui/gameOverlay or lib/saito/ui/saitoOverlay
* changing selectors to #advanced so it doesn't block gameoverlay (since it gets embedded in an element that gets hidden)
*/
class AdvancedOverlay {

    constructor(app) {
      this.app = app;
    }

    render(app, mod, html = "") {
      if (document.querySelector("#advanced-overlay-backdrop") != null) { 
        document.querySelector("#game-wizard-advanced-options-overlay").innerHTML = "";
      }

      if (document.getElementsByClassName('game-wizard-advanced-options-overlay').length > 1) {
        document.getElementsByClassName('game-wizard-advanced-options-overlay')[0].remove();
      }

      app.browser.addElementToId(AdvancedOverlayTemplate(), "game-wizard-advanced-options-overlay");

      //
      // advanced options loaded, even if never shown (because the arcade reads the options from the DOM to create the game invite)
      //
      let overlay_el = document.querySelector("#advanced-overlay");
      overlay_el.style.display = "none";
      overlay_el.innerHTML = sanitize(html);
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
      overlay_backdrop_el.style.opacity = 0.95;
      overlay_backdrop_el.style.backgroundColor = "#111";

      //This should be a blocking overlay by default
      //it is way too easy to accidentally click the background and close the options
      
      //overlay_backdrop_el.onclick = (e) => {
      //  overlay_self.hide(mycallback);
      //}

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

