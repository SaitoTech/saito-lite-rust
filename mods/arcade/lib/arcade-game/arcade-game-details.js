const ArcadeGameDetailsTemplate = require("./arcade-game-details.template");
const AdvancedOverlay = require("./advanced-overlay"); // game-overlay
const GameCryptoTransferManager = require("./../../../../lib/saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");

/**
 * Convert the text (html) options (returned by the game module) in to an object data structure
 *
 */
const getOptions = () => {
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
};

module.exports = ArcadeGameDetails = {
  /**
   *
   */
  render(app, mod, invite) {
    let gamemod = app.modules.returnModule(invite.msg.game);

    if (!document.getElementById("background-shim")) {
      app.browser.addElementToDom(
        `<div id="background-shim" class="background-shim" style=""><div id="background-shim-cover" class="background-shim-cover"></div></div>`
      );
    }
    
    let gamemod_url = gamemod.respondTo("arcade-games")?.img;
    document.querySelector(".background-shim").style.backgroundImage = "url(" + gamemod_url + ")";

    //Create the gamedetails window
    mod.overlay.show(app, mod, ArcadeGameDetailsTemplate(app, gamemod, invite), function () {
      document.querySelector("#background-shim").destroy();
    });

    //Test for advanced options
    let advancedOptions = gamemod.returnGameOptionsHTML();
    if (!advancedOptions) {
      document.querySelector(".game-wizard-options-toggle").style.display = "none";
    } else {
      //Create (hidden) the advanced options window
      mod.meta_overlay = new AdvancedOverlay(app, gamemod);
      mod.meta_overlay.render(app, gamemod);
      mod.meta_overlay.attachEvents(app, gamemod);

      //Attach events to advance options button
      document.querySelector(".game-wizard-options-toggle").onclick = (e) => {
        //Requery advancedOptions on the click so it can dynamically update based on # of players
        mod.meta_overlay.show(app, gamemod, gamemod.returnGameOptionsHTML());
        gamemod.attachAdvancedOptionsEventListeners();
        document.querySelector(".game-wizard-advanced-options-overlay").style.display = "block";
        try {
          if (document.getElementById("game-wizard-advanced-return-btn")) {
            document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
              mod.meta_overlay.hide();
            };
          }
        } catch (err) { }
      };

      //
      // move advanced options into game details form
      let advanced1 = document.querySelector(".game-wizard-advanced-box");
      let overlay1 = document.querySelector(".game-overlay");
      let overlay2 = document.querySelector(".game-overlay-backdrop");
      let overlaybox = document.querySelector(".game-wizard-advanced-options-overlay");
      overlaybox.appendChild(overlay1);
      overlaybox.appendChild(overlay2);
      if (advanced1) {
        overlaybox.appendChild(advanced1);
      }
    }
  },

  /**
   * Define function to create a game invite from clicking on create new game button
   * @param mod - reference to Arcade.js
   */
  attachEvents(app, mod) {
    document.querySelector(".background-shim").onclick = (e) => {
      mod.overlay.hide();
      document.querySelector(".background-shim").destroy();
    };

    //go to game home page
    document.querySelector(".game-home-link").addEventListener("click", (e) => {
      let options = getOptions();
      let gamemod = app.modules.returnModule(options.game);
      app.browser.logMatomoEvent("Navigation", "GameDetailtoPage", gamemod.returnSlug());
      window.location = "/arcade/?game=" + gamemod.returnSlug();
    });


    if (document.querySelector(".dynamic_button")){
      document.querySelector(".dynamic_button").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("showAll");
      });  
    }

    //Query game instructions
    document.getElementById("game-rules-btn").addEventListener("click", (e)=>{
       let options = getOptions();
       let gamemod = app.modules.returnModule(options.game);
       gamemod.overlay.show(app, mod, gamemod.returnGameRulesHTML());
    });

    //
    // create game
    //
    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          let options = getOptions();
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
            if (options.crypto != "") {
              if (parseFloat(options.stake) > 0) {
                let selected_crypto_ticker = app.wallet.returnCryptoModuleByTicker(options.crypto).ticker; //is this really necessary?
                let preferred_crypto_ticker = app.wallet.returnPreferredCrypto().ticker;
                if (selected_crypto_ticker === preferred_crypto_ticker) {
                  let my_address = app.wallet.returnPreferredCrypto().returnAddress();
                  let crypto_transfer_manager = new GameCryptoTransferManager(app);
        
                  let current_balance = await crypto_transfer_manager.returnBalance(
                    app,
                    mod,
                    my_address,
                    options.crypto,
                    function () { }
                  );
                  console.log("Current balance", current_balance);

                  try {
                    if (BigInt(current_balance) < BigInt(options.stake)) {
                      salert("You do not have enough " + options.crypto + "! Balance: " + current_balance);
                      return;
                    }
                  } catch (err) {
                    if (parseFloat(current_balance) < parseFloat(options.stake)) {
                      salert("You do not have enough " + options.crypto + "! Balance: " + current_balance);
                      return;
                    }
                  }
                  
                } else {
                  salert(
                    `${options.crypto} must be set as your preferred crypto to create a game using ${options.crypto}`
                  );
                  return;
                }
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
              salert("You need to be a member of the League to create a League-only game invite");
              return;
            }
          }

          let gamemod = app.modules.returnModule(options.game);
          let players_needed = 0;
          if (document.querySelector(".game-wizard-players-select")) {
            players_needed = document.querySelector(".game-wizard-players-select").value;
          } else {
            players_needed = document.querySelector(".game-wizard-players-no-select").dataset.player;
          }

          let gamedata = {
            ts: new Date().getTime(),
            name: gamemod.name,
            slug: gamemod.returnSlug(),
            options: options,
            players_needed: players_needed,
            invitation_type: "public",
          };
          if (players_needed === 0) {
            console.error("Create Game Error");
            console.log(gamedata);
            return;
          }
          
          //Close the overlay
          mod.overlay.hide();
          document.getElementById("background-shim").destroy();

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
  },
};
