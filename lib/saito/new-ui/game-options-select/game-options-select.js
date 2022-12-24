const SaitoOverlay = require('./../saito-overlay/saito-overlay');

/*
  
  Todo -- this shouldn't necessarily exist/be here
  Combine with game-wizard and make a dedicated UI component?? 

*/

class GameOptionsSelect{

  constructor(app){
    this.app = app;
  }

  render(app, mod){}
  attachEvents(app, mod){}

  selectGameOptions(app, game_mod){

    return new Promise((resolve, reject) => {
      let newOverlay = new SaitoOverlay(this.app, false, false);
      let advancedOptions = game_mod.returnGameOptionsHTML();
      let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>`;
      let moreOptions = this.players(app, game_mod);

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
      newOverlay.show(this.app, this, html); 
      newOverlay.blockClose();
       
      //Attach dynamic listeners
      game_mod.attachAdvancedOptionsEventListeners();
      //Hide overlay if clicking button
      if (document.getElementById("game-wizard-advanced-return-btn")) {
        document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
          options = this.readGameOptionsFromDOM();
          if (game_mod.opengame){
            options["game-wizard-players-select-max"] = options["game-wizard-players-select"];
          }                
          newOverlay.remove();
          resolve(options);
        };
      }
    });

  }


   players(app, game_mod){
      let selection = "";
      if (game_mod.minPlayers === game_mod.maxPlayers) {
        selection = `<input type="hidden" class="game-wizard-players-select" name="game-wizard-players-select" value="${game_mod.minPlayers}">`;
        selection += game_mod.returnSingularGameOption(app);
      } else {
        selection = `<div><label for="game-wizard-players-select">Number of Players:</label>
                     <select class="game-wizard-players-select" name="game-wizard-players-select">`;
        for (let p = game_mod.minPlayers; p <= game_mod.maxPlayers; p++) {
          selection += `<option value="${p}">${p} player</option>`;
        }
        selection += `</select></div>`;
      }

      return selection;
    }



    readGameOptionsFromDOM(){
      let options = {};
      document.querySelectorAll("form#game-wizard-form input, form#game-wizard-form select").forEach((element) => {
        console.log(element);
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

      console.log(JSON.parse(JSON.stringify(options)));
      return options;
    }

}

module.exports = GameOptionsSelect;   
