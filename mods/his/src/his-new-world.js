
//
// NEW WORLD
//
// When factions explore or send a conquest or found a colony an extry is added into one
// of these three main arrays with the data structure that follows:
//
// 	this.game.state.colonies 
// 	this.game.state.explorations		
// 	this.game.state.conquests		
//
//    		{
//            		faction : faction,
//            		resolved :  0 ,
//            		round :   this.game.state.round,
//    		}
//
// at the end of the turn, we have three functions -- resolveColonies(), resolveConquests(), 
// and resolveExplorations() that loop through all of the "unresolved" items in these lists
// and roll the dice to figure out who has founded what. If user-intervention is required
// to pick a bonus, users will be invited to do so. data is added to these data structures
//
//
//
//

  returnNextColonyTile(faction="") {
    if (faction == "england") {
      if (this.game.state.newworld['england_colony1'].claimed != 1) {
        return "/his/img/tiles/colonies/Roanoke.svg";
      } else {
	return "/his/img/tiles/colonies/Jamestown.svg";
      }
    }

    if (faction == "france") {
      if (this.game.state.newworld['france_colony1'].claimed != 1) {
        return "/his/img/tiles/colonies/Charlesbourg.svg";
      } else {
	return "/his/img/tiles/colonies/Montreal.svg";
      }
    }

    if (faction == "hapsburg") {
      if (this.game.state.newworld['hapsburg_colony1'].claimed != 1) {
        return "/his/img/tiles/colonies/PuertoRico.svg";
      } else {
	if (this.game.state.newworld['hapsburg_colony2'].claimed != 1) {
          return "/his/img/tiles/colonies/Cuba.svg";
	} else {
          return "/his/img/tiles/colonies/Hispaniola.svg";
	}
      }
    }

    return "/his/img/tiles/colonies/PuertoRico.svg";

  }

  resolveColonies() {

    for (let z = 0; z < this.game.state.colonies.length; z++) {
      if (this.game.state.colonies[z].resolved != 1) {

	this.game.state.colonies[z].resolved = 1;

        if (this.game.state.colonies[z].faction === "england") {
	  if (this.game.state.newworld['england_colony1'].claimed != 1) {
	    this.game.state.newworld['england_colony1'].claimed = 1;
	    this.game.state.colonies[z].colony = "england_colony1";
	    this.game.state.colonies[z].name = "Roanoke";
	    this.game.state.colonies[z].img = "/his/img/tiles/colonies/Roanoke.svg";
	    this.updateLog("England founds Roanoke");
          } else {
	    this.game.state.newworld['england_colony2'].claimed = 1;
	    this.game.state.colonies[z].colony = "england_colony2";
	    this.game.state.colonies[z].name = "Jamestown";
	    this.game.state.colonies[z].img = "/his/img/tiles/colonies/Jamestown.svg";
	    this.updateLog("England founds Jamestown");
	  }
        }

        if (this.game.state.colonies[z].faction === "france") {
	  if (this.game.state.newworld['france_colony1'].claimed != 1) {
	    this.game.state.newworld['france_colony1'].claimed = 1;
	    this.game.state.colonies[z].colony = "france_colony1";
	    this.game.state.colonies[z].name = "Charlesbourg";
	    this.game.state.colonies[z].img = "/his/img/tiles/colonies/Charlesbourg.svg";
	    this.updateLog("France founds Charlesbourg");
          } else {
	    this.game.state.newworld['france_colony2'].claimed = 1;
	    this.game.state.colonies[z].colony = "france_colony2";
	    this.game.state.colonies[z].name = "Montreal";
	    this.game.state.colonies[z].img = "/his/img/tiles/colonies/Montreal.svg";
	    this.updateLog("France founds Montreal");
	  }
        }

        if (this.game.state.colonies[z].faction === "hapsburg") {
	  if (this.game.state.newworld['hapsburg_colony1'].claimed != 1) {
	      this.game.state.newworld['hapsburg_colony1'].claimed = 1;
	      this.game.state.colonies[z].colony = "hapsburg_colony1";
	      this.game.state.colonies[z].name = "Puerto Rico";
	      this.game.state.colonies[z].img = "/his/img/tiles/colonies/PuertoRico.svg";
	      this.updateLog("Hapsburgs found Puerto Rico");
          } else {
	    if (this.game.state.newworld['hapsburg_colony2'].claimed != 1) {
	      this.game.state.newworld['hapsburg_colony2'].claimed = 1;
	      this.game.state.colonies[z].colony = "hapsburg_colony2";
	      this.game.state.colonies[z].name = "Cuba";
	      this.game.state.colonies[z].img = "/his/img/tiles/colonies/Cuba.svg";
	      this.updateLog("Hapsburgs found Cuba");
	    } else {
	      this.game.state.newworld['hapsburg_colony3'].claimed = 1;
	      this.game.state.colonies[z].colony = "hapsburg_colony3";
	      this.game.state.colonies[z].name = "Hispaniola";
	      this.game.state.colonies[z].img = "/his/img/tiles/colonies/Hispaniola.svg";
	      this.updateLog("Hapsburgs found Hispaniola");
	    }
	  }
        }
      }
    }

    //
    // resolve potosi mines if outstanding
    //
    if (this.game.state.events.potosi_silver_mines != "") {

      let have_we_added_potosi_mines = false;
      let have_we_added_potosi_mines_idx = 0;

      for (let z = 0; z < this.game.state.colonies.length; z++) {
	if (this.game.state.colonies[z].img == "/his/img/tiles/colonies/Potosi.svg") {
	  have_we_added_potosi_mines = true;
	  have_we_added_potosi_mines_idx = z;
	}
      }

      if (!have_we_added_potosi_mines) {

	let pbox = "england_colony2";
	if (this.game.state.events.potosi_silver_mines == "france") { pbox = "france_colony2"; }
	if (this.game.state.events.potosi_silver_mines == "hapsburg") { pbox = "hapsburg_colony3"; }

	this.game.state.colonies.push({
	  faction : this.game.state.events.potosi_silver_mines ,
	  resolved : 1 ,
	  round : this.game.state.round ,
	  img : "/his/img/tiles/colonies/Potosi.svg" ,
	  name : "Potosi Silver Mines" ,
	  colony : pbox ,	  
	});

	this.game.state.events.potosi_silver_mines_added = this.game.state.events.potosi_silver_mines;
	this.game.state.events.potosi_silver_mines = "";
	this.game.state.newworld[pbox].claimed = 1;

      }

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

	  con.base_roll = base_hits;
	  con.modifiers = modifiers;
	  con.modified_roll = total_hits;
	  con.hits = total_hits;
	  con.conquistador = conquistador;
	  con.img = this.conquistadors[conquistador].img;

	  active_conquests.push(z);

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

    let cabot_england_found = 0;
    let cabot_france_found = 0;
    let cabot_hapsburg_found = 0;

    for (let z = 0; z < this.game.state.explorations.length; z++) {
      let exp = this.game.state.explorations[z];

      if (exp.cabot == 1) { 
	if (exp.faction == "england") { cabot_england_found = 1; }
	if (exp.faction == "france") { cabot_france_found = 1; }
	if (exp.faction == "hapsburg") { cabot_hapsburg_found = 1; }
      }

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
	
	  exp.base_roll = base_hits;
	  exp.modified_roll = total_hits;
	  exp.explorer = explorer;
	  exp.prize = "-";
	  exp.hits = total_hits;
	  exp.modifiers = modifiers;
          exp.explorer = explorer;
          exp.explorer_img = this.explorers[explorer].img;
          exp.cabot = 0;

	  active_explorations.push(z);
 
	}
      }
    }

    //
    // sebastian cabot is a special case
    //
    if ((this.game.state.events.cabot_england == 1 && cabot_england_found == 0) || (this.game.state.events.cabot_france == 1 && cabot_france_found == 0) || (this.game.state.events.cabot_hapsburg == 1 && cabot_hapsburg_found == 0)) {

      //
      // which faction has
      //
      let f = "england";
      if (this.game.state.events.cabot_france == 1 && cabot_france_found == 0) { f = "france"; }
      if (this.game.state.events.cabot_hapsburg == 1 && cabot_hapsburg_found == 0) { f = "hapsburg"; }

      this.game.state.explorations.push({
	faction : f ,
	round : this.game.state.round ,
	resolved : 0 ,
      });
      let idx = this.game.state.explorations.length - 1;
      let exp = this.game.state.explorations[idx];

      let yy = this.rollDice(6);
      let zz = this.rollDice(6);

      let total_hits = yy + zz;
      let base_hits = total_hits;
      let modifiers = 1;
      total_hits += modifiers;

      exp.base_roll = base_hits;
      exp.modified_roll = total_hits;
      exp.prize = "-";
      exp.hits = total_hits;
      exp.modifiers = modifiers;
      exp.cabot = 1;
      exp.explorer = "Cabot";
      exp.explorer_img = "/his/img/tiles/explorers/Cabot_English.svg";
      if (f == "france") { exp.explorer_img = "/his/img/tiles/explorers/Cabot_French.svg"; }
      if (f == "hapsburg") { exp.explorer_img = "/his/img/tiles/explorers/Cabot_Hapsburg.svg"; }

      active_explorations.push(idx);

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
	    let f = exp.faction;
	    let p = 0;
	    if (explorer === "Cabot") { p = 1; } else { p = this.explorers[explorer].power; }
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


