/*********************************************************************************
 GAME DISPLAY

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
let SaitoOverlay = require("./../saito/ui/saito-overlay/saito-overlay");

class GameDisplay {

  /**
   * Advanced options interface in Arcade creates an overlay with the returned html
   * Can use <div class="overlay-input"></div> to neatly group options
   */
  returnAdvancedOptions() {
    return "";
  }

  returnOptions() {
    let html = "";
    if (this.minPlayers === this.maxPlayers) {
      html = `<input type="hidden" class="game-wizard-players-select" name="game-wizard-players-select" value="${this.minPlayers}">`;
      html += this.returnSingularGameOption();
    } else {
      html += `<div class="overlay-input"><select class="game-wizard-players-select" name="game-wizard-players-select">`;
      for (let p = this.minPlayers; p <= this.maxPlayers; p++) {
        html += `<option value="${p}" ${p === this.minPlayers ? "selected default" : ""
          }>${p} player</option>`;
      }
      html += `</select></div>`;

      if (this.opengame) {
        html += `
          <input type="hidden" name="game-wizard-players-select-max" value="${this.maxPlayers}">
          <div class="saito-labeled-input">
            <label for="open-table">Allow additional players to join</label>
            <input type="checkbox" name="open-table" />          
          </div>`;
      }
    }

    return html;
  }








  /**
   * A stub that should be overwritten by the game module to return a formatted HTML (to be inserted into an overlay) description of the game rules
   */
  returnGameRulesHTML() {
    return "";
  }


  returnDefaultGameOptions() {
    let playerOptions = this.returnOptions();
    let advancedOptions = this.returnAdvancedOptions();

    let metaOverlay = new SaitoOverlay(this.app, this, false, false);
    metaOverlay.show(`<form class="default_game_options">${playerOptions}${advancedOptions}</form>`);
    metaOverlay.hide();

    let options = { game: this.name };
    document.querySelectorAll("form.default_game_options input, form.default_game_options select").forEach((element) => {
      if (element.name){
        if (element.type == "checkbox") {
          if (element.checked) {
            options[element.name] = 1;
          }
        } else if (element.type == "radio") {
          if (element.checked) {
            options[element.name] = element.value;
          }
        } else {
          options[element.name] = element.value;
        }
      }
    });

    metaOverlay.remove();
    return options;
  }

  returnCryptoOptionsHTML(values = null) {
    values = values || [0.001, 0.01, 0.1, 1, 5, 10, 50, 100, 500, 1000];
    let html = `
        <div class="overlay-input">
          <label for="crypto">Crypto:</label>
          <select id="crypto" name="crypto">
            <option value="" selected>none</option>`;

    let listed = [];
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].ticker && !listed.includes(this.app.modules.mods[i].ticker)) {
        html += `<option value="${this.app.modules.mods[i].ticker}">${this.app.modules.mods[i].ticker}</option>`;
        listed.push(this.app.modules.mods[i].ticker);
      }
    }

    html += `</select></div>`;

    html += `<div id="stake_input" class="overlay-input" style="display:none;">
                <label for="stake">Stake:</label>
                <select id="stake" name="stake">`;

    for (let i = 1; i < values.length; i++) {
      html += `<option value="${values[i]}" >${values[i]}</option>`;
    }
    html += `</select></div>`;

    return html;
  }

  /**
   * Semi-Advanced options interface in Arcade allows 2 player games to elevate a separate option in lieu of # players
   * Should be a <select>
   */
  returnSingularGameOption() {
    return "";
  }

  /*
   * A method to filter out some of the game options to clean up the game invite display in the arcade
   * Game invites list options, or rename the options in a more user friendly way
   * See also arcade/lib/arcade-main/templates/arcade-invite.template.js
   */
  returnShortGameOptionsArray(options) {
    let sgo = {};
    let crypto = "";

    for (let i in options) {
      if (options[i] != "") {
        let output_me = 1;
        if (i == "clock"){
          output_me = 0;
          if (options[i] == 0) {
            sgo[i] = "unlimited";
          }else{
            sgo[i] += " minutes";
          }
        }
        if (i == "observer" && options[i] != "enable") {
          output_me = 0;
        }
        if (i == "league_id") {
          output_me = 0;
        }
        if (i == "league_name") {
          output_me = 0;
          sgo["league"] = `<span class="saito-league">${options[i]}</span>`;
        }
        if (i == "open-table") {
          if (options[i]) {
            sgo["max players"] = options["game-wizard-players-select-max"];
          }
          output_me = 0;
        }
        if (i.includes("game-wizard-players")) {
          output_me = 0;
        }
        if (i == "game") {
          output_me = 0;
        }
        if (i == "crypto") {
          output_me = 0;
          crypto = options[i]; //Don't display but save this info
        }
        if (i == "stake") {
          output_me = 0;
          if (crypto && parseFloat(options["stake"]) > 0) {
            sgo["stake"] = options["stake"] + " " + crypto;
          }
        }

        if (i == "desired_opponent_publickey") {
          output_me = 0;
          sgo["invited player"] = this.app.browser.returnAddressHTML(options[i]);
        }

        if (output_me == 1) {
          sgo[i] = options[i];
        }
      }
    }

    return sgo;
  }

  /*
   * DEPRECATED -- It was a way to reorganize the options read from HTML and better package it,
   * However, the few game modules that implemented it didn't make any meaningful difference, but introduced errors
   * A method for game modules to (optionally) filter the whole list of options to a smaller object.
   * That object gets included in the game data packaged with the transaction to create an invite
   */
  returnFormattedGameOptions(options) {
    return options;
  }

}

module.exports = GameDisplay;

