const GamePlayerboxTemplate = require("./playerbox.template");
const SaitoUser = require("./../saito-user/saito-user");

/**
 * Basic template:
 *
 *   Head -- displays SaitoUser component
 *   Body -- information space for games
 *
 */
class GamePlayerBox {
  /**
   *  @constructor
   *  @param app - Saito app
   */
  constructor(app, mod, container = "", publickey = "", seat_num = 0) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.publickey = publickey;
    this.seat_num = seat_num;
    this.saito_user = new SaitoUser(this.app, this.mod, `.game-playerbox-head-${this.seat_num}`, this.publickey, `Player ${this.seat_num}`, '<div class="game-playerbox-graphics"></div>'); 
  }

  onclick(fn=null) {
    if (document.querySelector(`.game-playerbox-${this.seat_num}`)) {
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user`).setAttribute("data-disable", true);
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-userline`).setAttribute("data-disable", true);
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-address`).setAttribute("data-disable", true);
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-identicon`).setAttribute("data-disable", true);
      document.querySelector(`.game-playerbox-${this.seat_num}`).onclick = (e) => { fn(); };
    }
  }

  updateAddress(address) {
    if (document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-address`)) {
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-address`).innerHTML = address;
    }
  }
  updateBody(content) {
    if (document.querySelector(`.game-playerbox-body-${this.seat_num}`)) {
      document.querySelector(`.game-playerbox-body-${this.seat_num}`).innerHTML = content;
    }
  }
  updateGraphics(content) {
    if (document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .game-playerbox-graphics`)) {
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .game-playerbox-graphics`).innerHTML = content;
    }
  }
  updateUserline(userline) {
    if (document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-userline`)) {
      document.querySelector(`.game-playerbox-head-${this.seat_num} .saito-user .saito-userline`).innerHTML = userline;
    }
  }


  render() {

   // 
   // add or replace playerbox component 
   // 
   if (document.querySelector(`.game-playerbox-${this.seat_num}`)) {
      this.app.browser.replaceElementBySelector(GamePlayerboxTemplate(this), `.game-playerbox-${this.seat_num}`);
    } else {
      this.app.browser.addElementToSelector(GamePlayerboxTemplate(this), `${this.container}`);
    }

    //
    // render user into playerbox head
    //
    this.saito_user.render();
   
    //
    // attach events
    //
    this.attachEvents();

  }

  attachEvents() { 

    //
    // make draggable
    //
    this.app.browser.makeDraggable(`game-playerbox-${this.seat_num}`, `game-playerbox-head-${this.seat_num}`);
    document.querySelector(`#game-playerbox-head-${this.seat_num}`).style.cursor = "grab";
  }


  hide() {
    if (document.querySelector(`.game-playerbox-${this.seat_num}`)) {
      document.querySelector(`.game-playerbox-${this.seat_num}`).style.display = "none";
    }
  }

  show() {
    if (document.querySelector(`.game-playerbox-${this.seat_num}`)) {
      document.querySelector(`.game-playerbox-${this.seat_num}`).style.display = "flex";
    }
  }

}

module.exports = GamePlayerBox;
