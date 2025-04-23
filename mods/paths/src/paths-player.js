
  returnPlayers(num = 0) {
    var players = [];
    return players;
  }

  returnPlayerHand() {
    return this.game.deck[this.game.player-1].hand;
  }

  returnFactionName(faction="") { return this.returnPlayerName(faction); }

  returnPlayerName(faction="") {
    if (faction == "central") { return "Central Powers"; }
    return "Allies";
  }

  returnFactionOfPlayer() {
    if (this.game.player == 1) { return "central"; }
    return "allies";
  }

  returnPlayerOfFaction(faction="") {
    if (faction == "central") { return 1; }
    return 2;
  }

  playerSelectAttackerCombatCards() {

    let num = 0;
    let ccs = [];
    let cards = this.returnDeck("all");
    let faction = this.returnFactionOfPlayer(this.game.player);
    let name = this.returnPlayerName(faction);

    if (faction == "central") {
      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	if (cards[this.game.deck[0].hand[i]].cc) { 
	  if (this.game.state.cc_central_active.includes(this.game.deck[0].hand[i])) {
	    num++;
	    ccs.push(this.game.deck[0].hand[i]);
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_central_active.length; i++) {
	let c = this.game.state.cc_central_active[i];
	if (!this.game.state.cc_central_played_this_round.includes(c)) {
	  if (this.game.state.cc_central_active.includes(this.game.deck[0].hand[i])) {
	    num++;
	    ccs.push(c);
          }
        }
      }
    }
    if (ccs.includes("cp02")) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] == "cp02") { ccs.splice(i, 1); }
      }
    }
    if (faction == "allies") {
      for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	if (cards[this.game.deck[1].hand[i]].cc) { 
	  if (this.game.state.cc_allies_active.includes(this.game.deck[1].hand[i])) {
	    num++;
	    ccs.push(this.game.deck[1].hand[i]);
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_allies_active.length; i++) {
	let c = this.game.state.cc_allies_active[i];
	if (!this.game.state.cc_allies_played_this_round.includes(c)) {
	  if (this.game.state.cc_allies_active.includes(this.game.deck[1].hand[i])) {
	    num++;
	    ccs.push(c);
          }
        }
      }
    }

    //
    // Mine Attack can only be used once per turn
    //
    if (this.game.state.events.mine_attack == 1) {
      for (let i = 0; i < ccs.length; i++) {
	if (ccs[i] === "ap36") {
	  ccs.splice(i, 1);
	}
      }
    }

    if (num == 0) {
      this.endTurn();
      return 0;
    }

    ccs.push("pass");
   
    this.updateStatusAndListCards(`${name} - play combat card?`, ccs);
    this.attachCardboxEvents((card) => {

      this.unbindBackButtonFunction();
      this.updateStatus("submitting...");

      if (card == "pass") {
	this.endTurn();
	return 1;
      }

      if (ccs.length > 2) { // > 1+PASS
        this.addMove("attacker_select_combat_cards");
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      } else {
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      }

    }); 
  }

  playerSelectDefenderCombatCards() {

    let num = 0;
    let ccs = [];
    let cards = this.returnDeck("all");
    let faction = this.returnFactionOfPlayer(this.game.player);
    let name = this.returnPlayerName(faction);

    if (faction == "central") {
      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	if (cards[this.game.deck[0].hand[i]].cc) { 
	  if (this.game.state.cc_central_active.includes(this.game.deck[0].hand[i])) {
	    num++;
	    ccs.push(this.game.deck[0].hand[i]);
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_central_active.length; i++) {
	let c = this.game.state.cc_central_active[i];
	if (!this.game.state.cc_central_played_this_round.includes(c)) {
	  if (this.game.state.cc_central_active.includes(this.game.deck[0].hand[i])) {
	    num++;
	    ccs.push(c);
          }
        }
      }
    }
    if (faction == "allies") {
      for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	if (cards[this.game.deck[1].hand[i]].cc) { 
	  if (this.game.state.cc_allies_active.includes(this.game.deck[1].hand[i])) {
	    num++;
	    ccs.push(this.game.deck[1].hand[i]);
	  }
	}
      }
      for (let i = 0; i < this.game.state.cc_allies_active.length; i++) {
	let c = this.game.state.cc_allies_active[i];
	if (!this.game.state.cc_allies_played_this_round.includes(c)) {
	  if (this.game.state.cc_allies_active.includes(this.game.deck[1].hand[i])) {
	    num++;
	    ccs.push(c);
          }
        }
      }
    }

    if (num == 0) {
      this.endTurn();
      return 0;
    }

    ccs.push("pass");
   
    this.updateStatusAndListCards(`${name} - play combat card?`, ccs);
    this.attachCardboxEvents((card) => {

      this.unbindBackButtonFunction();
      this.updateStatus("submitting...");

      if (card == "pass") {
	this.endTurn();
	return 1;
      }

      if (ccs.length > 2) { // > 1+PASS
        this.addMove("defender_select_combat_cards");
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      } else {
        this.addMove("combat_card\t"+faction+"\t"+card);
	this.endTurn();
      }

    }); 
  }


  playerAddReinforcements(faction="", units=[], country="", options=[]) {

    let paths_self = this;
    let just_stop = 0;
    let unit = null;

    //
    // corps go into reserve boxes
    // armies into capital or supply sources
    // if options specified, respect
    //
    let continue_fnct = () => {
      if (just_stop == 1) { paths_self.endTurn(); return 0; }
      if (units.length == 0) { paths_self.endTurn(); return 0; }
      return 1;
    }

    let execute_fnct = (spacekey) => {
      paths_self.updateStatus("deploying...");
      paths_self.removeSelectable();
      paths_self.addUnitToSpace(unit.key, spacekey);
      paths_self.addMove(`add\t${spacekey}\t${unit.key}\t${paths_self.game.player}`);    
      paths_self.displaySpace(spacekey);
      loop_fnct();
    };

    let loop_fnct = () => {
      if (continue_fnct()) {

	unit = paths_self.game.units[units[units.length-1]];
	units.splice(units.length-1, 1);
	let choices = [];

console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("UNIT: " + JSON.stringify(unit));

	
	//
	// CORPS
	//
	if (unit.corps) {

	  if (faction == "allies") { choices.push("arbox"); } 
	  if (faction == "central") { choices.push("crbox"); } 

	  //
	  // one option? auto-handle
	  //
	  if (options.length == 0) {
	    execute_fnct(choices[0]);
	    return;

	  //
	  // multiple options? let player choose
	  //
	  } else {

	    for (let z = 0; z < options.length; z++) {
	      if (!choices.includes(options[z])) { choices.push(options[z]); }
	    }

            paths_self.playerSelectSpaceWithFilter(
   	      `Destination for ${unit.name}` ,
	      (spacekey) => { if (choices.includes(spacekey)) { return 1; } return 0; } ,
	      execute_fnct ,
	      null , 
	      true ,
            );

	    return;
	  }

	//
	// ARMIES
	//
	} else {

	  //
	  // armies go in spacekeys, options over-ride
	  //
	  let spacekeys = this.returnArrayOfSpacekeysForPlacingReinforcements(country);
          if (options.length > 0) { spacekeys = options; }

	  //
	  // one option? auto-handle
	  //
	  if (spacekeys.length == 0) {
	    alert("Error -- no viable placement options?");
	    this.endTurn();
	  }

	  if (spacekeys.length == 1) {
	    execute_fnct(spacekeys[0]);
	    return;
	  }

	  if (spacekeys.length > 1) {
            paths_self.playerSelectSpaceWithFilter(
   	      `Destination for ${unit.name}` ,
	      (spacekey) => { if (spacekeys.includes(spacekey)) { return 1; } return 0; } ,
	      execute_fnct ,
	      null , 
	      true
            );
	    return;
	  }

	}
      }
    }    

    loop_fnct();
    return;

  }


  playerPlayAdvance() {

    let can_player_advance = false;
    let spacekey = this.game.state.combat.key;
    let space = this.game.spaces[spacekey];
    let attacker_units = this.returnAttackerUnits();

    for (let i = 0; i < attacker_units.length; i++) {
      let unit = attacker_units[i];
      if (!unit.damaged) { can_player_advance = true; }
    }
    if (space.fort) { 
      //
      // we cannot advance into a fort we attacked from an adjacent space if
      // the fort was empty, but we can advance (and then besiege) a fort if
      // we routed the opponent.
      //
      if (this.game.state.combat.unoccupied_fort == 1) { can_player_advance = false; }
    }

    //
    // skip advance if not possible
    //
    if (can_player_advance == false) {
      this.endTurn();
      return;
    }


    let html = `<ul>`;
    html    += `<li class="card" id="advance">advance</li>`;
    html    += `<li class="card" id="refuse">do not advance</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Advance Full-Strength Units?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "advance") {
	this.playerHandleAdvance();
	return;
      }

      if (action === "refuse") {
	this.endTurn();
	return;
      }

    });

  }


  playerHandleAdvance() {

    let paths_self = this;

    let spaces_to_retreat = 2;
    let attacker_loss_factor = this.game.state.combat.attacker_loss_factor;
    let defender_loss_factor = this.game.state.combat.defender_loss_factor;
    if ((attacker_loss_factor-defender_loss_factor) == 1) { spaces_to_retreat = 1; }

    if (this.game.state.combat.unoccupied_fort == 1 && this.game.space[this.game.state.combat.key].fort == -1) {
      spaces_to_retreat = 1;
      paths_self.playerSelectSpaceWithFilter(
        `Advanced into Destroyed Fort?`,
        (destination) => {
          if (destination == this.game.state.combat.key) { return 1; }
	  return 0;
        },
        (key) => {

          this.unbindBackButtonFunction();
          this.updateStatus("advancing...");

          for (let i = 0; i < attacker_units.length; i++) {
            let x = attacker_units[i];
            let skey = x.spacekey;
            let ukey = x.key;
            let uidx = 0;
            let u = {};
            for (let z = 0; z < paths_self.game.spaces[skey].units.length; z++) {
              if (paths_self.game.spaces[skey].units[z].key === ukey) {
                uidx = z;
              }
            }
            if (!attacker_units[i].damaged) {
              paths_self.moveUnit(skey, uidx, key);
              paths_self.addMove(`move\t${faction}\t${skey}\t${uidx}\t${key}\t${paths_self.game.player}`);
            }
            paths_self.displaySpace(skey);
          }
          paths_self.displaySpace(key);
          paths_self.endTurn();
        },
        null,
        true
      );
      return 0;
    }


    let sourcekey = this.game.state.combat.retreat_sourcekey;
    let destinationkey = this.game.state.combat.retreat_destinationkey;
    let roptions = [];
    let attacker_units = this.returnAttackerUnits();
    let faction = this.returnFactionOfPlayer();

    //
    // no-one retreated, it was a massacre
    //
    if (!sourcekey) {

      roptions.push(this.game.state.combat.key);

    //
    // 
    //
    } else {

      let source = this.game.spaces[sourcekey];
      let destination = this.game.spaces[destinationkey];

      roptions.push(sourcekey);
   
      if (spaces_to_retreat == 2) {
        for (let i = 0; i < source.neighbours.length; i++) {
          for (let z = 0; z < destination.neighbours.length; z++) {
            if (source.neighbours[i] == destination.neighbours[z]) {
	      if (!roptions.includes(source.neighbours[i])) { roptions.push(source.neighbours[i]); }
	    }
          }
        }
      }
    }

    //
    // remove inappropriate options
    //
    for (let z = roptions.length-1; z >= 0; z--) {
      let spliceout = false;
      let s = this.game.spaces[roptions[z]];
      if (s.fort) { spliceout = true; }
      if (s.units.length > 0) { spliceout = true; }
      if (faction == "central" && this.game.state.events.race_to_the_sea != 1) {
	if (roptions[z] == "amiens") { spliceout = true; }
	if (roptions[z] == "ostend") { spliceout = true; }
	if (roptions[z] == "calais") { spliceout = true; }
      }
      if (spliceout == true) {
	roptions.splice(z, 1);
      }
    }

    //
    // nope out if no advance options
    //
    if (roptions.length == 0) {
      paths_self.addMove("NOTIFY\tAttacker no options ot advance");
      paths_self.endTurn();
    }

    paths_self.playerSelectSpaceWithFilter(
      `Select Advance Destination`,
      (destination) => {
	if (roptions.includes(destination)) {
	  return 1;
	}
        return 0;
      },
      (key) => {

	this.unbindBackButtonFunction();
	this.updateStatus("advancing...");


	for (let i = 0; i < attacker_units.length; i++) {
          let x = attacker_units[i];
      	  let skey = x.spacekey;
      	  let ukey = x.key;
      	  let uidx = 0;
	  let u = {};
	  for (let z = 0; z < paths_self.game.spaces[skey].units.length; z++) {
	    if (paths_self.game.spaces[skey].units[z].key === ukey) {
	      uidx = z;
	    } 
	  }
	  if (!attacker_units[i].damaged) {
            paths_self.moveUnit(skey, uidx, key);
	    paths_self.addMove(`move\t${faction}\t${skey}\t${uidx}\t${key}\t${paths_self.game.player}`);
	  }
          paths_self.displaySpace(skey);
	}
        paths_self.displaySpace(key);
	paths_self.endTurn();
      },
      null,
      true
    );
  }



  playerSpendReplacementPoints(faction="central") {

    let paths_self = this;
    let rp = this.game.state.rp[faction];
    let do_upgradeable_units_remain = false;
    let just_stop = 0;

    //
    // players can spend their replacement points to:
    //
    // 1. flip damaged units on the board
    // 2. flip damaged units in the RB
    // 3. return eliminated units to RB 
    //
    loop_fnct();
    let loop_fnct = () => {
      if (continue_fnct()) {
        paths_self.playerSelectUnitWithFilter(
 	  "Select Unit to Repair / Deploy" ,
	  filter_fnct ,
	  execute_fnct ,
	  null , 
	  true ,
	  [{ key : "pass" , value : "pass" }]
        );
      }
    }    

    let filter_fnct = (spacekey, unit) => { 
      if (spacekey == "aeubox") { 
        if (faction == "central") { return 0; }
	if (unit.destroyed) { return 1; }
      }
      if (spacekey == "ceubox") { 
        if (faction == "allies") { return 0; }
        if (unit.destroyed) { return 1; }
      }
      if (spacekey == "arbox") { 
        if (faction == "central") { return 0; }
        return 1;
      }
      if (spacekey == "crbox") { 
        if (faction == "allies") { return 0; }
        return 1;
      }
      if (paths_self.game.spaces[spacekey].control == faction && unit.damaged) { return 1; }
      return 0;
    };

    let execute_fnct = (spacekey, unit_idx) => {

      paths_self.updateStatus("processing...");

      if (spacekey === "pass") {
	paths_self.removeSelectable();
	paths_self.endTurn();
        just_stop = 1;
	return 1;
      }

      let unit = paths_self.game.spaces[spacekey].units[unit_idx];
      let processed = false;

      if (spacekey === "aeubox") {
        paths_self.game.spaces[spacekey].units[unit_idx].destroyed = 0;
        paths_self.game.spaces[spacekey].units[unit_idx].damaged = 1;
        paths_self.moveUnit(spacekey, unit_idx, "arbox");
 	paths_self.prependMove(`repair\t${faction}\t${spacekey}\t${unit_idx}`);
 	paths_self.prependMove(`move\t${faction}\t${spacekey}\t${unit_idx}\tarbox\t${paths_self.game.player}`);
	paths_self.displaySpace(spacekey);
        processed = true;
	loop_fnct();
      }

      if (spacekey === "ceubox") {
        paths_self.game.spaces[spacekey].units[unit_idx].destroyed = 0;
        paths_self.game.spaces[spacekey].units[unit_idx].damaged = 1;
        paths_self.moveUnit(spacekey, unit_idx, "crbox");
 	paths_self.prependMove(`repair\t${faction}\t${spacekey}\t${unit_idx}`);
 	paths_self.prependMove(`move\t${faction}\t${spacekey}\t${unit_idx}\tcrbox\t${paths_self.game.player}`);
	paths_self.displaySpace(spacekey);
        processed = true;
	loop_fnct();
      }

      if (spacekey === "arbox" || spacekey === "crbox") {
	if (paths_self.game.spaces[spacekey].units[unit_idx].damaged) {
          paths_self.game.spaces[spacekey].units[unit_idx].damaged = 0;
 	  paths_self.prependMove(`repair\t${faction}\t${spacekey}\t${unit_idx}`);
	  paths_self.displaySpace(spacekey);
	  loop_fnct();
        } else {
      	  paths_self.playerSelectSpaceWithFilter(
            `Deploy Unit Where?`,
	    (destination) => {
	      if (paths_self.game.spaces[destination].control == faction) { return 1; }
	      return 0;
	    },
	    (key) => {
              paths_self.moveUnit(spacekey, unit_idx, key);
 	      paths_self.prependMove(`move\t${faction}\t${spacekey}\t${unit_idx}\t${key}\t${paths_self.game.player}`);
              paths_self.displaySpace(spacekey);
              paths_self.displaySpace(key);
	      loop_fnct();
	    },
	    null,
    	    true
	  );
        }
	processed = true;
      }

     
      if (processed != true) {
        paths_self.game.spaces[spacekey].units[unit_idx].destroyed = 0;
        paths_self.game.spaces[spacekey].units[unit_idx].damaged = 0;
 	paths_self.prependMove(`repair\t${faction}\t${spacekey}\t${unit_idx}`);
	paths_self.displaySpace(spacekey);
        processed = true;
	loop_fnct();
      }

    };
 

    let continue_fnct = () => {
      if (just_stop == 1) { return 0; }
      let count = paths_self.countUnitsWithFilter(filter_fnct);
      if (count == 0) { return 0; }
      for (let key in paths_self.game.state.rp[faction]) {
	if (parseInt(paths_self.game.state.rp[faction][key]) > 0) { return 1; }
      }
      return 0;
    }


    return 1;
  }



  playerPlayPostCombatRetreat() {

    let can_defender_cancel_retreat = false;

    //
    // Defending units in Trenches, Forests, Deserts, Mountains, or 
    // Swamps may chose to ignore a retreat by taking one additional
    // step loss. 
    //
    let space = this.game.spaces[this.game.state.combat.key];

    if (space.terrain == "forest") 	{ can_defender_cancel_retreat = true; }
    if (space.terrain == "mountain") 	{ can_defender_cancel_retreat = true; }
    if (space.terrain == "swamp") 	{ can_defender_cancel_retreat = true; }
    if (space.terrain == "desert") 	{ can_defender_cancel_retreat = true; }
    if (space.trench > 0) 		{ can_defender_cancel_retreat = true; }

    if (can_defender_cancel_retreat == false) {
      this.playerHandleRetreat();
      return;
    }

    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="hit">take additional hit</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "retreat") {
	this.playerHandleRetreat();
	return;
      }

      if (action === "hit") {
	this.loss_overlay.renderToAssignAdditionalStepwiseLoss();
        return;
      }

    });

    return;
  }


  playerHandleRetreat() {

    let paths_self = this;

    let spaces_to_retreat = 3; // 2 + source
    let attacker_loss_factor = this.game.state.combat.attacker_loss_factor;
    let defender_loss_factor = this.game.state.combat.defender_loss_factor;
    if ((attacker_loss_factor-defender_loss_factor) == 1) { spaces_to_retreat = 2; } // 1 + source
    let faction = this.returnFactionOfPlayer(this.game.player);
    let sourcekey = this.game.state.combat.key;

    //
    // 
    //
    let spaces_within_hops = paths_self.returnSpacesWithinHops(
      this.game.state.combat.key,
      spaces_to_retreat, 
      (spacekey) => {
	if (spacekey == this.game.state.combat.key) { return 1; }; // pass through
        if (paths_self.game.spaces[spacekey].units.length > 0) {
	  if (paths_self.returnPowerOfUnit(paths_self.game.spaces[spacekey].units[0]) != faction) { 
  	    return 0; 
          }
        }
        return 1;
      }
    );

console.log("###################");
console.log("###################");
console.log("###################");
console.log("SPACES WITHIN HOPS:");
console.log(JSON.stringify(spaces_within_hops));

    //
    // remove source and single-hop destination if needed
    //
    let source = this.game.spaces[this.game.state.combat.key];
    for (let i = spaces_within_hops.length-1; i >= 0; i--) {
      let destination = spaces_within_hops[i];
      if (destination == this.game.state.combat.key) {
	spaces_within_hops.splice(i, 1);
      }
      if (source.neighbours.includes(destination)) {
	let is_there_a_two_hop_connection = false;
	let d = this.game.spaces[destination];
	//
	// we only keep if there is a connecting, controlled space
	// that could server as the first interstitial hop...
	//
        for (let z = 0; z < d.neighbours.length; z++) {
	  if (this.doesSpaceHaveEnemyUnits(this.returnFactionOfPlayer(), d.neighbours[z])) {
	  } else {
	    //
	    // check to see if it has a connection with the source
	    //
	    if (source.neighbours.includes(d.neighbours[z])) {
	      is_there_a_two_hop_connection = true;
	    }
	  }
	}
	if (is_there_a_two_hop_connection == false) {
	  spaces_within_hops.splice(i, 1);
	}
      }
      if (faction == "central" && paths_self.game.state.events.race_to_the_sea != 1) {
	if (spaces_within_hops[i] == "amiens") { spaces_within_hops.splice(i, 1); } else {
	  if (spaces_within_hops[i] == "ostend") { spaces_within_hops.splice(i, 1); } else {
	    if (spaces_within_hops[i] == "calais") { spaces_within_hops.splice(i, 1); }
	  }
	}
      }
    }

    //
    // no retreat options? eliminate all defenders
    //
    if (spaces_within_hops.length == 0) {
      for (let i = 0; i < source.units.length; i++) {
        paths_self.addMove(`eliminate\t${source.key}\t${i}`);
	paths_self.endTurn();
	return;
      }
    }

  
    //
    // allow UI for moving unit...
    //
    let retreat_function = (unit_idx, retreat_function) => {
console.log(JSON.stringify(source));
console.log("unit idx: " + unit_idx);
      let unit = source.units[unit_idx];
      paths_self.playerSelectSpaceWithFilter(
          `Select Retreat Destination for ${unit.name}`,
	  (destination) => {
	    if (spaces_within_hops.includes(destination)) {
	      return 1;
	    }
	    return 0;
	  },
	  (key) => {
	    paths_self.updateStatus("retreating...");
            paths_self.moveUnit(sourcekey, unit_idx, key);
	    paths_self.prependMove(`retreat\t${faction}\t${sourcekey}\t${unit_idx}\t${key}\t${paths_self.game.player}`);
            paths_self.displaySpace(key);
	    if (unit_idx <= 0) {
	      paths_self.endTurn();
	      return 0;
	    } else {
	      retreat_function(unit_idx-1, retreat_function);
	    }
	  },
	  null,
    	  true
      );
    };
  
    //
    // now allow moves
    //
    retreat_function(source.units.length-1, retreat_function);

  }



  playerPlayGunsOfAugust() {

    let html = `<ul>`;
    html    += `<li class="card" id="guns">Guns of August</li>`;
    html    += `<li class="card" id="other">other card</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Choose Your Seventh Card:`, html);
    this.guns_overlay.render();

    this.attachCardboxEvents((action) => {

      this.unbindBackButtonFunction();
      this.guns_overlay.remove();
      this.updateStatus("selected");

      if (action === "guns") {
        this.game.deck[0].hand.push("cp01");
	this.endTurn();
      }

      if (action === "other") {
        this.addMove("DEAL\t1\t1\t1"); // player chooses random other card
	this.endTurn();
      }

    });

  }

  playerPlayFlankAttack() {

    //
    // it is possible to launch a flank attack if we want
    //
    let html = `<ul>`;
    html    += `<li class="option" id="yes">flank attack</li>`;
    html    += `<li class="option" id="no">normal attack</li>`;
    if (this.game.deck[0].hand.includes("cp02")) {
      let attacker_units = this.returnAttackerUnits();
      let defender_units = this.returnDefenderUnits();
      let valid_option = false;
      for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].country == "germany") { valid_option = true; } }
      for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].country != "russia") { valid_option = false; } }
      if (valid_option == true) {
        html    += `<li class="option showcard" id="cp02">wireless intercepts</li>`;
      }
    }
    html    += `</ul>`;

    this.flank_overlay.render();
    this.updateStatusWithOptions(`Flank Attack?`, html);
    this.attachCardboxEvents((action) => {

      this.unbindBackButtonFunction();
      this.updateStatus("submitting...");
      this.flank_overlay.hide();

      if (action === "no") {
	this.endTurn();
	return;
      }

      if (action === "cp02") {
	this.addMove("event\tcp02\tcentral");
        this.endTurn();
      }

      if (action === "yes") {

	//
	// computer-aided simulation, so we will-auto pin
	// in the most advantageous possible... HACK
	//

        //
        // select pinning unit
        //
        let html = `<ul>`;
	let eligible_spaces = [];
	for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
	  let unit = this.game.state.combat.attacker[i];
	  if (!eligible_spaces.includes(unit.unit_sourcekey)) { eligible_spaces.push(unit.unit_sourcekey); }
	}

	let current_option_spacekey = "";
	let current_option_drmboost = 0;
	let best_option_spacekey = "";
	let best_option_drmboost = 0;
        let flanking_spaces = [];
	let action = 0;

	//
	//
	//
	for (let z = 0; z < eligible_spaces.length; z++) {

	  current_option_spacekey = eligible_spaces[z];
	  current_option_drmboost = 0;
	  flanking_spaces = [];

          for (let i = 0; i < eligible_spaces.length; i++) {
            if (eligible_spaces[i] !== current_option_spacekey) {
              if (!flanking_spaces.includes(eligible_spaces[i])) {
                flanking_spaces.push(eligible_spaces[i]);
                if (this.canSpaceFlank(eligible_spaces[i])) {
                  current_option_drmboost++;
                }
              }
            }
          }

	  if (best_option_drmboost < current_option_drmboost) {
	    best_option_drmboost = current_option_drmboost;
	    best_option_spacekey = current_option_spacekey;
	  }

	}

	for (let i = 0; i < eligible_spaces.length; i++) {
	  if (eligible_spaces[i] === best_option_spacekey) { action = i; }
	}

	this.addMove(`flank_attack_attempt\t${action}\t${JSON.stringify(eligible_spaces)}`);
	this.addMove(`NOTIFY\tFlank Attack launched from: ${eligible_spaces[action]}`);
	this.endTurn();

      }
    });
  }

  playerPlayCard(faction, card) {

    //
    // pass is pass!
    //
    if (card == "pass") {
      this.addMove("pass\t"+faction);
      this.endTurn();
      return;
    }


    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    html    += `<li class="card movement" id="ops">ops (movement / combat)</li>`;
    if (c.sr) {
      html    += `<li class="card redeployment" id="sr">strategic redeployment</li>`;
    }
    if (c.rp) {
      html    += `<li class="card replacement" id="rp">replacement points</li>`;
    }
    if (c.canEvent(this, faction)) {
      html    += `<li class="card event" id="event">trigger event</li>`;
    }
    html    += `</ul>`;


    this.updateStatusWithOptions(`${this.returnFactionName(faction)} - playing ${this.popup(card)}`, html, true);

    this.menu_overlay.render(this.game.player, faction);
    this.bindBackButtonFunction(() => { this.playerTurn(faction); });

    this.attachCardboxEvents((action) => {

      this.updateStatus("selected...");
      this.menu_overlay.hide();

      //
      // discard the card
      //
      this.addMove("discard\t"+card);

      if (action === "ops") {
	this.playerPlayOps(faction, card, c.ops);
      }

      if (action === "sr") {
	this.playerPlayStrategicRedeployment(faction, card, c.sr);
      }

      if (action === "rp") {
	this.playerPlayReplacementPoints(faction, card);
      }

      if (action === "event") {

	//
	// and trigger event
	//
	if (c.canEvent(this, faction)) {
	  this.addMove("event\t"+card+"\t"+faction);
	}

	//
	// War Status
	//
	if (c.ws > 0) {
	  this.addMove("ws\t"+card+"\t"+faction+"\t"+c.ws);
	}

        this.addMove(`record\t${faction}\t${this.game.state.round}\tevent`);

	this.endTurn();
	return 1;
      }

    });

  }

  playerPlayCombat(faction) {

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
	if (this.game.spaces[key].units.length > 0) {
	  if (this.returnPowerOfUnit(this.game.spaces[key].units[0]) != faction) {
  	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      let n = this.game.spaces[key].neighbours[i];
	      if (this.game.spaces[n].activated_for_combat == 1) { return 1; }
	    }
	  }
	}
        return 0;
      }
    );


    let mainInterface = function(options, mainInterface, attackInterface) {

      //
      // sometimes this ends
      //
      if (options.length == 0) {
	paths_self.updateStatus("combat finished...");
	paths_self.addMove("resolve\tplayer_play_combat");
	paths_self.addMove("post_combat_cleanup");
	paths_self.endTurn();
	return;
      }

      //
      // sanity check options still valid
      //
      let units_to_attack = 0;
      for (let i = 0; i < options.length; i++) {
	let s = options[i];
	for (let z = 0; z < paths_self.game.spaces[options[i]].units.length; z++) {
	  if (paths_self.game.spaces[options[i]].units[z].attacked != 1) {
	    units_to_attack++;
	  }
	}
      }

      //
      // exit if nothing is left to attack with
      //
      if (units_to_attack == 0) {
	//
	// nothing left
	//
	paths_self.removeSelectable();
	paths_self.updateStatus("acknowledge...");
	paths_self.addMove("resolve\tplayer_play_combat");
	paths_self.addMove("post_combat_cleanup");
	paths_self.endTurn();
      }

      //
      // select space to attack
      //
      paths_self.playerSelectSpaceWithFilter(
	"Execute Combat (Select Target): ",
	(key) => {
	  if (paths_self.game.state.events.oberost != 1) {
	    if (faction == "central") {
	      if (paths_self.game.spaces[key].country == "russia" && paths_self.game.spaces[key].fort > 0) { return 0; }
	    }
	  }
	  if (paths_self.game.spaces[key].fort > 0 && paths_self.game.spaces[key].units.length == 0) {
	    if (paths_self.game.spaces[key].control != faction) { return 1; }
	  }
	  if (paths_self.game.spaces[key].units.length > 0 || paths_self.game.spaces[key].fort > 0) {
	    let power = paths_self.game.spaces[key].control;
	    if (paths_self.game.spaces[key].units.length > 0) { power = paths_self.returnPowerOfUnit(paths_self.game.spaces[key].units[0]); }
	    if (power != faction) {
  	      for (let i = 0; i < paths_self.game.spaces[key].neighbours.length; i++) {
	        let n = paths_self.game.spaces[key].neighbours[i];
	        if (paths_self.game.spaces[n].activated_for_combat == 1) {
		  for (let z = 0; z < paths_self.game.spaces[n].units.length; z++) {
		    if (paths_self.game.spaces[n].units[z].attacked != 1) { return 1; }
		  }
		  paths_self.game.spaces[n].activated_for_combat = 0;
		  paths_self.displaySpace(n);
		}
	      }
	    }
            return 0;
	  }
	},
	(key) => {

	  if (key === "skip") {
	    paths_self.addMove("resolve\tplayer_play_combat");
	    paths_self.addMove("post_combat_cleanup");
	    paths_self.removeSelectable();
	    paths_self.endTurn();
	    return;
	  }
	
	  paths_self.removeSelectable();
	  attackInterface(key, options, [], mainInterface, attackInterface);
	},
	null,
	true,
	[{ key : "skip" , value : "finish attack" }],
      )
    }

    let attackInterface = function(key, options, selected, mainInterface, attackInterface) {

      let units = [];
      let original_key = key;

      for (let z = 0; z < paths_self.game.spaces[key].neighbours.length; z++) {
	let n = paths_self.game.spaces[key].neighbours[z];
	if (paths_self.game.spaces[n].activated_for_combat == 1) {
	  for (let k = 0; k < paths_self.game.spaces[n].units.length; k++) {
	    let u = paths_self.game.spaces[n].units[k];
	    if (u.attacked != 1) {
	       units.push({ key : key , unit_sourcekey: n , unit_idx : k });
	    }
	  }
	}
      }
      units.push({ key : "skip" , unit_idx : "skip" });
      paths_self.playerSelectOptionWithFilter(
	"Which Units Participate in Attack?",
	units,
	(idx) => {
	  if (idx.key == "skip") {
	    return `<li class="option" id="skip">finished selecting</li>`;
	  }
	  let unit = paths_self.game.spaces[idx.unit_sourcekey].units[idx.unit_idx];
	  let already_selected = false;
	  for (let z = 0; z < selected.length; z++) {
	     if (paths_self.app.crypto.stringToBase64(JSON.stringify(idx)) === selected[z]) { already_selected = true; }
	  }
	  if (already_selected) {
  	    return `<li class="option" id='${paths_self.app.crypto.stringToBase64(JSON.stringify(idx))}'>${unit.name} / ${idx.unit_sourcekey} ***</li>`;
	  } else {
  	    return `<li class="option" id='${paths_self.app.crypto.stringToBase64(JSON.stringify(idx))}'>${unit.name} / ${idx.unit_sourcekey}</li>`;
	  }
	},
	(idx) => {

	  //
	  // maybe we are done!
	  //
	  if (idx === "skip") {
	    let finished = false;
	    paths_self.updateStatusWithOptions("attacking...", "");
	    if (selected.length > 0) {
	      let s = [];
	      for (let z = 0; z < selected.length; z++) {
  		s.push(JSON.parse(paths_self.app.crypto.base64ToString(selected[z])));
	      }
	      paths_self.addMove("post_combat_cleanup");
	      paths_self.addMove(`combat\t${original_key}\t${JSON.stringify(s)}`);
	      paths_self.endTurn();
	    } else {
	      paths_self.addMove("resolve\tplayer_play_combat");
	      paths_self.addMove("post_combat_cleanup");
	      paths_self.endTurn();
	    }
	    return;
	  }

	  //
	  // or our JSON object
	  //
	  let pidx = JSON.parse(paths_self.app.crypto.base64ToString(idx));

	  let key = pidx.key;
	  let unit_sourcekey = pidx.unit_sourcekey;
	  let unit_idx = pidx.unit_idx;

	  if (selected.includes(idx)) {
	    selected.splice(selected.indexOf(idx), 1);
	  } else {
	    selected.push(idx);
	  }

          attackInterface(original_key, options, selected, mainInterface, attackInterface);

	},
        false
      );
    }

    mainInterface(options, mainInterface, attackInterface);

  }


  playerPlayMovement(faction) {

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
	if (this.game.spaces[key].activated_for_movement == 1) { return 1; }
        return 0;
      }
    );

    paths_self.zoom_overlay.renderAtSpacekey(options[0]);
    paths_self.zoom_overlay.showControls();

    let mainInterface = function(options, mainInterface, moveInterface, unitActionInterface) {

      //
      // sometimes this ends
      //
      if (options.length == 0) {
	this.updateStatus("moving units...");
	this.endTurn();
	return;
      }

      //
      // sanity check options still valid
      //
      let units_to_move = 0;
      for (let i = 0; i < options.length; i++) {
	for (let z = 0; z < paths_self.game.spaces[options[i]].units.length; z++) {
	  if (paths_self.game.spaces[options[i]].units[z].moved != 1) {
	    units_to_move++;
	  }
	}
      }
      if (units_to_move == 0) {
	//
	// nothing left
	//
	paths_self.removeSelectable();
	paths_self.updateStatus("acknowledge...");
	paths_self.endTurn();
      }

      paths_self.playerSelectSpaceWithFilter(
	"Execute Movement (Awaiting Orders): ",
	(key) => {
	  if (
	    paths_self.game.spaces[key].activated_for_movement == 1 
	    && options.includes(key)
	  ) {
	    let everything_moved = true;
	    for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	      if (paths_self.game.spaces[key].units[z].moved != 1) { everything_moved = false; }
	    }
	    if (everything_moved == true) {
	      paths_self.game.spaces[key].activated_for_movement = 0;
	      paths_self.displaySpace(key);
	    }
	    if (everything_moved == false) { return 1; }
	  }
	  return 0;
	},
	(key) => {
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    paths_self.game.spaces[key].units[z].moved = 0;
	  }
	  paths_self.removeSelectable();
	  moveInterface(key, options, mainInterface, moveInterface, unitActionInterface);
	},
	null,
	true
      )
    }


    let unitActionInterface = function(key, idx, options, mainInterface, moveInterface, unitActionInterface) {
      let unit = paths_self.game.spaces[key].units[idx];
      let sourcekey = key;
      let html  = `<ul>`;
          html += `<li class="option" id="move">move</li>`;
      if (paths_self.game.state.events.entrench == 1) {
          html += `<li class="option" id="entrench">entrench</li>`;
      }
          html += `<li class="option" id="skip">stand down</li>`;
          html += `</ul>`;
      paths_self.updateStatusWithOptions(`Select Action for Unit`, html);
      paths_self.attachCardboxEvents((action) => {

        if (action === "move") {
	  let spaces_within_hops = paths_self.returnSpacesWithinHops(key, unit.movement, (spacekey) => {
	    if (paths_self.game.spaces[spacekey].units.length > 0) {
	      if (paths_self.returnPowerOfUnit(paths_self.game.spaces[spacekey].units[0]) != faction) { 
		return 0; 
	      }
	    }
	    return 1;
	  });

	  paths_self.playerSelectSpaceWithFilter(
	    `Select Destination for ${unit.name}`,
	    (destination) => {
	      if (faction == "central" && paths_self.game.state.events.race_to_the_sea != 1) {
		if (destination == "amiens") { return 0; }
		if (destination == "ostend") { return 0; }
		if (destination == "calais") { return 0; }
	      }
	      if (spaces_within_hops.includes(destination)) {
	        return 1;
	      }
	      return 0;
	    },
	    (key) => {

	      //
	      // if this is a fort, we need to move enough units into the fort in order
	      // to besiege it, which is at least 1 army, or a number of Corps equal to 
	      // the fort’s LF 
	      //
	      let is_the_unit_an_army = false;
	      let is_the_destination_a_fort = false;
	      if (paths_self.game.spaces[key].fort > 1) { is_the_destination_a_fort = true; }
	      if (paths_self.game.spaces[sourcekey].units[idx].army == 1) { is_the_unit_an_army = true; }

	      let units_remaining = 2;
	
	      //
	      // internal function that allows for moving multiple units at the same 
	      // time if necessary to besiege a fort. hijacks control of this function...
	      //
	      let select_and_add_extra_armies = (units_remaining=1, select_and_add_extra_armies) => {

		//
		// find spaces with potential units
		//
	        let spaces_within_hops = paths_self.returnSpacesWithinHops(
      		  key ,
      		  3 ,
      		  (spacekey) => { if (paths_self.game.spaces[spacekey].activated_for_movement == 1) { 
		    for (let z = 0; z < paths_self.game.spaces[spacekey].units.length; z++) {
		      if (paths_self.game.spaces[spacekey].units[z].moved != 1) {
			if (spacekey != sourcekey || z != idx) { return 1; }
		      }
		    }
		  } return 0; }
    		);

		//
		// count units available
		//
		let count = 0;
		for (let z = 0; z < spaces_within_hops.length; z++) {
		  for (let i = 0; i < this.game.spaces[spaces_within_hops[z]].units.length; i++) {
		    if (spaces_within_hops[z] != sourcekey || i != idx) {
		      let u = this.game.spaces[spaces_within_hops[z]].units[i];
		      if (u.corps == 1) { count++; }
		      if (u.army == 1) { count += 100; }
		    }
		  }
		}

		paths_self.playerSelectUnitWithFilter(
		  "Select Unit to Help Besiege" ,
		  (spacekey, unit) => {
		    if (paths_self.game.spaces[spacekey].activated_for_movement) { 
		      if (unit.name != paths_self.game.spaces[sourcekey].units[idx].name) { return 1; }
		    }
		    return 0;
		  } ,
		  (bspacekey, bunit_idx) => {

		    let unit = paths_self.game.spaces[bspacekey].units[bunit_idx];
		    if (unit.army) { units_remaining = 0; }
		    if (unit.corps) { units_remaining--; }

              	    paths_self.moveUnit(bspacekey, bunit_idx, key);
	      	    paths_self.addMove(`move\t${faction}\t${bspacekey}\t${bunit_idx}\t${key}\t${paths_self.game.player}`);
              	    paths_self.displaySpace(key);
              	    paths_self.displaySpace(bspacekey);

		    if (units_remaining > 0) {

		      select_and_add_extra_armies(units_remaining, select_and_add_extra_armies);

		    } else {

              	      paths_self.moveUnit(sourcekey, idx, key);
	              paths_self.addMove(`move\t${faction}\t${sourcekey}\t${idx}\t${key}\t${paths_self.game.player}`);
                      paths_self.displaySpace(key);
	              let mint = false;
	              for (let z = 0; z < paths_self.game.spaces[sourcekey].units.length; z++) {
	                if (paths_self.game.spaces[sourcekey].units[z].moved != 1) { mint = true; }
	              }
	              if (mint) {
	                moveInterface(sourcekey, options, mainInterface, moveInterface, unitActionInterface);
	              } else {
	                mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	              }

		    }

		  } ,
		  () => {
		    alert("reload to restart please");
		  }
	        );

		return;


	      }

	      //
	      // besiege fort? enter sub-function to move all necessary units
	      //
	      if (is_the_destination_a_fort == true && is_the_unit_an_army == false) {
		select_and_add_extra_armies((paths_self.game.spaces[key].fort-1), select_and_add_extra_armies);
		return;
	      }

	      //
	      // code mirrored above inside besiege section
	      //
              paths_self.moveUnit(sourcekey, idx, key);
	      paths_self.addMove(`move\t${faction}\t${sourcekey}\t${idx}\t${key}\t${paths_self.game.player}`);
              paths_self.displaySpace(key);
	      let mint = false;
	      for (let z = 0; z < paths_self.game.spaces[sourcekey].units.length; z++) {
	        if (paths_self.game.spaces[sourcekey].units[z].moved != 1) { mint = true; }
	      }
	      if (mint) {
	        moveInterface(sourcekey, options, mainInterface, moveInterface, unitActionInterface);
	      } else {
	        mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	      }
	    },
	    null,
	    true
	  );
        }

        if (action === "entrench") {
	  let u = paths_self.game.spaces[sourcekey].units[idx];
	  let lf = u.loss; if (u.damaged) { lf = u.rloss; }
	  paths_self.addMove(`player_play_movement\t${faction}`);
	  paths_self.addMove(`entrench\t${faction}\t${sourcekey}\t${idx}\t${lf}`);
	  paths_self.endTurn();
	  return;
        }

        if (action === "skip") {
	  paths_self.game.spaces[key].units[idx].moved = 1;
	  let mint = false;
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    if (paths_self.game.spaces[key].units[z].moved != 1) { mint = true; }
	  }
	  if (mint) {
	    moveInterface(key, options, mainInterface, moveInterface, unitActionInterface);
	  } else {
	    mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	  }
        }

      });
    }


    let moveInterface = function(key, options, mainInterface, moveInterface, unitActionInterface) {

      let units = [];

      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	if (paths_self.game.spaces[key].units[z].moved != 1) {
	  units.push(z);
	}
      }

      if (units.length == 1) {

	let unit = paths_self.game.spaces[key].units[units[0]];
	paths_self.game.spaces[key].units[units[0]].moved = 1;
        unitActionInterface(key, units[0], options, mainInterface, moveInterface, unitActionInterface);

      } else {

        paths_self.playerSelectOptionWithFilter(
	  "Which Unit?",
	  units,
	  (idx) => {
	    let unit = paths_self.game.spaces[key].units[idx];
	    return `<li class="option" id="${idx}">${unit.name} / ${unit.movement}</li>`;
	  },
	  (idx) => {
	    let unit = paths_self.game.spaces[key].units[idx];
	    paths_self.game.spaces[key].units[idx].moved = 1;
            unitActionInterface(key, idx, options, mainInterface, moveInterface, unitActionInterface);
	  },
          false
        );

      }

    }

    mainInterface(options, mainInterface, moveInterface, unitActionInterface);

  }

  playerPlayOps(faction, card, cost, skipend=0) {

    this.addMove(`record\t${faction}\t${this.game.state.round}\tops`);

    if (!skipend) {
      this.addMove("player_play_combat\t"+faction);
      this.addMove("dig_trenches");
      this.addMove("player_play_movement\t"+faction);
    }

    let targets = this.returnNumberOfSpacesWithFilter((key) => {
      if (cost < this.returnActivationCost(faction, key)) { return 0; }
      let space = this.game.spaces[key];
      if (space.activated_for_combat == 1) { return 0; }
      if (space.activated_for_movement == 1) { return 0; }
      for (let i = 0; i < space.units.length; i++) {
        return 1;
      }
      return 0;
    });

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    if (targets > 0) {
      html    += `<li class="card" id="movement">activate for movement</li>`;
    }
    if (targets > 0) {
      html    += `<li class="card" id="combat">activate for combat</li>`;
    }
    html    += `<li class="card" id="end">continue without activation</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`You have ${cost} OPS remaining`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {

      if (action === "end") {
	this.updateStatus("ending turn");
	this.endTurn();
      }

      let movement_fnct = (movement_fnct) => {
	this.playerSelectSpaceWithFilter(
	  `Select Space to Activate (${cost} ops):`,
	  (key) => {
	    if (cost < this.returnActivationCost(faction, key)) { return 0; }
	    let space = this.game.spaces[key];
	    if (space.activated_for_combat == 1) { return 0; }
	    if (space.activated_for_movement == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      if (this.returnPowerOfUnit(space.units[i]) === faction) {
	        return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForMovement(key);
            this.displaySpace(key);
	    let cost_paid = this.returnActivationCost(faction, key); 
	    cost -= cost_paid;
	    this.addMove(`activate_for_movement\t${faction}\t${key}`);
	    if (cost <= 0) {
	      cost = 0;
	      this.endTurn();
	    }
	    if (cost > 0) {
	      this.removeSelectable();
	      this.playerPlayOps(faction, card, cost, 1);
	      movement_fnct(movement_fnct);
	      return;
	    }
	  },
	  null,
	  true,
	);
      }
 
      let combat_fnct = (combat_fnct) => {
	this.playerSelectSpaceWithFilter(
	  `Select Space to Activate (${cost} ops):`,
	  (key) => {
	    let space = this.game.spaces[key];
	    if (space.activated_for_movement == 1) { return 0; }
	    if (space.activated_for_combat == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      if (this.returnPowerOfUnit(space.units[i]) === faction) {
	        return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForCombat(key);
	    let cost_paid = this.returnActivationCost(faction, key); 
	    cost -= cost_paid;
	    this.addMove(`activate_for_combat\t${faction}\t${key}`);
	    if (cost <= 0) {
	      cost = 0;
	      this.endTurn();
	    }
	    if (cost > 0) {
	      this.removeSelectable();
	      combat_fnct(combat_fnct);
	      this.playerPlayOps(faction, card, cost, 1);
	      return;
	    }
	  },
	  null,
	  true,
	);
      }

      if (action === "movement") {
	//
	// select valid space to activate
	//
	this.removeSelectable();
	movement_fnct(movement_fnct);
      }

      if (action === "combat") {
	//
	// select valid space to activate
	//
	this.removeSelectable();
	combat_fnct(combat_fnct);
      }

    });

  }

  playerPlayReplacementPoints(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    //
    //
    //
    this.updateStatus("adding replacement points...");
    this.addMove(`rp\t${faction}\t${card}`);
    this.addMove(`record\t${faction}\t${this.game.state.round}\trp`);
    this.endTurn();

  }

  playerSelectOptionWithFilter(msg, opts, filter_func, mycallback, cancel_func = null, board_blickable = false) {

    let paths_self = this;

    let html = '<ul>';
    for (let i = 0; i < opts.length; i++) { html += filter_func(opts[i]); }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);
    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      $('.option').off();
      paths_self.updateStatus("acknowledge...");
      mycallback(action);
    });

  }

  countSpacesWithFilter(filter_func) {

    let paths_self = this;
    let count = 0;

    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) { 
	count++;
      }
    }

    return count;
  }

  countUnitsWithFilter(filter_func) {

    let paths_self = this;
    let count = 0;

    for (let key in this.game.spaces) {
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
        if (filter_func(key, this.game.spaces[key].units[z]) == 1) {
	  count++;
	}
      }
    }

    return count;

  }


  playerSelectUnitWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable=false, extra_options=[]) {

    let paths_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();

    this.zoom_overlay.spaces_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      let at_least_one_eligible_unit_in_spacekey = false;
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
        if (filter_func(key, this.game.spaces[key].units[z]) == 1) {
	  at_least_one_eligible_unit_in_spacekey = true;
          at_least_one_option = true;
          html += '<li class="option .'+key+'-'+z+'" id="' + key + '-'+z+'">' + key + ' - ' + this.game.spaces[key].units[z].name + '</li>';
	}
      }
      if (at_least_one_eligible_unit_in_spacekey) {

        //
        // the spaces that are selectable are clickable on the main board (whatever board shows)
        //
        if (board_clickable) {
          let t = "."+key;
          document.querySelectorAll(t).forEach((el) => {
            paths_self.addSelectable(el);
            el.onclick = (e) => {

	      let clicked_key = e.currentTarget.id;

              e.stopPropagation();
              e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
              el.onclick = () => {};

              $('.space').off();
              $('.army-tile').off();
              $('.trench-tile').off();

              paths_self.zoom_overlay.spaces_onclick_callback = null;
              paths_self.removeSelectable();

	      if (paths_self.game.spaces[clicked_key].units.length == 1) {
                if (callback_run == false) {
                  callback_run = true;
                  mycallback(clicked_key, 0);
                }
	      } else {
	        let h =  '<ul>';
		for (let z = 0; z < paths_self.game.spaces[clicked_key].units.length; z++) {
                  h += '<li class="option .'+clicked_key+'-'+z+'" id="' + clicked_key + '-'+z+'">' + clicked_key + ' - ' + this.game.spaces[clicked_key].units[z].name + '</li>';
		}
		h += '</ul>';

    		this.updateStatusWithOptions("Select Unit", h);

    		$('.option').off();
  		$('.option').on('click', function () {
  		  let action = $(this).attr("id");
  		  let tmpx = action.split("-");
  		  mycallback(tmpx[0], tmpx[1]);
  		});

	      }
            }
          });
        }
      }
    }


    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    if (extra_options.length > 0) {
      for (let z = 0; z < extra_options.length; z++) { html += `<li class="option ${extra_options[z].key}" id="${extra_options[z].key}">${extra_options[z].value}</li>`; }
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action = $(this).attr("id");
      let tmpx = action.split("-");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      mycallback(tmpx[0], tmpx[1]);

    });

    if (at_least_one_option) { return 1; }
    return 0;

  }

  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false, extra_options=[]) {

    let paths_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();

    this.zoom_overlay.spaces_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) {
        at_least_one_option = true;
        html += '<li class="option .'+key+'" id="' + key + '">' + key + '</li>';

        //
        // the spaces that are selectable are clickable on the main board (whatever board shows)
        //
        if (board_clickable) {
          let t = "."+key;
          document.querySelectorAll(t).forEach((el) => {
            paths_self.addSelectable(el);
            el.onclick = (e) => {
              e.stopPropagation();
              e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
              el.onclick = () => {};
              $('.space').off();
              $('.army-tile').off();
              $('.trench-tile').off();
              paths_self.zoom_overlay.spaces_onclick_callback = null;
              paths_self.removeSelectable();
              if (callback_run == false) {
                callback_run = true;
                mycallback(key);
              }
            }
          });
        }
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    if (extra_options.length > 0) {
      for (let z = 0; z < extra_options.length; z++) { html += `<li class="option ${extra_options[z].key}" id="${extra_options[z].key}">${extra_options[z].value}</li>`; }
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      paths_self.updateStatus("selected...");


      //
      // and remove on-board clickability
      //
      if (board_clickable) {
        for (let key in paths_self.game.spaces) {
          if (filter_func(key) == 1) {
            let t = "."+key;
            document.querySelectorAll(t).forEach((el) => {
              el.onclick = (e) => {};
            });
          }
        }
      }

      paths_self.removeSelectable();

      $('.trench-tile').off();
      $('.army-tile').off();
      $('.space').off();

      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      paths_self.zoom_overlay.spaces_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }



  playerPlayStrategicRedeployment(faction, card, value) {

    let paths_self = this;

    let spaces = this.returnSpacesWithFilter((key) => {
      if (key == "aeubox") { return 0; }
      if (key == "ceubox") { return 0; }
      if (key == "arbox") { if (this.game.player == this.returnPlayerOfFaction("allies")) { return 1; } else { return 0; } }
      if (key == "crbox") { if (this.game.player == this.returnPlayerOfFaction("central")) { return 1; } else { return 0; } }
      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
        let unit = paths_self.game.spaces[key].units[z];
	if (faction == paths_self.returnPowerOfUnit(unit)) {
	  if (unit.type == "corps" && value >= 1) { 
	    return 1;
	  }
	  if (unit.type == "army" && value >= 4) {
	    return 1;
	  }
	}
      }
      return 0;
    });

    //
    // hide any popup
    //
    this.cardbox.hide();

    this.addMove(`record\t${faction}\t${this.game.state.round}\tsd`);

    //
    // select box with unit
    //
    this.playerSelectSpaceWithFilter(
      `Redeploy Units (${value} ops)`,
      (key) => {
	if (spaces.includes(key)) { return 1; }
        return 0;
      },
      (key) => {

	if (key === "end") {
	  paths_self.unbindBackButtonFunction();
	  paths_self.updateStatus("submitting...");
	  paths_self.endTurn();
	  return 1;
	}

        if (key == "crbox") {
  	  paths_self.reserves_overlay.pickUnitAndTriggerCallback("central", (idx) => {
	    let unit = paths_self.game.spaces[crbox].units[idx];
            if (unit.type == "corps") { value -= 1; }
            if (unit.type == "army") { value -= 4; }
	    paths_self.game.spaces[key].units[idx].moved = 1;
	    paths_self.playerRedeployUnit(faction, card, value, key, idx);
	  });
	  return;
	}
        if (key == "arbox") {
  	  paths_self.reserves_overlay.pickUnitAndTriggerCallback("allies", (idx) => {
	    let unit = paths_self.game.spaces[crbox].units[idx];
            if (unit.type == "corps") { value -= 1; }
            if (unit.type == "army") { value -= 4; }
	    paths_self.game.spaces[key].units[idx].moved = 1;
	    paths_self.playerRedeployUnit(faction, card, value, key, idx);
	  });
	  return;
	}

        let units = [];
        for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
  	  if (paths_self.game.spaces[key].units[z].moved != 1) {
	    units.push(z);
	  }
        }

	if (units.length == 0) {
	  return 1;
	}

	if (units.length > 1) {
          paths_self.playerSelectOptionWithFilter(
	    "Redeploy Which Unit?",
	    units,
	    (idx) => {
	      let unit = paths_self.game.spaces[key].units[idx];
	      return `<li class="option" id="${idx}">${unit.name}</li>`;
	    },
	    (idx) => {
	      paths_self.unbindBackButtonFunction();
	      let unit = paths_self.game.spaces[key].units[idx];
              if (unit.type == "corps") { value -= 1; }
              if (unit.type == "army") { value -= 4; }
	      paths_self.game.spaces[key].units[idx].moved = 1;
	      paths_self.playerRedeployUnit(faction, card, value, key, idx);
	    },
            false
          );
	} else {

	  paths_self.unbindBackButtonFunction();
	
	  let unit = paths_self.game.spaces[key].units[idx];
          if (unit.type == "corps") { value -= 1; }
          if (unit.type == "army") { value -= 4; }
	  paths_self.game.spaces[key].units[idx].moved = 1;
	  paths_self.playerRedeployUnit(faction, card, value, key, idx);

	}
      },
      null,
      true,
      [{ key : "end" , value : "end" }] ,
    );

  }

  playerRedeployUnit(faction, card, value=0, spacekey="", unit_idx=0) {

    let paths_self = this;
    let unit = paths_self.game.spaces[spacekey].units[unit_idx];

    let destinations = paths_self.returnSpacesConnectedToSpaceForStrategicRedeployment(faction, spacekey);

    this.playerSelectSpaceWithFilter(
      `Redeploy ${paths_self.game.spaces[spacekey].units[unit_idx].name}?`,
      (key) => {
        if (key == "aeubox" || key == "ceubox" || key == "arbox" || key == "crbox") { return 1; }
	if (destinations.includes(key)) { return 1; }
        return 0;
      },
      (key) => {
	this.updateStatus("redeploying...");
        this.addMove(`sr\t${faction}\t${spacekey}\t${key}\t${unit_idx}\t${value}\t${card}`);
        this.endTurn();
      },
      null,
      true
    );

  }

  playerTurn(faction) {

    let name = this.returnPlayerName(faction);
    let hand = this.returnPlayerHand();

    //
    // you can pass once only 1 card left
    //
    if (hand.length == 1) { hand.push("pass"); this.addMove("pass\t"+faction); }
    this.addMove("resolve\tplay");

    this.updateStatusAndListCards(`${name} - select card`, hand);
    this.attachCardboxEvents((card) => {
      this.playerPlayCard(faction, card);
    });

  }

  playerPlaceUnitInSpacekey(spacekey=[], units=[], mycallback=null) {

    let filter_fnct = (key) => { if (spacekeys.includes(key)) { return 1; } return 0; };
    let unit_idx = 0;

    let finish_fnct = (spacekey) => {
      this.addUnitToSpace(units[unit_idx], spacekey);
      this.displaySpace(spacekey);
      unit_idx++;
      if (unit_idx >= units.length) {
	if (mycallback != null) { mycallback(); }
	return 1;
      } else {
	place_unit_fnct();
      }
    }

    let place_unit_fnct = () => {

      let x = "1st";
      if (unit_idx == 1) { x = "2nd"; }
      if (unit_idx == 2) { x = "3rd"; }
      if (unit_idx == 3) { x = "4th"; }
      if (unit_idx == 4) { x = "5th"; }
      if (unit_idx == 5) { x = "6th"; }
      if (unit_idx == 6) { x = "7th"; }

      this.playerSelectSpaceWithFilter(
	`Select Space for ${this.game.units[units[unit_idx]].name} (${x} unit)`,
        filter_func ,
	finish_fnct ,
	null ,
	true
      );
    }

    if (units.length == 0) { mycallback(); return; }
    
    place_unit_fnct();

  }

  playerPlaceUnitOnBoard(country="", units=[], mycallback=null) {

    let filter_func = () => {}
    let unit_idx = 0;
    let countries = [];

console.log("####");
console.log("####");
console.log("####");
console.log("####");

    if (country == "russia") {
      countries = this.returnSpacekeysByCountry("russia");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "allies") { 
	    if (this.checkSupplyStatus("russia", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
    }

    if (country == "france") {
      countries = this.returnSpacekeysByCountry("france");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "allies") { 
	    if (this.checkSupplyStatus("france", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
console.log("countries: " + JSON.stringify(countries));
    }

    if (country == "germany") {
      countries = this.returnSpacekeysByCountry("germany");
console.log("GERMANY: " + JSON.stringify(countries));
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "central") { 
console.log("checking: " + spacekey);
	    if (this.checkSupplyStatus("germany", spacekey)) { 
console.log("in supply!");
	      return 1; 
	    }
	  }
	}
	return 0;
      }
    }

    if (country == "austria") {
      countries = this.returnSpacekeysByCountry("austria");
      filter_func = (spacekey) => { 
	if (countries.includes(spacekey)) {
	  if (this.game.spaces[spacekey].control == "central") { 
	    if (this.checkSupplyStatus("austria", spacekey)) { return 1; }
	  }
	}
	return 0;
      }
    }


    let finish_fnct = (spacekey) => {
      this.updateStatus("placing unit...");
      this.addUnitToSpace(units[unit_idx], spacekey);
      this.addMove(`add\t${spacekey}\t${this.game.units[units[unit_idx]].key}\t${this.game.player}`);
      this.displaySpace(spacekey);
      unit_idx++;
      if (unit_idx >= units.length) {
	if (mycallback != null) { mycallback(); }
	return 1;
      } else {
	place_unit_fnct();
      }
    }

    let place_unit_fnct = () => {

      let x = "1st";
      if (unit_idx == 1) { x = "2nd"; }
      if (unit_idx == 2) { x = "3rd"; }
      if (unit_idx == 3) { x = "4th"; }
      if (unit_idx == 4) { x = "5th"; }
      if (unit_idx == 5) { x = "6th"; }
      if (unit_idx == 6) { x = "7th"; }

      this.playerSelectSpaceWithFilter(
	`Select Space for ${this.game.units[units[unit_idx]].name} (${x} unit)`,
        filter_func ,
	finish_fnct ,
	null ,
	true
      );
    }

    if (units.length == 0) { mycallback(); return; }
    
    place_unit_fnct();

  }


