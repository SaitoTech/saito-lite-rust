

    /////////////////
    // Bay of Pigs //
    /////////////////
    if (card == "bayofpigs") {

      this.startClockAndSetActivePlayer(1);
      if (this.game.player == 1) {

        this.addMove("resolve\tbayofpigs");
        let twilight_self = this;

	let available = [];
	let ac = this.returnAllCards(true);

        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  let c = this.game.deck[0].cards[this.game.deck[0].hand[i]];
	  if (this.modifyOps(this.game.deck[0].cards[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], "ussr") == 2 && c.player === "us") {
	    available.push(this.game.deck[0].hand[i]);
	  }
        }

        let html = `<ul>`;
        for (let i = 0; i < available.length; i++) {
          html += `<li class="option" id="${available[i]}">${ac[available[i]].name}</li>`;
        }
	html += `<li class="option" id="skip">do not discard</li>`;
        html += `</ul>`;

        this.updateStatusWithOptions(`${this.cardToText(card)} discard:`, html, function(action2) {

	  let discarded = false;

	  if (action2 !== "skip") {
            twilight_self.removeCardFromHand(action2);
	    twilight_self.addMove("discard\tussr\t"+action2);
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


