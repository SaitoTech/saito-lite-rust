/*********************************************************************************
 GAME ACKNOWLEDGE

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

class GameAcknowledge {

  playerAcknowledgeNotice(msg, mycallback) {
    let html = `<ul><li class="option acknowledge" id="confirmit">${this.acknowledge_text}</li></ul>`;

    try {
      this.updateStatusWithOptions(msg, html);
      this.attachCardboxEvents();
      document.querySelectorAll(".acknowledge").forEach((el) => {
        el.onclick = (e) => {
	  // update controls
	  this.updateControls("");
          // if player clicks multiple times, don't want callback executed multiple times
          document.querySelectorAll(".acknowledge").forEach((el) => { el.onclick = null; });
          mycallback();
        };
      });
    } catch (err) {
      console.error("Error with ACKWNOLEDGE notice!: " + err);
    }

    return 0;
  }

  addPublickeyConfirm(pubkey, confs) {
    this.game.tmp_confirms_received += parseInt(confs);
    this.game.tmp_confirms_players.push(pubkey);
  }
  hasPlayerConfirmed(pubkey) {
    if (this.game.tmp_confirms_players.includes(pubkey)) {
      return 1;
    }
    if (this.game.confirms_players.includes(pubkey)) {
      return 1;
    }
    return 0;
  }

  removeConfirmsNeeded(array_of_player_nums) {
    this.game.confirms_needed = [];
    this.game.confirms_received = 0;
    this.game.confirms_players = [];
    this.game.tmp_confirms_received = 0;
    this.game.tmp_confirms_players = [];

    for (let i = 0; i < this.game.players.length; i++) {
      this.game.confirms_needed[i] = 0;
    }
  }
  resetConfirmsNeeded(array_of_player_nums) {
    this.game.confirms_needed = [];
    this.game.confirms_received = 0;
    this.game.confirms_players = [];
    this.game.tmp_confirms_received = 0;
    this.game.tmp_confirms_players = [];

    for (let i = 0; i < this.game.players.length; i++) {
      if (
        array_of_player_nums.includes(i + 1) ||
        array_of_player_nums.includes(this.game.players[i])
      ) {
        this.game.confirms_needed[i] = 1;
      } else {
        this.game.confirms_needed[i] = 0;
      }
    }
  }

}

module.exports = GameAcknowledge;

