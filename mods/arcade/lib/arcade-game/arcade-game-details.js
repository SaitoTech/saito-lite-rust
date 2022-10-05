const ArcadeGameDetailsTemplate = require("./arcade-game-details.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const GameCryptoTransferManager = require("./../../../../lib/saito/new-ui/game-crypto-transfer-manager/game-crypto-transfer-manager");


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
        mod.active_tab = "arcade"; //So it refreshes to show the new game invite
        e.stopPropagation();
        try {
          let options = this.readOptions();
          let isPrivateGame = e.currentTarget.getAttribute("data-type");
          if (isPrivateGame == "private") {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateClosedInvite", options.game);
          } else if (isPrivateGame == "single") {
            app.browser.logMatomoEvent("Arcade", "ArcadeLaunchSinglePlayerGame", options.game);
          } else {
            app.browser.logMatomoEvent("Arcade", "ArcadeCreateOpenInvite", options.game);
          }

          if (isPrivateGame !== "single"){
            for (let game of mod.games){
              if (mod.isMyGame(game, app) && game.msg.players_needed>1){
                let c = await sconfirm(`You already have a ${game.msg.game} game open, are you sure you want to create a new game invite?`);
                if (!c){
                  this.overlay.remove();
                  return;
                }
              }
              if (game.msg.game === options.game){
                let c = await sconfirm(`There is an open invite for ${game.msg.game}, are you sure you want to create a new invite?`);
                if (!c){
                  this.overlay.remove();
                  return;
                } 
              }
            }
          }

          //
          // if crypto and stake selected, make sure creator has it
          //
          try{
            if (options.crypto && parseFloat(options.stake) > 0) {
              let crypto_transfer_manager = new GameCryptoTransferManager(app);
              let success = await crypto_transfer_manager.confirmBalance(app, mod, options.crypto, options.stake);
              if (!success){ 
                this.overlay.remove();
                return; 
              }
            }
          }catch(err){
             console.log("ERROR checking crypto: " + err);
            return;
          }

          //Check League Membership
          if (options.league){
            let leag = app.modules.returnModule("League");
            if (!leag.isLeagueMember(options.league)){
              await sconfirm("You need to be a member of the League to create a League-only game invite");
              this.overlay.remove();
              return;
            }
          }

          let players_needed = 0;
          if (document.querySelector(".game-wizard-players-select")) {
            players_needed = document.querySelector(".game-wizard-players-select").value;
          } else {
            players_needed = document.querySelector(".game-wizard-players-no-select").dataset.player;
          }

          if (this.gamemod.opengame){
            options = Object.assign(options, {max_players: players_needed});
            console.log(JSON.parse(JSON.stringify(options)));
            players_needed = this.gamemod.minPlayers;
          }

          let gamedata = {
            ts: new Date().getTime(),
            name: this.gamemod.name,
            slug: this.gamemod.returnSlug(),
            options: options,
            players_needed: players_needed,
            invitation_type: "public",
          };

          this.overlay.remove();

          if (players_needed === 0) {
            console.error("Create Game Error");
            console.log(gamedata);
            return;
          }
          

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

            mod.renderArcadeMain(app, mod);

            if (isPrivateGame == "private") {
              console.log(newtx);
              //Create invite link from the game_sig 
              mod.showShareLink(newtx.transaction.sig);
            }
          }
        } catch (err) {
          alert("error: " + err);
        }

        return false;
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
    return options;
  }



}

module.exports = ArcadeGameDetails;