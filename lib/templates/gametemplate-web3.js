/*********************************************************************************
 GAME WEB3

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
let ModTemplate = require("./modtemplate");

class GameWeb3 {

  //
  // games can override this function if they want to support crypto integration and
  // have any module-specific initialization work to do.
  //
  initializeGameStake(crypto, stake) { 

    for (let i = 0; i < this.game.players.length; i++) {
      this.game.queue.push("BALANCE\t"+stake+"\t"+this.game.keys[i]+"\t"+crypto);
    }

  }

  //
  // this allows players to propose a crypto/web3 stake for the game. it will trigger
  // the STAKE command among players who have not INIT'd or APPROVED the shift allowing
  // them to accept / reject the idea.
  //
  proposeGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    while (sigs.length < this.game.players.length) {
      sigs.push("");
    }
    sigs[this.game.player - 1] = this.app.wallet.signMessage(
      `${ts} ${ticker} ${stake} ${this.game.id}`
    );

    this.game = this.game_state_pre_move;
    this.game.turn = [];
    this.moves = [];

    //
    // remove STAKE instruction
    //
    if (this.game.queue.length) {
      let pmv = this.game.queue[this.game.queue.length - 1];
      let pm = pmv.split("\t");
      if (pm[0] === "STAKE") {
        this.game.queue.splice(this.game.queue.length - 1, 1);
      }
    }

    this.addMove("STAKE\t" + ticker + "\t" + stake + "\t" + ts + "\t" + JSON.stringify(sigs));
    this.endTurn();

    //
    // need to reload to avoid issues / save-state errors
    //
    setTimeout(function () {
      location.reload();
    }, 500);
  }
  depositGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    this.addMove("ACKNOWLEDGE\tppponent considering...");
    this.endTurn();
  }
  refuseGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    this.addMove("ACKNOWLEDGE\tCrypto Game Rejected");
    this.endTurn();
  }

 
  payWinners(winner) {
    if (Array.isArray(winner)) {
      let num_winners = winner.length;
      let amount_to_send = (this.game.stake / num_winners).toFixed(8);
      for (let i = 0; i < this.game.players.length; i++) {
        if (!winner.includes(this.game.players[i])) {
          for (let w of winner) {
            this.payWinner(this.game.players[i], w, amount_to_send);
          }
        }
      }
    } else {
      for (let i = 0; i < this.game.players.length; i++) {
        if (this.game.players[i] !== winner) {
          this.payWinner(this.game.players[i], winner, this.game.stake.toString());
        }
      }
    }
  }


  payWinner(sender, receiver, amount) {
    let ts = new Date().getTime();
    this.rollDice();
    let unique_hash = this.game.dice;
    amount = amount.toString(); //ensure string representation
    let ticker = this.game.crypto;

    //
    // if we are the sender, lets get sending and receiving addresses
    //
    let sender_crypto_address = "";
    let receiver_crypto_address = "";
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === sender) {
        sender_crypto_address = this.game.keys[i];
      }
      if (this.game.players[i] === receiver) {
        receiver_crypto_address = this.game.keys[i];
      }
    }
    let game_self = this;

    if (this.app.wallet.returnPublicKey() === sender) {
      this.crypto_transfer_manager.sendPayment(
        this.app,
        this,
        [sender_crypto_address.split("|")[0]],
        [receiver_crypto_address.split("|")[0]],
        [amount],
        ts,
        ticker,
        function () {
          game_self.app.wallet.sendPayment(
            [sender_crypto_address],
            [receiver_crypto_address],
            [amount],
            ts,
            unique_hash,
            function (robj) {
              siteMessage(game_self.name + ": payment issued", 5000);
            },
            ticker
          );

          return 0;
        }
      );
    } else if (this.app.wallet.returnPublicKey() === receiver) {
      game_self.crypto_transfer_manager.receivePayment(
        this.app,
        this,
        [sender_crypto_address.split("|")[0]],
        [receiver_crypto_address.split("|")[0]],
        [amount],
        ts,
        ticker,
        function (divname) {
          game_self.app.wallet.receivePayment(
            [sender_crypto_address],
            [receiver_crypto_address],
            [amount],
            ts,
            unique_hash,
            function (robj) {
              //Update crypto-transfer-manager
              if (document.querySelector(".spinner")) {
                document.querySelector(".spinner").remove();
              }
              $(".game-crypto-transfer-manager-container .hidden").removeClass("hidden");
              if (divname) {
                if (robj) {
                  //==1, success
                  divname.textContent = "Success";
                } else {
                  //==0, failure
                  divname.textContent = "Failed";
                }
              }
              return 0;
            },
            ticker,
            -1
          );

          return 0;
        }
      );
    }
  }


}

module.exports = GameWeb3;
