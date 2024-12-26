class PokerUI {

        returnPlayerRole(player) {
                if (this.game.state.winners.includes(player)){
                        return "Winner!";
                }
                if (player == this.game.state.button_player) {
                        return 'dealer';
                }
                if (player == this.game.state.small_blind_player) {
                        return 'small blind';
                }
                if (player == this.game.state.big_blind_player) {
                        return 'big blind';
                }

                return '';
        }

        displayPlayers(preserveLog = false) {
                if (!this.browser_active) {
                        return;
                }
                for (let i = 1; i <= this.game.players.length; i++) {

                        this.playerbox.updateUserline(this.returnPlayerRole(i), i);

                        this.displayPlayerStack(i);

                        if (!preserveLog) {
                                this.displayPlayerNotice('', i);
                        }
                }

        }

        displayHand() {
                if (this.game.player == 0) {
                        this.updateStatus(`You are observing the game`, -1);
                        return;
                }

                if (this.game.state.passed[this.game.player - 1]) {
                        this.cardfan.hide();
                } else {
                        this.cardfan.render();
                }
        }

        showPlayerHand(player, card1, card2){
                if (!this.gameBrowserActive()){
                        return;
                }

                  let playercards = `<div class="other-player-hand hand">
                    <div class="card"><img src="${this.card_img_dir}/${this.game.deck[0].cards[card1].name}"></div>
                    <div class="card"><img src="${this.card_img_dir}/${this.game.deck[0].cards[card2].name}"></div>
                  </div>
                `;

                this.playerbox.updateGraphics(playercards, player);

        }

        //
        // Updates the status / text information body of player box
        //
        displayPlayerNotice(msg, player) {
                if (player == this.game.player){
                        this.playerbox.updateBody(`<div class="status"></div>`, player);
                        this.updateStatus(msg);
                }else{
                        this.playerbox.updateBody(msg, player);
                }
                
        }

        // Update the player's role and wager... 
        displayPlayerStack(player) {

                if (!this.browser_active) { return; }

                let credit = this.convertChipsToCrypto(this.game.state.player_credit[player - 1]);
                let chips = this.game.crypto || ('CHIP' + credit !== 1 ? "S" : "");

                this.playerbox.updateIcons(`<div class="poker-stack-balance">${credit}</div><div class="poker-stack-units">${chips}</div>`, player);

        }


/*
        updateStatus(str, hide_info = 0) {
                if (str.indexOf('<') == -1) {
                        str = `<div style="padding-top:2rem">${str}</div>`;
                }

                this.game.status = str;
                if (!this.browser_active) {
                        return;
                }
                if (this.lock_interface == 1) {
                        return;
                }

                //
                // insert status message into playerbox BODY unless the status
                // already exists, in which case we simplify update it instead
                // of updating the body again.
                //
                let status_obj = document.querySelector('.status');
                if (status_obj) {
                        status_obj.innerHTML = str;
                } else {
                        this.playerbox.updateBody(
                                `<div class="status">${str}</div>`,
                                this.game.player
                        );
                }
        }
*/

        playerTurn() {
                if (this.browser_active == 0) {
                        return;
                }
                if (this.game.player == 0) {
                        salert('How on earth did we call player-zero turn??');
                        return;
                }

                let poker_self = this;
                let balance_html = '';
                let html = '';
                let mobileToggle =
                        window.matchMedia('(orientation: landscape)').matches &&
                        window.innerHeight <= 600;

                //
                // cancel raise kicks us back
                //
                if (!poker_self.moves.includes('resolve\tturn')) {
                        poker_self.addMove('resolve\tturn');
                }

                let match_required =
                        this.game.state.required_pot -
                        this.game.state.player_pot[this.game.player - 1];

                if (match_required == 0 && this.game.state.all_in) {
                        poker_self.endTurn();
                        return;
                }

                if (match_required < 0) {
                        console.warn('Hmmm, can bet negative chips');
                        match_required = 0;
                }

                //These would be a strange edge case
                this.game.state.last_raise = Math.max(
                        this.game.state.last_raise,
                        this.game.state.big_blind
                );

                let can_call =
                        this.game.state.player_credit[this.game.player - 1] >=
                        match_required;
                let can_raise =
                        !this.game.state.all_in &&
                        this.game.state.player_credit[this.game.player - 1] >
                                match_required;

                //cannot raise more than everyone can call.
                //
                // TODO - buy-ins will change this smallest stack calculation
                //
                let smallest_stack = this.game.chips * poker_self.game.players.length; //Start with total amount of money in the game
                let smallest_stack_player = 0;

                poker_self.game.state.player_credit.forEach((stack, index) => {
                        if (poker_self.game.state.passed[index] == 0) {
                                stack += this.game.state.player_pot[index];
                                stack -= this.game.state.required_pot;
                                if (stack < smallest_stack) {
                                        smallest_stack = stack;
                                        smallest_stack_player = index;
                                }
                        }
                });

                if (!can_call) {
                        this.updateStatus('You can only fold...');
                        this.addMove('fold\t' + poker_self.game.player);
                        this.endTurn();
                        return;
                }

                balance_html = `
  <div class="menu-player-upper">
          <div style="float:right;" class="saito-balance">!!!${this.formatWager(
                this.game.state.player_credit[this.game.player - 1]
        )}</div>
        </div>
    `;
                this.app.browser.replaceElementBySelector(
                        balance_html,
                        `.game-playerbox-body-${this.game.player} .menu-player-upper`
                );

                html = '<ul>';
                html += '<li class="option" id="fold">fold</li>';

                if (match_required > 0) {
                        html += `<li class="option" id="call">call - ${this.formatWager(
                                match_required
                        )}</li>`;
                } else {
                        // we don't NEED to match
                        html += '<li class="option" id="check">check</li>';
                }
                if (can_raise) {
                        html += `<li class="option" id="raise">raise</li>`;
                }
                html += '</ul>';

                this.updateStatus(html);

                $('.option').off();
                $('.option').on('click', function () {
                        let choice = $(this).attr('id');

                        if (choice === 'raise') {
                                let credit_remaining =
                                        poker_self.game.state.player_credit[
                                                poker_self.game.player - 1
                                        ] - match_required;

                                html = `<div class="menu-player">`;
                                if (match_required > 0) {
                                        html += `match ${poker_self.formatWager(
                                                match_required
                                        )} and raise `;
                                } else {
                                }
                                html += `</div><ul><li class="option" id="0">${
                                        mobileToggle ? 'nope' : 'cancel raise'
                                }</li>`;
                                let max_raise = Math.min(credit_remaining, smallest_stack);

                                for (let i = 0; i < 4; i++) {
                                        let this_raise =
                                                poker_self.game.state.last_raise +
                                                i * poker_self.game.state.last_raise;

                                        if (max_raise > this_raise) {
                                                html += `<li class="option" id="${
                                                        this_raise + match_required
                                                }">${
                                                        mobileToggle ? ' ' : 'raise '
                                                }${poker_self.formatWager(this_raise)}</li>`;
                                        } else {
                                                break;
                                        }
                                }

                                //Always give option for all in
                                html += `<li class="option" id="${max_raise + match_required}">
                  raise ${poker_self.formatWager(max_raise)}
                  (all in${
        smallest_stack_player !== poker_self.game.player - 1
                ? ` for ${poker_self.game.state.player_names[smallest_stack_player]}`
                : ''
})</li>`;

                                html += '</ul>';
                                poker_self.updateStatus(html);

                                $('.option').off();
                                $('.option').on('click', function () {
                                        let raise = $(this).attr('id');

                                        if (raise === '0') {
                                                poker_self.playerTurn();
                                        } else {
                                                poker_self.addMove(
                                                        `raise\t${poker_self.game.player}\t${raise}`
                                                );
                                                poker_self.endTurn();
                                        }
                                });
                        } else {
                                poker_self.addMove(`${choice}\t${poker_self.game.player}`);
                                poker_self.endTurn();
                        }
                });
        }



}

module.exports = PokerUI;
