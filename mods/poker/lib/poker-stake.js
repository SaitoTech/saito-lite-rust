class PokerStake {

        //
        // initializes chips / pools / pots information
        //
        initializeGameStake(crypto = 'CHIPS', stake = '100') {
                console.log("Initialize Poker Stakes!");
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
                if (this.game.options.blind_mod) {
                        this.game.blind_mod = this.game.options.blind_mode;
                }

                this.settleNow = true;

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



}

module.exports = PokerStake;
