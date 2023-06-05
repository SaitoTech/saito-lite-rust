const GameWizardTemplate = require('./game-wizard.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay.js');

  //
      // {
      //    game   : module_name
      //    league : league_obj { id , name , mod }
      // }
      //


class GameWizard {

  constructor(app, mod, game_mod = null, obj = {}) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app, mod);
    this.obj = obj;

    app.connection.on("arcade-launch-game-wizard", (obj) => {

      if (obj?.game) {

        let game_mod = this.app.modules.returnModuleByName(obj.game);

        if (game_mod) {
          this.game_mod = game_mod;
          this.obj = obj;
          this.render();
        } else {
          salert("Module not found: " + obj.game);
        }

      }
    });
  }

  render() {
    //
    // Create the game wizard overlay
    //  & set a callback to remove the advanced options overlay if we change our mind about creating a game
    //
    if (this.mod.debug){
      console.log(JSON.parse(JSON.stringify(this.obj)));
    }

    this.overlay.show(GameWizardTemplate(this.game_mod, this.obj), () => { if (this.meta_overlay) { this.meta_overlay.remove();}});
    this.overlay.setBackground(this.game_mod.respondTo("arcade-games").image);

    //Test if we should include Advanced Options
    let advancedOptions = this.game_mod.returnGameOptionsHTML();
    if (!advancedOptions) {
      if (document.getElementById("arcade-advance-opt")) {
        document.getElementById("arcade-advance-opt").style.visibility = "hidden";
      }
    } else {

      advancedOptions = `<div id="advanced-options-overlay-container">${advancedOptions}</div>`;
      this.meta_overlay = new SaitoOverlay(this.app, this.mod, false, false); // Have to manually delete when done
      this.meta_overlay.show(advancedOptions);
      this.meta_overlay.hide();

    }

    this.attachEvents();

  }

  //
  // Note: mod = Arcade
  //
  attachEvents() {

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
        let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary">Accept</div>`;
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
        let rules_overlay = new SaitoOverlay(this.app, this.mod);
        rules_overlay.show(this.game_mod.returnGameRulesHTML());
      }
    }

    //
    // create game
    //
    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();

          let options = this.getOptions();
          let gameType = e.currentTarget.getAttribute("data-type");

          let c = await this.mod.verifyOptions(gameType, options);
          if (!c) {
            this.overlay.remove();
            return;
          }

          this.overlay.remove();

          if (gameType == "private") {
            this.app.browser.logMatomoEvent("GameWizard", "CreatePrivateInvite", options.game);
          } else if (gameType == "single") {
            this.app.browser.logMatomoEvent("GameWizard", "PlaySinglePlayerGame", options.game);
            this.mod.makeGameInvite(options, "private", this.obj);
            return;
          } else if (gameType == "direct") {
            this.app.browser.logMatomoEvent("GameWizard", "CreateDirectInvite", options.game);
          } else {
            this.app.browser.logMatomoEvent("GameWizard", "CreateOpenInvite", options.game);
          }

          this.mod.makeGameInvite(options, gameType, this.obj);

      });
    });
  }

  getOptions() {
    let options = {};
    document.querySelectorAll("#advanced-options-overlay-container input, #advanced-options-overlay-container select, .arcade-wizard-overlay input, .arcade-wizard-overlay select").forEach((element) => {
      if (element.name){
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
      }
    });

    if (this.mod.debug){
      console.log("GAMEWIZARD -- reading options from HTML: ", JSON.stringify(options));
    }

    if (this.meta_overlay){
      this.meta_overlay.remove();  
    }

    return options;
  }
}

module.exports = GameWizard;

