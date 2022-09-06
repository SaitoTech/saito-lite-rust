const GameCreateNewTemplate = require('./game-create-new.template.js');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');
const AdvancedOverlay = require("./game-create-advance-options");

class GameCreateNew {

  constructor(app, mod, game_mod) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod) {
    this.overlay.show(app, mod, GameCreateNewTemplate(app, mod, this.game_mod));
    
    let advancedOptions = this.game_mod.returnGameOptionsHTML();
    if (!advancedOptions) {
      document.querySelector(".arcade-advance-opt").style.display = "none";
    } else {
      //Create (hidden) the advanced options window
      mod.meta_overlay = new AdvancedOverlay(app, this.game_mod);
      mod.meta_overlay.render(app, this.game_mod, advancedOptions);
      mod.meta_overlay.attachEvents(app, this.game_mod);
      

      //
      // move advanced options into game details form
      let advanced1 = document.querySelector(".game-wizard-advanced-box");
      let overlay1 = document.querySelector(".game-overlay");
      let overlay2 = document.querySelector(".game-overlay-backdrop");
      let overlaybox = document.querySelector(".game-wizard-advanced-options-overlay");
      overlaybox.appendChild(overlay1);
      overlaybox.appendChild(overlay2);
      if (advanced1) {
        overlaybox.appendChild(advanced1);
      }
    }

    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {
  
    if (document.querySelector(".saito-multi-select_btn")){
      document.querySelector(".saito-multi-select_btn").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("showAll");
      });  
    }


    //Attach events to advance options button
    document.querySelector(".arcade-advance-opt").onclick = (e) => {
      //Requery advancedOptions on the click so it can dynamically update based on # of players
      let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary small" style="float: right;">Accept</div>`;
      let advancedOptionsHTML = this.game_mod.returnGameOptionsHTML();
      if (!advancedOptionsHTML.includes(accept_button)){
        advancedOptionsHTML += accept_button;
      }
      mod.meta_overlay.show(app, this.game_mod, advancedOptionsHTML);
      this.game_mod.attachAdvancedOptionsEventListeners();
      document.querySelector(".game-wizard-advanced-options-overlay").style.display = "block";
      try {
        if (document.getElementById("game-wizard-advanced-return-btn")) {
          document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
            mod.meta_overlay.hide();
          };
        }
      } catch (err) { }
    };
  
  }

}

module.exports = GameCreateNew;
