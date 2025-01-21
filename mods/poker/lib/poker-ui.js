class PokerUI {
  returnPlayerRole(player) {
    if (this.game.state.winners.includes(player)) {
      return 'Winner!';
    }

    if (player == this.game.state.button_player && player == this.game.state.big_blind_player) {
      return 'dealer / big blind';
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

  refreshPlayerboxes(){
      this.playerbox.removeBoxes();
      this.playerbox.render();
      this.displayPlayerNotice(this?.status || "", this.game.player);

      $(".game-playerbox-seat-1").appendTo(".mystuff");
      
      if (this.game.player == 0){
        this.observerControls.render();
      }else{
        this.observerControls.remove();  
      }
  }

  displayButton(){
    for (let i = 1; i <= this.game.players.length; i++) {
      if (i == this.game.state.button_player){
        this.playerbox.updateGraphics(`<div class="dealer-button"></div>`, i); 
      }else{
        this.playerbox.updateGraphics('', i); 
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

  showPlayerHand(player, card1, card2) {
    if (!this.gameBrowserActive()) {
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
    if (!player) {
      return;
    }
    if (player == this.game.player) {
      this.playerbox.updateBody(`<div class="status"></div>`, player);
      this.updateStatus(msg);
    } else {
      this.playerbox.updateBody(msg, player);
    }
  }

  // Update the player's role and wager...
  displayPlayerStack(player, amount = -1) {
    if (!this.browser_active) {
      return;
    }

    let credit = this.convertChipsToCrypto(this.game.state.player_credit[player - 1]);

    if (amount !== -1){
      credit = this.convertChipsToCrypto(amount);
    }

    let chips = this.game.crypto || ('CHIP' + credit !== 1 ? 'S' : '');

    this.playerbox.updateIcons(
      `<div class="poker-stack-balance">${credit}</div><div class="poker-stack-units">${chips}</div>`,
      player
    );
  }


  //
  // We will actually increment player stack / decrement the game pot in this function!!!
  //
  async animateWin(amount, winners){ 

    this.animating = true;

    let step_speed = Math.min(200, 1000/amount);

    while (amount >= Object.keys(winners).length && this.animating) {
  
      for (let j in winners){
        j = parseInt(j);
        this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, ".pot"),
          `.game-playerbox-${j + 1}`,
          {
            callback: () => {
              this.pot.render(--amount);
              this.displayPlayerStack(j + 1, ++winners[j]);
            },
            run_all_callbacks: true
          },
          (item) => {
            $(item).remove();
          });
        await this.timeout(step_speed);
      }
    }

    if (amount > 0) {
      // ***TO DO: examine possibility of fractional chips
      // Randomly give the remaining chip to one player
    }


  }

  async animateBet(better, amount, restartQueue = false){

    if (restartQueue){
      this.halted = 1;
    }

    let initial_pot = this.pot.render();
    let initial_stack = this.game.state.player_credit[better-1];

    let step_speed = Math.min(150, 550/amount);

    for (let i = 0; i < amount; i++){

      this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, `.game-playerbox-${better}`),
        ".pot",
        {
          callback: () => {
            this.pot.render(++initial_pot);
            this.displayPlayerStack(better, --initial_stack);
            this.pot.addPulse();
          },
          run_all_callbacks: true
        },
        (item) => {
          if (!restartQueue){
            $(item).remove(); 
          }else{
            $('.animated_elem').remove();
            console.log("*******************************");
            this.restartQueue();
          }
          
        });
      await this.timeout(step_speed);
    }
    await this.timeout(500);
  }


  /*
  This is the core Poker function
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
    let mobileToggle =
      window.matchMedia('(orientation: landscape)').matches && window.innerHeight <= 600;

    //
    // cancel raise kicks us back
    //
    if (!poker_self.moves.includes('resolve\tturn')) {
      poker_self.addMove('resolve\tturn');
    }

    let match_required =
      this.game.state.required_pot - this.game.state.player_pot[this.game.player - 1];

    if (match_required == 0 && this.game.state.all_in) {
      poker_self.endTurn();
      return;
    }

    if (match_required < 0) {
      console.warn('Hmmm, can bet negative chips');
      match_required = 0;
    }

    //These would be a strange edge case
    this.game.state.last_raise = Math.max(this.game.state.last_raise, this.game.state.big_blind);

    let can_call = this.game.state.player_credit[this.game.player - 1] >= match_required;
    let can_raise =
      !this.game.state.all_in &&
      this.game.state.player_credit[this.game.player - 1] > match_required;

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

    let html = '<ul>';
    html += '<li class="option" id="fold">fold</li>';

    if (match_required > 0) {
      html += `<li class="option" id="call">call - ${this.formatWager(match_required)}</li>`;
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
    $('.option').on('click', async function () {
      let choice = $(this).attr('id');

      if (choice === 'raise') {
        let credit_remaining =
          poker_self.game.state.player_credit[poker_self.game.player - 1] - match_required;

        html = `<div class="menu-player">`;
        if (match_required > 0) {
          html += `match ${poker_self.formatWager(match_required)} and raise `;
        } else {
        }
        html += `</div><ul><li class="option" id="0">${
          mobileToggle ? 'nope' : 'cancel raise'
        }</li>`;
        let max_raise = Math.min(credit_remaining, smallest_stack);

        for (let i = 0; i < 4; i++) {
          let this_raise = poker_self.game.state.last_raise + i * poker_self.game.state.last_raise;

          if (max_raise > this_raise) {
            html += `<li class="option" id="${this_raise + match_required}">${
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
            poker_self.addMove(`raise\t${poker_self.game.player}\t${raise}`);
            poker_self.endTurn();
          }
        });
      } else {
        if (choice == "fold" && !match_required){
                let c = await sconfirm("Are you sure you want to fold?");
                if (!c){
                        poker_self.playerTurn();
                        return;
                }
        }
        poker_self.addMove(`${choice}\t${poker_self.game.player}`);
        poker_self.endTurn();
      }
    });
  }
}

module.exports = PokerUI;
