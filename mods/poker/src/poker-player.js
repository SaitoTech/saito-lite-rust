

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
          <div style="float:right;" class="saito-balance">${this.formatWager(
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


        endTurn(nextTarget = 0) {
                if (this.browser_active) {
                        this.updateStatus('waiting for information from peers...');
                        $('.option').off();
                }

                super.endTurn(nextTarget);
        }




