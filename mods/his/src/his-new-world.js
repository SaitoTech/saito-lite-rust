
  resolveColonies() {

    for (let z = 0; z < this.game.state.colonies.length; z++) {
      if (this.game.state.colonies[z].resolved != 1) {

	this.game.state.colonies[z].resolved = 1;

        if (this.game.state.colonies[z].faction === "england") {
	  if (this.game.state.newworld['england_colony1'].claimed != 1) {
	    this.game.state.newworld['england_colony1'].claimed = 1;
	    this.game.state.newworld.results.colonies.push({ faction : "england" , colony : 'england_colony1' , name : "Roanoke" , img : "/his/img/tiles/colonies/Roanoke.svg" });
	  } else {
	    this.game.state.newworld['england_colony2'].claimed = 1;
	    this.game.state.newworld.results.colonies.push({ faction : "england" , colony : 'england_colony1' , name : "Jamestown" , img : "/his/img/tiles/colonies/Roanoke.svg" });
	  }
	  this.updateLog("England founds a colony");
	  this.game.state.colonies[z].resolved = 1;
        }
        if (this.game.state.colonies[z].faction === "france") {
	  if (this.game.state.newworld['france_colony1'].claimed != 1) {
	    this.game.state.newworld['france_colony1'].claimed = 1;
	    this.game.state.newworld.results.colonies.push({ faction : "france" , colony : 'france_colony1' , name : "Charlesbourg" , img : "/his/img/tiles/colonies/Charlesbourg.svg" });
	  } else {
	    this.game.state.newworld['france_colony2'].claimed = 1;
	    this.game.state.newworld.results.colonies.push({ faction : "france" , colony : 'france_colony2' , name : "Montreal" , img : "/his/img/tiles/colonies/Montreal.svg" });
	  }
	  this.updateLog("France founds a colony");
	  this.game.state.colonies[z].resolved = 1;
        }
        if (this.game.state.colonies[z].faction === "hapsburg") {
	  if (this.game.state.newworld['hapsburg_colony1'].claimed != 1) {
	    this.game.state.newworld['hapsburg_colony1'].claimed = 1;
	    this.game.state.newworld.results.colonies.push({ faction : "hapsburg" , colony : 'hapsburg_colony1' , name : "Puerto Rico" , img : "/his/img/tiles/colonies/PuertoRico.svg" });
	  } else {
	    if (this.game.state.newworld['hapsburg_colony2'].claimed != 1) {
	      this.game.state.newworld['hapsburg_colony2'].claimed = 1;
	      this.game.state.newworld.results.colonies.push({ faction : "hapsburg" , colony : 'hapsburg_colony2' , name : "Cuba" , img : "/his/img/tiles/colonies/Cuba.svg" });
	    } else {
	      this.game.state.newworld['hapsburg_colony3'].claimed = 1;
	      this.game.state.newworld.results.colonies.push({ faction : "hapsburg" , colony : 'hapsburg_colony3' , name : "Hispanola" , img : "/his/img/tiles/colonies/Hispanola.svg" });
	    }
	  }

	  //
	  // no "resolve colonies" stage, so we resolve here
	  //
	  this.updateLog("The Hapsburgs founds a colony");
	  this.game.state.colonies[z].resolved = 1;
        }
      }
    }

    if (this.game.state.events.potosi_silver_mines == "hapsburg") {
      this.updateLog("The Hapsburgs found the Potosi Mines");
      this.game.state.newworld['hapsburg_colony3'].claimed = 1;
      this.game.state.newworld['hapsburg_colony3'].img = "Potosi.svg";
      this.game.state.newworld.results.colonies.push({ faction : "hapsburg" , colony : 'potosi' , name : "Potosi Silver Mines" , img : "/his/img/tiles/colonies/Potosi.svg" });
    }
    if (this.game.state.events.potosi_silver_mines == "france") {
      this.updateLog("France founds the Potosi Mines");
      this.game.state.newworld['france_colony2'].claimed = 1;
      this.game.state.newworld['france_colony2'].img = "Potosi.svg";
      this.game.state.newworld.results.colonies.push({ faction : "france" , colony : 'potosi' , name : "Potosi Silver Mines" , img : "/his/img/tiles/colonies/Potosi.svg" });
    }
    if (this.game.state.events.potosi_silver_mines == "england") {
      this.updateLog("England founds the Potosi Mines");
      this.game.state.newworld['england_colony2'].claimed = 1;
      this.game.state.newworld['england_colony2'].img = "Potosi.svg";
      this.game.state.newworld.results.colonies.push({ faction : "england" , colony : 'potosi' , name : "Potosi Silver Mines" , img : "/his/img/tiles/colonies/Potosi.svg" });
    }

    this.displayNewWorld();

    return 1;
  }

  resolveConquests() {

    let active_conquests = [];
    let sorted_conquests = [];
    
    for (let z = 0; z < this.game.state.conquests.length; z++) {

      let con = this.game.state.conquests[z];
      if (con.resolved == 0) {

        let available_conquistadors = this.returnAvailableConquistadors(con.faction);

	if (available_conquistadors.length > 0) {

	  //
	  // find explorer
	  //
	  let x = this.rollDice(available_conquistadors.length) - 1;
	  let conquistador = available_conquistadors[x];
	  con.conquistador = conquistador;

	  //
	  // calculate hits
	  //
	  let yy = this.rollDice(6);
	  let zz = this.rollDice(6);

	  let total_hits = yy + zz;
          let base_hits = total_hits;
	  let modifiers = 0;

	  //
	  // conquistador power
	  //
	  total_hits += this.conquistadors[conquistador].power;
	  modifiers += this.conquistadors[conquistador].power;

	  //
	  // smallpox
	  //
	  if (this.game.state.events.smallpox === con.faction) {
	    total_hits += 2;
	    modifiers += 2;
	    this.game.state.events.smallpox = 0;
	  }

	  con.hits = total_hits;
	  con.modifiers = modifiers;

	  active_conquests.push(z);

          this.game.state.newworld.results.conquests.push({ round : this.game.state.round , faction : con.faction , base : base_hits , total_hits : total_hits , modifiers : modifiers , conquistador : conquistador , img : this.conquistadors[conquistador].img , idx : z });

	}
      }
    }

    //
    // now determine sorted_explorations (order of resolution)
    //
    let hapsburg_done = 0;
    let england_done = 0;
    let france_done = 0;
    for (let i = 0; i < 3; i++) {
      target_faction = "hapsburg";
      if (i == 1) { target_faction = "england"; }
      if (i == 2) { target_faction = "france"; }
      for (let k = 0; k < active_conquests.length; k++) {
 	if (this.game.state.conquests[active_conquests[k]].faction === target_faction) { 
	  sorted_conquests.push(active_conquests[k]);
	}
      }
    }

    //
    // now resolve in order
    //
    for (let z = sorted_conquests.length-1; z >= 0; z--) {
      this.game.queue.push("resolve_conquest\t"+sorted_conquests[z]);
    }

    return 1;

  }

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

	  exp.explorer = explorer;

	  //
	  // calculate hits
	  //
	  let yy = this.rollDice(6);
	  let zz = this.rollDice(6);

	  let total_hits = yy + zz;
	  let base_hits = total_hits;
	  let modifiers = 0;

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
	  modifiers += this.explorers[explorer].power;

	  //
	  // mercators map
	  //
	  if (this.game.state.events.mercators_map === exp.faction) {
	    total_hits += 2;
	    modifiers += 2;
	    this.game.state.events.mercators_map = 0;
	  }
	  

	  if (!this.game.state[`${exp.faction}_uncharted`]) { total_hits++; }
	
	  exp.hits = total_hits;
	  exp.modifiers = modifiers;

	  active_explorations.push(z);
 
          this.game.state.newworld.results.explorations.push({ round : this.game.state.round , prize : "-" , faction : exp.faction , base : base_hits , total_hits : total_hits , modifiers : modifiers , explorer : explorer , img : this.explorers[explorer].img , idx : z });

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
      while (active_explorations.length > sorted_explorations.length) {
        for (let k = 0; k < active_explorations.length; k++) {
  	  let exp = this.game.state.explorations[active_explorations[k]];
	  if (exp.sorted != 1) {
	    let explorer = exp.explorer;
	    let f = this.explorers[explorer].faction;
	    let p = this.explorers[explorer].power;
	    if (p == highest) {
	      if (f == "england") { highest = -5; } // force next IF to execute
    	      if (f == "france" && highest_faction == "hapsburg") { highest = -5; } //force next-IF to execute
	    }
	    if (p > highest) {
	      idx = k;
	      highest = p;
	      highest_faction = f;
	    }
          }
	  exp.sorted = 1;
	  sorted_explorations.push(active_explorations[k]);
        };
      }
    }

    //
    // now resolve in order
    //
    for (let z = sorted_explorations.length-1; z >= 0; z--) {
      this.game.queue.push("resolve_exploration\t"+sorted_explorations[z]);
    }

    return 1;

  }


