
    if (card == "nixonshock") {

      let twilight_self = this;

      if (twilight_self.game.state.events.energycrisis == 1) {
        twilight_self.updateLog("Energy Crisis cancels Nixon Shock");
        return 1;
      }

      twilight_self.game.state.events.nixonshock = 1;
      twilight_self.cancelEvent("energycrisis");

      twilight_self.startClockAndSetActivePlayer(2);

      if (twilight_self.game.player == 2) {

        twilight_self.addMove("resolve\tnixonshock");

        twilight_self.updateStatusWithOptions(`${twilight_self.cardToText(card)}: `,'<ul><li class="option" id="draw">Drawl Additional Card from Deck</li><li class="option" id="skip">Skip</li></ul>', function(action2) {

	  if (action2 === "skip") {
	    twilight_self.endTurn();
	    return 0;
	  }

	  //
	  // offer to USSR
	  //
	  twilight_self.addMove("nixon_shock_play_card_or_hand_to_opponent\t2\t"+player);

	  //
	  // need reshuffle? do it
	  //
          if (1 > twilight_self.game.deck[0].crypt.length) {

            twilight_self.addMove("DEAL\t1\t2\t1");

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
          } else {
            twilight_self.addMove("DEAL\t1\t2\t1");
	  }
          twilight_self.endTurn();
	  
        });

      }

      return 0;

    }

