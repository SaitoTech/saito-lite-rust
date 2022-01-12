

  //
  // Core Game Logic
  //
  handleGameLoop() {

console.log("handle game loop...");

    let his_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
        let shd_continue = 1;

        //
        // round
        // init
	//
        if (mv[0] == "init") {
	  this.updateLog("init game");
          this.game.queue.splice(qe, 1);
        }

        if (mv[0] === "round") {

	  //
	  // restore state
	  //
	  if (this.game.state.round > 1) {
	    this.log.updateLog("Luther's 95 Theses!");
	    this.game.queue.push("event\t1\t008");
	    this.convertSpace("protestant", "wittenberg");
	    this.addUnit("regular", 1, "wittenberg");
	    this.addUnit("regular", 1, "wittenberg");
	    this.addUnit("luther", 1, "wittenberg");
	  }


          return 1;
        }

        if (mv[0] === "event") {

	  let player = mv[1];
	  let card = mv[2];

	  this.deck[card].triggerEvent(1);

	  this.game.queue.splice(qe, 1);

	}

        if (mv[0] === "play") {

          this.displayBoard();
          this.playMove();
          return 0;
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


