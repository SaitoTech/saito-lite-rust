const LeagueWizardTemplate = require('./league-wizard.template');
const LeagueAdvancedOptions = require('./league-advanced-options.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');


class LeagueWizard {

  constructor(app, mod, game_mod) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app);
    this.super_overlay = new SaitoOverlay(app, false, false);

    this.app.connection.on("league-launch-wizard", (game_mod = {}) => {

      if (!game_mod) {
        console.log("No game module to launch league wizard");
        return;
      }
      this.game_mod = game_mod;

      this.render();
    });

  }

  render() {

    //Create the game wizard overlay
    this.overlay.show(LeagueWizardTemplate(this.app, this.mod, this.game_mod), () => {
      this.super_overlay.remove();
    });

    //Create (hidden) the advanced options window
    this.meta_overlay = new SaitoOverlay(this.app, false, false);
    this.meta_overlay.show(LeagueAdvancedOptions());
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

    this.attachEvents();
  }

  attachEvents() {
    if (document.querySelector(".saito-multi-select_btn")) {
      document.querySelector(".saito-multi-select_btn").addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("showAll");
      });
    }

    const clearPlaceHolder = (e) => {
      let value = e.target.innerHTML;
      if (value == e.target.getAttribute("data-placeholder")) {
        e.target.innerHTML = "";
      }
    };
    const restorePlaceHolder = (e) => {
      if (e.target.innerHTML == "") {
        e.target.innerHTML = e.target.getAttribute("data-placeholder");
      }
    }

    let desc = document.getElementById("league-desc");
    if (desc) {
      desc.addEventListener("focus", clearPlaceHolder);
      desc.addEventListener("blur", restorePlaceHolder);
    }
    let title = document.getElementById("league-name");
    if (title) {
      title.addEventListener("focus", clearPlaceHolder);
      title.addEventListener("blur", restorePlaceHolder);
    }


    //
    // Display Advanced Options Overlay
    //
    const advancedOptionsToggle = document.getElementById("league-advance-opt");
    if (advancedOptionsToggle) {
      advancedOptionsToggle.onclick = (e) => {

        //Requery advancedOptions on the click so it can dynamically update based on # of players
        this.meta_overlay.show(LeagueAdvancedOptions());
        this.attachAdvancedOptionsEventListeners();
        this.meta_overlay.blockClose();

        if (document.getElementById("league-wizard-advanced-return-btn")) {
          document.getElementById("league-wizard-advanced-return-btn").onclick = (e) => {
            if (this.validateDate(document.getElementById("startdate"), document.getElementById("enddate"))) {
              this.meta_overlay.hide();
            }
          };
        }
      }
    }


    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();

        if (!this.validateLeague()) {
          return;
        }

        let options = (document.getElementById("fixedoptions").checked) ? JSON.stringify(this.getOptions()) : "";

        let newLeague = {
          game: this.game_mod.name,
          type: e.currentTarget.getAttribute("data-type"),
          admin: this.app.wallet.getPublicKey(),
          name: sanitize(document.getElementById("league-name").innerHTML),
          description: sanitize(document.getElementById("league-desc").innerHTML),
          ranking: document.getElementById("ranking").value,
          starting_score: parseInt(document.getElementById("starting_score").value),
          max_players: parseInt(document.getElementById("max_players").value),
          options: options,
          startdate: document.getElementById("startdate").value,
          enddate: document.getElementById("enddate").value,
          allowlate: (document.getElementById("lateregister").checked) ? '1' : '0',
        };

        this.mod.sendCreateLeagueTransaction(newLeague);

        //Destroy both overlays
        this.overlay.remove();
        this.super_overlay.remove();

        setTimeout(function() {
          location.reload();
        }, 1000);
        return false;
      });
    });


  }


  attachAdvancedOptionsEventListeners() {
    let playerCheck = document.getElementById("limit_players");
    let playerObj = document.getElementById("max_player_option");
    let playerDefault = 25;

    if (playerCheck && playerObj) {
      playerCheck.onchange = (e) => {
        if (playerCheck.checked) {
          playerObj.style.display = "block";
          document.getElementById("max_players").value = playerDefault;
        } else {
          playerObj.style.display = "none";
          playerDefault = document.getElementById("max_players").value;
          document.getElementById("max_players").value = 0;
        }
      }
    }

    let startDiv = document.getElementById("starting_score");
    let startObj = document.getElementById("starting_score_option");
    let rankDiv = document.querySelector("#ranking");
    if (startDiv && rankDiv && startObj) {
      rankDiv.onchange = (e) => {
        if (rankDiv.value == "elo") {
          startDiv.value = 1000;
          startObj.style.display = "block";
        } else {
          startDiv.value = 0;
          startObj.style.display = "none";
        }
      };
    }

    const seasonObj = document.getElementById("season_option");
    const seasonCheck = document.getElementById("limit_season");

    if (seasonObj && seasonCheck) {
      seasonCheck.onchange = (e) => {
        if (seasonCheck.checked) {
          seasonObj.style.display = "block";
        } else {
          seasonObj.style.display = "none";
          document.getElementById("startdate").value = "";
          document.getElementById("enddate").value = "";
          document.getElementById("lateregister").checked = false;
        }
      }
    }

    let exclusiveObj = document.getElementById("exclusive");
    let optionsToggle = document.getElementById("fixedoptions");
    let optionsSelect = document.getElementById("selectoptions");


    if (optionsSelect && optionsToggle && exclusiveObj) {
      exclusiveObj.onchange = (e) => {
        if (exclusiveObj.value == "inclusive") {
          optionsToggle.checked = false;
        }
      }

      optionsSelect.onclick = (e) => {
        try {
          optionsToggle.checked = true;
          exclusiveObj.value = "exclusive";
          let html = "";

          if (!document.getElementById("game-wizard-form")) {
            let advancedOptions = this.game_mod.returnGameOptionsHTML();
            let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>`;
            let moreOptions = this.game_mod.returnPlayerSelectHTML();

            if (advancedOptions.includes(accept_button)) {
              advancedOptions = advancedOptions.replace(accept_button, moreOptions + accept_button);
            } else {
              advancedOptions += moreOptions + accept_button;
            }

            html = `<div class="game_option_league_wizard">
                        <form id="game-wizard-form" class="game-wizard-form">
                        ${advancedOptions}
                        </form>
                        </div>
                        `;
          }

          //Display Game Options
          this.super_overlay.show(html);
          //Attach dynamic listeners
          this.game_mod.attachAdvancedOptionsEventListeners();
          //Hide overlay if clicking button
          if (document.getElementById("game-wizard-advanced-return-btn")) {
            document.getElementById("game-wizard-advanced-return-btn").onclick = (e) => {
              this.super_overlay.hide();
            };
          }
        } catch (err) {
          console.log(err);
        }
      }

      optionsToggle.onclick = (e) => {
        if (optionsToggle.checked) {
          exclusiveObj.value = "exclusive";
        }

        if (!document.getElementById("game-wizard-form")) {
          let advancedOptions = this.game_mod.returnGameOptionsHTML();
          let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>`;
          let moreOptions = this.game_mod.returnPlayerSelectHTML();

          if (advancedOptions.includes(accept_button)) {
            advancedOptions = advancedOptions.replace(accept_button, moreOptions + accept_button);
          } else {
            advancedOptions += moreOptions + accept_button;
          }

          let html = `<div class="game_option_league_wizard">
                      <form id="game-wizard-form" class="game-wizard-form">
                      ${advancedOptions}
                      </form>
                      </div>
                      `;
          this.super_overlay.show(html);
          this.super_overlay.hide();
        }
      };
    }


  }

  getOptions() {
    let options = {};

    document.querySelectorAll("form#game-wizard-form input, form#game-wizard-form select").forEach((element) => {
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

  validateLeague() {
    let title = document.getElementById("league-name");

    if (!title || !title.innerHTML || title.innerHTML == title.getAttribute("data-placeholder")) {
      alert("Your league must have a name");
      return false;
    }

    if (title.innerHTML == this.game_mod.name || title.innerHTML == this.game_mod.gamename) {
      alert("You can't just name your league after the game");
      return false;
    }

    let desc = document.getElementById("league-desc");
    if (!desc || !desc.innerHTML || desc.innerHTML == desc.getAttribute("data-placeholder")) {
      alert("Your league must have a description");
      return false;
    }

    return true;
  }

  validateDate(start, end) {
    let today = new Date().getTime();

    if (start) {
      let startTime = Date.parse(start);

      if (startTime < today) {
        alert("Invalid Start Date! Must be after today, otherwise leave blank for League to take immediate effect.");
        return false;
      }

      if (end) {
        let endTime = Date.parse(end);
        if (endTime < startTime) {
          alert("Invalid Date Range!");
          return false;
        }
      }

    }

    if (end) {
      let endTime = Date.parse(end);
      if (endTime < today) {
        alert("Invalid End Date!");
        return false;
      }
    }

    return true;
  }

}

module.exports = LeagueWizard;

