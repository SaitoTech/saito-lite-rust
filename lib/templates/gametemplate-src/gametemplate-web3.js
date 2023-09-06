/*********************************************************************************
 GAME WEB3


**********************************************************************************/
class GameWeb3 {
  //
  // games can override this function if they want to support crypto integration and
  // have any module-specific initialization work to do.
  //
  initializeGameStake(crypto, stake) {
    //Don't do this
    //for (let i = 0; i < this.game.players.length; i++) {
    //  this.game.queue.push("BALANCE\t" + stake + "\t" + this.game.keys[i] + "\t" + crypto);
    //}
  }

  //
  // this allows players to propose a crypto/web3 stake for the game. it will trigger
  // the STAKE command among players who have not INIT'd or APPROVED the shift allowing
  // them to accept / reject the idea.
  //
  async proposeGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    //
    // restore original pre-move state
    //
    // this ensures if we are halfway through a move that we will
    // return to the game in a clean state after we send the request
    // to our opponent for shifting game modes.
    //
    this.game = this.game_state_pre_move;
    this.game.turn = [];
    this.moves = [];

    while (sigs.length < this.game.players.length) {
      sigs.push("");
    }

    let privateKey = await this.app.wallet.getPrivateKey();

    sigs[this.game.player - 1] = this.app.crypto.signMessage(
      `${ts} ${ticker} ${stake} ${this.game.id}`,
      privateKey
    );

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
  }

  async depositGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    this.addMove("ACKNOWLEDGE\tOpponent considering...");
    await this.endTurn();
  }
  async refuseGameStake(ticker = "", stake = "", sigs = [], ts = new Date().getTime()) {
    this.addMove("ACKNOWLEDGE\tCrypto Game Rejected");
    await this.endTurn();
  }
}

module.exports = GameWeb3;
