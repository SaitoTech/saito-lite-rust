

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
      // turns for each player.
      //
      if (mv[0] == "round") {
	      this.game.queue.push("PLAY\t2");
        this.game.queue.push("DEAL\t2\t2\t1");
	      this.game.queue.push("PLAY\t1");
        this.game.queue.push("DEAL\t1\t1\t1");
      }

      if (mv[0] === "move") {

      	let player_id = parseInt(mv[1]);
      	let cardkey = mv[2];
      	let source = mv[3];
      	let destination = mv[4];
      	let sending_player_also = 1;
      	if (mv[5] == 0) { sending_player_also = 0; }

      	if (sending_player_also == 0) {
      	  if (this.game.player != player_id) {
      	    this.moveCard(player_id, cardkey, source, destination);
      	  }
      	} else {
      	  this.moveCard(player_id, cardkey, source, destination);
      	}

      	this.displayBoard();

        this.game.queue.splice(qe, 1);

      }

      /*if (mv[0] === "play") {

        let player_to_go = parseInt(mv[1]);

      	//
      	// update board
      	//
        this.displayBoard();
        this.playerTurn();

      	//
      	// do not remove until we resolve!
      	//
        //this.game.queue.splice(qe, 1);

        return 0;

      }*/

    }
    return 1;
  }




