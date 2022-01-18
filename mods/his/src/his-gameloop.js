

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

	  //
	  // restore state
	  //
	  if (this.game.state.round == 1) {
	    this.updateLog("Luther's 95 Theses!");
	    this.game.queue.push("event\t1\t008");
	    this.game.queue.push("ACKNOWLEDGE\tThe Reformation.!");
	    this.convertSpace("protestant", "wittenberg");
	    this.addUnit(1, "wittenberg", "regular");
	    this.addUnit(1, "wittenberg", "regular");
	    this.addUnit(1, "wittenberg", "debater");
	    this.displaySpace("wittenberg");

console.log("this is what is in wittenberg");
console.log(JSON.stringify(this.spaces["wittenberg"]));

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

        if (mv[0] === "play") {

          this.displayBoard();
          this.playMove();
          return 0;
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


