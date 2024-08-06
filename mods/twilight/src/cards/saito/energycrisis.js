
    if (card == "energycrisis") {

      let twilight_self = this;

      if (twilight_self.game.state.events.nixonshock == 1) {
	twilight_self.updateLog("Nixon Shock cancels Energy Crisis");
	return 1;
      }

      twilight_self.game.state.events.energycrisis = 1;
      twilight_self.cancelEvent("nixonshock");

      twilight_self.startClockAndSetActivePlayer(2);
      if (this.game.player == 2) {

        twilight_self.addMove("resolve\tenergycrisis");

	let has_ops_to_discard = false;
        for (let i = 0; i < twilight_self.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].cards[this.game.deck[0].hand[i]].ops >= 2 && this.game.deck[0].cards[this.game.deck[0].hand[i]].player === "us") {
	    has_ops_to_discard = true;
	  }
	}

	if (has_ops_to_discard == false) {
	  twilight_self.addMove("vp\tussr\t2");
	  twilight_self.endTurn();
	  return 0;
	}


        twilight_self.updateStatusWithOptions(`${twilight_self.cardToText(card)}: `,'<ul><li class="option" id="givevp">give USSR 2 VP</li><li class="option" id="discard">discard US OPs</li></ul>', function(action2) {

  	  if (action2 === "givevp") {
	    twilight_self.addMove("vp\tussr\t2");
	    twilight_self.endTurn();
	    return 0;
	  }

  	  if (action2 === "discard") {

            let user_message = `${twilight_self.cardToText(card)} -- select card to discard:`;
            let cardList = [];
            for (let i = 0; i < twilight_self.game.deck[0].hand.length; i++) {
	      if (twilight_self.game.deck[0].cards[twilight_self.game.deck[0].hand[i]].ops >= 2 && twilight_self.game.deck[0].cards[twilight_self.game.deck[0].hand[i]].player === "us") {
                let card_in_hand = twilight_self.game.deck[0].hand[i];
                if (card_in_hand != "china" && card_in_hand != twilight_self.game.state.headline_opponent_card && card_in_hand != twilight_self.game.state.headline_card) {
                  cardList.push(card_in_hand);
                }
              }
            }

            twilight_self.updateStatusAndListCards(user_message, cardList, false);
            twilight_self.hud.attachControlCallback(function(action2) {
              if (twilight_self.game.deck[0].hand.includes(action2)){
                try {$(`#${action2}.card`).hide();} catch (err) {}
                twilight_self.removeCardFromHand(action2);
                twilight_self.updateStatus("discarding...");
                twilight_self.addMove("discard\tus\t"+action2);
		twilight_self.endTurn();
              }
            });

	  }

        });

      }

      return 0;

    }



