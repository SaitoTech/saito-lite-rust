/*********************************************************************************
 GAME UI

 There are three general UI instructions that are tracked by games universally
 so that on re-load the UI can be appropriately updated. These are the Game Log, 
 Game Status and Game Controls.

 - log - an array of game updates
 - status - a single sentence describing state of processing
 - controls - a flexible HTML box for making game choices

 All of these functions should be passed raw-text with whatever minimal-markup
 is needed for internal functionality. You can write something to the log that
 contains the HTML needed for cards to track mouseover, for instance, but should
 not provide WRAPPING HTML around the log entry or status market.

 This class also provides GameHud integration, as the GameHud is a standard 
 component that has both a STATUS and CONTROL space. If your game has the GameHud
 activated and you run updateStatus() or updateControls() you will see the 
 gamehud UI components updated and formatted properly. In the event tha the 
 GameHud is in use, this component will work with the GameHud to properly wrap
 the updates so that they are formatted properly.

 For any more complicated UI requirements, please have the games override these
 functions and merge / combine input streams to update whatever custom UI components
 they have created and/or are using.

**********************************************************************************/
let SaitoOverlay = require("./../../saito/ui/saito-overlay/saito-overlay");

class GameUI {
  updateControls(str, force = 0) {
    this.game.controls = str;
    if (!this.browser_active) {
      return;
    }

    try {
      document.querySelectorAll(".controls").forEach((el) => {
        el.innerHTML = str;
      });
      if (document.getElementById("controls")) {
        document.getElementById("controls").innerHTML = str;
      }
      if (this.useHUD) {
        this.hud.updateControls(str);
      }
    } catch (err) {
      console.warn("Error Updating Controls: ignoring: " + err);
    }
  }

  updateLog(str, force = 0) {
    try {
      this.game.log.unshift(str);
      if (this.game.log.length > this.log_length) {
        this.game.log.splice(length);
      }
      if (this.browser_active && this.log.rendered) {
        this.log.updateLog(str, force);
        //
        // adds mouseover to cards in log
        //
        if (this.useCardbox) {
          this.cardbox.attachCardEvents();
        }
      }
    } catch (err) {}
  }

  updateStatus(str, force = 0) {
    this.game.status = str;
    if (!this.browser_active) {
      return;
    }
    try {
      if (this.useHUD) {
        this.hud.updateStatus(str);
      } else {
        document.querySelectorAll(".status").forEach((el) => {
          el.innerHTML = str;
        });
        if (document.getElementById("status")) {
          document.getElementById("status").innerHTML = str;
        }
      }
      if (this.useCardbox) {
        this.cardbox.attachCardEvents();
      }
    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  }

  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param cards - an array of cards (indices to this.game.deck[].cards)
   *
   */
  updateStatusAndListCards(message, cards = [], mycallback = null) {
    //
    // update the status
    //
    this.updateStatus(`${message}`);

    //
    // observers do not get controls
    //
    if (this.game.player == 0) {
      return;
    }

    //
    // update the controls
    //
    if (this.interface === 1) {
      this.updateControls(
        `<div class="game-cardgrid hide-scrollbar">${this.returnCardList(cards)}</div>`
      );
    } else if (this.interface === 2) {
      this.updateControls(`${this.returnCardList(cards)}`);
    }

    //
    // allow cardbox to attach popups to message
    //
    if (this.useCardbox) {
      this.cardbox.attachCardEvents();
    }

    if (mycallback != null) {
      this.attachCardboxEvents(mycallback);
    }
  }

  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param optionHTML - an html list of actions a user can take
   *
   */
  updateStatusWithOptions(message = "", options = "", mycallback = null) {
    //
    // update the status
    //
    if (document.getElementById("controls") || document.querySelector(".controls")) {
      this.updateStatus(message);
    } else {
      this.updateStatus(message + `<div id="controls"></div>`);
    }

    //
    // observers do not get controls
    //
    if (this.game.player == 0) {
      return;
    }

    //
    // update the controls
    //
    this.updateControls(options);

    //
    // allow cardbox to attach popups to message
    //
    if (this.useCardbox) {
      this.cardbox.attachCardEvents();
    }

    if (mycallback != null) {
      console.log("Attaching B");
      this.attachCardboxEvents(mycallback);
      console.log("done attaching callback in updateStatusWithOptions...");
    }
  }

  //
  // deprecated but included for convenience
  //
  attachCardboxEvents(fn = null) {
    this.hud.attachControlCallback(fn);
  }

  unbindBackButtonFunction() {
    this.hud.back_button = false;
    this.hud.back_button_callback = null;
  }

  bindBackButtonFunction(mycallback) {
    // for HUD
    this.hud.back_button = true;
    this.hud.back_button_callback = mycallback;
    // for independent button
    try {
      document.getElementById("back_button").onclick = (e) => {
        mycallback();
      };
    } catch (err) {}
  }

  ///
  // These three functions are used by Blackjack and Imperium ...
  // but were delete in refactor / readded by WASM
  // TODO: fix this
  ///
  lockInterface() {
    this.lock_interface = 1;
    this.lock_interface_step = this.game.queue[this.game.queue.length - 1];
  }

  unlockInterface() {
    this.lock_interface = 0;
  }

  mayUnlockInterface() {
    if (this.lock_interface_step === this.game.queue[this.game.queue.length - 1]) {
      return 1;
    }
    return 0;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  ///////////// META USER INTERFACE /////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////

  setPlayReminder() {
    //We can assume anyone holding their phone is going to be paying attention!
    if (this.app.browser.isMobileBrowser(navigator.userAgent)) {
      return;
    }

    let newOverlay = new SaitoOverlay(this.app, this, false, true);
    let timer = setTimeout(() => {
      //console.log("Player inactive");
      newOverlay.show(`<div class="message_box">the move is yours</div>`);
      window.removeEventListener("mousemove", clearTimer);
    }, 15000);

    const clearTimer = () => {
      //console.log("Player active");
      clearTimeout(timer);
    };

    window.addEventListener("mousemove", clearTimer, { once: true });
  }

  startNotification() {
    if (!this.browser_active) {
      return;
    }
    //If we haven't already started flashing the tab
    this.notifications++;
    if (!this.tabInterval) {
      this.tabInterval = setInterval(() => {
        let modName = this.gamename || this.name;
        if (document.title === modName) {
          document.title =
            this.notifications == 1 ? "New move" : `(${this.notifications}) new moves`;
        } else {
          document.title = modName;
        }
      }, 650);
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////   END GAME USER INTERFACE   ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  gameOverUserInterface() {
    let winner = this.game.winner;
    let reason = this.game.reason;
    
    //Stop players from clicking more
    this.removeEvents();

    /////////////////////////////////////////////////////
    // Update the Game UI to reflect the end of the game
    /////////////////////////////////////////////////////
    let readable = "";
    //Check if multiple winners, or none
    if (winner.includes(this.publicKey)) {
      readable = "You win";
    } else {
      if (Array.isArray(winner)) {
        for (let w of winner) {
          readable += this.app.keychain.returnUsername(w) + ", ";
        }
        readable = readable.substring(0, readable.length - 2) + " win";
        if (winner.length == 1) {
          readable += "s";
        }
      } else {
        readable = this.app.keychain.returnUsername(winner) + " wins";
      }
    }

    //Include reason if given
    if (reason != "") {
      readable += " by " + reason;
    } else {
      readable += "!";
    }

    //Just state reason if no winners
    if (winner.length == 0 || reason == "cancellation") {
      readable = reason;
    }

    readable = "Game Over: " + readable;

    try {
      this.updateLog(readable);

      this.updateStatusForGameOver(readable, reason !== "cancellation");

      ////////////////////////////////////////
      // Attach Listeners for rematch actions
      ////////////////////////////////////////
      this.app.connection.on("arcade-reject-challenge", async (game_id) => {
        this.updateStatusForGameOver(readable, false);
      });

      this.app.connection.on("arcade-game-loading", () => {
        this.hud.back_button = false;
        this.updateStatus("Resetting game...");
        this.browser_active = 0; //Hack to simulate not being in the game mod
      });

      this.app.connection.on("arcade-game-ready-play", (game) => {
        window.location = "/" + this.returnSlug();
      });
    } catch (err) {}
  }

  updateStatusForGameOver(status, allowRematch) {
    let target = this.app.options.homeModule || "Arcade";
    allowRematch = allowRematch && this.game.player !== 0;

    let options = `<ul>
                      <li class="textchoice" id="confirmit">Return to ${target}</li>
                      ${allowRematch ? '<!--li class="textchoice" id="rematch">Rematch</li-->' : ""}
                   </ul>`;

    this.hud.back_button = false;

    //if (document.querySelector(".status") && document.querySelector(".controls")){
    this.updateStatusWithOptions(status, options);
    //}else{
    //  this.overlay.show(`<div class="status-overlay"><div class="status-header">${status}</div><div class="status-text-menu">${options}</div></div>`);
    //this.overlay.blockClose();
    //}

    if (document.getElementById("rematch")) {
      document.getElementById("rematch").onclick = (e) => {
        this.app.connection.emit("arcade-issue-challenge", {
          game: this.name,
          players: this.game.players,
          options: this.game.options,
        });
      };
    }

    document.getElementById("confirmit").onclick = (e) => {
      document.getElementById("confirmit").onclick = null; //If player clicks multiple times, don't want callback executed multiple times
      this.exitGame();
    };
  }
}

module.exports = GameUI;
