const GamePlayerboxManagerTemplate = require("./game-playerbox.template");
const GamePlayerbox = require("./playerbox");

class GamePlayerboxManager {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container || ".game-playerbox-manager";
    this.playerboxes = [];
    this.mode = 1; // 1 = normal - flex-container
    // 2 = poker mode
    // 3 = freestyle (no container)
  }

  async render() {

    //
    // create playerboxes to render
    //
    if (this.playerboxes.length < this.mod.game.players.length) {
      for (let i = 0; i < this.mod.game.players.length; i++) {
        this.playerboxes.push(
          new GamePlayerbox(this.app, this.mod, this.container, this.mod.game.players[i], i + 1)
        );
      }
    }

    //
    // insert container
    //
    if (this.mode != 3) {
      if (document.querySelector(".game-playerbox-manager")) {
        this.app.browser.replaceElementBySelector(
          GamePlayerboxManagerTemplate(this.app, this.mod),
          ".game-playerbox-manager"
        );
      } else {
        this.app.browser.addElementToSelectorOrDom(
          GamePlayerboxManagerTemplate(this.app, this.mod),
          this.container
        );
      }
    }

    //
    // render playerboxes
    //
    for (let i = 0; i < this.playerboxes.length; i++) {
      await this.playerboxes[i].render();
    }

    //
    // poker mode => add seating
    //
    if (this.mode == 2) {
      document
        .querySelector(".game-playerbox-manager")
        .classList.add("game-playerbox-seat-manager");

      let seats = this.returnPlayersBoxArray();

      //
      // make sure this player is always seat #1
      //
      let my_idx = -1;
      let s1_idx = -1;
      for (let i = 0; i < seats.length; i++) {
        if (seats[i] == 1) {
          s1_idx = i;
        }
        if (i + 1 === this.mod.game.player) {
          my_idx = i;
        }
      }
      if (my_idx != -1 && s1_idx != -1 && my_idx != s1_idx) {
        let x = seats[s1_idx];
        let y = seats[my_idx];
        seats[s1_idx] = y;
        seats[my_idx] = x;
      }

      for (let i = 0; i < seats.length; i++) {
        let obj = document.querySelector(`.game-playerbox-${i + 1}`);
        if (obj) {
          obj.classList.add(`game-playerbox-seat-${seats[i]}`);
        }
      }
    }

    await this.attachEvents();

  }

  async attachEvents() {
    for (let i = 0; i < this.playerboxes.length; i++) {
      await this.playerboxes[i].attachEvents();
    }
  }

  onclick(fn = null, player_number) {
    if (this.playerboxes.length >= player_number) {
      this.playerboxes[player_number - 1].onclick(fn);
    }
  }
  updateAddress(address, player_number) {
    if (this.playerboxes.length >= player_number) {
      this.playerboxes[player_number - 1].updateAddress(address);
    }
  }
  updateBody(content, player_number) {
    if (this.playerboxes.length >= player_number) {
      this.playerboxes[player_number - 1].updateBody(content);
    }
  }
  updateGraphics(content, player_number) {
    if (this.playerboxes.length >= player_number) {
      this.playerboxes[player_number - 1].updateGraphics(content);
    }
  }
  updateUserline(userline, player_number) {
    if (this.playerboxes.length >= player_number) {
      this.playerboxes[player_number - 1].updateUserline(userline);
    }
  }

  setActive(player_number, deactivate_others = true) {
    //
    // remove other active playerboxes
    //
    let qs2 = `.game-playerbox.active`;
    let obj2 = document.querySelectorAll(qs2).forEach((el) => {
      el.classList.remove("active");
    });

    //
    // set as active
    //
    let qs = `.game-playerbox-${player_number}`;
    let obj = document.querySelector(qs);
    if (obj) {
      obj.classList.add("active");
    }
  }

  setInactive(player_number = -1) {
    if (player_number == -1) {
      this.setActive(-1); // de-activate others, but won't set anything active
      return;
    }

    let qs = `.game-playerbox-${player_number}`;
    let obj = document.querySelector(qs);
    if (obj) {
      obj.classList.remove("active");
    }
  }

  /**
   * Alert Next player with visual UI changes on player box. Done with predefined css classes
   * @param {int} pnum - the player number (according to game), -1 means this player
   * @param {string} alertType - the alert type that should be displayed  supported: 'flash', 'shake'
   * @param {string} stopTrigger - the browser event that should  stop an alert supported: 'click', 'mousemove'
   * @param {int} duration - the duration in milliseconds in which the alert should be displayed in the event of no stop trigger
   */
  alertPlayer(player_number = -1, alertType = "flash", stopTrigger = null, duration = 4000) {
    let selector = `.game-playerbox-${player_number}`;
    let box = document.querySelector(selector);
    if (box) {
      box.classList.add(alertType);
    }

    if (stopTrigger) {
      window.addEventListener(stopTrigger, (e) => {
        box.classList.remove(alertType);
      });
    } else {
      setTimeout(() => {
        box.classList.remove(alertType);
      }, duration);
    }
  }

  /**
   *
   * everything that follows is a support function that we do not want outside
   * elements to interact with...
   *
   * @param {int} pnum - player number, e.g. {1, 2, ... # of players}
   * Converts the player number to a "seat position" This player is always 1, unless you render with game.seats
   */
  async playerBox(pnum) {

    //For attempts to access playerbox before rendered
    if (!this.mod) {
      return 1;
    }

    if (!this.mod.game.players.includes(await this.app.wallet.getPublicKey())) {
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
      let prank = 1 + this.mod.game.players.indexOf(await this.app.wallet.getPublicKey()); //Equivalent to mod.player ?
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
