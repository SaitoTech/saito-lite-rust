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
    }else if(element.type == "radio"){
      if (element.checked) {
        options[element.name] = element.value;
      }
    }else {
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
    let gamemod_url = "/" + gamemod.returnSlug() + "/img/arcade.jpg";
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
        document.querySelector(".game-wizard-advanced-options-overlay").style.display = "block";
        try {
          if (document.getElementById("game-wizard-advanced-return-btn")) {
            document.querySelector(".game-wizard-advanced-return-btn").onclick = (e) => {
              mod.meta_overlay.hide();
            };
          }
        } catch (err) {}
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
   */
  attachEvents(app, mod) {
    document.querySelector(".background-shim").onclick = (e) => {
      mod.overlay.hide();
      document.querySelector(".background-shim").destroy();
    };

    //go to game home page
    document.querySelector(".game-home-link").addEventListener("click", (e) => {
      let options = getOptions();
      let gamemod = app.modules.returnModule(options.gamename);
      app.browser.logMatomoEvent("Navigation", "GameDetailtoPage", gamemod.returnSlug());
      window.location = "/arcade/?game=" + gamemod.returnSlug();
    });

    //Query game instructions
    //document.getElementById("game-rules-btn").addEventListener("click", (e)=>{
    //   let options = getOptions();
    //   let gamemod = app.modules.returnModule(options.gamename);
    //   gamemod.overlay.show(app, mod, gamemod.returnGameRulesHTML());
    //});

    //
    // create game
    //
    document.getElementById("game-invite-btn").addEventListener("click", async (e) => {
      try {
        let options = getOptions();
        app.browser.logMatomoEvent("Arcade", "ArcadeCreateNewInvite", options.gamename);
        //
        // if crypto and stake selected, make sure creator has it
        //
        if (options.crypto != "") {
          if (options.stake > 0) {
            let selected_crypto_ticker = app.wallet.returnCryptoModuleByTicker(
              options.crypto
            ).ticker;
            let preferred_crypto_ticker = app.wallet.returnPreferredCrypto().ticker;
            if (selected_crypto_ticker === preferred_crypto_ticker) {
              let my_address = app.wallet.returnPreferredCrypto().returnAddress();
              let crypto_transfer_manager = new GameCryptoTransferManager(app);
              crypto_transfer_manager.returnBalance(app, mod, my_address, options.crypto, function () {});
              let returnObj = await app.wallet.returnPreferredCryptoBalances(
                [my_address],
                null,
                options.crypto
              );

              let adequate_balance = 0;
              for (let i = 0; i < returnObj.length; i++) {
                if (returnObj[i].address == my_address) {
                  if (parseFloat(returnObj[i].balance) >= parseFloat(options.stake)) {
                    adequate_balance = 1;
                  }
                }
              }
              crypto_transfer_manager.hideOverlay();

              if (adequate_balance == 0) {
                salert("You don't have enough " + options.crypto + " to create this game!");
                return;
              }
            } else {
              salert(
                `${options.crypto} must be set as your preferred crypto to create a game using ${options.crypto}`
              );
              return;
            }
          }
        }

        let gamemod = app.modules.returnModule(options.gamename);
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
          options: gamemod.returnFormattedGameOptions(options),
          options_html: gamemod.returnGameRowOptionsHTML(options),
          players_needed: players_needed,
        };
        if (players_needed === 0) {
          console.error("Create Game Error");
          console.log(gamedata);
          return;
        }
        if (players_needed == 1) {
          mod.launchSinglePlayerGame(app, gamedata); //Game options don't get saved....
          return;
        } else {
          mod.overlay.hide();
          document.getElementById("background-shim").destroy();

          console.log("PRE CREATING OPEN TX");

          let newtx = mod.createOpenTransaction(gamedata);

          let arcade_mod = app.modules.returnModule("Arcade");
          if (arcade_mod) {
            arcade_mod.addGameToOpenList(newtx);
          }

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

          mod.app.network.propagateTransaction(newtx);
          mod.renderArcadeMain(app, mod);
        }
      } catch (err) {
        alert("error: " + err);
      }

      return false;
    });
  },
};
