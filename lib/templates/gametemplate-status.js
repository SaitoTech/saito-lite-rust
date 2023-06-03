/*********************************************************************************
 GAME STATUS

 This is a general parent class for modules that wish to implement Game logic. It
 introduces underlying methods for creating games via email invitations, and sending
 and receiving game messages over the Saito network. The module also includes random
 number routines for dice and deck management. Thanks for the Web3 Foundation for its
 support developing code that allows games to interact with cryptocurrency tokens and
 Polkadot parachains.

 This module attempts to use peer-to-peer connections with fellow gamers where
 possible in order to avoid the delays associated with on-chain transactions. All
 games should be able to fallback to using on-chain communications however. Peer-
 to-peer connections will only be used if both players have a proxymod connection
 established.

 Developers please note that every interaction with a random dice and or processing
 of the deck requires an exchange between machines, so games that do not have more
 than one random dice roll per move and/or do not require constant dealing of cards
 from a deck are easier to implement on a blockchain than those which require
 multiple random moves per turn.

 HOW IT WORKS

 We recommend new developers check out the WORDBLOCKS game for a quick introduction
 to how to build complex games atop the Saito Game Engine. Essentially, games require
 developers to manage a "stack" of instructions which are removed one-by-one from
 the main stack, updating the state of all players in the process.

 MINOR DEBUGGING NOTE

 core functionality from being re-run -- i.e. DECKBACKUP running twice on rebroadcast
 or reload, clearing the old deck twice. What this means is that if the msg.extra
 data fields are used to communicate, they should not be expected to persist AFTER
 core functionality is called like DEAL or SHUFFLE. etc. An example of this is in the
 Twilight Struggle headline code.

**********************************************************************************/

class GameStatus {

  updateLog(str, force = 0) {
    try {

      this.game.log.unshift(str);
      if (this.game.log.length > this.log_length) {
        this.game.log.splice(length);
      }

      if (this.browser_active && this.log.rendered) {
        this.log.updateLog(str, force);
        if (this.useCardbox) {
          this.cardbox.attachCardEvents();
        }
      }
    } catch (err) { }
  }



  //
  // there are four ways of writing to the status-box:
  //
  // updateStatus(msg) <--- write raw HTML to .status
  // updateStatusHeader(msg); <--- formats msg
  // updateStatusAndListCards(msg, include_back_button) <--- formats msg + adds cards
  // updateStatusWithOptions(msg, html) <--- formats msg, adds html (ul/li)
  //
  // if you're using the HUD in most cases you want updateStatusHeader() to
  // leave a short note and either updateStatusAndListCards() for image 
  // display or updateStatusWithOptions() if you have a vertical list of 
  // tech choices.
  //
  updateStatus(str, force = 0) {
    if (this.lock_interface == 1 && force == 0) {
      return;
    }

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
    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  }

  //
  // formats the message so it looks nice instead of performing a raw
  // HTML write to the .status object, which requires a lot more effort
  // to make consistent.
  //
  updateStatusHeader(message, include_back_button = false) {

    if (!this.useHUD) { this.updateStatus(message); }

    html = `<div class="status-header">
              ${include_back_button ? this.back_button_html : ""}
            <span id="status-content">${message}</span>
            </div>`;

    this.updateStatus(html);

  }


  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param cards - an array of cards (indices to this.game.deck[].cards)
   *
   */
  updateStatusAndListCards(message, cards = [], include_back_button = false) {
    //
    // OBSERVER MODE
    if (this.game.player == 0) {
      this.updateStatusHeader(`${message}`);
      return;
    }

    //console.log("UPDATE STATUS AND LIST CARDS");
    html = `<div class="status-header">
              ${include_back_button ? this.back_button_html : ""}
            <span id="status-content">${message}</span>
            </div>`;

    if (this.interface === 1) {
      html += `<div class="status-cardbox" id="status-cardbox">${this.returnCardList(cards)}</div>`;
    } else if (this.interface === 2) {
      html += `<ul id="status-cardbox">${this.returnCardList(cards)}</ul>`;
    }

    this.updateStatus(html);
    if (include_back_button && this.menu_backup_callback) {
      document.getElementById("back_button").onclick = this.menu_backup_callback;
    }
  }


  /**
   *  Update Status (in HUD) and include a graphical display/textual description of cards (either provided or in one's hand)
   *  @param message - text (non-HTML formatted message) to insert in the (HUD) status
   *  @param optionHTML - an html list of actions a user can take
   *
   */
  updateStatusWithOptions(message = "", optionHTML = "", include_back_button = false) {

    let html = `<div class="status-header">`;
    if (include_back_button) {
      html += this.back_button_html;
    }
    html += `<span id="status-content">${message}</span></div>
      <div class="status-text-menu">
        ${optionHTML}
      </div>`;

    this.updateStatus(html);
    if (include_back_button && this.menu_backup_callback) {
      document.getElementById("back_button").onclick = this.menu_backup_callback;
    }
  }

}

module.exports = GameStatus;


