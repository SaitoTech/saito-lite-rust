/*********************************************************************************
 GAME MOVES

 **********************************************************************************/

let saito = require("./../saito/saito");
const Transaction = require("../saito/transaction").default;

class GameMoves {

  //
  // we accept this as the next move if it is either one more than the current
  // in the MASTER step (i.e. legacy for two player games) or if it is one more
  // than the last move made by the specific player (i.e. 3P simultaneous moves)
  //
  isFutureMove(playerpkey, txmsg) {
    let tx_step = parseInt(txmsg.step.game) - 1;

    if (txmsg.game_id !== this.game.id) {
      return 0;
    }

    if (tx_step <= Math.min(this.game.step.game, this.game.step.players[playerpkey])) {
      return 0;
    }

    if (tx_step > Math.max(this.game.step.game, this.game.step.players[playerpkey])) {
      return 1;
    }

    return 0;
  }

  /*
  Is this tx the next game move? It should have a step exactly one more than the main game
  @param player - the public key address of the player
  */
  isUnprocessedMove(player, txmsg) {
    let tx_step = parseInt(txmsg.step.game) - 1;

    if (txmsg.game_id !== this.game.id) {
      return 0;
    }

    if (tx_step == this.game.step.game) {
      return 1;
    }

    if (this.game.step.players[player]) {
      if (tx_step == this.game.step.players[player]) {
        return 1;
      }

      // MAY 28 - player has an updated move, but not the next move
      // When on earth does this actually occur?
      // -- this is a great question -- perhaps this pre-dates getting futureMoves right?
      //
      if (tx_step >= this.game.step.players[player] && tx_step < this.game.step.game) {
        return 1;
      }
    }

    return 0;
  }

  async addNextMove(gametx) {
    let gametxmsg = gametx.returnMessage();

    ////////////
    // HALTED  -- a safety catch for future moves
    ////////////
    if (this.game.halted == 1 || this.gaming_active == 1 || this.initialize_game_run == 0) {
      console.info(
        `Save as future move because halted (${this.game.halted}) or active (${this.gaming_active})`
      );
      await this.addFutureMove(gametx);
      return;
    }

    //Update player's step value
    this.game.step.players[gametx.from[0].publicKey] = gametxmsg.step.game;

    //And master game step value (if actually incremented)
    if (gametxmsg.step.game > this.game.step.game) {
      this.game.step.game = gametxmsg.step.game;
    }

    window.location.hash = this.app.browser.modifyHash(window.location.hash, {
      step: gametxmsg.step.game,
    });

    //console.info(`Add Next Move (${gametxmsg.step.game}) to QUEUE: ${JSON.stringify(gametxmsg.turn)}`);
    //console.log(JSON.parse(JSON.stringify(gametxmsg)));

    //
    // OBSERVER MODE -
    //
    if (this.game.player == 0) {
      if (this.browser_active) {
        this.observerControls.showLastMoveButton();
        this.observerControls.updateStep(this.game.step.game);
      }

      this.observerControls.game_states.push(this.game_state_pre_move);
      this.observerControls.game_moves.push(gametx);
      //To avoid memory overflow for long games
      if (this.observerControls.game_states.length > 100) {
        this.observerControls.game_states.shift();
      }
      if (this.observerControls.game_moves.length > 100) {
        this.observerControls.game_moves.shift();
      }
    }

    if (this.game.queue) {
      for (let i = 0; i < gametxmsg.turn.length; i++) {
        this.game.queue.push(gametxmsg.turn[i]);
      }

      await this.saveFutureMoves(this.game.id);
      this.saveGame(this.game.id);
      this.startQueue();
    } else {
      console.error("No queue in game engine");
    }
  }

  async addFutureMove(gametx) {
    if (!this.game.future) {
      this.game.future = [];
    }

    if (!this.game.future.includes(gametx.toJson())) {
      console.log("Future TX:", gametx.toJson());
      this.game.future.push(gametx.toJson());
      await this.saveFutureMoves(this.game.id);

      if (this.game.player == 0 && this.browser_active) {
        try {
          if (this.observerControls.is_paused) {
            this.observerControls.showNextMoveButton();
            this.observerControls.updateStatus("New pending move");
          } else {
            await this.processFutureMoves();
          }
        } catch (err) {}
      }
    }
  }

  /*
  The goal of this function is not to process all the future moves, but to search
  the archived future moves for JUST the NEXT one, so we can continue processing the game steps
  */
  async processFutureMoves() {
    this.gaming_active = 0;

    if (this.game.halted == 1 || this.initialize_game_run == 0) {
      console.info(
        `Unable to process future moves now because halted (${this.game.halted}) or gamefeeder not initialized (${this.initialize_game_run})`
      );
      return -1;
    }

    //console.info(this.game.future.length + " FUTURE MOVES at step --> " + this.game.step.game);

    //Search all future moves for the next one
    for (let i = 0; i < this.game.future.length; i++) {

      console.log("json object ////////");
      console.log(this.game.future[i]);

      let ftx = new Transaction(undefined, this.game.future[i]);
      let ftxmsg = ftx.returnMessage();
      //console.info(`FTMSG (${ftxmsg.step.game}): ` + JSON.stringify(ftxmsg.turn));

      if (this.isUnprocessedMove(ftx.from[0].publicKey, ftxmsg)) {
        //This move (future[i]) is the next one, move it to the queue
        this.game.future.splice(i, 1);
        this.observerControls.updateStatus("Advanced one move");
        await this.addNextMove(ftx);
        return 1;
      } else if (this.isFutureMove(ftx.from[0].publicKey, ftxmsg)) {
        //console.info("Is future move, leave on future queue");
        //This move (future[i]) is still for the future, so leave it alone
      } else {
        //Old move, can ignore
        //console.info("Is old move, prune from future queue");
        this.game.future.splice(i, 1);
        i--; // reduce index as deleted
      }
    }

    if (this.game.player == 0 && this.game.future.length == 0) {
      this.observerControls.updateStatus("No pending moves, click again to check the database");
      //salert("Caught up to current game state");
    }

    await this.saveFutureMoves(this.game.id);
    if (this.game.future?.length > 0) {
      console.info(JSON.parse(JSON.stringify(this.game.future)));
    }

    return 0; //No moves in future
  }

  //
  // saves future moves without disrupting our queue state
  // so that we can continue without reloading and reload
  // without losing future moves.
  //
  async saveFutureMoves(game_id = null) {
    if (game_id === null) {
      return;
    }

    if (this.app.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === this.game.id) {
          this.app.options.games[i].future = this.game.future;
        }
      }
    }

    await this.app.storage.saveOptions();
  }

  prependMove(mv) {
    if (mv) {
      this.moves.unshift(mv);
    }
  }

  addMove(mv) {
    if (mv) {
      this.moves.push(mv);
    }
    console.log("just added move!");
  }

  removeMove() {
    return this.moves.pop();
  }

  async endTurn(nexttarget = 0) {
    let extra = {};
    this.game.turn = this.moves;
    //this.game.halted = 0;
    this.moves = [];
console.log("in endTurn");
    await this.sendMessage("game", extra);
console.log("done SM from endTurn");
  }

  /**
   * Check what moves are pending in my wallet and if any of them are future moves
   * (I sent, but haven't received and processed) return 1
   */
  async hasGameMovePending() {
    let pending = await this.app.wallet.getPendingTxs();
    for (let i = 0; i < pending.length; i++) {
      let tx = pending[i];
      let txmsg = tx.returnMessage();
      if (txmsg && txmsg.module == this.name) {
        if (txmsg.game_id === this.game?.id) {
          if (txmsg?.step?.game) {
            if (txmsg.step.game > this.game.step.players[tx.from[0].publicKey]) {
              console.log("PENDING TXS:", JSON.parse(JSON.stringify(txmsg)));
              return 1;
            } else {
              //console.log("OLD MOVE in PENDING TXS:",JSON.parse(JSON.stringify(txmsg)));
            }
          }
        }
      }
    }
    return 0;
  }
}

module.exports = GameMoves;
