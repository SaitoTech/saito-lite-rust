

  //
  // Core Game Logic
  //
  handleGameLoop() {

    let labyrinth_self = this;


    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
	let z = this.returnEventObjects();
        let shd_continue = 1;

console.log("QUEUE: " + JSON.stringify(this.game.queue));
console.log("MOVE: " + mv[0]);

        //
        // round
        // init
	//
        if (mv[0] == "init") {
          this.game.queue.splice(qe, 1);
	  return 1;
        }

        if (mv[0] === "round") {
	  this.game.state.round++;
          this.game.queue.splice(qe, 1);
          return 1;
        }

	if (mv[0] === "halt") {
	  return 0;
	}


	//
	// halt if events return 0
	//
        for (let i in z) {
          if (!await z[i].handleGameLoop(this, qe, mv)) { return 0; }
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


