const LeagueComponentAdminBoxTemplate = require("./admin-box.template");

const getGameOptions = () => {
  let options = "";
  document.querySelectorAll("form#game-wizard-form input, form#game-wizard-form select").forEach((element) => {
    if (!options){
      options = {};
    }
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
};

const players = (app, mod) => {
  let selection = "";
  if (mod.minPlayers === mod.maxPlayers) {
    selection = `<input type="hidden" class="game-wizard-players-select" name="game-wizard-players-select" value="${mod.minPlayers}">`;
    selection += mod.returnSingularGameOption(app);
  } else {
    selection = `<div><label for="game-wizard-players-select">Number of Players:</label>
                 <select class="game-wizard-players-select" name="game-wizard-players-select">`;
    for (let p = mod.minPlayers; p <= mod.maxPlayers; p++) {
      selection += `<option value="${p}">${p} player</option>`;
    }
    selection += `</select></div>`;
  }

  return selection;
};


const validateDate = (start, end) => {
  let today = new Date().getTime();

  if (start){
    let startTime = Date.parse(start);

    if (startTime < today){
      salert("Invalid Start Date! Must be after today, otherwise leave blank for League to take immediate effect.");
      return false;
    }

    if (end){
      let endTime = Date.parse(end);
      if (endTime < startTime){
        salert("Invalid Date Range!");
        return false;
      }
    }

  }

  if (end){
    let endTime = Date.parse(end);
    if (endTime < today){
      salert("Invalid End Date!");
      return false;
    }
  }

  return true;
};

module.exports = AdminBox = {

  render(app, mod, games) {
    if (!document.getElementById("game-selector")) {
      app.browser.addElementToId(LeagueComponentAdminBoxTemplate(app, mod, games), "league-main-container-games");
      this.attachEvents(app, mod);
    }
  },


  attachEvents(app, mod) {
    let box = document.querySelector('.league-component-admin-box-form');
    if (!box) { return; }

    let desc = document.getElementById("league-desc");
    if (desc) {
      desc.addEventListener("focus", function (e) {
        let value = e.target.innerHTML;
        if (value == desc.getAttribute("data-placeholder")) {
          e.target.innerHTML = "";
        }
      });
    }

    box.onsubmit = (e) => {
      e.preventDefault();

      if (!validateDate(e.target.startdate.value, e.target.enddate.value)){
        return false;
      }

      let leaguename = sanitize(document.getElementById("league-name")?.textContent || e.target.game.value);
      let leaguedesc = sanitize(desc?.textContent) || "";
      if (leaguedesc === desc.getAttribute("data-placeholder")) {
        leaguedesc = "";
      }

      let options = (e.target.fixedoptions.checked) ? JSON.stringify(getGameOptions()) : "";

      let newLeague = {
        game: e.target.game.value,
        type: e.target.type.value,
        admin: app.wallet.returnPublicKey(),
        name: leaguename,
        description: leaguedesc,
        ranking: e.target.ranking.value,
        starting_score: e.target.starting_score.value,
        max_players: e.target.max_players.value,
        options: options,
        startdate: e.target.startdate.value,
        enddate: e.target.enddate.value,
        allowlate: (e.target.lateregister.checked) ? '1' : '0',
      };

      document.getElementById("league-details").style.display = "none";
      mod.sendCreateLeagueTransaction(newLeague);
      mod.overlay.clear();
      return false;
    }


    let selector = document.querySelector("#league-game");
    if (selector) {
      selector.onchange = (e) => {
        //Refresh game specific information
        let gamename = selector.value;
        try {
          if (gamename) {
            document.querySelector("#league-details img").src = selector.querySelector(`#${gamename}`).getAttribute("data-img");
            document.querySelector("#league-name").textContent = gamename;
            document.querySelector("#league-desc").textContent = "";
            document.querySelector("#game").value = gamename;
            document.getElementById("league-details").style.display = "block";
            document.getElementById("fixedoptions").checked = false;
            mod.overlay.clear();
            if (desc.innerHTML === "") {
              desc.innerHTML = desc.getAttribute("data-placeholder");
            }
          } else {
            document.getElementById("league-details").style.display = "none";
          }

        } catch (err) { console.log(err); }
      };
    }

    let startDiv = document.querySelector("#starting_score");
    let rankDiv = document.querySelector("#ranking");
    if (startDiv && rankDiv) {
      rankDiv.onchange = (e) => {
        if (rankDiv.value == "elo") {
          startDiv.value = 1000;
          startDiv.style.display = "block";
        } else {
          startDiv.value = 0;
          startDiv.style.display = "none";
        }
      };
    }

    let optionsSelect = document.getElementById("selectoptions");
    if (optionsSelect){
      optionsSelect.onclick = (e) => {
        try{
          document.getElementById("fixedoptions").checked = true;

          let gameName = selector.value;
          let gamemod = app.modules.returnModule(gameName);
          let advancedOptions = gamemod.returnGameOptionsHTML();
          let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>`;
          let moreOptions = players(app, gamemod);

          if (advancedOptions.includes(accept_button)){
            advancedOptions = advancedOptions.replace(accept_button, moreOptions+accept_button);
          }else{
            advancedOptions += moreOptions + accept_button; 
          }

          let html = `<div class="game_option_league_wizard">
                      <form id="game-wizard-form" class="game-wizard-form">
                      ${advancedOptions}
                      </form>
                      </div>
                      `;
          //Display Game Options
          mod.overlay.show(app, mod, html);  
          //Attach dynamic listeners
          gamemod.attachAdvancedOptionsEventListeners();
          //Hide overlay if clicking button
          if (document.getElementById("game-wizard-advanced-return-btn")) {
            document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
              mod.overlay.hide();
            };
          }
        }catch(err){
          console.log(err);
        }
      }
    }

    let optionsToggle = document.getElementById("fixedoptions");
    if (optionsToggle){
      optionsToggle.onchange = (e) =>{
        if (!document.getElementById("game-wizard-form")){
          let gameName = selector.value;
          let gamemod = app.modules.returnModule(gameName);
          let html = `<div class="game_option_league_wizard">
                      <form id="game-wizard-form" class="game-wizard-form">
                      ${gamemod.returnGameOptionsHTML()}
                      ${players(app, gamemod)}
                      </form>
                      </div>`;
          mod.overlay.show(app, mod, html);  
          mod.overlay.hide();
        }
      };
    }

  }
}



