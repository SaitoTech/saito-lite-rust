

  //
  // Core Game Logic
  //
  handleGameLoop() {

    let his_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
	let z = this.returnEventObjects();
        let shd_continue = 1;

console.log("MOVE: " + mv[0]);

        //
        // round
        // init
	//
        if (mv[0] == "init") {
	  this.updateLog("init game");
          this.game.queue.splice(qe, 1);
        }

        if (mv[0] === "round") {

	  this.game.state.round++;

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("action_phase");
	  this.game.queue.push("spring_deployment_phase");
	  this.game.queue.push("diplomacy_phase");
	  this.game.queue.push("card_draw_phase");
	  this.game.queue.push("ACKNOWLEDGE\ttest");


	  //
	  // start the game with the Protestant Reformation
	  //
//	  if (this.game.state.round == 1) {
//	    this.updateLog("Luther's 95 Theses!");
//	    this.game.queue.push("event\t1\t008");
//	  }

	  if (this.game.state.round > 1) {
	    this.updateStatus("Game Over");
	    return 0;
	  }
          return 1;
        }

        if (mv[0] === "event") {

	  let player = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  if (!this.deck[card].onEvent(this, player)) { return 0; }

	  return 1;
	}

        if (mv[0] === "victory_determination_phase") {
	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "new_world_phase") {
	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "winter_phase") {
	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "action_phase") {
	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "spring_deployment_phase") {
	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "diplomacy_phase") {

console.log("just in diplomacy phase!");
console.log("cards in hand: " + JSON.stringify(this.game.deck[0].hand));

	  this.updateStatusAndListCards("Select a Card: ", this.game.deck[0].hand);
          this.attachCardboxEvents(function(card) {
            this.playerPlayCard(card, this.game.player);
          });


	  this.game.queue.splice(qe, 1);
          return 0;
        }
        if (mv[0] === "card_draw_phase") {
this.updateLog("Deal Cards to Players");
this.updateLog("Discards Reshuffled into Deck");
this.updateLog("New Units and New Cards Added");

	  let cards_to_deal = [];

	  for (let i = 0; i < this.game.players_info.length; i++) {
	    let pf = this.game.players_info[i].faction;
console.log("faction: " + pf);
	    cards_to_deal.push(this.factions[pf].returnCardsDealt(this));
          }

console.log("CARDS TO DEAL: " + JSON.stringify(cards_to_deal));

	  //
	  // generate new deck
	  //
	  for (let i = this.game.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DEAL\t1\t"+(i)+"\t"+(cards_to_deal[(i-1)]));
	  }
	  for (let i = this.game.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKENCRYPT\t1\t"+(i));
	  }
	  for (let i = this.game.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKXOR\t1\t"+(i));
	  }
    	  this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnDeck()));

console.log("ABOUT TO KICK OFF: " + JSON.stringify(this.game.queue));

	  this.game.queue.splice(qe, 1);
          return 1;
        }

        if (mv[0] === "play") {
          this.displayBoard();
          this.playMove();
          return 0;
        }

	if (mv[0] === "convert") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let religion = mv[2];

	  this.updateLog(this.game.spaces[space].name + " converts to the " + religion + " religion");

	  this.game.spaces[space].religion = religion;
	  this.displaySpace(space);

	  return 1;

	}

	if (mv[0] === "reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let p_player = mv[2];
	  let c_player = mv[3];

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let protestants_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // neighbours
	  //
	  for (let i = 0; i < this.spaces[space].neighbours.length; i++) {
	    if (this.spaces[ this.spaces[space].neighbours[i] ].religion === "catholic") {
	      c_neighbours++;
	    }
	    if (this.spaces[ this.spaces[space].neighbours[i] ].religion === "protestant") {
	      p_neighbours++;
	    }  
	  }

	  //
	  // language zone
	  //
	  if (this.spaces[space].language !== "german") {
	    ties_resolve = "catholic";
 	  }

	  //
	  // temporary bonuses
	  //
	  p_bonus += this.game.state.tmp_protestant_reformation_bonus;
	  c_bonus += this.game.state.tmp_catholic_reformation_bonus;

	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

this.updateLog("Total Rolls: ");
this.updateLog("Protestants: " + p_rolls);

	  for (let i = 0; i < p_rolls; i++) {
console.log("i: " + i);
	    let x = this.rollDice(6);
console.log("x is: " + x);
	    this.updateLog("Protestants roll: " + x, 1);
	    if (x > p_high) { p_high = x; }
	  }

this.updateLog("Catholics: " + c_rolls);

	  for (let i = 0; i < c_rolls; i++) {
console.log("i: " + i);
	    let x = this.rollDice(6);
console.log("x is: " + x);
	    this.updateLog("Catholics roll: " + x, 1);
	    if (x > c_high) { c_high = x; }
	  }

	  //
	  // do protestants win?
	  //
	  if (p_high > c_high) { protestants_win = 1; }
	  if (p_high == c_high && ties_resolve === "protestant") { protestants_win = 1; }
	
	  //
	  // handle victory
	  //
	  if (protestants_win == 1) {
	    this.updateLog("Protestants win!");
	    this.game.queue.push("convert\t"+space+"\tprotestant");
	  } else {
	    this.updateLog("Catholics win!");
	  }

	  return 1;

	}





	//
	// objects and cards can add commands
	//
        // we half if we receive a 0/false from one
        for (let i in z) {
          if (!z[i].handleGameLoop(this, qe, mv)) { return 0; }
        }


        //
        // avoid infinite loops
        //
        if (shd_continue == 0) {
          console.log("NOT CONTINUING");
          return 0;
        }

    } // if cards in queue
    return 1;

  }


