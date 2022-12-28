const JSON = require("json-bigint");
const ArcadeMainTemplate = require("./main.template");
const ArcadeMenu = require("./menu");
const ArcadeBanner = require("./banner");
const SaitoSidebar = require('./../../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class ArcadeMain {

  constructor(app, mod, container=""){

    this.app = app;
    this.mod = mod;

    //
    // left sidebar
    //
    this.sidebar = new SaitoSidebar(this.app, this.mod, ".saito-container");
    this.sidebar.align = "nope";
    this.menu = new ArcadeMenu(this.app, this.mod, ".saito-sidebar.left");
    this.sidebar.addComponent(this.menu);
    this.banner = new ArcadeBanner(this.app, this.mod, ".arcade-central-panel");



    //
    // load init page
    //
    app.connection.on("arcade-launch-game-init", (game_id) => {

      this.mod.is_game_initializing = true;

      this.mod.initialization_timer = setInterval(() => {

        let game_idx = -1;
        if (this.app.options.games != undefined) {
          for (let i = 0; i < this.app.options.games.length; i++) {
            if (this.app.options.games[i].id == game_id) {
              game_idx = i;
            }
          }
        } 
        
        if (game_idx == -1) { return; }
          
        if (this.app.options.games[game_idx].initializing == 0) {
    
          //
          // check we don't have a pending TX for this game...
          //
          let ready_to_go = 1;
      
          if (this.app.wallet.wallet.pending.length > 0) {
            for (let i = 0; i < this.app.wallet.wallet.pending.length; i++) {
              let thistx = new saito.transaction(JSON.parse(this.app.wallet.wallet.pending[i]));
              let thistxmsg = thistx.returnMessage();
              if (thistxmsg.module == this.app.options.games[game_idx].module) {
                if (thistxmsg.game_id == this.app.options.games[game_idx].id) {
                  ready_to_go = 0;
                }
              }
            }  
          }

          if (ready_to_go == 0) {
            console.log("transaction for this game still in pending...");
            return;
          }

          clearInterval(this.mod.initialization_timer);

        }
      }, 1000);

    });

  }

  

  render() {

    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(ArcadeMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelectorOrDom(ArcadeMainTemplate(), this.container);
    }

    this.sidebar.render();

//    if (Math.random() < 0.5) {
//      this.banner.render();
//    } else {
      this.app.modules.renderInto(".arcade-invites-box");
//    }


    //
    // appspace modules
    //
    this.app.modules.renderInto(".arcade-leagues");

  }



  attachEvents() {

/****    
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

              if (game_cmd === "cancel") {
                if (app.wallet.returnPublicKey() !== invite.msg.originator || invite.msg.players.length >= invite.msg.players_needed){
                  let c = confirm("Are you sure you want to cancel this game?");
                  if (c) {
                      mod.cancelGame(game_sig);
                      return;
                  }
                }else{
                  mod.cancelGame(game_sig);                  
                }

              }

              if (game_cmd === "join") {
                  mod.joinGame(game_sig);
                  return;
              }

              if (game_cmd === "continue") {
                mod.continueGame(game_sig);
                return;
              }

              if (game_cmd === "watch"){
                app.connection.emit("arcade-observer-join-table", game_sig);
                return;
              }

              if (game_cmd === "invite") {
                arcade_main_self.privatizeGame(app, mod, game_sig);
                return;
              }
              if (game_cmd === "publicize") {
                arcade_main_self.publicizeGame(app, mod, game_sig);
                return;
              }

            };
          });
      } catch (err) {
        console.error(err);
      }
    });


    mod.games.forEach((invite, i) => {
      let linkBtn = document.querySelector(`#invite-${invite.transaction.sig} .link_icon`);
      if (linkBtn){
        linkBtn.onclick = () => {
          mod.showShareLink(invite.transaction.sig);
        };
      }
    });
****/
  }


/*****

  renderArcadeTab(app, mod){
    //No Service modules
    if (!app.BROWSER){ return; }

    //Announce to active module
    if (mod.browser_active == 0 || mod.viewing_arcade_initialization_page == 1) {
      //so any function in Arcade that triggers a refresh of the invite list
      //will notify the active module that maybe you want to update the DOM
      app.connection.emit('game-invite-list-update');
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


    let numGamesDisplayed = 0;
    let tab = document.getElementById("arcade-hero");
    let league = app.modules.returnModule("League");

    if (tab) {
      tab.innerHTML = "";


      //On initial load of Arcade, it takes a while for Leagues array to get populated
      //so need some way to refresh the arcade game invites...
      let visibleLeagues = (league) ? league.filterLeagues(app) : "";

      mod.games.forEach((invite, i) => {
        if (mod.viewing_game_homepage == "Arcade" || invite.msg.game === mod.viewing_game_homepage) {
          //console.log("INVITE: " + JSON.stringify(invite) + " -- " + mod.name);
          let includeGame = true;
          
          //Only filter if there are leagues to compare against
          if (league && league.leagues.length > 0){
            //Do some extra checking to see if we should make this game invite visible based on leagues
            if (invite.msg.options.league){
              includeGame = false;
              for (let l of visibleLeagues){
                if (l.id == invite.msg.options.league){
                  includeGame = true;
                }
              }
            }
          }

          if (invite.msg?.options["game-wizard-players-select-max"] == invite.msg.players.length){
            includeGame = false;
          }

          //isMyGame is a decent safety catch for ongoing games
          if (includeGame || mod.isMyGame(invite, app)){
            numGamesDisplayed++;
            app.browser.addElementToElement(ArcadeInviteTemplate(app, mod, invite, i), tab);    
          }
        }
      });

      if (mod.viewing_game_homepage == "Arcade" && numGamesDisplayed == 0) {
        let observer = app.modules.returnModule("Observer");
        if (!observer || observer.games.length == 0){
          let carousel = new SaitoCarousel(app);
          carousel.render(app, "arcade-hero");
          if (mod.viewing_game_homepage === mod.name) {
              carousel.addLeaves(app);
          }
        }
      }

    }
    

    this.attachEvents(app, mod);
  }



  privatizeGame(app, mod, game_sig) {
    console.log(JSON.parse(JSON.stringify(mod.games)));

    let accepted_game = null;
    mod.games.forEach((g) => {
      if (g.transaction.sig === game_sig) {
        accepted_game = g;
      }
    });
    if (accepted_game) {
      console.log("Game in my open list");
      let newtx = mod.createChangeTransaction(accepted_game, "private");
      app.network.propagateTransaction(newtx);
      app.connection.emit("send-relay-message", {recipient:"PEERS", request:"arcade spv update", data:newtx});

    }

    //Update status of the game invitation
    Array.from(document.querySelectorAll(`#invite-${game_sig} .invite-tile-button`)).forEach(button => {
      let game_cmd = button.getAttribute("data-cmd");
      if (game_cmd == "invite") {
        button.setAttribute("data-cmd", "publicize");
        button.textContent = "PRIVATE";
      }
    });
  }

  publicizeGame(app, mod, game_sig) {
    let accepted_game = null;
    mod.games.forEach((g) => {
      if (g.transaction.sig === game_sig) {
        accepted_game = g;
      }
    });
 

    if (accepted_game) {
      console.log("Game in my open list");
      let newtx = mod.createChangeTransaction(accepted_game, "open");
      app.network.propagateTransaction(newtx);

      let relay_mod = app.modules.returnModule("Relay");
      if (relay_mod != null) {
        let peers = [];
        for (let i = 0; i < app.network.peers.length; i++) {
          peers.push(app.network.peers[i].returnPublicKey());
        }
        relay_mod.sendRelayMessage(peers, "arcade spv update", newtx);
      }
 
    }
  
    //Update status of the game invitation
    Array.from(document.querySelectorAll(`#invite-${game_sig} .invite-tile-button`)).forEach(button => {
      let game_cmd = button.getAttribute("data-cmd");
      if (game_cmd == "publicize") {
        button.setAttribute("data-cmd", "invite");
        button.textContent = "PUBLIC";
      }
    });
  }

*****/

}

module.exports = ArcadeMain;
