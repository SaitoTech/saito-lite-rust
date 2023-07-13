
	handleGameLoop() {

  	  ///////////
	  // QUEUE //
	  ///////////
	  if (this.game.queue.length > 0) {

	    let qe = this.game.queue.length - 1;
	    let mv = this.game.queue[qe].split("\t");

	    console.log("QUEUE: " + JSON.stringify(this.game.queue));

	    //
	    // we never clear the "round" so that when we hit it
	    // we always bounce back higher on the queue by adding
	    // more turns for each player.
	    //
	    if (mv[0] == "round") {
	      this.game.queue.push("play\t2");
	      this.game.queue.push("DEAL\t2\t2\t1");
	      this.game.queue.push("play\t1");
	      this.game.queue.push("DEAL\t1\t1\t1");
	    }


	    //
	    // this "deploys" cards into the battleground, such
	    // as adding mana into play. the 4th argument allows us
	    // to specify that a player should ignore the instruction
	    // which is used when a player has made their move locally
	    // and we have already updated their board and do not want
	    // them to repeat that.
	    // 
	    if (mv[0] == "deploy") {

	      this.game.queue.splice(qe, 1);

	      let type = mv[1];
	      let player = parseInt(mv[2]);
	      let cardkey = mv[3];
	      let card = this.deck[cardkey];
	      let player_ignores = parseInt(mv[4]);

	      if (this.game.player != player_ignores) {

		if (type == "land") {
		  this.deploy(player, cardkey);
		}
			
		if (type == "creature") {
		  this.deploy(player, cardkey);
		}
				
		if (type == "artifact") {
		  this.deploy(player, cardkey);
		}
				
		if (type == "enchantment") {
		  this.deploy(player, cardkey);
		}

	      }

   	      this.board.render();			

	      return 1;

	    }

	    if (mv[0] === "play") {

	      // this is only removed through "resolve"

	      let player = parseInt(mv[1]);
   	      if (this.game.player == player) {
		this.playerTurn();
	      } else {
	        this.updateStatusAndListCards("Opponent Turn", this.game.deck[this.game.player-1].hand);
	      }

	      return 0;

	    }

	  }
	  return 1;
	}

