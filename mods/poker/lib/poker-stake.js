class PokerStake {

        returnTicker() {
                if (this.game.crypto) {
                        return this.game.crypto;
                }
                return 'CHIPS';
        }


        convertChipsToCrypto(numChips, asString = true) {
                let numCrypto =
                        (numChips * parseFloat(this.game.stake)) / this.game.chips;
                
                if (asString) {
                        return this.app.crypto.convertFloatToSmartPrecision(numCrypto);
                } else {
                        return numCrypto;
                }
        }


        //      
        // returns "1 CHIP" or "2.412 SAITO" or "1.423 CHIPS" etc.
        //              
        formatWager(numChips, includeTicker = true) {
                let chips = this.game.crypto || 'CHIPS';
                if (chips === 'CHIPS') {
                        if (numChips == 1) {
                                chips = 'CHIP';
                        }
                }
                
                let wager = this.convertChipsToCrypto(numChips);
                
                if (includeTicker) {
                        wager += ' ' + chips;
                }

                return wager;
        }


        //
        // returns "true" or "false" based on need to settle
        //
        needToSettleDebt() {
                if (!this.game.crypto || this.settleNow) {
                        return false;
                }
                if (this.toLeave.length > 0) {
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
                                                let amount_owed = Math.min(
                                                        this.game.state.debt[j],
                                                        this.game.state.debt[i]
                                                );
                                                if (amount_owed > 0) {
                                                        this.game.state.debt[i] -= amount_owed;
                                                        this.game.state.debt[j] += amount_owed;

                                                        // Convert Chips to CRYPTO
                                                        let amount_to_send =
                                                                this.convertChipsToCrypto(amount_owed);

                                                        let ts = new Date().getTime();
                                                        this.rollDice();
                                                        let uh = this.game.dice;
                                                        this.settlement.push(
                                                                `RECEIVE\t${this.game.players[i]}\t${this.game.players[j]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
                                                        );
                                                        this.settlement.push(
                                                                `SEND\t${this.game.players[i]}\t${this.game.players[j]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
                                                        );
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
                        this.settleDebt();
                }

                if (
                        this.game.crypto &&
                        this.game.crypto != 'CHIPS' &&
                        this.settleNow == true
                ) {
                        msg += ' and settling bets...';
                        for (let i = 0; i < this.settlement.length; i++) {
                                this.game.queue.push(this.settlement[i]);
                        }
                } else {
                        msg += '...';
                }

                //
                // We will calculate vpip here, before resetting the next round
                // If a player voluntarily added money to the pot, +1
                // >>>>>>>>>>
                for (let i = 1; i <= this.game.players.length; i++){
                        let voluntary_bet = this.game.state.player_pot[i-1];
                        if (i == this.game.state.small_blind_player){
                                voluntary_bet -= this.game.state.small_blind;
                        }
                        if (i == this.game.state.big_blind_player){
                                voluntary_bet -= this.game.state.big_blind;
                        }

                        if (voluntary_bet > 0){
                                this.game.stats[this.game.players[i-1]].vpip++;
                        }
                }

                this.updateStatus(msg);
                this.settlement = [];
                this.game.queue.push(`ROUNDOVER\t${JSON.stringify(winner_array)}\t${method}`);

        }

        // Extension of game engine stub for advanced stake selection before starting a game
        
        attachAdvancedOptionsEventListeners() {

                let blindModeInput = document.getElementById('blind_mode');
                let numChips = document.getElementById('num_chips');
                let blindDisplay = document.getElementById('blind_explainer');
                let crypto = document.getElementById('crypto');
                let stakeValue = document.getElementById('stake');
                let chipInput = document.getElementById('chip_wrapper');
                //let stake = document.getElementById("stake");

                const updateChips = function () {
                        if (numChips && stakeValue && chipInput /*&& stake*/) {
                                if (crypto.value == '') {
                                        chipInput.style.display = 'none';
                                        stake.value = '0';
                                } else {
                                        let nChips = parseInt(numChips.value);
                                        let stakeAmt = parseFloat(stakeValue.value);
                                        let jsMath = stakeAmt / nChips;
                                        chipInput.style.display = 'block';
                                }
                        }
                };

                if (blindModeInput && blindDisplay) {
                        blindModeInput.onchange = function () {
                                if (blindModeInput.value == 'static') {
                                        blindDisplay.textContent =
                                                'Small blind is one chip, big blind is two chips throughout the game';
                                } else {
                                        blindDisplay.textContent =
                                                'Small blind starts at one chip, and increments by 1 every 5 rounds';
                                }
                        };
                }

                if (crypto) {
                        crypto.onchange = updateChips;
                }
                if (numChips) {
                        numChips.onchange = updateChips;
                }
        }


}

module.exports = PokerStake;
