
    //
    // US may discard any number of cards and replace them with a new draw
    if (card == "asknot") {

      let ac = this.returnAllCards(true);

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        var twilight_self = this;
        let cards_discarded = 0;

        let user_message = `${this.cardToText(card)} -- Select cards to discard:`;
        let cardList = [];
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          let card_in_hand = this.game.deck[0].hand[i];
          if (card_in_hand != "china" && card_in_hand != this.game.state.headline_opponent_card && card_in_hand != this.game.state.headline_card) {
            //html += '<li class="card card_'+this.game.deck[0].hand[i]+'" id="'+this.game.deck[0].hand[i]+'">'+ac[this.game.deck[0].hand[i]].name+'</li>';
            cardList.push(card_in_hand);
          }
        }

        if (cardList.length == 0) {
          twilight_self.addMove("notify\tUS has no cards available to discard");
          twilight_self.endTurn();
          return;
        }

        cardList.push("finished");
        //html += '<span class="card dashed nocard" id="finished">done discarding</span></ul>';

        twilight_self.updateStatusAndListCards(user_message, cardList, false);
        twilight_self.addMove("resolve\tasknot");
        twilight_self.hud.attachControlCallback(function(action2) {

          if (action2 == "finished") {

      	    //
            // if Aldrich Ames is active, US must reveal cards
            //
            if (twilight_self.game.state.events.aldrich == 1) {
              twilight_self.addMove("aldrichreveal\tus");
            }

            //
      	    // cards to deal first
      	    //
      	    let cards_to_deal_before_reshuffle = cards_discarded;
	    
            if (cards_to_deal_before_reshuffle > twilight_self.game.deck[0].crypt.length) {
      	      cards_to_deal_before_reshuffle = twilight_self.game.deck[0].crypt.length;
      	      let cards_to_deal_after_reshuffle = cards_discarded - cards_to_deal_before_reshuffle;
              if (cards_to_deal_after_reshuffle > 0) {
                twilight_self.addMove("DEAL\t1\t2\t"+cards_to_deal_after_reshuffle);
              }

              let discarded_cards = twilight_self.returnDiscardedCards();

              //
              // shuttle diplomacy
              //
              if (this.game.state.events.shuttlediplomacy == 1) {
                if (discarded_cards['shuttle'] != undefined) {
                  delete discarded_cards['shuttle'];
                }
              }


              if (Object.keys(discarded_cards).length > 0) {

                //
                // shuffle in discarded cards
                //
                twilight_self.addMove("SHUFFLE\t1");
                twilight_self.addMove("DECKRESTORE\t1");
                twilight_self.addMove("DECKENCRYPT\t1\t2");
                twilight_self.addMove("DECKENCRYPT\t1\t1");
                twilight_self.addMove("DECKXOR\t1\t2");
                twilight_self.addMove("DECKXOR\t1\t1");
                twilight_self.addMove("flush\tdiscards"); // opponent should know to flush discards as we have
                twilight_self.addMove("DECK\t1\t"+JSON.stringify(discarded_cards));
                twilight_self.addMove("DECKBACKUP\t1");
                twilight_self.addMove("NOTIFY\tcards remaining: " + twilight_self.game.deck[0].crypt.length);
                twilight_self.addMove("NOTIFY\tShuffling discarded cards back into the deck...");

              }
      	    }

            twilight_self.addMove("DEAL\t1\t2\t"+cards_to_deal_before_reshuffle);
            twilight_self.endTurn();

          } else {
            if (this.game.deck[0].hand.includes(action2)){
              cards_discarded++;
              $(`#${action2}.card`).hide();
              twilight_self.removeCardFromHand(action2);
              twilight_self.addMove("discard\tus\t"+action2);  
            }
          }
        });

      }

      return 0;

    }

