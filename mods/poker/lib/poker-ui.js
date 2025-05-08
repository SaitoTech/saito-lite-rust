class PokerUI {
  returnPlayerRole(player) {
    
    if (this.game.state.winners.length > 0) {
      if (this.game.state.winners.includes(player)) {
        return 'Winner!';
      }
    }

    if (player == this.game.state.button_player && player == this.game.state.small_blind_player) {
      return 'dealer / small blind';
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
        this.displayPlayerNotice(`<div class="plog-update"></div>`, i);
      }
    }
  }

  clearPlayers(){
    //
    // clear displayed cards... / button / player-pots
    //
    for (let i = 1; i <= this.game.players.length; i++) {
      this.playerbox.updateGraphics('', i);
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
        this.playerbox.updateGraphics(`<div class="dealer-button" title="dealer button">D</div>`, i); 
      }else{
        this.playerbox.updateGraphics('', i); 
      }

      if (this.game.state.player_pot[i - 1] && !this.loadGamePreference("poker-hide-pot")){
        let html = `<div class="poker-player-stake"><span class="stake-in-chips">${this.game.state.player_pot[i - 1]}</span></div>`;
        this.playerbox.replaceGraphics(html, ".poker-player-stake", i); 
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
      this.playerbox.updateBody(`<div class="status" id="status"></div><div class="controls" id="controls"></div>`, player);
      this.updateStatus(msg);
    } else {
      this.playerbox.updateBody(msg, player);
    }

    console.log("displayPlayerNotice:", msg);
  }

  // Update the player's role and wager...
  displayPlayerStack(player, amount = -1) {
    if (!this.browser_active) {
      return;
    }

    if (amount === -1){
      amount = this.game.state.player_credit[player - 1];
    }
    let credit = this.convertChipsToCrypto(amount);

    //
    // Amount = number of chips in player stack, credit = crypto value of chips in player stack
    //

    let chips = 'CHIP';
    if (amount !== 1){
      chips += "S";
    } 

    let stack_html = stack_html = `<div class="poker-stack-balance">${amount}</div><div class="poker-stack-units">${chips}</div>`;

    if (this.game.crypto && this.game.crypto !== "CHIPS"){
      // Could add a test for an option to should crypto by default (either globally or just a toggle here)
      stack_html += `<div class="crypto-hover-balance">${credit} <span class="smaller-font">${this.game.crypto}</span></div>`;
    }

    this.playerbox.updateIcons(stack_html, player);

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
              this.pot.render(Math.max(0, --amount));
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

    let qs;

    for (let i = 1; i <= amount; i++){

      this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, `.game-playerbox-${better}`),
        ".pot",
        {
          callback: () => {
            this.pot.render(++initial_pot);
            this.displayPlayerStack(better, --initial_stack);
            // player_pot is update outside the animation...
            qs = this.playerbox.replaceGraphics(`<div class="poker-player-stake"><span class="stake-in-chips">${this.game.state.player_pot[better - 1]+i}</span></div>`, ".poker-player-stake", better); 
            this.pot.addPulse();
          },
          run_all_callbacks: true
        },
        (item) => {

          if (this.loadGamePreference("poker-hide-pot")){
            setTimeout(()=> {
              document.querySelector(qs).classList.add("invisible");
            }, 500);
          }

          if (!restartQueue){
            $(item).remove(); 
          }else{
            $('.animated_elem').remove();
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

    //
    // cancel raise kicks us back
    //
    if (!poker_self.moves.includes('resolve\tturn')) {
      poker_self.addMove('resolve\tturn');
    }

    let match_required =
      this.game.state.required_pot - this.game.state.player_pot[this.game.player - 1];

    if (match_required == 0 && this.game.state.all_in) {
      poker_self.addMove(`allin`);
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

    this.displayPlayerNotice(`your turn:`, this.game.player);

    let html = '<div class="option" id="fold"><img src="/poker/img/fold_icon.svg" alt="fold"><span>fold</span></div>';

    if (match_required > 0) {
      html += `<div class="option" id="call"><img src="/poker/img/call_icon.svg" alt="call"><span>call <span class="call-wager">(${this.formatWager(match_required, false)})</span></span></div>`;
    } else {
      // we don't NEED to match
      html += '<div class="option" id="check"><img src="/poker/img/check_icon.svg" alt="check"><span>check</span></div>';
    }
    if (can_raise) {
      html += `<div class="option" id="raise"><img src="/poker/img/raise_icon.svg" alt="raise"><span>raise</span></div>`;
    }

    this.updateControls(html);

    $('.option').off();
    $('.option').on('click', async function () {
      let choice = $(this).attr('id');

      if (choice === 'raise') {
        let credit_remaining =
          poker_self.game.state.player_credit[poker_self.game.player - 1] - match_required;

        html = `<div class="option raise_option" id="0"><img src="/poker/img/cancel_raise_icon.svg" alt="cancel"></div>`;
        if (match_required > 0) {
          html += `match ${poker_self.formatWager(match_required)} and  `;
        } 
        html += `raise: `;
        
        poker_self.updateStatus(html);

        let max_raise = Math.min(credit_remaining, smallest_stack);

        html = "";

        for (let i = 0; i < 3; i++) {
          let this_raise = poker_self.game.state.last_raise * 2**i;

          if (max_raise > this_raise) {
            html += `<div class="option raise_option" id="${this_raise + match_required}"><img src="/poker/img/raise_value_icon.svg" alt="raise">`;
            html += poker_self.formatWager(this_raise, false);
            if (poker_self.game.stake && poker_self.game.crypto !== "CHIPS"){
              html += `<div class="crypto-hover-raise">${poker_self.convertChipsToCrypto(this_raise)} <span class="smaller-font"> ${poker_self.game.crypto}</span></div>`
            }
            html += "</div>";
          } else {
            break;
          }
        }

        //Option for manual input...
        html += `<div class="option raise_option" id="manual"><img src="/poker/img/raise_allin_icon.svg" alt="raise"><span>?</span></div>`;

        //Always give option for all in
        html += `<div class="option raise_option all-in" id="${max_raise + match_required}"><img src="/poker/img/raise_allin_icon.svg" alt="raise">`;
        html += poker_self.formatWager(max_raise, false);
        if (poker_self.game.stake && poker_self.game.crypto !== "CHIPS"){
          html += `<div class="crypto-hover-raise">${poker_self.convertChipsToCrypto(max_raise)} <span class="smaller-font"> ${poker_self.game.crypto}</span></div>`
        }
        html += `</div>`;


        poker_self.updateControls(html);

        const enterRaise = async () => {
          let c = await sprompt("How many chips would you like to raise?");
          if (c){
            let amt = parseInt(c);
            if (amt >= poker_self.game.state.last_raise && amt <= max_raise){
              poker_self.addMove(`raise\t${poker_self.game.player}\t${amt+match_required}`);
              poker_self.endTurn();
            }else{
              await sconfirm("Invalid input");
              enterRaise();
            }
          }
        }

        $('.option').off();
        $('.option').on('click', async function () {
          let raise = $(this).attr('id');

          if (raise === '0') {
            poker_self.playerTurn();
          } else if (raise === 'manual'){
            enterRaise();
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
