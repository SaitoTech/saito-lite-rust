const PokerGameRulesTemplate = require('./poker-game-rules.template');
const PokerGameOptionsTemplate = require('./poker-game-options.template');
//const GameTemplateArcade = require('../../../lib/templates/gametemplate-src');


class PokerState {


        returnState(num_of_players) {
                let state = {};

                state.round = 1;
                state.flipped = 0;

                state.player_cards = {};
                state.player_cards_reported = 0;
                state.player_cards_required = 0;

                state.plays_since_last_raise = 0;

                state.pot = 0;

                state.big_blind_player = 1;
                state.small_blind_player = 2;
                state.button_player = 3;

                if (num_of_players == 2) {
                        state.button_player = 2;
                        state.big_blind_player = 2;
                        state.small_blind_player = 1;
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

        removePlayerFromState(index) {
                if (index >= 0 && index < this.game.state.player_names.length){
                        this.game.state.player_names.splice(index, 1);
                        this.game.state.player_pot.splice(index, 1);
                        this.game.state.player_credit.splice(index, 1);
                        this.game.state.passed.splice(index, 1);
                        this.game.state.debt.splice(index, 1);
                }else{
                        console.warn("Invalid index removePlayerFromState");
                }
        }

        returnGameRulesHTML() {
                return PokerGameRulesTemplate(this.app, this);
        }

        returnAdvancedOptions() {
                return PokerGameOptionsTemplate(this.app, this);
        }

        returnShortGameOptionsArray(options) {
                let sgoa = super.returnShortGameOptionsArray(options);
                let ngoa = {};
                let crypto = '';
                for (let i in sgoa) {
                        if (sgoa[i] != '') {
                                let okey = i;
                                let oval = sgoa[i];

                                let output_me = 1;
                                if (okey == 'chip') {
                                        if (oval !== '0') {
                                                okey = 'small blind';
                                        } else {
                                                output_me = 0;
                                        }
                                }
                                if (okey == 'blind_mode') {
                                        if (oval == 'increase') {
                                                okey = 'mode';
                                                oval = 'tournament';
                                        } else {
                                                output_me = 0;
                                        }
                                }
                                if (okey == 'num_chips') {
                                        okey = 'chips';
                                }

                                if (output_me == 1) {
                                        ngoa[okey] = oval;
                                }
                        }
                }

                return ngoa;
        }

}

module.exports = PokerState;
