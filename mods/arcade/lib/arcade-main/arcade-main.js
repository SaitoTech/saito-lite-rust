const ArcadeMainTemplate = require("./templates/arcade-main.template");
const ArcadeContainerTemplate = require("./templates/arcade-container.template");
const ArcadeMobileHelper = require("./templates/arcade-mobile-helper.template");
const ArcadeForums = require("./arcade-forums");
const ArcadePosts = require("./arcade-posts");
const ArcadeInfobox = require("./arcade-infobox");
const GameLoader = require("./../arcade-game/game-loader");
const SaitoCarousel = require("./../../../../lib/saito/ui/saito-carousel/saito-carousel");
const ArcadeInviteTemplate = require("./templates/arcade-invite.template");
const ArcadeObserveTemplate = require("./templates/arcade-observe.template");
const GameCryptoTransferManager = require("./../../../../lib/saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");
const JSON = require("json-bigint");
const saito = require("../../../../lib/saito/saito");

//let tabNames = ["arcade", "observables", "tournaments"];
let tabNames = [];

module.exports = ArcadeMain = {
  render(app, mod) {
    // avoid rendering over inits
    if (mod.viewing_arcade_initialization_page == 1) {
      return;
    }

   
    // put active games first
    let whereTo = 0;
    for (let i = 0; i < mod.games.length; i++) {
      if (mod.isMyGame(mod.games[i], app)) {
        mod.games[i].isMine = true;
        let replacedGame = mod.games[whereTo];
        mod.games[whereTo] = mod.games[i];
        mod.games[i] = replacedGame;
        whereTo++;
      } else {
        mod.games[i].isMine = false;
      }
    }

    // purge existing content
    if (document.getElementById("arcade-main")) {
      document.getElementById("arcade-main").destroy();
    }


    //
    // add parent wrapping class
    //
    if (!document.getElementById("arcade-container")) {
      app.browser.addElementToDom(ArcadeContainerTemplate(app, mod));
    }
    if (!document.querySelector(".arcade-main")) {
      app.browser.addElementToDom(ArcadeMainTemplate(app, mod), "arcade-container");
    }

    //
    // add tabs
    //
    /*
    tabNames.forEach((tabButtonName, i) => {
      document.querySelector("#tab-button-" + tabButtonName).onclick = () => {
        app.browser.logMatomoEvent(
          "Arcade",
          "ArcadeTabNavigationClick",
          tabButtonName
        );
        tabNames.forEach((tabName, i) => {
          if (tabName === tabButtonName) {
            document
              .querySelector("#" + tabName + "-hero")
              .classList.remove("arcade-tab-hidden");
            document
              .querySelector("#tab-button-" + tabName)
              .classList.add("active-tab-button");
          } else {
            document
              .querySelector("#" + tabName + "-hero")
              .classList.add("arcade-tab-hidden");
            document
              .querySelector("#tab-button-" + tabName)
              .classList.remove("active-tab-button");
          }
        });
      };
    });
    */

    if (mod.viewing_game_homepage) {
      //Events for this are same as side bar (and attached via arcade-game-sidebar.js)
      app.browser.addElementToElement(
        ArcadeMobileHelper(app.modules.returnModuleBySlug(mod.viewing_game_homepage)),
        document.getElementById("arcade-mobile-helper")
      );
    }

    //
    // add games
    //
    if (document.querySelector(".arcade-hero")) {
      mod.games.forEach((invite, i) => {
        if (!mod.viewing_game_homepage || invite.msg.game.toLowerCase() === mod.viewing_game_homepage) {
console.log("INVITE: " + JSON.stringify(invite) + " -- " + mod.name);
          app.browser.addElementToElement(
            ArcadeInviteTemplate(app, mod, invite, i),
            document.querySelector(".arcade-hero")
          );
        }
      });
      
      /*mod.observer.forEach((observe, i) => {
        app.browser.addElementToElement(
          ArcadeObserveTemplate(app,mod,observe,i,app.crypto.stringToBase64(JSON.stringify(observe))),
          document.querySelector(".observables-hero")
        );
      });*/
    }


    if (mod.viewing_game_homepage) { //Add game-specific posts
      ArcadePosts.render(app, mod);
    } else {  //Add summary of game pages with latest post teaser
      ArcadeForums.render(app, mod);
    }

    //ArcadeInfobox.render(app, mod); //Not doing anything right now

    if (mod.games.length == 0) {
      let carousel = new SaitoCarousel(app);
      carousel.render(app, mod, "arcade", "arcade-hero");
      if (mod.viewing_game_homepage) { //Overwrite the carousel to only show the relevant game
        let gamemod = app.modules.returnModuleBySlug(mod.viewing_game_homepage);
        let cdiv = document.getElementById("saito-carousel");
        if (cdiv){
          cdiv.innerHTML = `<div class="big">${gamemod.gamename}</div>`;
          cdiv.style.backgroundImage = `url('/${gamemod.returnSlug()}/img/arcade.jpg')`;
          cdiv.style.backgroundSize = "cover";  
        }
      }
    }

    try {
    
      // fetch any usernames needed
      app.browser.addIdentifiersToDom();

      //What is this?
      if (app.browser.isSupportedBrowser(navigator.userAgent) == 0) {
        document.querySelector(".alert-banner").style.display = "block";
      }
    } catch (err) {
      console.error(err);
    }
  },

  attachEvents(app, mod) {
    /*
    // observer mode actions
    document.querySelectorAll(`.observe-game-btn`).forEach((el, i) => {
      el.onclick = function (e) {
        let game_obj = e.currentTarget.getAttribute("data-gameobj");
        let game_cmd = e.currentTarget.getAttribute("data-cmd");

        if (game_cmd === "watch") {
          arcade_main_self.observeGame(app, mod, game_obj);
          return;
        }
      };
    });*/

    //
    // game invitation actions
    //
    let arcade_main_self = this;
    mod.games.forEach((invite, i) => {
      try {
        document.querySelectorAll(`#invite-${invite.transaction.sig} .invite-tile-button`)
          .forEach((el, i) => {
            el.onclick = function (e) {
              let game_sig = e.currentTarget.getAttribute("data-sig");
              let game_cmd = e.currentTarget.getAttribute("data-cmd");
              
              app.browser.logMatomoEvent("Arcade", "ArcadeAcceptInviteButtonClick", game_cmd);
              
              if (game_cmd === "delete") {
                arcade_main_self.deleteGame(app, mod, game_sig);
                return;
              }

              if (game_cmd === "cancel") {
		let c = confirm("Are you sure you want to cancel this game?");
		if (c) {
                  arcade_main_self.cancelGame(app, mod, game_sig);
                  return;
		}
              }

              if (game_cmd === "join") {
		let c = confirm("Are you sure you want to join this game?");
		if (c) {
                  arcade_main_self.joinGame(app, mod, game_sig);
                  return;
		}
              }

              if (game_cmd === "continue") {
                arcade_main_self.continueGame(app, mod, game_sig);
                return;
              }
            };
          });
      } catch (err) {
        console.error(err);
      }
    });




    //Attach events for arcade-sub
    if (mod.viewing_game_homepage) {
      ArcadePosts.attachEvents(app, mod);
    } else {
      ArcadeForums.attachEvents(app, mod);
    }
  


  },

  async joinGame(app, mod, game_id) {
    let accepted_game = null;
    mod.games.forEach((g) => {
      if (g.transaction.sig === game_id) {
        accepted_game = g;
      }
    });

    if (!accepted_game) {
      console.log("ERR: game not found");
      return;
    }

    //
    // if this requires "crypto" we need to check that the mod is installed
    // and the minimum required amount is available
    //
    try {
      let txmsg = accepted_game.msg;
      let game_options = txmsg.options;

      //
      // check we have module
      //
      if (game_options.crypto != "" && game_options.crypto != undefined) {
        if (game_options.crypto !== app.wallet.returnPreferredCrypto().ticker) {
          salert(`You must set ${game_options.crypto} as your preferred crypto to join this game`);
          return;
        }
        let cryptoMod = null;
        try {
          cryptoMod = app.wallet.returnCryptoModuleByTicker(game_options.crypto);
        } catch (err) {
          if (err.startsWith("Module Not Found")) {
            salert("This game requires " + game_options.crypto + " crypto to play! Not Found!");
            return;
          } else {
            throw err;
          }
        }

        let c = await sconfirm("This game requires " + game_options.crypto + " crypto to play. OK?");
        if (!c) {
          return;
        }

        //
        // if a specific cost / stake specified
        //

        if (parseFloat(game_options.stake) > 0) {
          let my_address = app.wallet.returnPreferredCrypto(game_options.crypto).returnAddress();
          let crypto_transfer_manager = new GameCryptoTransferManager(app);
          crypto_transfer_manager.returnBalance(
            app,
            mod,
            my_address,
            game_options.crypto,
            function () {}
          );

          let current_balance = await cryptoMod.returnBalance();

          crypto_transfer_manager.hideOverlay();

	  try {
            if (BigInt(current_balance) < BigInt(game_options.stake)) {
              salert("You do not have enough " + game_options.crypto + "! Balance: " + current_balance);
              return;
            }
	  } catch (err) {
            if (parseFloat(current_balance) < parseFloat(game_options.stake)) {
              salert("You do not have enough " + game_options.crypto + "! Balance: " + current_balance);
              return;
	    }
	  }
        }
      }
    } catch (err) {
      console.log("ERROR checking if crypto-required: " + err);
      return;
    }

    //
    // not enough players? join not accept
    //
    let players_needed = parseInt(accepted_game.msg.players_needed);
    let players_available = accepted_game.msg.players.length;
    if (players_needed > players_available + 1) {
      let newtx = mod.createJoinTransaction(accepted_game);
      app.network.propagateTransaction(newtx);

      /***** FAILS
      // try to relay
      let relay_mod = app.modules.returnModule('Relay');
      if (relay_mod != null && accepted_game.initialize_game_offchain_if_possible == 1) {
        relay_mod.sendRelayMessage(accepted_game.players, 'game relay gamemove', newtx);
      }
******/

      mod.joinGameOnOpenList(newtx);
      salert("Joining game! Please wait a moment");
      return;
    }

    //
    // enough players, so "accept" to kick off
    //
    if (accepted_game.transaction.from[0].add == app.wallet.returnPublicKey()) {
      let { players } = accepted_game.returnMessage();
      if (players.length > 1) {
        salert(`You created this game! Waiting for enough players to join we can start...`);
      }
    } else {
      //
      // we are going to send a message to accept this game, but first check if we have
      // already done this, in which case we will have the game loaded in our local games list
      //
      if (app.options.games) {
        let existing_game = app.options.games.find((g) => g.id == game_id);

        if (existing_game) {
          //find returns "undefined"
          if (existing_game.initializing == 1) {
            salert(
              "Accepted Game! It may take a minute for your browser to update -- please be patient!"
            );

            GameLoader.render(app, data);
            GameLoader.attachEvents(app, data);

            return;
          } else {
            //
            // game exists, so "continue" not "join"
            //
            existing_game.ts = new Date().getTime();
            existing_game.initialize_game_run = 0;
            app.storage.saveOptions();
            //Have to search list of modules in Saito to get the existing_game's slug (i.e. directory)
            for (let z = 0; z < app.modules.mods.length; z++) {
              if (app.modules.mods[z].name == existing_game.module) {
                window.location = "/" + app.modules.mods[z].returnSlug();
                return;
              }
            }
            //window.location = "/" + existing_game.slug;
            return;
          }
        }
      }

      //
      // ready to go? check with server game is not taken
      //
      GameLoader.render(app, mod);
      GameLoader.attachEvents(app, mod);

      mod.sendPeerRequestWithFilter(
        () => {
          let msg = {};
          msg.request = "rawSQL";
          msg.data = {};
          msg.data.module = "Arcade";
          msg.data.sql = `SELECT is_game_already_accepted FROM games WHERE game_id = "${game_id}"`;
          msg.data.game_id = game_id;
          return msg;
        },

        (res) => {
          if (res.rows == undefined) {
            console.log("ERROR 458103: cannot fetch information on whether game already accepted!");
            return;
          }

          if (res.rows.length > 0) {
            if (
              res.rows[0].game_still_open == 1 ||
              (res.rows[0].game_still_open == 0 && players_needed > 2)
            ) {
              //
              // data re: game in form of tx
              //
              let { transaction } = accepted_game;
              let game_tx = Object.assign({ msg: { players_array: null } }, transaction);

              let newtx = mod.createAcceptTransaction(accepted_game);
              mod.app.network.propagateTransaction(newtx);

              let my_publickey = app.wallet.returnPublicKey();
              let { players } = accepted_game.returnMessage();
              let peers = [];
              for (let i = 0; i < app.network.peers.length; i++) {
                peers.push(app.network.peers[i].returnPublicKey());
              }

              //
              // try fast accept
              //
              let relay_mod = app.modules.returnModule("Relay");
              if (relay_mod != null) {
                relay_mod.sendRelayMessage(players, "arcade spv update", newtx);
                relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
              }

              return;
            } else {
              salert("Sorry, this game has been accepted already!");
            }
          } else {
            salert("Sorry, this game has already been accepted!");
          }
        }
      );
    }
  },

  continueGame(app, mod, game_id) {
    let existing_game = -1;
    let testsig = "";

    if (app.options?.games) {
      for (let i = 0; i < app.options.games.length; i++) {
        if (typeof app.options.games[i].transaction != "undefined") {
          testsig = app.options.games[i].transaction.sig;
        } else if (typeof app.options.games[i].id != "undefined") {
          testsig = app.options.games[i].id;
        }
        if (testsig === game_id) {
          existing_game = app.options.games[i];
        }
      }
    }

    if (existing_game && existing_game !== -1) {
      if (existing_game.initializing == 1) {
        salert(
          "Accepted Game! It may take a minute for your browser to update -- please be patient!"
        );

        GameLoader.render(app, data);
        GameLoader.attachEvents(app, data);

        return;
      } else {
        //
        // game exists, so "continue" not "join"
        //
        existing_game.ts = new Date().getTime();
        existing_game.initialize_game_run = 0;
        app.storage.saveOptions();

        let game_mod = app.modules.returnModule(existing_game.module);
        if (game_mod) {
          window.location = "/" + game_mod.returnSlug().toLowerCase();
        }
        return;
      }
    }
  },

  cancelGame(app, mod, game_id) {
    let sig = game_id;
    var testsig = "";
    let players = [];

    if (app.options?.games) {
      for (let i = 0; i < app.options.games.length; i++) {
        if (typeof app.options.games[i].transaction != "undefined") {
          testsig = app.options.games[i].transaction.sig;
        } else if (typeof app.options.games[i].id != "undefined") {
          testsig = app.options.games[i].id;
        }
        if (testsig == sig) {
          app.options.games[i].over = 1;
          players = app.options.games[i].players;
          app.options.games.splice(i, 1);
          app.storage.saveOptions();
        }
      }
    }

    let newtx = app.wallet.createUnsignedTransactionWithDefaultFee();
    let my_publickey = app.wallet.returnPublicKey();
    let peers = [];
    for (let i = 0; i < app.network.peers.length; i++) {
      peers.push(app.network.peers[i].returnPublicKey());
    }

    for (let i = 0; i < players.length; i++) {
      if (players[i] != my_publickey) newtx.transaction.to.push(new saito.default.slip(players[i]));
    }

    let msg = {
      sig: sig,
      status: "close",
      request: "close",
      winner: players[0] == my_publickey ? players[1] : players[0],
      module: "Arcade",
    };

    newtx.msg = msg;
    newtx = app.wallet.signTransaction(newtx);

    let relay_mod = app.modules.returnModule("Relay");
    if (relay_mod != null) {
      relay_mod.sendRelayMessage(players, "arcade spv update", newtx);
      relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
    }

    app.network.propagateTransaction(newtx);
    this.removeGameFromList(sig);
  },

  deleteGame(app, mod, game_id) {
    salert(`Delete game id: ${game_id}`);

    if (app.options.games) {
      let { games } = app.options;
      for (let i = 0; i < app.options.games.length; i++) {
        if (app.options.games[i].id == game_id) {
          let resigned_game = app.options.games[i];

          if (resigned_game.over == 0) {
            let game_mod = app.modules.returnModule(resigned_game.module);
            game_mod.resignGame(game_id);
          } else {
            //
            // removing game someone else ended
            //
            app.options.games[i].over = 1;
            app.options.games[i].last_block = app.blockchain.last_bid;
            app.storage.saveOptions();
          }
        }
      }
      this.removeGameFromList(game_id);
    }
  },

  observeGame(app, mod, encryptedgamejson) {
    mod.observeGame(encryptedgamejson);
  },

  removeGameFromList(game_id) {
    document
      .getElementById(`arcade-hero`)
      .removeChild(document.getElementById(`invite-${game_id}`));
  },
};
