const JSON = require("json-bigint");
const ArcadeMainTemplate = require("./main.template");
const ArcadeMenu = require("./menu");
const GameSlider = require("../game-slider");
const ArcadeInitializer = require("./initializer");
const SaitoSidebar = require('./../../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class ArcadeMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;

    //
    // left sidebar
    //
    this.sidebar = new SaitoSidebar(this.app, this.mod, ".saito-container");
    this.sidebar.align = "nope";
    this.menu = new ArcadeMenu(this.app, this.mod, ".saito-sidebar.left");
    this.sidebar.addComponent(this.menu);
    this.slider = new GameSlider(this.app, this.mod, ".arcade-game-slider");
    this.initializer = new ArcadeInitializer(this.app, this.mod, ".arcade-central-panel");

    //
    // load init page
    //
    app.connection.on("arcade-game-initialize-render-request", (game_id) => {
      document.querySelector(".arcade-central-panel").innerHTML = "";
      this.mod.is_game_initializing = true;
      this.slider.hide();
      this.initializer.render(game_id);
    });

  }



  render() {

    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(ArcadeMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelectorOrDom(ArcadeMainTemplate(), this.container);
    }

    this.sidebar.render();

    //
    // slider
    //
    this.slider.render();

    //
    // invite manager
    //
    this.app.modules.renderInto(".arcade-invites-box");

    //
    // appspace modules
    //
    this.app.modules.renderInto(".arcade-leagues");

    this.attachEvents();

  }



  attachEvents() {

    var scrollableElement = document.querySelector(".saito-container");
    var sidebar = document.querySelector(".saito-sidebar.right");
    var scrollTop = 0;
    var stop = 0;

    scrollableElement.addEventListener("scroll", (e) => {
      if (window.innerHeight - 150 < sidebar.clientHeight) {
        if (scrollTop < scrollableElement.scrollTop) {
          stop = window.innerHeight - sidebar.clientHeight + scrollableElement.scrollTop;
          if (scrollableElement.scrollTop + window.innerHeight > sidebar.clientHeight) {
            sidebar.style.top = stop + "px";
          }
        } else {
          if (stop > scrollableElement.scrollTop) {
            stop = scrollableElement.scrollTop;
            sidebar.style.top = stop + "px";
          }
        }
      } else {
        stop = scrollableElement.scrollTop;
        sidebar.style.top = stop + "px";
      }
      scrollTop = scrollableElement.scrollTop;
    });

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

}

module.exports = ArcadeMain;

