

  nonPlayerTurn() {
    this.updateStatusAndListCards(`Opponent Turn`, this.game.deck[this.game.player-1].hand, function() {});
  }
  playerTurn() {

    if (this.browser_active == 0) { return; }

    //
    // show my hand
    //
    this.updateStatusAndListCards(`Your Turn <span id="end-turn" class="end-turn">[ or pass ]</span>`, this.game.deck[this.game.player-1].hand, function() {});

    //
    // players may click on cards in their hand
    //
    this.attachCardboxEvents((card) => {
      this.playerPlayCardFromHand(card);
    });

    //
    // players may also end their turn
    //
    document.getElementById("end-turn").onclick = (e) => {
      this.updateStatusAndListCards("Opponent Turn", this.game.deck[this.game.player-1].hand, function() {});
      this.prependMove("RESOLVE\t"+this.app.wallet.returnPublicKey());
      this.endTurn();
    }

    //
    // display board
    //
    this.displayBoard();

  }


  //
  // this moves a card from one location, such as a player's hand, to another, such as 
  // the discard or remove pile, or a location on the table, such as affixing it to 
  // another card.
  //
  moveCard(player, card, source, destination) {

console.log(player + " -- " + card + " -- " + source + " -- " + destination);

    switch(source) {

      case "hand":
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].hand[i] == card) {
	    this.game.deck[0].hand.splice(i, 1);
	    break;
	  }
	}
        break;

      case "lands":
        for (let i = 0; i < this.game.state.hands[player-1].lands.length; i++) {
	  if (this.game.state.hands[player-1].lands[i] == card) {
	    this.game.state.hands[player-1].lands.splice(i, 1);
	    break;
	  }
	}
	break;

      case "creatures":
        for (let i = 0; i < this.game.state.hands[player-1].creatures.length; i++) {
	  if (this.game.state.hands[player-1].creatures[i] == card) {
	    this.game.state.hands[player-1].creatures.splice(i, 1);
	    break;
	  }
	}
	break;

      case "sorcery":
      case "enchantments":
        for (let i = 0; i < this.game.state.hands[player-1].enchantments.length; i++) {
	  if (this.game.state.hands[player-1].enchantments[i] == card) {
	    this.game.state.hands[player-1].enchantments.splice(i, 1);
	    break;
	  }
	}
	break;

      case "graveyard":
        for (let i = 0; i < this.game.state.hands[player-1].graveyard.length; i++) {
	  if (this.game.state.hands[player-1].graveyard[i] == card) {
	    this.game.state.hands[player-1].graveyard.splice(i, 1);
	    break;
	  }
	}
	break;

      default:
    }


console.log("pushing card onto " + destination);

    let already_exists = 0;
    switch(destination) {

      case "hand":
        already_exists = 0;
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].hand[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.deck[0].hand.push(card);
	}
        break;

      case "lands":
	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].lands.length; i++) {
	  if (this.game.state.hands[player-1].lands[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].lands.push(card);
	}
	break;

      case "creatures":
	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].creatures.length; i++) {
	  if (this.game.state.hands[player-1].creatures[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].creatures.push(card);
	}
	break;

      case "sorcery":
      case "enchantments":

	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].enchantments.length; i++) {
	  if (this.game.state.hands[player-1].enchantments[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].enchantments.push(card);
	}
	break;

      case "graveyard":
	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].graveyard.length; i++) {
	  if (this.game.state.hands[player-1].graveyard[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].graveyard.push(card);
	}
	break;

      default:
    }
  }

  playerPlayCardFromHand(card) {

    let c = this.game.cards[card];

    switch(c.type) {
      case "land":

	//
	// confirm player can place
	//
	if (this.game.state.has_placed_land == 1) {
	  alert("You may only play one land per turn.");
	  break;
	} else {
	  this.game.state.has_placed_land = 1;
	}

	// move land from hand to board
	this.moveCard(this.game.player, c.key, "hand", "lands");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tlands\t0");
	this.endTurn();
	break;

      case "creature":

	// move creature from hand to board
	this.moveCard(this.game.player, c.key, "hand", "creatures");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tcreatures\t0");
	this.endTurn();
	break;

      case "sorcery":
      case "enchantment":

	// move enchantment from hand to board
	this.moveCard(this.game.player, c.key, "hand", "enchantments");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tenchantments\t0");
	this.endTurn();
	break;

      case "instant" :

	// move instant from hand to board
	this.moveCard(this.game.player, c.key, "hand", "instant");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tinstants\t0");
	this.endTurn();
	break;

      default:
	console.log("unsupported card type");
    }
  }


