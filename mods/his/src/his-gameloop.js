

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


	  //
	  // collect stats
	  //
	  if (this.game.state.round > 1) {
	    //this.game.state.stats.round.push({});
	    //this.game.state.stats.round[this.game.state.stats.round.length-1].us_scorings = this.game.state.stats.us_scorings;
	  }

	  //
          // if we have come this far, move to the next turn
          //
          this.updateStatus("<div class='status-message' id='status-message'><span>Preparing for round</span> " + this.game.state.round+"</div>");

          this.game.queue.push("turn");
          for (let i = this.game.players.length; i > 0; i++) {
            this.game.queue.push(`play\t${i}`);
          }

          return 1;
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


