const GamePlayerboxManagerTemplate = require("./main.template");
const GamePlayerbox = require("./playerbox");

class GamePlayerboxManager {

  constructor(app, mod, container = "") {

    this.app  = app;
    this.mod  = mod;
    this.mode = 1;	// 1 = normal - flex-container
			// 2 = poker mode

    this.container = container || ".game-playerbox-manager";

    //
    // track popups
    //
    this.playerboxes = [];
    for (let i = 0; i < mod.game.players.length; i++) {
      this.playerboxes.push(new GamePlayerbox(app, mod, this.container, mod.game.players[i], (i+1))); 
    }

  }



  render() {

    if (document.querySelector(".game-playerbox-manager")) {
        this.app.browser.replaceElementBySelector(GamePlayerboxManagerTemplate(this.app, this.mod), ".game-playerbox-manager");
    } else {
        this.app.browser.addElementToSelectorOrDom(GamePlayerboxManagerTemplate(this.app, this.mod), this.container);
    }

    //
    // render playerboxes
    //
    for (let i = 0; i < this.playerboxes.length; i++) {
      this.playerboxes[i].render();
    }

    //
    // poker mode = poker seating
    //
    if (this.mode == 2) { 

      document.querySelector(".game-playerbox-manager").classList.add("game-playerbox-seat-manager");

      let seats = this.returnPlayersBoxArray();

      //
      // make sure this player is always seat #1
      //
      let my_idx = -1;
      let s1_idx = -1;
      for (let i = 0; i < seats.length; i++) {
	if (seats[i] == 1) { s1_idx = i; }
	if ((i+1) === this.mod.game.player) { my_idx = i; }
      }
      if (my_idx != -1 && s1_idx != -1 && my_idx != s1_idx) {
alert("I AM NOT IN SEAT ONE!");
	let x = seats[s1_idx];
	let y = seats[my_idx];
	seats[s1_idx] = y;
	seats[my_idx] = x;
      }

      for (let i = 0; i < seats.length; i++) {
	let obj = document.querySelector(`.game-playerbox-${i+1}`);
	if (obj) { obj.classList.add(`game-playerbox-seat-${seats[i]}`); }
      }
    }

    this.attachEvents();

  }


  attachEvents() {
    for (let i = 0; i < this.playerboxes.length; i++) {
      this.playerboxes[i].attachEvents();
    }
  }



  onclick(fn=null, seat_num) {
    if (this.playerboxes.length >= seat_num) {
      this.playerboxes[seat_num-1].onclick(fn);
    }
  }
  updateAddress(address, seat_num) {
    if (this.playerboxes.length >= seat_num) {
      this.playerboxes[seat_num-1].updateAddress(address);
    }
  }
  updateBody(content, seat_num) {
    if (this.playerboxes.length >= seat_num) {
      this.playerboxes[seat_num-1].updateBody(content);
    }
  }
  updateGraphics(content, seat_num) {
    if (this.playerboxes.length >= seat_num) {
      this.playerboxes[seat_num-1].updateGraphics(content);
    }
  }
  updateUserline(userline, seat_num) {
    if (this.playerboxes.length >= seat_num) {
      this.playerboxes[seat_num-1].updateUserline(userline);
    }
  }


  setActive(num) {

  }

  setInactive(num) {

  }


  //
  // we want to make these functions obsolete
  //
  addClass(classname, pnum) {
    let div = document.querySelector(`.game-playerbox-body-${pnum}`);
    div.classList.add(classname);
  }

  removeClass(classname, pnum) {
    let div = document.querySelector(`#game-playerbox-body-${pnum}`);
    div.classList.remove(classname);
  }






  /** 
   * @param {int} pnum - player number, e.g. {1, 2, ... # of players}
   * Converts the player number to a "seat position" This player is always 1, unless you render with game.seats
   */
  playerBox(pnum) {

    //For attempts to access playerbox before rendered
    if (!this.mod) {
      return 1;
    } 
    
    if (!this.mod.game.players.includes(this.app.wallet.returnPublicKey())) {
      let player_box = this.returnViewBoxArray();
      if (pnum <= 0) {
        return 1;
      }
      return player_box[pnum - 1];
    } else {
      let player_box = this.returnPlayersBoxArray();
        
      if (pnum <= 0) {
        return player_box[0]; //Default is first position
      }
      
      //Shift players in Box Array according to whose browser, so that I am always in seat 1
      let prank = 1 + this.mod.game.players.indexOf(this.app.wallet.returnPublicKey()); //Equivalent to mod.player ?
      let seat = pnum - prank;
   
      if (seat < 0) {
        seat += this.mod.game.players.length;
      }
      return player_box[seat];
    }
  }

  /**
   * Returns either game.seats or the default poker table seating schedule
   * 5 4 3
   * 6 1 2
   */
  returnPlayersBoxArray() {
    let player_box = [];
    if (this.mod.game.players.length == 1) {
      player_box = [1];
    }
    if (this.mod.game.players.length == 2) {
      player_box = [1, 4];
    }
    if (this.mod.game.players.length == 3) {
      player_box = [1, 3, 5];
    }
    if (this.mod.game.players.length == 4) {
      player_box = [1, 2, 4, 6];
    }
    if (this.mod.game.players.length == 5) {
      player_box = [1, 2, 3, 5, 6];
    }
    if (this.mod.game.players.length == 6) {
      player_box = [1, 2, 3, 4, 5, 6];
    }
    return player_box;
  }


  /**
   * Returns poker table seating schedule for observer mode
   * 3 4 5
   * 2 _ 6
   */
  returnViewBoxArray() {
    let player_box = [];

    if (this.mod.game.players.length == 1) {
      player_box = [4];
    }
    if (this.mod.game.players.length == 2) {
      player_box = [3, 5];
    }
    if (this.mod.game.players.length == 3) {
      player_box = [3, 4, 5];
    }
    if (this.mod.game.players.length == 4) {
      player_box = [2, 3, 5, 6];
    }
    if (this.mod.game.players.length == 5) {
      player_box = [2, 3, 4, 5, 6];
    }

    return player_box;
  }


}

module.exports = GamePlayerboxManager;


