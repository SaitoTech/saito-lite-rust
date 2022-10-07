const ArcadeGameDetailsTemplate = require("./arcade-game-details.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class ArcadeGameDetails {
  
  constructor(app){
    this.app = app;
    this.overlay = new SaitoOverlay(app);
    this.meta_overlay = new SaitoOverlay(app, false, false);
  }

  /**
   *
   */
  render(app, mod, invite) {
    this.gamemod = app.modules.returnModule(invite.msg.game);
    
    let image = this.gamemod.respondTo("arcade-games")?.img || `/${slug}/img/arcade/arcade.jpg`;

    //Create the gamedetails window
    this.overlay.show(app, mod, ArcadeGameDetailsTemplate(app, this.gamemod, invite));
    this.overlay.setBackground(image);

    //Test for advanced options
    let advancedOptions = this.gamemod.returnGameOptionsHTML();
    if (!advancedOptions) {
      document.querySelector(".game-wizard-options-toggle").style.display = "none";
    } else {
      //Create (hidden) the advanced options window
      this.meta_overlay.show(app, this.gamemod, advancedOptions);
      this.meta_overlay.hide();
  
      //
      // move advanced options into game details form
      let overlay1 = document.querySelector(`#saito-overlay${this.meta_overlay.ordinal}`);
      let overlay_backdrop_el = document.querySelector(`#saito-overlay-backdrop${this.meta_overlay.ordinal}`);
      let overlaybox = document.querySelector(".game-wizard-advanced-options-overlay");
      overlaybox.appendChild(overlay1);
      overlaybox.appendChild(overlay_backdrop_el);
 
      overlay_backdrop_el.style.opacity = 0.95;
      overlay_backdrop_el.style.backgroundColor = "#111";

    }
    this.attachEvents(app, mod);
  }

  /**
   * Define function to create a game invite from clicking on create new game button
   * @param mod - reference to Arcade.js
   */
  attachEvents(app, mod) {

    //Attach events to advance options button
      document.querySelector(".game-wizard-options-toggle").onclick = (e) => {
        //Requery advancedOptions on the click so it can dynamically update based on # of players
        let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>`;

        let advancedOptionsHTML = this.gamemod.returnGameOptionsHTML();
        if (!advancedOptionsHTML.includes(accept_button)){
          advancedOptionsHTML += accept_button;
        }
        this.meta_overlay.show(app, this.gamemod, advancedOptionsHTML);
        this.meta_overlay.blockClose();

        this.gamemod.attachAdvancedOptionsEventListeners();
        document.querySelector(".game-wizard-advanced-options-overlay").style.display = "block";
        try {
          if (document.getElementById("game-wizard-advanced-return-btn")) {
            document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
              this.meta_overlay.hide();
            };
          }
        } catch (err) { }
      };



    //go to game home page
    document.querySelector(".game-home-link").addEventListener("click", (e) => {
      let options = this.readOptions();
      app.browser.logMatomoEvent("Navigation", "GameDetailtoPage", this.gamemod.returnSlug());
      window.location = "/arcade/?game=" + this.gamemod.returnSlug();
    });


    if (document.querySelector(".dynamic_button")){
      document.querySelector(".dynamic_button").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("showAll");
      });  
    }

    //Query game instructions
    document.getElementById("game-rules-btn").addEventListener("click", (e)=>{
       let options = this.readOptions();
       let rules_overlay = new SaitoOverlay(app);
       rules_overlay.show(app, mod, this.gamemod.returnGameRulesHTML());
    });

    //
    // create game
    //
    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();
    
        try {
          let options = this.readOptions();
          let isPrivateGame = e.currentTarget.getAttribute("data-type");

          let c = await mod.verifyOptions(isPrivateGame, options);
          if (!c){
            this.overlay.remove();
            return;
          }

          if (isPrivateGame == "private") {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateClosedInvite", options.game);
          } else if (isPrivateGame == "single") {
            app.browser.logMatomoEvent("Arcade", "ArcadeLaunchSinglePlayerGame", options.game);
          } else {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateOpenInvite", options.game);
          }

          mod.makeGameInvite(options, isPrivateGame);

        } catch (err) {
          alert("error: " + err);
        }

        this.overlay.remove();

        return false; //For form stuff (?)
      });
    });
  }

/**
 * Reads the hidden overlay form for its game options
 */
  readOptions(){
    let options = {};
    document.querySelectorAll("form input, form select").forEach((element) => {
      if (element.type == "checkbox") {
        if (element.checked) {
          options[element.name] = 1;
        }
      } else if (element.type == "radio") {
        if (element.checked) {
          options[element.name] = element.value;
        }
      } else {
        options[element.name] = element.value;
      }
    });

    let fixed_players = document.querySelector(".game-wizard-players-no-select");
    if (fixed_players){
      options["game-wizard-players-select"] = fixed_players.dataset.player;
    }

    return options;
  }



}

module.exports = ArcadeGameDetails;