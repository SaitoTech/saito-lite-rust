const GameWizardTemplate = require('./game-wizard.template.js');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

/*
  Red Square re-do of "arcade-game-details", an interface to select game options and create a game invite
*/

class GameWizard {

  constructor(app, mod, game_mod = null, invite_obj = {}) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app);
    this.obj = invite_obj;

    app.connection.on("arcade-launch-game-wizard", (invite_obj) => {

      if (invite_obj.game) {

        let game_mod = this.app.modules.returnModule(invite_obj.game);

        if (game_mod) {

          this.game_mod = game_mod;
          this.obj = invite_obj;
          this.render(this.app, this.mod);
        } else {
          salert("Module not found: " + game_mod);
        }

      }
    });
  }

  render() {

    let app = this.app;
    let mod = this.mod;

    //Create the game wizard overlay
    this.overlay.show(app, mod, GameWizardTemplate(app, mod, this.game_mod, this.obj));
    let backdrop_image = this.game_mod.respondTo("arcade-games")?.img || `/${slug}/img/arcade/arcade.jpg`;
    this.overlay.setBackground(backdrop_image);

    //Test if we should include Advanced Options
    let advancedOptions = this.game_mod.returnGameOptionsHTML();
    if (!advancedOptions) {
      if (document.getElementById("arcade-advance-opt")) {
        document.getElementById("arcade-advance-opt").style.display = "none";
      }
    } else {

      //Create (hidden) the advanced options window
      this.meta_overlay = new SaitoOverlay(app, false, false);
      this.meta_overlay.show(app, mod, advancedOptions);
      this.meta_overlay.hide();

      //
      // move advanced options into game details form for easy selection of game options
      //
      let overlay1 = document.querySelector(`#saito-overlay${this.meta_overlay.ordinal}`);
      let overlay_backdrop_el = document.querySelector(`#saito-overlay-backdrop${this.meta_overlay.ordinal}`);
      let overlaybox = document.querySelector("#advanced-options-overlay-container");
      overlaybox.appendChild(overlay1);
      overlaybox.appendChild(overlay_backdrop_el);

      overlay_backdrop_el.style.opacity = 0.95;
      overlay_backdrop_el.style.backgroundColor = "#111";

    }

    this.attachEvents();

  }

  //
  // Note: mod = Arcade
  //
  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    if (document.querySelector(".saito-multi-select_btn")) {
      document.querySelector(".saito-multi-select_btn").addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("showAll");
      });
    }


    //
    // Display Advanced Options Overlay
    //
    const advancedOptionsToggle = document.getElementById("arcade-advance-opt");
    if (advancedOptionsToggle) {
      advancedOptionsToggle.onclick = (e) => {

        //Requery advancedOptions on the click so it can dynamically update based on # of players
        let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary small">Accept</div>`;
        let advancedOptionsHTML = this.game_mod.returnGameOptionsHTML();
        if (!advancedOptionsHTML.includes(accept_button)) {
          advancedOptionsHTML += accept_button;
        }
        this.meta_overlay.show(app, this.game_mod, advancedOptionsHTML);
        this.game_mod.attachAdvancedOptionsEventListeners();
        this.meta_overlay.blockClose();

        if (document.getElementById("game-wizard-advanced-return-btn")) {
          document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
            this.meta_overlay.hide();
          };
        }
      }
    }

    //
    // Display Rules Overlay
    //
    if (document.getElementById('game-rules-btn')) {
      document.getElementById('game-rules-btn').onclick = function () {
        let rules_overlay = new SaitoOverlay(app);
        rules_overlay.show(app, mod, this.game_mod.returnGameRulesHTML());
      }
    }

    //
    // create game
    //
    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          let options = this.getOptions();
          let isPrivateGame = e.currentTarget.getAttribute("data-type");

          let c = await mod.verifyOptions(isPrivateGame, options);
          if (!c) {
            this.overlay.remove();
            return;
          }

          if (isPrivateGame == "private") {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateClosedInvite", options.game);
          } else if (isPrivateGame == "single") {
            app.browser.logMatomoEvent("Arcade", "ArcadeLaunchSinglePlayerGame", options.game);
          } else if (isPrivateGame == "direct") {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateDirectInvite", options.game);
          } else {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateOpenInvite", options.game);
          }

          console.log("CAN WE MAKE GAME INVITE 1");
          mod.makeGameInvite(options, isPrivateGame);
          console.log("CAN WE MAKE GAME INVITE 2");

        } catch (err) {
          console.warn(err);
        }

        //Destroy both overlays
        this.overlay.remove();

        return false;
      });
    });

  }


  getOptions() {
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

    return options;
  }
}

module.exports = GameWizard;

