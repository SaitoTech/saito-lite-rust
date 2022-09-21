const GameCreateNewTemplate = require('./game-create-new.template.js');
const GameCryptoTransferManager = require('./../../../../../lib/saito/new-ui/game-crypto-transfer-manager/game-crypto-transfer-manager');
const SaitoOverlay = require('./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay');

class GameCreateNew {

  constructor(app, mod, game_mod, invite) {
    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app);
    this.overlay.removeOnClose = true;
  }

  render(app, mod, invite) {

    let slug = (this.game_mod.returnSlug())? this.game_mod.slug: this.game_mod.name.toLowerCase();
    let image = `/${slug}/img/arcade/arcade.jpg`;

    this.overlay.show(app, mod, GameCreateNewTemplate(app, mod, this.game_mod, invite));
    this.overlay.setBackground(image);


    let advancedOptions = this.game_mod.returnGameOptionsHTML();
    if (!advancedOptions) {
      document.querySelector(".arcade-advance-opt").style.display = "none";
    } else {

      //Create (hidden) the advanced options window
      this.meta_overlay = new SaitoOverlay(app, false, false);
      this.meta_overlay.class = "game-overlay";
      this.meta_overlay.show(app, mod, advancedOptions);

      this.meta_overlay.hide();      

      //
      // move advanced options into game details form
      let overlay1 = document.querySelector(".game-overlay");
      let overlay_backdrop_el = document.querySelector(`#saito-overlay-backdrop${this.meta_overlay.ordinal}`);
      let overlaybox = document.querySelector("#advanced-options-overlay-container");
      overlaybox.appendChild(overlay1);
      overlaybox.appendChild(overlay_backdrop_el);

      overlay_backdrop_el.style.opacity = 0.95;
      overlay_backdrop_el.style.backgroundColor = "#111";

      //let advanced1 = document.querySelector(".game-wizard-advanced-box");
      //if (advanced1) {
      //  overlaybox.appendChild(advanced1);
      //}
    }

    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {
    gamecreate_self = this;

    if (document.querySelector(".saito-multi-select_btn")){
      document.querySelector(".saito-multi-select_btn").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("showAll");
      });  
    }


    //Attach events to advance options button

    try {
      const identifiers = document.getElementsByClassName(`arcade-advance-opt`);

      Array.from(identifiers).forEach((identifier) => {
        identifier.addEventListener("click", (e) => {

          //Requery advancedOptions on the click so it can dynamically update based on # of players
          let accept_button = `<div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary small" style="float: right;">Accept</div>`;
          let advancedOptionsHTML = gamecreate_self.game_mod.returnGameOptionsHTML();
          if (!advancedOptionsHTML.includes(accept_button)){
            advancedOptionsHTML += accept_button;
          }
          gamecreate_self.meta_overlay.show(app, gamecreate_self.game_mod, advancedOptionsHTML);
          gamecreate_self.game_mod.attachAdvancedOptionsEventListeners();
          gamecreate_self.meta_overlay.blockClose();

          try {
            if (document.getElementById("game-wizard-advanced-return-btn")) {
              document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
                gamecreate_self.meta_overlay.hide();
              };
            }
          } catch (err) { }
        });
      });
    } catch (err) {
      console.error("Error while adding event to game advance options: " + err);
    }

    try {
      if (document.getElementById('game-rules-btn')){
        document.getElementById('game-rules-btn').onclick = function(){
          let rules_overlay = new SaitoOverlay(app);
          rules_overlay.show(app, mod, gamecreate_self.game_mod.returnGameRulesHTML());
        }
      }
    } catch (err) {
      console.error("Error while adding event to game rules: " + err);
    }

    //
    // create game
    //
    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          let mod = app.modules.returnModule('Arcade');   
          let options = this.getOptions();

          let isPrivateGame = e.currentTarget.getAttribute("data-type");
          if (isPrivateGame == "private") {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateClosedInvite", options.game);
          } else if (isPrivateGame == "single") {
            app.browser.logMatomoEvent("Arcade", "ArcadeLaunchSinglePlayerGame", options.game);
          } else {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateOpenInvite", options.game);
          }

          //
          // if crypto and stake selected, make sure creator has it
          //
          try{
            if (options.crypto && parseFloat(options.stake) > 0) {
              let crypto_transfer_manager = new GameCryptoTransferManager(app);
              let success = await crypto_transfer_manager.confirmBalance(app, mod, options.crypto, options.stake);
              if (!success){ return; }
            }
          }catch(err){
             console.log("ERROR checking crypto: " + err);
            return;
          }

          //Check League Membership
          if (options.league){
            let leag = app.modules.returnModule("League");
            if (!leag.isLeagueMember(options.league)){
              salert("You need to be a member of the League to create a League-only game invite");
              return;
            }
          }

          let players_needed = 0;
          if (document.querySelector(".game-wizard-players-select")) {
            players_needed = document.querySelector(".game-wizard-players-select").value;
          } else {
            players_needed = document.querySelector(".game-wizard-players-no-select").dataset.player;
          }

          if (gamecreate_self.game_mod.opengame){
            options = Object.assign(options, {max_players: players_needed});
            console.log(JSON.parse(JSON.stringify(options)));
            players_needed = gamecreate_self.game_mod.minPlayers;
          }

          let gamedata = {
            ts: new Date().getTime(),
            name: gamecreate_self.game_mod.name,
            slug: gamecreate_self.game_mod.returnSlug(),
            options: options,
            players_needed: players_needed,
            invitation_type: "public",
          };

          if (players_needed === 0) {
            console.error("Create Game Error");
            console.log(gamedata);
            return;
          }
          
          //Destroy persistent advanced options overlay
          gamecreate_self.meta_overlay.remove();
          gamecreate_self.overlay.remove();

          if (players_needed == 1) {

            mod.launchSinglePlayerGame(app, gamedata); //Game options don't get saved....
            return;
          } else {
            
            //console.log("PRE CREATING OPEN TX");
            if (isPrivateGame == "private") {
              gamedata.invitation_type = "private";
            }

            let newtx = mod.createOpenTransaction(gamedata);
            app.network.propagateTransaction(newtx);
  
            //
            // and relay open if exists
            //
            let peers = [];
            for (let i = 0; i < app.network.peers.length; i++) {
              peers.push(app.network.peers[i].returnPublicKey());
            }
            let relay_mod = app.modules.returnModule("Relay");
            if (relay_mod != null) {
              relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
            }
        
            mod.addGameToOpenList(newtx);

            if (isPrivateGame == "private") {
              console.log(newtx);
              //Create invite link from the game_sig 
              mod.showShareLink(newtx.transaction.sig);
            }
          }
        } catch (err) {
          console.log(err);
          alert("error: " + err);
        }

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




module.exports = GameCreateNew;
