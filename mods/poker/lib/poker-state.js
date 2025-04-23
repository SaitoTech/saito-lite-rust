
class PokerState {


        returnState(num_of_players) {
                let state = {};

                state.round = 1;
                state.flipped = 0;

                state.player_cards = {};
                state.player_cards_reported = 0;
                state.player_cards_required = 0;

                state.plays_since_last_raise = 0;

                state.big_blind_player = 1;
                state.small_blind_player = 2;
                state.button_player = 3;

                if (num_of_players == 2) {
                        state.button_player = 2;
                        state.big_blind_player = 1;
                        state.small_blind_player = 2;
                }

                state.player_names = [];
                state.player_pot = [];
                state.player_credit = [];
                state.passed = [];
                state.debt = [];

                state.winners = [];
                state.last_fold = null;

                //
                // initializeGameStake should flesh this out
                //
                for (let i = 0; i < num_of_players; i++) {
                        state.passed[i] = 0;
                        state.player_pot[i] = 0;
                        state.player_credit[i] = 0;
                        state.debt[i] = 0;
                        state.player_names[i] = this.app.keychain.returnUsername(
                                this.game.players[i],
                                12
                        );
                }

                state.big_blind = 2;
                state.small_blind = 1;
                state.last_raise = 2;
                state.required_pot = 2;
                state.all_in = false;

                return state;
        }



        returnStats() {
                let stats = {};
                for (let i = 0; i < this.game.players.length; i++) {
                        stats[this.game.players[i]] = {};
                        stats[this.game.players[i]].hands = 0;
                        stats[this.game.players[i]].wins = 0;
                        stats[this.game.players[i]].folds = 0;
                        stats[this.game.players[i]].walks = 0;
                        stats[this.game.players[i]].vpip = 0;
                        stats[this.game.players[i]].showdowns = 0;
                }
                return stats;
        }

        removePlayerFromState(pkey) {

                let index = this.game.players.indexOf(pkey);

                if (index >= 0 && index < this.game.state.player_names.length){
                        this.game.stats[pkey].final_chips = this.game.state.player_credit[index];
                        this.game.state.player_names.splice(index, 1);
                        this.game.state.player_pot.splice(index, 1);
                        this.game.state.player_credit.splice(index, 1);
                        this.game.state.passed.splice(index, 1);
                        this.game.state.debt.splice(index, 1);
                        return `${this.game.stats[pkey].final_chips} CHIPS`;
                }else{
                        console.warn("Invalid index removePlayerFromState");
                }
        }

        addPlayerToState(pkey){
                let index = this.game.players.indexOf(pkey);

                console.log(pkey, index, this.game.players);

                this.game.state.player_names.push(this.app.keychain.returnUsername(this.game.players[index], 12));
                this.game.state.player_pot.push(0);
                this.game.state.player_credit.push(this.game.chips);
                this.game.state.passed.push(0);
                this.game.state.debt.push(0);

                // And for stats...

                this.game.stats[pkey] = {};
                this.game.stats[pkey].hands = 0;
                this.game.stats[pkey].wins = 0;
                this.game.stats[pkey].folds = 0;
                this.game.stats[pkey].walks = 0;
                this.game.stats[pkey].vpip = 0;
                this.game.stats[pkey].showdowns = 0;

        }


}

module.exports = PokerState;
