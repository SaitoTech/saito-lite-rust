const GamePlayerBoxTemplate = require("./playerbox.template");
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
    this.saito_user = new SaitoUser(this.app, this.mod, this.publickey); 
  }

  render() {

   // 
   // add or replace playerbox component 
   // 
   if (document.querySelector(`.playerbox-${this.seat_num}`)) {
      this.app.browser.replaceElementBySelector(SaitoUserTemplate(this), `.playerbox-${this.seat_num}`);
    } else {
      this.app.browser.addElementToSelector(SaitoUserTemplate(this), `${this.container}`);
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
    this.app.browser.makeDraggable(`.playerbox-${this.seat_num}`, `.playerbox-head-${this.seat_num}`);
    document.querySelector(`#player-box-head-${player}`).style.cursor = "grab";
  }


  hide() {
    if (document.querySelector(`.playerbox-${this.seat_num}`)) {
      document.querySelector(`.playerbox-${this.seat_num}`).style.display = "none";
    }
  }

  show() {
    if (document.querySelector(`.playerbox-${this.seat_num}`)) {
      document.querySelector(`.playerbox-${this.seat_num}`).style.display = "flex";
    }
  }

}

module.exports = GamePlayerBox;
