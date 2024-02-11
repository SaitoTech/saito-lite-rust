

  resolveExplorations() {

    let active_explorations = [];
    let sorted_explorations = [];

    for (let z = 0; z < this.game.state.explorations.length; z++) {
      let exp = this.game.state.explorations[z];
      if (exp.resolved == 0) {

        let available_explorers = this.returnAvailableExplorers(exp.faction);
	if (available_explorers.length > 0) {

	  //
	  // find explorer
	  //
	  let x = this.rollDice(available_explorers.length) - 1;
	  let explorer = available_explorers[x];
	  this.game.state.explorations[z].explorer = explorer;

	  //
	  // calculate hits
	  //
	  let y = this.rollDice(6);
	  let z = this.rollDice(6);

	  let total_hits = y + z;

	  //
	  // modifications
	  //
	  if (this.game.state[`${exp.faction}_uncharted`]) {
	    total_hits--;
	    this.game.state[`${exp.faction}_uncharted`] = 0;
	  }

	  //
	  // explorer power
	  //
	  total_hits += this.explorers[explorer].power;

	  //
	  // mercators map
	  //
	  if (this.game.state.events.mercators_map === exp.faction) {
	    total_hits += 2;
	    this.game.state.events.mercators_map = 0;
	  }
	  

	  if (!this.game.state[`${exp.faction}_uncharted`]) { total_hits++; }
	
	  this.game.state.explorations[z].hits = total_hits;

	  active_explorations.push(z);

	}

      }
    }

    //
    // now determine sorted_explorations (order of resolution)
    //
    for (let z = 5; z >= -1; z--) {
      let idx = 0;
      let highest = -5;
      let highest_faction = "";

      //
      // sort resolution
      //
      while (active_explorations.length < sorted_explorations.length) {
        for (let k = 0; k < active_explorations.length; k++) {
  	  let exp = this.game.state.explorations[active_explorations[k]];
	  if (exp.sorted != 1) {
	    let explorer = exp.explorer;
	    let f = this.explorers[explorer].faction;
	    let p = this.explorers[explorer].power;
	    if (p == highest) {
	      if (f == "england") { highest = -5; } // force next IF to execute
    	      if (f == "france" && current_highest == "hapsburg") { highest = -5; } //force next-IF to execute
	    }
	    if (p > highest) {
	      idx = k;
	      highest = p;
	      highest_faction = f;
	    }
          }
	  exp.sorted = 1;
	  sorted_explorations.push(idx);
        };
      }
    }

    //
    // now resolve in order
    //
    for (let z = sorted_explorations.length-1; z >= 0; z--) {
      this.game.queue.push("resolve_exploration\t"+sorted_explorations[k]);
    }

    return 1;

  }

  resolveConquests() {

  }

  resolveColonies() {


  }

