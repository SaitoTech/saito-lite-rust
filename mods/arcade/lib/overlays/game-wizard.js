const GameWizardTemplate = require('./game-wizard.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay.js');

class GameWizard {
  constructor(app, mod, game_mod = null, obj = {}) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app);
    this.obj = obj;

    app.connection.on("arcade-launch-game-wizard", (obj) => {

      if (obj.game) {

	//
	// {
	//    game   : module_name
	//    league : league_obj { id , name , mod }
 	// }
	//

        let game_mod = this.app.modules.returnModule(obj.game);

        if (game_mod) {
          this.game_mod = game_mod;
          this.obj = obj;
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
    this.overlay.show(GameWizardTemplate(app, mod, this.game_mod, this.obj));
    let backdrop_image = this.game_mod.respondTo("arcade-games")?.img || `/${this.slug}/img/arcade/arcade.jpg`;
    this.overlay.setBackground(backdrop_image);

    //Test if we should include Advanced Options
    let advancedOptions = this.game_mod.returnGameOptionsHTML();
    if (!advancedOptions) {
      if (document.getElementById("arcade-advance-opt")) {
        document.getElementById("arcade-advance-opt").style.display = "none";
      }
    } else {

      advancedOptions = `<div id="advanced-options-overlay-container">${advancedOptions}</div>`;
      this.meta_overlay = new SaitoOverlay(app, mod, false, false);
      this.meta_overlay.show(advancedOptions);
      this.meta_overlay.hide();

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
        advancedOptionsHTML = ` <div id="advanced-options-overlay-container">${advancedOptionsHTML}</div>`;

        this.meta_overlay.show(advancedOptionsHTML);
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
        rules_overlay.show(this.game_mod.returnGameRulesHTML());
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

          mod.makeGameInvite(options, isPrivateGame, this.obj);

        } catch (err) {
          console.warn(err);
        }

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

