const GamePlayerBoxTemplate = require("./game-playerbox.template");

/**
 * A Class to Make Playerboxes for displaying information about all the players in the game
 * Class converts Player numbers from game into user-oriented ids to distinguish this player from the opponents
 * For example, in a 2-player game each player's own playerbox will have -1 suffixed to all the div id's and the opponent's playerbox will have -4 as the suffix on each of the div ids
 * This player has a status class added by default for compatibility with gameTemplate functions to updateStatus (a way to pass information to the player and insert controls)
 *
 * PlayerBox vs HUD. PlayerBox is best when having information about each of the players is important to gameplay. Playerbox can handle UI controls (best for text menus),
 * but HUD is more flexible for inserting different kinds of clickable options to interact with the game.
 *
 * Basic template:
 *   Name --- a Head for the Player's identicon and name
 *   Info --- a Div for Information (formatted to the players specification)
 *   Log --- a Div for Player log (to include additional information),
 *         this defaults to status for the player and is used by some games for interactive controls
 *   Graphic --- a Div for graphical elements, such a dealt hand of cards
 *
 *   Name is the only mandatory and pre-defined part of Player-Box
 *   You may insert whatever HTML you want into Info, Log, or Graphic.
 *   Info can be hidden/displayed independently of the Player-Box
 *   Graphic can be assigned classnames for more flexible display behavior (such as outside the player-box)
 */
class GamePlayerBox {
  /**
   *  @constructor
   *  @param app - Saito app
   */
  constructor(app, mod) {
    this.app = app;
    this.game_mod = mod;
    this.show_observer_box = true;
    this.rendered = false;

  }

  /**
   * Creates player boxes according to number of players in game
   * Automatically assigns unique id #s to divs in DOM, but can be specified by setting a seats property in game object
   */
  render() {

    try {
      this.rendered = true;
      let boxes = document.querySelectorAll(".player-box");
      for (let box of boxes){
        box.remove();
      }

      let i = (this.show_observer_box) ? 0 : 1;
      for (; i <= this.game_mod.game.players.length; i++) {
        let player = this.playerBox(i);
        if (!document.getElementById(`player-box-${player}`)) {
          this.app.browser.addElementToDom(GamePlayerBoxTemplate(player));
          this.refreshName(i); //Player names included in box by default
        }
      }

      this.attachEvents();
    } catch (err) {
      console.log("Render error: ", err);
    }
  }

  /** Default event -- double click player-box head to launch chat window with player */
  attachEvents() {
    let chatmod = null;
    let pb_self = this;
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].slug === "chat") {
        chatmod = this.app.modules.mods[i];
      }
    }

    for (let player = 1; player <= this.game_mod.game.players.length; player++) {
      let boxId = this.playerBox(player);
      $(`#player-box-head-${boxId}`).off();
      if (pb_self.game_mod.game.players[player - 1] !== pb_self.app.wallet.returnPublicKey()) {
        $(`#player-box-head-${boxId}`).on("dblclick", function () {
          pb_self.app.connection.emit("open-chat-with", {key: pb_self.game_mod.game.players[player - 1]});
        });
      }
    }
  }

  /**
   * Adds draggability to all the playerboxes (not a default setting)
   */
  makeDraggable() {
    try {
      let groupedOpponents = document.getElementById("opponentbox");
      for (let i = 1; i <= this.game_mod.game.players.length; i++) {
        let player = this.playerBox(i);
        if (
          !document.getElementById(`player-box-${player}`) ||
          !document.getElementById(`player-box-head-${player}`)
        ) {
          console.log("Null DOM elements for Playerbox");
          return -1;
        }
        if (i == this.game_mod.game.player || !groupedOpponents) {
          this.app.browser.makeDraggable(`player-box-${player}`, `player-box-head-${player}`);
          document.querySelector(`#player-box-head-${player}`).style.cursor = "grab";
        }
      }
      if (groupedOpponents) {
        this.app.browser.makeDraggable("opponentbox");
      }
    } catch (err) {
      console.log("Events error:", err);
    }
  }

  /**  Hide all Player-boxes  */
  hide() {
    try {
      for (let i = 1; i <= this.game_mod.game.players.length; i++) {
        let player = this.playerBox(i);
        if (document.getElementById(`player-box-${player}`)) {
          document.getElementById(`player-box-${player}`).style.display = "none";
        }
      }
    } catch (err) { }
  }

  /** Show all playerboxes */
  show() {
    try {
      for (let i = 1; i <= this.game_mod.game.players.length; i++) {
        let player = this.playerBox(i);
        if (document.getElementById(`player-box-${player}`)) {
          document.getElementById(`player-box-${player}`).style.display = "flex";
        }
      }
    } catch (err) { }
  }

  /**
   * Groups all "opponent" playerboxes into a wrapper division
   * Sometimes cleaner to have all the opponent boxes together rather than around a poker table
   */
  groupOpponents(onlyOpponents = true) {
    let oBox = document.getElementById("opponentbox");

    if (!oBox) {
      let html = `<div class="opponents" id="opponentbox"></div>`;
      oBox = this.app.browser.htmlToElement(html);
      if (document.getElementById("player-box-1")){
        document.querySelector("#player-box-1").after(oBox); //Put new wrapper just after the player box  
      }else{
        document.body.append(oBox);
      }
      
    }

    let opponents = this.returnPlayersBoxArray();
    if (!this.game_mod.game.players.includes(this.app.wallet.returnPublicKey())){
      opponents = this.returnViewBoxArray();
    }else{
      //Only filter me if I even have a player box
      if (onlyOpponents) {
        opponents.shift(); //Remove the active player
      }
    }
    for (let o of opponents) {
      let pbo = document.querySelector(`#player-box-${o}`);
      let pbho = document.querySelector(`#player-box-head-${o}`);
      if (!pbo || !pbho) {
        console.log("DOM failure");
        return;
      }
      //Unset draggable (if activated)
      pbo.removeAttribute("style");
      pbho.removeAttribute("style");

      //Move Opponent Playerbox into container
      oBox.append(pbo);
    }
    //Make them draggable as a unit
    //this.app.browser.makeDraggable("opponentbox");
  }

  /**
   * @param {int} pnum - player number, e.g. {1, 2, ... # of players}
   * Converts the player number to a "seat position" This player is always 1, unless you render with game.seats
   */
  playerBox(pnum) {
    //For attempts to access playerbox before rendered
    if (!this.game_mod) {
      return 1;
    }

    if (!this.game_mod.game.players.includes(this.app.wallet.returnPublicKey())) {
      let player_box = this.returnViewBoxArray();
      //console.log("*** Playerbox: Using view box");
      if (pnum <= 0) {
        return 1; //Default is first position
      }
      return player_box[pnum - 1];
    } else {
      let player_box = this.returnPlayersBoxArray();

      if (pnum <= 0) {
        return player_box[0]; //Default is first position
      }

      //Shift players in Box Array according to whose browser, so that I am always in seat 1
      let prank = 1 + this.game_mod.game.players.indexOf(this.app.wallet.returnPublicKey()); //Equivalent to game_mod.player ?
      let seat = pnum - prank;

      if (seat < 0) {
        seat += this.game_mod.game.players.length;
      }
      return player_box[seat];
    }
  }

  /**
   * Returns either game.seats or the default poker table seating schedule
   * 5 4 3
   * 6 1 2  ?? --> CSS this way
   */
  returnPlayersBoxArray() {
    let player_box = [];
    if (this.game_mod.seats) {
      player_box = this.game_mod.seats;
    } else {
      if (this.game_mod.game.players.length == 1) {
        player_box = [1];
      }
      if (this.game_mod.game.players.length == 2) {
        player_box = [1, 4];
      }
      if (this.game_mod.game.players.length == 3) {
        player_box = [1, 3, 5];
      }
      if (this.game_mod.game.players.length == 4) {
        player_box = [1, 2, 4, 6];
      }
      if (this.game_mod.game.players.length == 5) {
        player_box = [1, 2, 3, 5, 6];
      }
      if (this.game_mod.game.players.length == 6) {
        player_box = [1, 2, 3, 4, 5, 6];
      }
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

    if (this.game_mod.game.players.length == 1) {
      player_box = [4];
    }
    if (this.game_mod.game.players.length == 2) {
      player_box = [3, 5];
    }
    if (this.game_mod.game.players.length == 3) {
      player_box = [3, 4, 5];
    }
    if (this.game_mod.game.players.length == 4) {
      player_box = [2, 3, 5, 6];
    }
    if (this.game_mod.game.players.length == 5) {
      player_box = [2, 3, 4, 5, 6];
    }

    return player_box;
  }

  /**
   * Adds a class to each of the playerboxes
   * @param {string} className - user defined class (for css or DOM hacking)
   * @param {boolean} isStub - flag for whether to add a numerical suffic to classname so you can tell apart playerboxes
   * This function [addClassAll("poker-seat")] is required for Player-Box to accurately render around a card table
   */
  addClassAll(className, isStub = true) {
    if (isStub) {
      for (let i = 1; i <= 9; i++) {
        let box = document.querySelector(`#player-box-${i}`);
        if (box) {
          box.classList.add(`${className}${i}`);
        }
      }
    } else {
      let boxes = document.querySelectorAll(".player_box");
      for (let box of boxes) {
        box.classList.add(className);
      }
    }
  }

  /**
   * Individually a classname to one of the playerboxes
   * @param {string} className - name of class
   * @param {int} player - the player number (according to game), -1 means this player
   */
  addClass(className, player = -1) {
    let selector = "#player-box-" + this.playerBox(player);
    let box = document.querySelector(selector);
    if (box) {
      box.classList.add(className);
    }
  }

  /**
   * Add a class name to the "graphical" subdivision of each playerbox
   * @param {string} className - name of class
   */
  addGraphicClass(className) {
    let playerBoxes = document.querySelectorAll(".player-box-graphic");
    for (let hand of playerBoxes) {
      hand.classList.remove(className);
      hand.classList.add(className);
    }
  }

  /**
   * Adds a "status" class to player-box log of this player so that updateStatus functions
   * render in the playerbox
   */
  addStatus() {
    let div = document.querySelector(`#player-box-log-${this.playerBox(-1)}`);
    if (div) {
      div.classList.add("status");
    }
  }

  /*
   * Helper class for updating different sections of Player-Box
   */
  _updateDiv(selector, html) {
    try {
      let div = document.querySelector(selector);
      if (div) {
        div.innerHTML = html;
      } else { console.log(selector + " not found"); }
    } catch (err) { console.log("could not update div"); }
  }

  /**
   * Refresh Player Name (Player-Boxes show Identicon + Username in top line)
   * @param {int} pnum - the player number (according to game), -1 means this player
   * @param {string} name - a user-provided name. If blank, will use whatever name is associated with the wallet
   * @param {stirng} nameClass - a customizable className for the players display name
   */
  refreshName(pnum, name = "", nameClass = "") {
    let selector = "#player-box-head-" + this.playerBox(pnum);

    let playerKey = (pnum >= 1) ? this.game_mod.game.players[pnum - 1] : this.app.wallet.returnPublicKey();
    let identicon = this.app.keychain.returnIdenticon(playerKey);

    if (name == "") {
      name = this.app.keychain.returnUsername(playerKey);

      if (!name){
        console.log("Playerbox not finding player name --- ");
        console.log(`Player ${pnum}: ${playerKey}`);
        console.log("Keys returns: "+this.app.keychain.returnUsername(playerKey));
        console.log("Alt keys returns: "+ this.app.keychain.returnIdentifierByPublicKey(playerKey));
        name = playerKey;
      }
      if (name.includes("...")){
        name = `Player ${pnum}`;
      }
      if (name.includes("@")){
        name = name.substring(0, name.indexOf("@"));
      }

    }
    let html = identicon ? `<img class="player-identicon" src="${identicon}">` : "";
    html += `<div class="player-box-head-name saito-playername ${nameClass}" data-id="${playerKey}">${name}</div>`;
    this._updateDiv(selector, html);
  }

  refreshTitle(html, pnum = -1){
    let selector = "#player-box-head-" + this.playerBox(pnum);    
    this._updateDiv(selector, html); 
  }

  /**
   * Insert provided html into the graphic subdivision of playerbox
   * @param {string} html - information to be displayed
   * @param {int} pnum - the player number (according to game), -1 means this player
   */
  refreshGraphic(html, pnum = -1) {
    this._updateDiv(`#player-box-graphic-${this.playerBox(pnum)}`, html);
  }


  appendGraphic(html, pnum = -1){
     try {
      let div = document.querySelector(`#player-box-graphic-${this.playerBox(pnum)}`);
      if (div) {
        div.innerHTML += html;
      } 
    } catch (err) { console.warn("could not update graphic div:", err); }
  }

  /**
   * Query selects a dom element and inserts into the given player's graphics box
   * @param {string} elem_id - id of an already existing dom element
   * @param {int} pnum - the player number (according to game), -1 means this player
   */
  insertGraphic(elem_id, pnum = -1) {
    let div = document.getElementById(`player-box-graphic-${this.playerBox(pnum)}`);
    let elm = document.getElementById(elem_id);
    if (div && elm) {
      div.append(elm);
    }
  }

  /**
   * Insert provided html into the log subdivision of playerbox
   * @param {string} html - information to be displayed
   * @param {int} pnum - the player number (according to game), -1 means this player
   */
  refreshLog(html, pnum = -1) {
    this._updateDiv(`#player-box-log-${this.playerBox(pnum)}`, html);
  }

  appendLog(html, pnum = -1){
    try{
      let div = document.getElementById(`player-box-log-${this.playerBox(pnum)}`);
      if (div){
        div.innerHTML += html;
        console.log(html);
      }else{
        console.log(`player-box-log-${this.playerBox(pnum)} not found`);
      }
    }catch(err) { console.warn("could not update log: ", err); }
  }

  /**
   * Insert provided html into the log subdivision of playerbox
   * @param {string} html - information to be displayed
   * @param {int} pnum - the player number (according to game), -1 means this player
   */
  refreshInfo(html, pnum = -1) {
    this._updateDiv(`#player-box-info-${this.playerBox(pnum)}`, html);
  }

  /**
   * Hide the info subdivision of a given player-box
   * @param {int} pnum - the player number (according to game), -1 means this player
   */
  hideInfo(pnum = -1) {
    let selector = "#player-box-info-" + this.playerBox(pnum);
    try {
      document.querySelector(selector).classList.add("hidden-playerbox-element");
    } catch (err) { }
  }

  /**
   * Hide the info subdivision of a given player-box
   * @param {int} pnum - the player number (according to game), -1 means this player
   */
  showInfo(pnum = -1) {
    let selector = "#player-box-info-" + this.playerBox(pnum);
    try {
      document.querySelector(selector).classList.remove("hidden-playerbox-element");
    } catch (err) { }
  }
  /** 
 *Alert Next player with visual UI changes on player box. Done with predefined css classes
 * @param {int} pnum - the player number (according to game), -1 means this player
 * @param {string} alertType - the alert type that should be displayed  supported: 'flash', 'shake'
 * @param {string} stopTrigger - the browser event that should  stop an alert supported: 'click', 'mousemove'
 * @param {int} duration - the duration in milliseconds in which the alert should be displayed in the event of no stop trigger
*/
  alertNextPlayer(pnum, alertType = "flash", stopTrigger = null, duration = 4000) {

    let selector = "#player-box-" + this.playerBox(pnum);

    let box = document.querySelector(selector);
    if (box) {
      box.classList.add(alertType);
    }

    if (stopTrigger) {
      // A browser instance only listens to it's own browser stop trigger event, hence won't affect other players. 
      // Consider  ways of sending stop trigger event to all peers/players
      window.addEventListener(stopTrigger, (e) => {
        box.classList.remove(alertType);
      })
    } else {
      setTimeout(() => {
        box.classList.remove(alertType);
      }, duration)
    }


  }
}

module.exports = GamePlayerBox;
