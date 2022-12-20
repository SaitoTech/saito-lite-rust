// const ArcadeMainTemplate = require("./main.template");

// const ArcadeContainerTemplate = require("./../templates/arcade-container.template");
// const ArcadeMobileHelper = require("./../templates/arcade-mobile-helper.template");
// const ArcadeForums = require("./forums");
// const ArcadePosts = require("./posts");
// const GameLoader = require("./../../../../lib/saito/new-ui/game-loader/game-loader");
// const SaitoCarousel = require("./../../../../lib/saito/ui/saito-carousel/saito-carousel");
// const ArcadeInviteTemplate = require("./../templates/arcade-invite.template");
// const GameCryptoTransferManager = require("./../../../../lib/saito/new-ui/game-crypto-transfer-manager/game-crypto-transfer-manager");
// const JSON = require("json-bigint");
// const saito = require("../../../../lib/saito/saito");


// module.exports = ArcadeMain = {
//   render(app, mod) {
//     // avoid rendering over inits
//     if (mod.viewing_arcade_initialization_page == 1) {
//       return;
//     }



//     // purge existing content
//     if (document.getElementById("arcade-main")) {
//       document.getElementById("arcade-main").destroy();
//     }


//     //
//     // add parent wrapping class
//     //
//     if (!document.getElementById("arcade-container")) {
//       app.browser.addElementToDom(ArcadeContainerTemplate(app, mod));
//     }
//     if (!document.querySelector(".arcade-main")) {
//       app.browser.addElementToDom(ArcadeMainTemplate(app, mod), document.getElementById("arcade-container"));
//     }

//     //
//     // add tabs if we have League installed
//     //
//     let league = app.modules.returnModule("League");
//     let observer = app.modules.returnModule("Observer");

//     let tabNames = ["arcade"];
//     if (league){
//       tabNames.push("league");
//     }
//     if (observer){
//       tabNames.push("observer");
//     }

//     if (tabNames.length > 1){
//       try{
//         document.getElementById("arcade-tab-buttons").style.gridTemplateColumns = `repeat(${tabNames.length}, auto)`;
//       }catch(err){
//         console.log(err);
//       }
//       tabNames.forEach((tabButtonName, i) => {
//         //Add click event to tab
//         let tab = document.querySelector("#tab-button-" + tabButtonName);
//         tab.style.display = "grid";
//         tab.onclick = () => {
//           app.browser.logMatomoEvent(
//             "Arcade",
//             "ArcadeTabNavigationClick",
//             tabButtonName
//           );
//           tabNames.forEach((tabName, i) => {
//             if (tabName === tabButtonName) {
//               mod.active_tab = tabName;
//               document.querySelector(`#${tabName}-hero`).classList.remove("arcade-tab-hidden");
//               document.querySelector("#tab-button-"+tabName).classList.add("active-tab-button");
//             } else {
//               document.querySelector(`#${tabName}-hero`).classList.add("arcade-tab-hidden");
//               document.querySelector("#tab-button-"+tabName).classList.remove("active-tab-button");
//             }
//           });
//         };

//         //Set default tab to display
//         tabNames.forEach((tabName, i) => {
//           if (tabName === mod.active_tab) {
//             document.querySelector(`#${tabName}-hero`).classList.remove("arcade-tab-hidden");
//             document.querySelector("#tab-button-"+tabName).classList.add("active-tab-button");
//           } else {
//             document.querySelector(`#${tabName}-hero`).classList.add("arcade-tab-hidden");
//             document.querySelector("#tab-button-"+tabName).classList.remove("active-tab-button");
//           }
//         });

//       });
    
//     }else{
//       //Hide Tabs
//       document.querySelector("#arcade-tab-buttons").style = "display: none";
//     }
    
//     if (mod.viewing_game_homepage) {
//       //Events for this are same as side bar (and attached via arcade-game-sidebar.js)
//       app.browser.addElementToElement(
//         ArcadeMobileHelper(app.modules.returnModuleBySlug(mod.viewing_game_homepage)),
//         document.getElementById("arcade-mobile-helper")
//       );
//     }

//     //
//     // add games
//     //
//     this.renderArcadeTab(app, mod);

//     //insert leagues into hidden tab
//     if (league){
//       league.renderArcadeTab(app, mod); 
//     }

//     //insert observables
//     if (observer){
//       observer.renderArcadeTab(app, mod);
//     }


//     if (mod.viewing_game_homepage) { //Add game-specific posts
//       ArcadePosts.render(app, mod);
//       ArcadePosts.attachEvents(app, mod);
//     } else {  //Add summary of game pages with latest post teaser
//       ArcadeForums.render(app, mod);
//       ArcadeForums.attachEvents(app, mod);
//     }


//     // Insert Posts
//     let post = app.modules.returnModule("Post");
//     if (post){
//       post.renderMethod = "arcade";
//       post.render();
//     }


//     try {

//       //What is this?
//       if (app.browser.isSupportedBrowser(navigator.userAgent) == 0) {
//         document.querySelector(".alert-banner").style.display = "block";
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   },


//   renderArcadeTab(app, mod){
//     //No Service modules
//     if (!app.BROWSER){ return; }

//     //Announce to active module
//     if (mod.browser_active == 0 || mod.viewing_arcade_initialization_page == 1) {
//       //so any function in Arcade that triggers a refresh of the invite list
//       //will notify the active module that maybe you want to update the DOM
//       app.connection.emit('game-invite-list-update');
//       return;
//     }

//     // put active games first
//     let whereTo = 0;
//     for (let i = 0; i < mod.games.length; i++) {
//       if (mod.isMyGame(mod.games[i], app)) {
//         mod.games[i].isMine = true;
//         let replacedGame = mod.games[whereTo];
//         mod.games[whereTo] = mod.games[i];
//         mod.games[i] = replacedGame;
//         whereTo++;
//       } else {
//         mod.games[i].isMine = false;
//       }
//     }


//     let numGamesDisplayed = 0;
//     let tab = document.getElementById("arcade-hero");
//     let league = app.modules.returnModule("League");

//     if (tab) {
//       tab.innerHTML = "";


//       //On initial load of Arcade, it takes a while for Leagues array to get populated
//       //so need some way to refresh the arcade game invites...
//       let visibleLeagues = (league) ? league.filterLeagues(app) : "";

//       mod.games.forEach((invite, i) => {
//         if (!mod.viewing_game_homepage || invite.msg.game.toLowerCase() === mod.viewing_game_homepage) {
//           //console.log("INVITE: " + JSON.stringify(invite) + " -- " + mod.name);
//           let includeGame = true;
          
//           //Only filter if there are leagues to compare against
//           if (league && league.leagues.length > 0){
//             //Do some extra checking to see if we should make this game invite visible based on leagues
//             if (invite.msg.options.league){
//               includeGame = false;
//               for (let l of visibleLeagues){
//                 if (l.id == invite.msg.options.league){
//                   includeGame = true;
//                 }
//               }
//             }
//           }

//           if (invite.msg?.options["game-wizard-players-select-max"] == invite.msg.players.length){
//             includeGame = false;
//           }

//           //isMyGame is a decent safety catch for ongoing games
//           if (includeGame || mod.isMyGame(invite, app)){
//             numGamesDisplayed++;
//             app.browser.addElementToElement(ArcadeInviteTemplate(app, mod, invite, i), tab);    
//           }
//         }
//       });

//       if (numGamesDisplayed == 0) {
//         let carousel = new SaitoCarousel(app);
//         carousel.render(app, "arcade-hero");
//         if (mod.viewing_game_homepage === mod.name) {
//             carousel.addLeaves(app);
//         }
//       }

//     }
    

//     this.attachEvents(app, mod);
//   },

//   attachEvents(app, mod) {
    
//     //
//     // game invitation actions
//     //
//     let arcade_main_self = this;
//     mod.games.forEach((invite, i) => {
//       try {
//         document.querySelectorAll(`#invite-${invite.transaction.sig} .invite-tile-button`)
//           .forEach((el, i) => {
//             el.onclick = function (e) {
//               let game_sig = e.currentTarget.getAttribute("data-sig");
//               let game_cmd = e.currentTarget.getAttribute("data-cmd");

//               app.browser.logMatomoEvent("Arcade", "ArcadeAcceptInviteButtonClick", game_cmd);

//               if (game_cmd === "cancel") {
//                 if (app.wallet.returnPublicKey() !== invite.msg.originator || invite.msg.players.length >= invite.msg.players_needed){
//                   let c = confirm("Are you sure you want to cancel this game?");
//                   if (c) {
//                       arcade_main_self.cancelGame(app, mod, game_sig);
//                       return;
//                   }
//                 }else{
//                   arcade_main_self.cancelGame(app, mod, game_sig);                  
//                 }

//               }

//               if (game_cmd === "join") {
//                   arcade_main_self.joinGame(app, mod, game_sig);
//                   return;
//               }

//               if (game_cmd === "watch"){
//                 arcade_main_self.watchGame(app, mod, game_sig);
//                 return;
//               }

//               if (game_cmd === "continue") {
//                 arcade_main_self.continueGame(app, mod, game_sig);
//                 return;
//               }

//               if (game_cmd === "invite") {
//                 arcade_main_self.privatizeGame(app, mod, game_sig);
//                 return;
//               }
//               if (game_cmd === "publicize") {
//                 arcade_main_self.publicizeGame(app, mod, game_sig);
//                 return;
//               }

//             };
//           });
//       } catch (err) {
//         console.error(err);
//       }
//     });


//     mod.games.forEach((invite, i) => {
//       try {
//         document.querySelectorAll(`#invite-${invite.transaction.sig} .link_icon`)
//           .forEach((el, i) => {
//             el.onclick = function (e) {
//               let game_sig = e.currentTarget.nextElementSibling.getAttribute("data-sig");
//               mod.showShareLink(game_sig);
//             };
//           });
//         }catch(err){
//           console.error(err);
//         }
//     });
    
//   },

//   async joinGame(app, mod, game_id, confirm_join = true) {
//     let accepted_game = null;
//     let relay_mod = app.modules.returnModule("Relay");

//     mod.games.forEach((g) => {
//       if (g.transaction.sig === game_id) {
//         accepted_game = g;
//       }
//     });

//     //If following a link and it fails
//     if (!accepted_game) {
//       console.log("ERR: game not found");
//       await sconfirm("Game no longer available");
//       window.location = "/arcade";
//       return;
//     }

//     //
//     // if this requires "crypto" we need to check that the mod is installed
//     // and the minimum required amount is available
//     //
//     let txmsg = accepted_game.msg;
//     let game_options = txmsg.options;

//     try {

//       //
//       // check we have crypto module
//       //
//       if (game_options.crypto && parseFloat(game_options.stake) > 0) {
//         if (game_options.crypto !== app.wallet.returnPreferredCrypto().ticker) {
//           salert(`You must set ${game_options.crypto} as your preferred crypto to join this game`);
//           return;
//         }
//         let c = await sconfirm(`This game requires ${game_options.stake} ${game_options.crypto} to play. OK?`);
//         if (!c) {
//           return;
//         }

//         let crypto_transfer_manager = new GameCryptoTransferManager(app);
//         let success = await crypto_transfer_manager.confirmBalance(app, mod, game_options.crypto, game_options.stake);
//         if (!success){ return; }
        
//       }else{
//         if (confirm_join){
//           //We move the confirmation down here, so you don't have to click twice on crypto games
//           let c = confirm("Are you sure you want to join this game?");
//           if (!c) {
//             return;
//           }
//         }
//       }
//     } catch (err) {
//      console.log("ERROR checking if crypto-required: " + err);
//       return;
//     }

//     //Check if League Member
//     if (game_options.league){
//       let leag = app.modules.returnModule("League");
//       if (!leag.isLeagueMember(game_options.league)){
//         let conf = await sconfirm("You need to be a member to join a League-only game, join?");
//         if (conf){
//           leag.sendJoinLeagueTransaction(game_options.league);
//           salert("Joining League... It may take a minute to take effect");
//         }
//         return;
//       }
//     }


//     //
//     // not enough players? join not accept
//     //
//     let { players } = accepted_game.returnMessage();
//     let players_needed = parseInt(accepted_game.msg.players_needed);
//     let players_available = players.length;
    
//     let peers = [];
//     for (let i = 0; i < app.network.peers.length; i++) {
//       peers.push(app.network.peers[i].returnPublicKey());
//     }

//       let newtx = mod.createJoinTransaction(accepted_game);
//       app.network.propagateTransaction(newtx);

//       //
//       // try fast accept
//       //
//       if (relay_mod != null) {
//         relay_mod.sendRelayMessage(players, "arcade spv update", newtx);
//         relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
//       }
//       if (mod.debug){console.log(JSON.parse(JSON.stringify(newtx)));}

//       salert("Joining game! Please wait a moment");

//   },

//   continueGame(app, mod, game_id) {
//     let existing_game = -1;
//     let testsig = "";

//     if (app.options?.games) {
//       for (let i = 0; i < app.options.games.length; i++) {
//         if (typeof app.options.games[i].transaction != "undefined") {
//           testsig = app.options.games[i].transaction.sig;
//         } else if (typeof app.options.games[i].id != "undefined") {
//           testsig = app.options.games[i].id;
//         }
//         if (testsig === game_id) {
//           existing_game = app.options.games[i];
//         }
//       }
//     }

//     if (existing_game && existing_game !== -1) {
//       //
//       //I'm not sure this safety catch does anything
//       //I've never seen it come up
//       //
//       if (existing_game.initializing == 1) {
//         salert(
//           "Accepted Game! It may take a minute for your browser to update -- please be patient!"
//         );

//         //Make a spinner
//         let gameLoader = new GameLoader(app, mod);
//         mod.viewing_arcade_initialization_page = 1;
//         gameLoader.render(app, mod, "#arcade-main");

//         return;
//       } else {
//         //
//         // game exists, so "continue" not "join"
//         //
//         existing_game.ts = new Date().getTime();
//         existing_game.initialize_game_run = 0;
//         app.storage.saveOptions();

//         let game_mod = app.modules.returnModule(existing_game.module);
//         if (game_mod) {
//           window.location = "/" + game_mod.returnSlug().toLowerCase();
//         }
//         return;
//       }
//     }
//   },

//   /**
//    * This partially duplicates functionality of Observer Module
//    */ 
//   watchGame(app, mod, game_id){
//     app.connection.emit("arcade-observer-join-table", game_id);
//   },


//   cancelGame(app, mod, game_id) {
//     var testsig = "";

//     console.log("Click to Cancel Game: " + game_id);
//     console.log(JSON.parse(JSON.stringify(mod.games)));
//     console.log(JSON.parse(JSON.stringify(app.options.games)));

//     //
//     let createCloseTx = (game_id) =>{
//       let newtx = app.wallet.createUnsignedTransactionWithDefaultFee();
//       let my_publickey = app.wallet.returnPublicKey();
//       let peers = [];
//       for (let i = 0; i < app.network.peers.length; i++) {
//         peers.push(app.network.peers[i].returnPublicKey());
//       }

//       let msg = {
//         request: "close",
//         module: "Arcade",
//       };

//       newtx.msg = msg;
//       newtx.msg.game_id = game_id;
//       newtx = app.wallet.signTransaction(newtx);

//       console.log(JSON.parse(JSON.stringify(newtx)));

//       let relay_mod = app.modules.returnModule("Relay");
//       if (relay_mod != null) {
//         relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
//       }

//       app.network.propagateTransaction(newtx);
//     };


//     if (app.options?.games) {
//       for (let i = 0; i < app.options.games.length; i++) {
//         testsig = app.options.games[i].transaction?.sig || app.options.games[i].id;
//         if (testsig == game_id) { //If the game has been initialized
//           let gamemod = app.modules.returnModule(app.options.games[i].module);
//           if (gamemod) {
//             gamemod.resignGame(game_id, "cancellation");
//             console.log("If game engine doesn't respond, will auto close game in 2.5 seconds...");
//             //Set a fallback interval if the opponent is no longer online
//             setTimeout(()=>{
//                 createCloseTx(game_id);
//               },2.5*1000);
//             return;
//           }
//         }
//       }
//     }

//     //Fall back -- force the game to be marked as closed
//     createCloseTx(game_id);
//   },

//   //&&&&&&&&&&&&&&&&
//   privatizeGame(app, mod, game_sig) {
//     console.log(JSON.parse(JSON.stringify(mod.games)));

//     let accepted_game = null;
//     mod.games.forEach((g) => {
//       if (g.transaction.sig === game_sig) {
//         accepted_game = g;
//       }
//     });
//     if (accepted_game) {
//       console.log("Game in my open list");
//       let newtx = mod.createChangeTransaction(accepted_game, "private");
//       app.network.propagateTransaction(newtx);
    
//       let relay_mod = app.modules.returnModule("Relay");
//       if (relay_mod != null) {
//         let peers = [];
//         for (let i = 0; i < app.network.peers.length; i++) {
//           peers.push(app.network.peers[i].returnPublicKey());
//         }
//         relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
//       }
//     }

//     //Update status of the game invitation
//     Array.from(document.querySelectorAll(`#invite-${game_sig} .invite-tile-button`)).forEach(button => {
//       let game_cmd = button.getAttribute("data-cmd");
//       if (game_cmd == "invite") {
//         button.setAttribute("data-cmd", "publicize");
//         button.textContent = "PRIVATE";
//         /*let linkButton = button.parentNode.querySelector(".link_icon");
//         if (linkButton){
//           linkButton.classList.add("private");
//         }*/
//       }
//     });
//   },

//   publicizeGame(app, mod, game_sig) {
//     let accepted_game = null;
//     mod.games.forEach((g) => {
//       if (g.transaction.sig === game_sig) {
//         accepted_game = g;
//       }
//     });
 

//     if (accepted_game) {
//       console.log("Game in my open list");
//       let newtx = mod.createChangeTransaction(accepted_game, "open");
//       app.network.propagateTransaction(newtx);

//       let relay_mod = app.modules.returnModule("Relay");
//       if (relay_mod != null) {
//         let peers = [];
//         for (let i = 0; i < app.network.peers.length; i++) {
//           peers.push(app.network.peers[i].returnPublicKey());
//         }
//         relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
//       }
 
//     }
  
//     //Update status of the game invitation
//     Array.from(document.querySelectorAll(`#invite-${game_sig} .invite-tile-button`)).forEach(button => {
//       let game_cmd = button.getAttribute("data-cmd");
//       if (game_cmd == "publicize") {
//         button.setAttribute("data-cmd", "invite");
//         button.textContent = "PUBLIC";
//         /*let linkButton = button.parentNode.querySelector(".link_icon");
//         if (linkButton){
//           linkButton.classList.remove("private");
//         }*/
//       }
//     });
//   },


//   /*deleteGame(app, mod, game_id) {
//     salert(`Delete game id: ${game_id}`);

//     if (app.options.games) {
//       for (let i = 0; i < app.options.games.length; i++) {
//         if (app.options.games[i].id == game_id) {
//           let resigned_game = app.options.games[i];

//           if (resigned_game.over == 0) {
//             let game_mod = app.modules.returnModule(resigned_game.module);
//             game_mod.resignGame(game_id);
//           } else {
//             //
//             // removing game someone else ended
//             //
//             app.options.games[i].over = 1;
//             app.options.games[i].last_block = app.blockchain.last_bid;
//             app.storage.saveOptions();
//           }
//         }
//       }
//     }
//   },*/


// };
