class PokerStake {
  //
  // initializes chips / pools / pots information
  //
  initializeGameStake(crypto = 'CHIPS', stake = '100') {
    console.log('Initialize Poker Stakes!');
    this.game.crypto = crypto;
    this.game.stake = stake;
    this.game.chips = 100;
    this.game.blind_mode = 'static';

    if (this.game.options.num_chips > 0) {
      this.game.chips = this.game.options.num_chips;
    }
    if (this.game.options.crypto) {
      this.game.crypto = this.game.options.crypto;
    }
    if (this.game.options.stake) {
      this.game.stake = this.game.options.stake;
    }
    if (this.game.options.blind_mode) {
      this.game.blind_mode = this.game.options.blind_mode;
    }

    this.game.state.round = 1;

    this.game.state.big_blind = 2;
    this.game.state.small_blind = 1;
    this.game.state.last_raise = this.game.state.big_blind;
    this.game.state.required_pot = this.game.state.big_blind;

    for (let i = 0; i < this.game.players.length; i++) {
      this.game.state.passed[i] = 0;
      this.game.state.player_pot[i] = 0;
      this.game.state.debt[i] = 0;
      this.game.state.player_credit[i] = this.game.chips;
    }

    this.game.queue = ['newround'];
  }

  returnTicker() {
    if (this.game.crypto) {
      return this.game.crypto;
    }
    return 'CHIPS';
  }

  convertChipsToCrypto(numChips, asString = true) {
    if (this.returnTicker() == 'CHIPS') {
      return numChips;
    }

    let numCrypto = (numChips * parseFloat(this.game.stake)) / this.game.chips;

    if (asString) {
      let singleChipValue = String(parseFloat(this.game.stake / this.game.chips));  
      let split_string = singleChipValue.split('.');
      let fraction = split_string[1] || '';
      let precision = fraction.length;
  
      return numCrypto.toFixed(precision);
    } else {
      return numCrypto;
    }
  }

  //
  // returns "1 CHIP" or "2.412 SAITO" or "1.423 CHIPS" etc.
  // 
  // temporarily breaking this because we think CHIPS is always better...
  //
  formatWager(numChips, includeTicker = true) {
    //let chips = this.game.crypto || 'CHIPS';
    let chips = 'CHIPS';
    if (chips === 'CHIPS') {
      if (numChips == 1) {
        chips = 'CHIP';
      }
    }

    let wager = '<span class="wager-num">' + numChips + '</span>'; //this.convertChipsToCrypto(numChips);

    if (includeTicker) {
      wager += ' <span class="wager-ticker">' + chips + '</span>';
    }

    return wager;
  }

  //
  // returns "true" or "false" based on need to settle
  //
  needToSettleDebt() {
    if (!this.game.options?.crypto) {
      return false;
    }

    if (this.settle_every_hand) {
      return true;
    }
    //
    // if settleNow is true, the send/receive are added directly in the poker queue
    //
    if (this.settleNow) {
      return true;
    }
    if (this.toLeave.length > 0 || this.toJoin.length > 0) {
      return true;
    }
    for (let i = 0; i < this.game.state.player_credit.length; i++) {
      if (this.game.state.player_credit[i] <= 0) {
        return true;
      }
    }
    return false;
  }

  //
  // adds settlement instructions to queue for processing
  //
  settleDebt() {
    for (let i = 0; i < this.game.state.debt.length; i++) {
      if (this.game.state.debt[i] > 0) {
        for (let j = 0; j < this.game.state.debt.length; j++) {
          if (this.game.state.debt[j] < 0) {
            let amount_owed = Math.min(Math.abs(this.game.state.debt[j]), this.game.state.debt[i]);
            if (amount_owed > 0) {
              this.game.state.debt[i] -= amount_owed;
              this.game.state.debt[j] += amount_owed;

              // Convert Chips to CRYPTO
              let amount_to_send = this.convertChipsToCrypto(amount_owed);

              this.addPaymentToQueue(this.game.players[i], this.game.players[j], amount_to_send);

            }
          }
        }
      }
    }
  }

  settleLastRound(winner_array, method) {
    /*
                    We want these at the end of the queue so they get processed first, but if
                    any players got removed, there will be some issues....
                */
    let msg = 'Clearing the table';
    this.game.queue.push('newround');

    this.game.queue.push('PLAYERS');
    this.game.queue.push('checkplayers');

    if (this.needToSettleDebt()) {
      console.log("***********************************");
      console.log(this.game.state.debt);
      this.settleDebt();
      msg += ' and settling bets...';
      this.settleNow = false;
    }else{
      msg += '...';
    }

    //
    // We will calculate vpip here, before resetting the next round
    // If a player voluntarily added money to the pot, +1
    // >>>>>>>>>>
    for (let i = 1; i <= this.game.players.length; i++) {
      let voluntary_bet = this.game.state.player_pot[i - 1];
      this.game.state.player_pot[i - 1] = 0;

      if (i == this.game.state.small_blind_player) {
        voluntary_bet -= this.game.state.small_blind;
      }
      if (i == this.game.state.big_blind_player) {
        voluntary_bet -= this.game.state.big_blind;
      }

      if (voluntary_bet > 0) {
        this.game.stats[this.game.players[i - 1]].vpip++;
      }
    }

    this.updateStatus(msg);
    this.game.queue.push(`ROUNDOVER\t${JSON.stringify(winner_array)}\t${method}`);
  }


  showStakeOverlay(){
  
    let html = `<div class="stake-info-overlay"><div class="h3">Game Stake</div>`;
    let add_debt_button = false;
    html += `<div class="player-table">`;
    for (let i = 0; i < this.game.state.debt.length; i++){
      html += `<div>${this.app.keychain.returnUsername(this.game.players[i])}</div>`;
      let amount = this.game.stake;
      let status = "has staked";

      if (this.game.state.debt[i] > 0){
        add_debt_button = true;
        status = `owes`;
        amount = this.convertChipsToCrypto(this.game.state.debt[i]);
      }else if (this.game.state.debt[i] < 0){
        status = `is owed`;
        amount = this.convertChipsToCrypto(-this.game.state.debt[i]);
      }else{
        let winnings = this.game.state.player_credit[i] + this.game.state.player_pot[i] - this.game.chips;
        if (winnings > 0){
          status = `has won`;
          amount = this.convertChipsToCrypto(winnings);
        }else if (winnings  < 0){
          status = `has lost`;
          amount = this.convertChipsToCrypto(-winnings);
        }
      }
      html += `<div>${status}</div><div>${amount} ${this.game.crypto}</div>`;
    }

    html += "</div>";

    if (add_debt_button){
      html += `<div class="saito-button-primary" id="settle-now">Settle</div>`;
    }

    html += "</div>";
    this.overlay.show(html);

    let db = document.querySelector("#settle-now");
    if (db){
      db.onclick = (e) => {
        this.sendMetaMessage("SETTLEMENT");
        this.overlay.hide();
      }
    }
  }




}

module.exports = PokerStake;
