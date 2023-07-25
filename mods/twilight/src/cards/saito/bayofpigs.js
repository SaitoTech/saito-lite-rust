

    /////////////////
    // Bay of Pigs //
    /////////////////
    if (card == "bayofpigs") {

      if (this.game.player == 1) {

        this.startClock();
        this.addMove("resolve\tbayofpigs");
        let twilight_self = this;

        let holding_voa = false;
        let holding_gs = false;

        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (this.game.deck[0].hand[i] == "grainsales") { holding_gs = true; }
          if (this.game.deck[0].hand[i] == "voiceofamerica") { holding_voa = true; }
        }

        let html = `<ul>`;
        if (holding_voa == true) { html += `<li class="option" id="voa">discard Voice of America</li>`; }
        if (holding_gs == true) { html += `<li class="option" id="gs">discard Grain Sales</li>`; }
        html += `<li class="option" id="skip">do not discard</li>`;
        html += `</ul>`;

        this.updateStatusWithOptions(`${this.cardToText(card)}:`, html, function(action2) {

	  let discarded = false;

	  if (action2 === "voa") {
            twilight_self.removeCardFromHand("voiceofamerica");
	    twilight_self.addMove("discard\tussr\tvoiceofamerica");
	    discarded = true;
	  }

	  if (action2 === "gs") {
            twilight_self.removeCardFromHand("voiceofamerica");
	    twilight_self.addMove("discard\tussr\tgrainsales");
	    discarded = true;
	  }

	  if (discarded == true) {

            twilight_self.addMove("DEAL\t1\t1\t1");

	    if (twilight_self.game.deck[0].crypt.length == 0) {

              let discarded_cards = this.returnDiscardedCards();

              // shuffle in discarded cards
              twilight_self.addMove("SHUFFLE\t1");
              twilight_self.addMove("DECKRESTORE\t1");
              twilight_self.addMove("DECKENCRYPT\t1\t2");
              twilight_self.addMove("DECKENCRYPT\t1\t1");
              twilight_self.addMove("DECKXOR\t1\t2");
              twilight_self.addMove("DECKXOR\t1\t1");
              twilight_self.addMove("DECK\t1\t"+JSON.stringify(discarded_cards));
              //this.game.queue.push("DECKBACKUP\t1");
              twilight_self.addMove("HANDBACKUP\t1");
              twilight_self.updateLog("Shuffling discarded cards back into the deck...");

	    }

	  }

	  twilight_self.endTurn();

	});

      } else {
        this.updateStatus(`<div class='status-message' id='status-message'>USSR responding to ${this.cardToText(card)}</div>`);
      }

      return 0;

    }


