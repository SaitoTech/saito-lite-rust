/*********************************************************************************
 GAME PLAYER

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

class GamePlayers {

  async addPlayer(address) {
    if (address === "") {
      return 0;
    }
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === address) {
        return 0;
      }
    }

    this.game.players.push(address);

    if (!this.game.accepted.includes(address)) {
      this.game.accepted.push(address);
    }

    if (this.publicKey !== address) {
      this.game.opponents.push(address);
    }
    return 1;
  }

  async removePlayer(address) {
    if (address === "") {
      return;
    }
    for (let i = this.game.players.length - 1; i >= 0; i--) {
      if (this.game.players[i] === address) {
        this.game.players.splice(i, 1);
        this.game.keys.splice(i, 1);
        //this.game.accepted.splice(i, 1);
      }
    }
    for (let i = 0; i < this.game.opponents.length; i++) {
      if (this.game.opponents[i] === address) {
        this.game.opponents.splice(i, 1);
      }
    }

    //
    // reassign player id's
    //
    this.game.player = 0;
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === this.publicKey) {
        this.game.player = i + 1;
      }
    }

    //
    // track of players removed from the game
    //
    if (!this.game.eliminated) {
      this.game.eliminated = [];
    }
    if (!this.game.eliminated.includes(address)) {
      this.game.eliminated.push(address);
    }
  }

  addFollower(address) {
    console.log("Adding follower: " + address);
    if (address === "") {
      return;
    }
    if (!this.game.accepted.includes(address)) {
      this.game.accepted.push(address);
      this.saveGame(this.game.id);
    }
  }

  returnNextPlayer(num) {
    let p = parseInt(num) + 1;
    if (p > this.game.players.length) {
      return 1;
    }
    return p;
  }


  nonPlayerTurn() {
    //console.log("it is not my turn!");
    this.hud.updateStatusMessage("Waiting for Opponent to Move");
  }

  async playerTurn() {
    let game_self = this;

    console.log(`
  This is the default Player Turn function. It should be replaced in any 
  game by code logic that specifies what players actually do. Their moves
  should be added to the queue using addMove() and then endTurn() to 
  submit those moves to all other players.

  Note that other players will execute the contents of this queue in 
  reverse order. Complicated game moves that require conditional should
  be handled in .

  The PLAY instruction does not "fall-out" automatically (it will keep 
  coming back to the player whose turn it is. This is deliberate design.
  In order to remove this move, RESOLVE command must be issued by the 
  player whose turn it is. This will permit the queue to clear and 
  the game will continue with the next player.
    `);

    game_self.addMove("RESOLVE\t" + this.publicKey);
    game_self.addMove("NOTIFY\tPlayer " + game_self.game.player + " has moved");
    await game_self.endTurn();
  }

}

module.exports = GamePlayers;
