const LeagueWizardTemplate = require('./league-wizard.template');
const LeagueAdvancedOptions = require('./league-advanced-options.template');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');


class LeagueWizard {

  constructor(app, mod, game_mod) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod) {

    //Create the game wizard overlay
    this.overlay.show(app, mod, LeagueWizardTemplate(app, mod, this.game_mod));

    //Create (hidden) the advanced options window
    this.meta_overlay = new SaitoOverlay(app, false, false);
    this.meta_overlay.show(app, mod, LeagueAdvancedOptions());
    this.meta_overlay.hide();      

    //
    // move advanced options into game details form for easy selection of game options
    //
    let overlay1 = document.querySelector(`#saito-overlay${this.meta_overlay.ordinal}`);
    let overlay_backdrop_el = document.querySelector(`#saito-overlay-backdrop${this.meta_overlay.ordinal}`);
    let overlaybox = document.querySelector("#league-options-overlay-container");
    overlaybox.appendChild(overlay1);
    overlaybox.appendChild(overlay_backdrop_el);

    overlay_backdrop_el.style.opacity = 0.95;
    overlay_backdrop_el.style.backgroundColor = "#111";

    this.attachEvents(app, mod);
  }

  attachEvents(app, mod){
    if (document.querySelector(".saito-multi-select_btn")){
      document.querySelector(".saito-multi-select_btn").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("showAll");
      });  
    }

    const clearPlaceHolder = (e) =>{
      let value = e.target.innerHTML;
      if (value == e.target.getAttribute("data-placeholder")){
        e.target.innerHTML = "";
      }
    };


    let desc = document.getElementById("league-desc");
    if (desc) {
      desc.addEventListener("focus", function (e) {
        let value = e.target.innerHTML;
        if (value == e.target.getAttribute("data-placeholder")) {
          e.target.innerHTML = "";
        }
      });
    }
    let title = document.getElementById("league-name");
    if (title) {
      title.addEventListener("focus", clearPlaceHolder);
    }

    
    //
    // Display Advanced Options Overlay
    //
    const advancedOptionsToggle = document.getElementById("league-advance-opt");
    if (advancedOptionsToggle){
      advancedOptionsToggle.onclick = (e) => {

        //Requery advancedOptions on the click so it can dynamically update based on # of players
        let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary small">Accept</div>`;
        let advancedOptionsHTML = LeagueAdvancedOptions();
        if (!advancedOptionsHTML.includes(accept_button)){
          advancedOptionsHTML += accept_button;
        }
        this.meta_overlay.show(app, this.game_mod, advancedOptionsHTML);
        this.attachAdvancedOptionsEventListeners();
        this.meta_overlay.blockClose();

        if (document.getElementById("game-wizard-advanced-return-btn")) {
          document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
            this.meta_overlay.hide();
          };
        }
      }
    }
      

    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        
        //let options = this.getOptions();
        let isPrivateGame = e.currentTarget.getAttribute("data-type");

        

        //Destroy both overlays
        this.overlay.remove();

        return false;
      });
    });
  

  }

}

module.exports = LeagueWizard;

