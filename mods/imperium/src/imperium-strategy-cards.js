  

  //
  // NOTE: this.game.strategy_cards --> is an array that is used in combination with
  // this.game.strategy_cards_bonus to add trade goods to cards that are not selected
  // in any particular round.
  //
  returnStrategyCards() {
    return this.strategy_cards;
  }
  
  importStrategyCard(name, obj) {

    if (obj.name == null) 	{ obj.name = "Strategy Card"; }
    if (obj.rank == null) 	{ obj.rank = 1; }

    if (obj.returnCardImage == null) {
      obj.returnCardImage = (mode=0) => {

	let cards = this.returnStrategyCards();
	let idx = ""; for (let x in cards) { if (cards[x].name === obj.name) { idx = x; } }
        let picked = "not picked";
        let player = -1;
        let bonus = 0;
        let bonus_html = "";
        card_html = '';

        if (mode == 1) {

          for (let i = 0; i < this.game.state.strategy_cards.length; i++) {
            if (idx === this.game.state.strategy_cards[i]) {
              bonus = this.game.state.strategy_cards_bonus[i];
            }
          }

          if (bonus > 0) {
            bonus_html =
            `<div class="bonus">
              <i class="fas fa-database white-stroke"></i>
              <span>${bonus}</span>
            </div>`;
          }

          for (let i = 0; i < this.game.state.players_info.length; i++) {
            if (this.game.state.players_info[i].strategy.includes(idx)) {
              picked = "unplayed";
              player = (i+1);
              if (this.game.state.players_info[i].strategy_cards_played.includes(idx)) {
                picked = "played";
              };
            };
          }

          if (picked != "not picked") {
            card_html += `
              <div class="picked p${player} bk">${picked}</div>
           `;
          }
        }

        return `
          <div class="strategy-card strategy-card-${name}" id="${name}">
	    <img id="${name}" src="/imperium/img/cards${obj.img}">
	    <div class="text">${obj.text}</div>
	    ${bonus_html} ${card_html}
	  </div>
        `;
      };
    }


    obj.key = name;
    obj = this.addEvents(obj);
    this.strategy_cards[name] = obj;

  }  


  playStrategyCardPrimary(player, card) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.strategy_cards[card]) {
	this.strategy_cards[card].strategyPrimaryEvent(this, (i+1), player);
      }
    }
    return 0;
  }

  playStrategyCardSecondary(player, card) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.strategy_cards[card]) {
	this.strategy_cards[card].strategySecondaryEvent(this, (i+1), player);
      }
    }
    return 0;
  }

  playStrategyCardTertiary(player, card) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.strategy_cards[card]) {
	this.strategy_cards[card].strategyTertiaryEvent(this, (i+1), player);
      }
    }
    return 0;
  }



