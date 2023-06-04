/*********************************************************************************
 GAME STATUS

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

class GameStatus {


  updateControls(str, force = 0) {

    this.game.controls = str;
    if (!this.browser_active) { return; }

    try {
      if (this.useHUD) {
        this.hud.updateControls(str);
      } else {
        document.querySelectorAll(".controls").forEach((el) => {
          el.innerHTML = str;
        });
        if (document.getElementById("controls")) {
          document.getElementById("controls").innerHTML = str;
        }
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
	// adds mouserover to cards in log
	//
        if (this.useCardbox) {
          this.cardbox.attachCardEvents();
        }
      }
    } catch (err) { }
  }


  updateStatus(str, force = 0) {
    this.game.status = str;
    if (!this.browser_active) { return; }
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
  updateStatusAndListCards(message, cards = []) {

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
      this.updateControls(`<div class="game-controls-cardbox">${this.returnCardList(cards)}</div>`);
    } else if (this.interface === 2) {
      this.updateControls(`<div class="game-controls-options">${this.returnCardList(cards)}</div>`);
    }

  }


  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param optionHTML - an html list of actions a user can take
   *
   */
  updateStatusWithOptions(message = "", options = "") {

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
    this.updateControls(`<div class="game-controls-options">${options}</div>`);

  }

}

module.exports = GameStatus;


