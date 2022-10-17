

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

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("action_phase");
	  this.game.queue.push("spring_deployment_phase");
//	  this.game.queue.push("diplomacy_phase");

this.game.queue.push("is_testing");

	  //
	  // start the game with the Protestant Reformation
	  //
	  if (this.game.state.round == 1) {

//  	    this.game.queue.push("diet_of_worms");
	    //
	    // cards dealt before diet of worms
	    //
	    this.game.queue.push("card_draw_phase");
//	    this.updateLog("Luther's 95 Theses!");
//	    this.game.queue.push("event\t1\t008");

	  } else {
	    this.game.queue.push("card_draw_phase");
	  }

	  this.game.queue.push("ACKNOWLEDGE\tFACTION: "+JSON.stringify(this.returnPlayerFactions(this.game.player)));

	  if (this.game.state.round > 1) {
	    this.updateStatus("Game Over");
	    return 0;
	  }

          return 1;
        }

	if (mv[0] === "halt") {
	  return 0;
	}


	if (mv[0] === "build") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.game.spaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	    if (land_or_sea === "sea") {
	      this.game.navalspaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	  }

	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "remove") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.removeUnit(faction, spacekey, unit_type);
	    }
	    if (land_or_sea === "sea") {
alert("removing unit not implement for sea");
	      this.removeUnit(faction, unit_type, spacekey);
	    }
	  }

	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "retreat_to_winter_spaces") {

	  let moves = [];

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.spaces) {
	    for (let key in this.game.spaces[i].units) {
	      if (this.game.spaces[i].units[key].length > 0) {
	        let space = this.game.spaces[i];
		if (!this.isSpaceFortified(space)) {
		  let res = this.returnNearestFriendlyFortifiedSpaces(key, space);
		  moves.push("retreat_to_winter_spaces_player_select\t"+key+"\t"+space.key);
		}
	      }
	    }
	  }


	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_spaces_player_select") {

	  this.game.queue.splice(qe, 1);

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.playerResolveWinterRetreat(mv[1], mv[2]);
	    return 0;
	  } else {
	    this.updateStatus(mv[1] + " is selecting winter retreat options from " + mv[2]);
	    if (x > 0) { return 0; }
	  }

	  //
	  // non-player controlled factions skip winter retreat
	  //
	  return 1;

        }


	if (mv[0] === "retreat_to_winter_spaces_resolve") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

          for (let i = this.game.spaces[from].units[faction].length-1; i >= 0; i--) {
	    this.game.spaces[to].units[faction].push(this.game.spaces[from].units[faction][i]);
	    this.game.spaces[from].units[faction].splice(i, 1);
	  }

	  return 1;

        }




	if (mv[0] === "retreat_to_winter_ports") {

	  let moves = [];

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.navalspaces) {
	    for (let key in this.game.navalspaces[i].units) {
	      if (this.game.navalspaces[i].units[key].length > 0) {
	        let space = this.game.navalspaces[i];
		let res = this.returnNearestFactionControlledPorts(key, space);
		moves.push("retreat_to_winter_ports_player_select\t"+key+"\t"+space.key);
	      }
	    }
	  }

	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_ports_player_select") {

	  this.game.queue.splice(qe, 1);

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.playerResolvePortsWinterRetreat(mv[1], mv[2]);
	  } else {
	    this.updateStatus(mv[1] + " is selecting winter port retreat options from " + mv[2]);
	  }

	  return 0;

        }


	if (mv[0] === "retreat_to_winter_ports_resolve") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

          for (let i = this.game.navalspaces[from].units[faction].length-1; i >= 0; i--) {
	    this.game.spaces[to].units[faction].push(this.game.navalspaces[from].units[faction][i]);
	    this.game.navalspaces[from].units[faction].splice(i, 1);
	  }

	  return 1;

        }



	if (mv[0] === "is_testing") {

//	  this.game.queue.push("event\t" + this.returnPlayerOfFaction("papacy") + "\t" + "006");
//	  this.game.queue.push("theological_debate");
//	  this.game.queue.push("pre_theological_debate\tpapacy\tprotestant\tgerman\tuncommitted");

	  //this.game.queue.push("retreat_to_winter_spaces");

    	  //
    	  // IS_TESTING -- TEMPORARY
    	  //
    	  this.addDebater("papacy", "bucer");
    	  this.addDebater("hapsburg", "aleander");
    	  this.addDebater("england", "bullinger");
    	  this.addDebater("protestant", "campeggio");


    	  this.activateMinorPower("papacy", "venice");

    	  this.convertSpace("protestant", "graz");
    	  this.controlSpace("protestant", "graz");
    	  this.addRegular("protestant", "graz", 3);
    	  this.addRegular("venice", "trieste", 4);
    	  this.addRegular("venice", "agram", 4);
    	  this.game.spaces['agram'].type = "fortress";

    	  this.addCard("protestant", "036");
    	  this.addCard("protestant", "026");
    	  this.addCard("protestant", "027");
    	  this.addCard("protestant", "028");
    	  this.addCard("papacy", "029");
    	  this.addCard("papacy", "030");
    	  this.addCard("papacy", "024");
    	  this.addCard("papacy", "025");

    	  this.game.spaces['graz'].type = 'key';
    	  this.game.spaces['graz'].occupier = 'protestant';

    	  this.game.queue.splice(qe, 1);


	  return 1;
	}

        if (mv[0] === "event") {

	  let player = parseInt(mv[1]);
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  if (!this.deck[card].onEvent(this, player)) { return 0; }

	  return 1;
	}


        if (mv[0] === "ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayOps(card, faction, opsnum);
	  }
	  
	  return 0;

	}

	if (mv[0] === "moveunit") {

	  let faction   = mv[1];
	  let from_type = mv[2];
	  let from_key  = mv[3];
	  let from_idx  = mv[4];
	  let to_type   = mv[5];
	  let to_key    = mv[6];

	  let unit_to_move;

	  this.game.queue.splice(qe, 1);

	  if (from_type === "sea") {
	    unit_to_move = this.game.navalspaces[from_key].units[faction][from_idx];
	  }
	  if (from_type === "land") {
	    unit_to_move = this.game.spaces[from_key].units[faction][from_idx];
	  }

	  if (to_type === "sea") {
	    this.game.navalspaces[to_key].units[faction].push(unit_to_move);
	  }
	  if (to_type === "land") {
	    this.game.spaces[to_key].units[faction].push(unit_to_move);
	  }

	  return 1;

	}


        if (mv[0] === "move") {

	  let faction = mv[1];
	  let movetype = mv[2];
	  let source = mv[3];
	  let destination = mv[4];
	  let unitidx = parseInt(mv[5]);
	  let skip_avoid_battle = parseInt(mv[6]);

	  this.game.queue.splice(qe, 1);

	  if (movetype === "sea") {

	    //
	    // source = land, destination = sea
	    //
	    if (this.game.spaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.spaces[source].units[faction][unitidx];
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.spaces[source].units[faction].splice(unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displaySpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = sea
	    //
	    if (this.game.navalspaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.navalspaces[source].units[faction][unitidx];
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = land
	    //
	    if (this.game.navalspaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.navalspaces[source].units[faction][unitidx];
              this.game.spaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displaySpace(destination);
	    }

	    //
	    // do we have a jolly sea battle?
	    //
            let space;
	    if (this.game.spaces[destination]) {
	      space = this.game.spaces[destination];
	    }
	    if (this.game.navalspaces[destination]) {
	      space = this.game.navalspaces[destination];
	    }

            let anyone_else_here = 0;

            let lqe = qe-1;
            if (lqe >= 0) {
              let lmv = this.game.queue[lqe].split("\t");
              if (lmv[0] == "naval_interception_check") {
                for (let f in space.units) {
                  if (space.units[f].length > 0 && f != faction) {
                    anyone_else_here = 1;
                  }
                  if (f !== faction && space.units[f].length > 0 && !this.areAllies(f, faction)) {
                    if (lqe-1 >= 0) {
                      // added in reverse order
                      if (skip_avoid_battle != 1) {
                        this.game.queue.splice(lqe, 0, "naval_retreat_check\t"+faction+"\t"+destination+"\t"+source);
                      }
                      this.game.queue.splice(lqe, 0, "RESETCONFIRMSNEEDED\tall");
                      this.game.queue.splice(lqe, 0, "counter_or_acknowledge\tNaval Battle is about to begin in "+destination + "\tnaval_battle");
                      this.game.queue.splice(lqe, 0, "naval_battle\t"+space.key+"\t"+faction);
                    }
                  }
                }
              } else {
                //
                // we only update the occupier of the space if the next move is not a "move"
                // as we require interception check to find out if there are units here already.
                //
                if (lmv[0] !== "move") {
                  if (anyone_else_here == 0) {
                    space.occupier = faction;
                  }
                }
              }
            }
	  }


	  if (movetype === "land") {

	    let unit_to_move = this.game.spaces[source].units[faction][unitidx];
            this.game.spaces[destination].units[faction].push(unit_to_move);
            this.game.spaces[source].units[faction].splice(unitidx, 1);
	    this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	    this.displaySpace(source);
	    this.displaySpace(destination);

	    //
	    // if this space contains two non-allies, field-battle or siege must occur
	    //
	    let space = this.game.spaces[destination];
	    let anyone_else_here = 0;

	    let lqe = qe-1;
	    if (lqe >= 0) {
	      let lmv = this.game.queue[lqe].split("\t");
	      if (lmv[0] == "interception_check") {
	        for (let f in space.units) {
	          if (space.units[f].length > 0 && f != faction) {
		    anyone_else_here = 1;
	          }
	          if (f !== faction && space.units[f].length > 0 && !this.areAllies(f, faction)) {
		    if (lqe-1 >= 0) {
		      // added in reverse order
		      if (skip_avoid_battle != 1) {
	                this.game.queue.splice(lqe, 0, "retreat_check\t"+faction+"\t"+destination+"\t"+source);
	                this.game.queue.splice(lqe, 0, "fortification_check\t"+faction+"\t"+destination+"\t"+source);
		      }
                      this.game.queue.splice(lqe, 0, "RESETCONFIRMSNEEDED\tall");
	    	      this.game.queue.splice(lqe, 0, "counter_or_acknowledge\tField Battle is about to begin in "+destination + "\tfield_battle");
	              this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+faction);
	            }
	          }
	        }
	      } else {
		//
		// we only update the occupier of the space if the next move is not a "move"
		// as we require interception check to find out if there are units here already.
		//
		if (lmv[0] !== "move") {
	          if (anyone_else_here == 0) {
	            space.occupier = faction;
		  }
		}
	      }
	    }
	  }

          return 1;
	}


        if (mv[0] === "fortification_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];

	  his_self.game.state.attacker_comes_from_this_spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.type !== "key" && space.type !== "fortress") {
	    return 1;
	  }

	  //
	  // whoever is being attacked can retreat into the fortification if they
	  // have 4 or less land units
	  //
	  for (f in this.factions) {

	    if (f !== attacker && this.isSpaceControlledByFaction(spacekey, f)) {

	      let fluis = this.returnFactionLandUnitsInSpace(f, spacekey);

	      if (fluis == 0) {

		//
		// no troops - skip
		//

	      } else {

	        if (fluis > 4) {

		  // must land battle

	        } else {

		  if (this.isMinorPower(f)) {

		    if (this.isMinorUnactivatedPower(f)) {

		      //
		      // auto-handled -- we retreat for siege
		      //
		      this.game.queue.push("fortification\t"+attacker+"\t"+f+"\t"+spacekey);

		    } else {

		      //
 		      // major power decides
		      //
		      let cf = "";
		      let mp = f;

		      if (this.game.state.activated_powers['ottoman'].includes(f)) { cf = "ottoman"; }
		      if (this.game.state.activated_powers['hapsburg'].includes(f)) { cf = "hapsburg"; }
		      if (this.game.state.activated_powers['france'].includes(f)) { cf = "france"; }
		      if (this.game.state.activated_powers['england'].includes(f)) { cf = "england"; }
		      if (this.game.state.activated_powers['papacy'].includes(f)) { cf = "papacy"; }
		      if (this.game.state.activated_powers['protestant'].includes(f)) { cf = "protestant"; }

		      let cp = this.returnPlayerOfFaction(cf);

		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+mp+"\t"+spacekey);

		    }

	          } else {

		    //
		    // major power - some player decides
		    //
		    let cp = this.returnPlayerOfFaction(f);
		    if (cp != 0) {
		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+f+"\t"+spacekey);
		    }

	          }
	        }
	      }

	    } else {

	      //
	      // no land units (skip)
	      //

	    }
	  }

          return 1;

	}

        if (mv[0] === "player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];

	  if (this.game.player == player) {
	    this.playerEvaluateFortification(attacker, faction, spacekey);
	  } else {
	    this.updateStatus(faction + " considering fortification");
	    this.updateLog(faction + " evaluating retreat into fortification");
	  }

	  return 0;

        }


	if (mv[0] === "fortify_unit") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let units = JSON.parse(mv[3]);
	  let space = this.game.spaces[spacekey];

          space.besieged = 2; // 2 = cannot attack this round
          space.besieged_factions.push(f);
	  for (let i = 0; i < units.length; i++) {
	    space.units[faction][units[i]].besieged = 1;
	  }

	  return 1;

        }


        if (mv[0] === "fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let faction = mv[2];
	  let spacekey = mv[3];
	  let space = this.game.spaces[spacekey];

	  let faction_map = this.returnFactionMap(space, attacker, faction);
	  let player = this.returnPlayerOfFaction(faction);

console.log("REMOVING EVERYTHING BEFORE FIELD BATTLE");
	  
	  for (let i = this.game.queue.length-1; i >= 0; i--) {
	    let lmv = this.game.queue[i].split("\t");
	    //
	    // remove everything before field_battle
	    //
	    if (lmv[0] !== "field_battle") {
	      this.game.queue.splice(i, 1);
	    } else {
	      break;
	    }
	  }

	  if (this.game.player === player) {
console.log("this player is fortifying space!");
	    this.playerFortifySpace(faction, attacker, spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " handling retreat into fortification");
	  }
	
          return 0;

	}





        if (mv[0] === "retreat_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  his_self.game.state.attacker_comes_from_this_spacekey = mv[3];
	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighbours(spacekey, 0); // 0 cannot intercept across passes
	  let attacking_player = this.returnPlayerOfFaction(attacker);


	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_faction_retreat = 0;
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction > 0) {
  	      if (io[i] !== attacker) {
console.log("considering retreat options for " + io[i]);
	        for (let z = 0; z < neighbours.length; z++) {
	          let fluis = this.canFactionRetreatToSpace(io[i], neighbours[z], attacker_comes_from_this_spacekey);
console.log("possible? " + fluis);
	          if (fluis > 0) {
	            this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+io[i]);
	          }
	        }
	      }
	    }
	    for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	      let ap = this.game.state.activated_powers[io[i]][z];
	      if (ap != attacker) {
console.log("considering retreat options for " + ap);
	        let fluis = this.canFactionRetreatToSpace(ap, neighbours[z], attacker_comes_from_this_spacekey);
console.log("possible? " + fluis);
	        if (fluis > 0) {
	          this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+ap);
	        }
	      }
	    }
	  }

          return 1;

	}



        if (mv[0] === "player_evaluate_retreat_opportunity") {

console.log("pero");
console.log(JSON.stringify(mv));

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  let defender = mv[4];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender)) {
	    this.playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey, defender);
	  } else {
	    this.updateStatus(defender + " considering retreat");
	  }

	  return 0;

	}


	if (mv[0] === "naval_retreat") {

	  let faction = mv[1];
	  let source_spacekey = mv[2];
	  let destination_spacekey = mv[3];

	  let source;
	  if (this.game.spaces[source_spacekey]) { source = this.game.spaces[source_spacekey]; }
	  if (this.game.navalspaces[source_spacekey]) { source = this.game.navalspaces[source_spacekey]; }

	  let destination;
	  if (this.game.spaces[destination_spacekey]) { source = this.game.spaces[destination_spacekey]; }
	  if (this.game.navalspaces[destination_spacekey]) { source = this.game.navalspaces[destination_spacekey]; }

	  for (let i = source.units[faction].length-1; i >= 0; i--) {
	    if (source.units[faction][i].land_or_sea == "sea" || source.units[faction][i].land_or_sea == "both") {
	      destination.units[faction].push(source.units[faction][i]);
	      source.units[faction].splice(i, 1);
	    }
	  }

	  this.displaySpace(source_spacekey);
	  this.displayNavalSpace(source_spacekey);
	  this.displaySpace(destination_spacekey);
	  this.displayNavalSpace(destination_spacekey);
	  
	  return 1;

	}



        if (mv[0] === "retreat") {

	  this.game.queue.splice(qe, 1);

	  let defender = mv[1];
	  let from = mv[2];
	  let to = mv[3];

	  let source = this.game.spaces[from];
	  let destination = this.game.spaces[to];

	  for (let i = 0; i < source.units[defender].length; i++) {
	    to.units[defender].push(source.units[defender][i]);
	  }

	  source.units[defender] = [];

	  this.displaySpace(from);
	  this.displaySpace(to);

          return 1;

	}


        if (mv[0] === "naval_battle_hits_assignment") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let hits_to_assign = parseInt(mv[2]);
	  let space = mv[3];

	  let player = this.returnPlayerOfFaction(faction);
	  if (player > 0) {
	    if (this.game.player === player) {
	      this.playerAssignNavalHits(faction, space, hits_to_assign);
	    } else {
	      this.updateStatus(faction + " assigning hits [ " + hits_to_assigns + " ]");
	    }
	  } else {
	    return 1;
	  }

	  return 0;
	}




        if (mv[0] === "interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let includes_cavalry = parseInt(mv[3]);

	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighbours(spacekey, 0); // 0 cannot intercept across passes

	  let attacking_player = this.returnPlayerOfFaction(faction);

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction != 0) {
  	      if (io[i] !== faction) {
	        for (let z = 0; z < neighbours.length; z++) {
	          let fluis = this.returnFactionLandUnitsInSpace(io[i], neighbours[z]);
	          if (fluis > 0) {
	            this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+includes_cavalry+"\t"+io[i]+"\t"+neighbours[z]);
	          }
	        }
	      }
	    }

	    for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	      let ap = this.game.state.activated_powers[io[i]][z];
	      if (ap != faction) {
	        let fluis = this.returnFactionLandUnitsInSpace(ap, neighbours[z]);
	        if (fluis > 0) {
	          this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"0"+"\t"+ap+"\t"+neighbours[z]);
	        }
	      }
	    }
	  }
          return 1;
	}


        if (mv[0] === "naval_interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];

	  let neighbours = this.returnNavalAndPortNeighbours(spacekey);
	  let attacking_player = this.returnPlayerOfFaction(faction);

	  //
	  // interception at port is not possible
	  //
	  if (this.game.spaces[spacekey]) {
	    console.log("INTERCEPTIONS INVOLVING PORTS NOT SUPPORTED YET");
	  }

	  //
	  //
	  //
	  if (this.game.navalspaces[spacekey]) {

	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i>= 0; i--) {
	      let player_of_faction = this.returnPlayerOfFaction(io[i]);
	      if (player_of_faction != attacking_player && player_of_faction != 0) {
  	        if (io[i] !== faction) {
	          for (let z = 0; z < neighbours.length; z++) {
	            let fluis = this.returnFactionSeaUnitsInSpace(io[i], neighbours[z]);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+io[i]+"\t"+neighbours[z]);
	            }
	          }
	        }
	      }

	      for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	        let ap = this.game.state.activated_powers[io[i]][z];
	        if (ap != faction) {
	          let fluis = this.returnFactionSeaUnitsInSpace(ap, neighbours[z]);
	          if (fluis > 0) {
	            this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+ap+"\t"+neighbours[z]);
	          }
	        }
	      }
	    }
	  }
          return 1;
	}






        if (mv[0] === "player_evaluate_naval_interception_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = mv[3];
	  let defender_spacekey = mv[4];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender)) {
	    this.playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering naval interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}

        if (mv[0] === "intercept") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = parseInt(mv[3]);
	  let defender = mv[4];
	  let defender_spacekey = mv[5];
	  let units_to_move_idx = JSON.parse(mv[6]);
	  let units_to_move = [];

	  //
	  // load actual units to examine them for cavalry, leaders
	  //
	  let s = this.game.spaces[defender_spacekey];
          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[defender][units_to_move_idx[i]]);
	  }

	  if (units_to_move.length == 0) {
	    this.updateLog("no units sent to intercept...");
	    return 1;
	  }

	  let hits_on = 9;
	  let defender_has_cavalry = 0;
	  let defender_highest_battle_rating = 0;

	  for (let i = 0; i < units_to_move.length; i++) {
	    if (units_to_move[i].type === "cavalry") { defender_has_cavalry = 1; }
	    if (units_to_move[i].battle_rating > defender_highest_battle_rating) {
	      defender_highest_battle_rating = units_to_move[i].battle_rating;
	    }
	  }

	  this.updateLog(this.returnFactionName(defender) + " moves to intercept from " + this.returnSpaceName(defender_spacekey));

	  if (attacker === "ottoman" && attacker_includes_cavalry) {
	    this.updateLog("Ottoman +1 cavalry bonus");
	    hits_on++; 
	  }
	  if (defender === "ottoman" && defender_has_cavalry) {
	    this.updateLog("Ottoman -1 cavalry bonus");
	    hits_on--; 
	  }
	  if (defender_highest_battle_rating > 0) {
	    this.updateLog(this.returnFactionName(defender) + " gains " + defender_highest_battle_rating + " bonus from formation leader");
	  }

	  let d1 = this.rollDice(6);
	  let d2 = this.rollDice(6);
	  let dsum = d1+d2;

	  this.updateLog("Interception roll #1: " + d1);
	  this.updateLog("Interception roll #2: " + d2);

	  // IS_TESTING
	  if (dsum >= hits_on) {

	    this.updateLog("SUCCESS");

	    //
	    // insert at end of queue by default
	    //
	    let index_to_insert_moves = this.game.queue.length-1;

	    //
	    // BUT NO OTHER POWER CAN INTERCEPT, SO CLEAN OUT GAME QUEUE
	    //
	    for (let i = this.game.queue.length-1; i >= 0; i--) {
	      let lqe = this.game.queue[i];
	      let lmv = lqe.split("\t");
	      if (lmv[0] !== "player_evaluate_navel_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[3] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
		}
	      } 
	    }


	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      let m = "move\t"+defender+"\tland\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i+"\t"+1]; // 1 = skip avoid battle
	      his_self.game.queue.splice(index_to_insert_moves, 0, m);
	    }

	  } else {
	    this.updateLog("FAILURE");
	  }

	  return 1;

	}




        if (mv[0] === "naval_intercept") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = mv[3];
	  let defender_spacekey = mv[4];
	  let units_to_move_idx = JSON.parse(mv[5]);
	  let units_to_move = [];

	  //
	  // load actual units to examine them for squadrons, corsairs, navy leaders
	  //
	  let s;
	  if (this.game.spaces[defender_spacekey]) {
	    s = this.game.spaces[defender_spacekey];
	  }
	  if (this.game.navalspaces[defender_spacekey]) {
	    s = this.game.navalspaces[defender_spacekey];
	  }

          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[defender][units_to_move_idx[i]]);
	  }

	  if (units_to_move.length == 0) {
	    this.updateLog("no units sent to intercept...");
	    return 1;
	  }

	  let hits_on = 9;
	  let defender_highest_battle_rating = 0;

	  for (let i = 0; i < units_to_move.length; i++) {
	    if (units_to_move[i].battle_rating > defender_highest_battle_rating) {
	      defender_highest_battle_rating = units_to_move[i].battle_rating;
	    }
	  }

	  this.updateLog(this.returnFactionName(defender) + " navy moves to intercept from " + this.returnSpaceName(defender_spacekey));
	  if (defender_highest_battle_rating > 0) {
	    this.updateLog(this.returnFactionName(defender) + " gains " + defender_highest_battle_rating + " bonus from navy leader");
	  }

	  let d1 = this.rollDice(6);
	  let d2 = this.rollDice(6);
	  let dsum = d1+d2;

	  this.updateLog("Interception roll #1: " + d1);
	  this.updateLog("Interception roll #2: " + d2);

	  // IS_TESTING
	  if (dsum >= hits_on) {

	    this.updateLog("SUCCESS");

	    //
	    // insert at end of queue by default
	    //
	    let index_to_insert_moves = this.game.queue.length-1;

	    //
	    // BUT NO OTHER POWER CAN INTERCEPT, SO CLEAN OUT GAME QUEUE FOR THIS DESTINATION
	    //
	    for (let i = this.game.queue.length-1; i >= 0; i--) {
	      let lqe = this.game.queue[i];
	      let lmv = lqe.split("\t");
	      if (lmv[0] !== "player_evaluate_naval_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[2] != spacekey) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
	          index_to_insert_moves = i;
		  break;
		}
	        if (lmv[3] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
	        } 
	      }
	    }


	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      let m = "move\t"+defender+"\tsea\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i+"\t"+1]; // 1 = skip avoid battle
	      his_self.game.queue.splice(index_to_insert_moves, 0, m);
	    }

	  } else {
	    this.updateLog("FAILURE");
	  }

	  return 1;

	}


        if (mv[0] === "diet_of_worms") {

	  let game_self = this;

          game_self.game.queue.push("resolve_diet_of_worms");

          this.updateStatusAndListCards("Pick your Card for the Diet of Worms", this.game.deck[0].fhand[0]);
          this.attachCardboxEvents(function(card) {

            game_self.updateStatus("You picked: " + game_self.deck[card].name); 
 
            let hash1 = game_self.app.crypto.hash(card);    // my card
            let hash2 = game_self.app.crypto.hash(Math.random().toString());  // my secret
            let hash3 = game_self.app.crypto.hash(hash2 + hash1);             // combined hash

            let card_sig = game_self.app.crypto.signMessage(card, game_self.app.wallet.returnPrivateKey());
            let hash2_sig = game_self.app.crypto.signMessage(hash2, game_self.app.wallet.returnPrivateKey());
            let hash3_sig = game_self.app.crypto.signMessage(hash3, game_self.app.wallet.returnPrivateKey());

            game_self.game.spick_card = card;
            game_self.game.spick_hash = hash2;

            game_self.addMove("SIMULTANEOUS_PICK\t"+game_self.game.player+"\t"+hash3+"\t"+hash3_sig);
            game_self.endTurn();

          });

	  this.game.queue.splice(qe, 1);
          return 0;
        }

	if (mv[0] === "resolve_diet_of_worms") {

	  this.game.queue.splice(qe, 1);

	  let protestant = this.returnPlayerOfFaction("protestant");
	  let papacy = this.returnPlayerOfFaction("papacy");

	  let protestant_card = this.game.deck[0].cards[this.game.state.sp[protestant-1]];
	  let papacy_card = this.game.deck[0].cards[this.game.state.sp[papacy-1]];

/*
3. roll protestant dice: The Protestant player adds 4 to the CP value of his card. This total represents the number of dice he now rolls. Each roll of a “5” or a “6” is considered to be a hit.
4. roll papal and Hapsburg dice: The Papal player rolls a num- ber of dice equal to the CP value of his card. The Hapsburg player does the same. Each roll of a “5” or a “6” is considered to be a hit. These two powers combine their hits into a Catholic total.
5. protestant Victory: If the number of Protestant hits exceeds the number of Catholic hits, the Protestant power flips a number of spaces equal to the number of extra hits he rolled to Protestant influence. All spaces flipped must be in the German language zone. Spaces flipped must be adjacent to another Protestant space; spaces that were just flipped in this step can be used as the required adjacent Protestant space.
6. Catholic Victory: If the number of Catholic hits exceeds the number of Protestant hits, the Papacy flips a number of spaces equal to the number of extra hits he rolled to Catholic influence. All spaces flipped must be in the German language zone. Spaces flipped must be adjacent to another Catholic space; spaces that were just flipped in this step can be used as the required adjacent Catholic space.
*/


	  let protestant_rolls = protestant_card.ops + 4;
	  let protestant_hits = 0;

	  for (let i = 0; i < protestant_rolls; i++) {
	    let x = this.rollDice(6);
	    this.updateLog("Protestants roll: " + x);
	    if (x >= 5) { protestant_hits++; }
	  }


	  let papacy_rolls = papacy_card.ops;
	  let papacy_hits = 0;

	  for (let i = 0; i < papacy_rolls; i++) {
	    let x = this.rollDice(6);
	    this.updateLog("Papacy rolls: " + x);
	    if (x >= 5) { papacy_hits++; }
	  }

	  //
	  // TODO: do the hapsburgs get rolls in the 2P game?
	  //
	  // yes -- card pulled from top of deck, or 2 if mandatory event pulled
	  // in which case the event is ignored.
	  //
	  for (let i = 0; i < 2; i++) {
	    let x = this.rollDice(6);
	    this.updateLog("Hapsburg rolls: " + x);
	    if (x >= 5) { papacy_hits++; }
	  }


	  if (protestant_hits > papacy_hits) {
	    for (let i = papacy_hits; i < protestant_hits; i++) {
	      this.game.queue.push("select_for_protestant_conversion\tprotestant\tgerman");
	    }
	  } else {
	    if (protestant_hits < papacy_hits) {
	      for (let i = protestant_hits; i < papacy_hits; i++) {
	        this.game.queue.push("select_for_catholic_conversion\tpapacy\tgerman");
	      }
	    } else {
	      this.updateLog("Diet of Worms ends in tie.");
	    }
	  }

          return 1;

	}

	//
	// this does not auto-remove, it needs to be preceded by a RESETCONFIRMSNEEDED
	// for however many people need to have the opportunity to counter or acknowledge.
	//
	if (mv[0] === "counter_or_acknowledge") {

	  if (this.game.confirms_needed[this.game.player-1] == 0) {
	    this.updateStatus("acknowledged");
	    return;
	  }

	  let msg = mv[1];
	  let stage = mv[2];

	  //
	  // this is run when players have the opportunity to counter
	  // or intercede in a move made by another player. we cannot
	  // automatically handle without leaking information about 
	  // game state, so we let players determine themselves how to
	  // handle. if they are able to, they can respond. if not they
	  // click acknowledge and the msg counts as notification of an
	  // important game development.
	  //
	  let his_self = this;

	  let html = '';

	  let menu_index = [];
	  let menu_triggers = [];
	  let attach_menu_events = 0;

    	  html += '<li class="option" id="ok">acknowledge</li>';

          let z = this.returnEventObjects();
	  for (let i = 0; i < z.length; i++) {
console.log(i + " --- " + z[i].name);
            if (z[i].menuOptionTriggers(this, stage, this.game.player) == 1) {
              let x = z[i].menuOption(this, stage, this.game.player);
              html += x.html;
	      z[i].faction = x.faction; // add faction
	      menu_index.push(i);
	      menu_triggers.push(x.event);
	      attach_menu_events = 1;
	    }
	  }

	  this.updateStatusWithOptions(msg, html);

	  $('.option').off();
          $('.option').on('click', function () {

            let action2 = $(this).attr("id");

	    //
	    // this ensures we clear regardless of choice
	    //
            his_self.addMove("RESOLVE\t"+his_self.app.wallet.returnPublicKey());

            //
            // events in play
            //
            if (attach_menu_events == 1) {
              for (let i = 0; i < menu_triggers.length; i++) {
                if (action2 == menu_triggers[i]) {
                  $(this).remove();
                  z[menu_index[i]].menuOptionActivated(his_self, stage, his_self.game.player, z[menu_index[i]].faction);
                  return;
                }
              }
            }

            if (action2 == "ok") {
	      his_self.updateStatus("acknowledged");
              his_self.endTurn();
              return;
            }

          });

	  return 0;

	}



	if (mv[0] === "naval_battle") {

          this.game.queue.splice(qe, 1);

	  this.game.state.naval_battle = {};

	  //
	  // count units
	  //
          let calculate_units = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type === "squadron") { rolls += 1; }
	      if (space.units[faction][i].type === "corsair") { rolls += 1; }
	    }
	    return rolls;
          }
	  //
	  // calculate rolls
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type === "squadron") { rolls += 2; }
	      if (space.units[faction][i].type === "corsair") { rolls += 1; }
	    }
	    return rolls;
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_ranking = function(faction) {
	    let highest_battle_ranking = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_ranking > 0) {
	        if (highest_battle_ranking < space.units[faction][i].battle_ranking) {
		  highest_battle_ranking = space.units[faction][i].battle_ranking;
		}
	      }
	    }
	    return highest_battle_ranking;
          }


	  //
	  // this is run when a naval battle starts. players have by now 
	  // interceded or played cards that allow them to respond to the 
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let space;
	  if (this.game.spaces[mv[1]]) { space = this.game.spaces[mv[1]]; }
	  if (this.game.navalspaces[mv[1]]) { space = this.game.navalspaces[mv[1]]; }
	  let attacker = mv[2];
	  let stage = "naval_battle";

	  //
	  // ok -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on 
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);


	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	      let dp = his_self.game.players_info[defender_player-1];
	      if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any 
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_units = 0;
          let defender_units = 0;
	  let defender_port_bonus = 0;
	  if (this.game.spaces[mv[1]]) { defender_port_bonus++; defender_rolls++; }

	  let attacker_highest_battle_ranking = 0;
	  let defender_highest_battle_ranking = 0;


	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      attacker_units += calculate_units(f);
	      attacker_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_ranking(f) > attacker_highest_battle_ranking) {
		attacker_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      defender_units += calculate_units(f);
	      defender_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_ranking(f) > defender_highest_battle_ranking) {
		defender_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }  
	  }
	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }



	  //
	  // "professional rowers" may be played after dice are rolled, so we roll the dice
	  // now and break ("naval_battle_continued" afterwards...
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ... rolls: " + attacker_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ... rolls: " + defender_results[i]);
          }

	  //
	  // things get messy and conditional now, because Professional Rowers may 
	  // be played to modify dice rolls.
	  //
	  // we handle this by saving the "state" of the battle and pushing 
	  // execution back to the game queue.
	  //


	  //
	  // save battle state
	  //
	  his_self.game.state.naval_battle.attacker_units = attacker_units;
	  his_self.game.state.naval_battle.defender_units = defender_units;
	  his_self.game.state.naval_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.naval_battle.defender_rolls = defender_rolls;
	  his_self.game.state.naval_battle.attacker_results = attacker_results;
	  his_self.game.state.naval_battle.defender_results = defender_results;
	  his_self.game.state.naval_battle.attacker_faction = attacker_faction;
	  his_self.game.state.naval_battle.defender_faction = defender_faction;
	  his_self.game.state.naval_battle.faction_map = faction_map;

	  his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);
	  his_self.game.queue.push(`counter_or_acknowledge\tNaval Battle Hits Assigmentt\tnaval_battle_hits_assignment`);
	  his_self.game.queue.push(`RESETCONFIRMSNEEDED\tall`);

	  return 1;

        }





	if (mv[0] === "field_battle") {

          this.game.queue.splice(qe, 1);

	  this.game.state.field_battle = {};

	  //
	  // calculate rolls 
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].personage == false) { rolls++; }
	    }
	    return rolls;
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_ranking = function(faction) {
	    let highest_battle_ranking = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_ranking > 0) {
	        if (highest_battle_ranking < space.units[faction][i].battle_ranking) {
		  highest_battle_ranking = space.units[faction][i].battle_ranking;
		}
	      }
	    }
	    return highest_battle_ranking;
          }


	  //
	  // this is run when a field battle starts. players have by now 
	  // interceded or played cards that allow them to respond to the 
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let space = this.game.spaces[mv[1]];
	  let attacker = mv[2];
	  let stage = "field_battle";


	  //
	  // the first thing we check is whether the land units that control the space have 
	  // withdrawn into fortifications, as if that is the case then land battle is avoided
	  //
	  if (space.besieged == 2) {
	    this.updateLog("Field Battle avoided by defenders withdrawing into fortifications");
	    this.game.queue.push("counter_or_acknowledge\tField Battle avoided by defenders retreating into fortification\tsiege");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    space.besieged = 1;
	    return 1;
	  }

	  //
	  // otherwise -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on 
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);


	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	      let dp = his_self.game.players_info[defender_player-1];
	      if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any 
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_highest_battle_ranking = 0;
	  let defender_highest_battle_ranking = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      attacker_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_ranking(f) > attacker_highest_battle_ranking) {
		attacker_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      defender_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_ranking(f) > defender_highest_battle_ranking) {
		defender_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }  
	  }
	  let attacker_units = attacker_rolls;
	  let defender_units = defender_rolls-1;

	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

	  //
	  // logic forks depending on if any of the players can "go first". in order to 
	  // simplify our implementation we are going to roll the dice now and then apply
	  // the hits either simultaneously or in sequence so that we don't need to re-
	  // implement the above.
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ... rolls: " + attacker_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ... rolls: " + defender_results[i]);
          }

	  //
	  // things get messy and conditional now, because Ottomans may play 
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing 
	  // execution back to the game queue.
	  //


	  //
	  // save battle state
	  //
	  his_self.game.state.field_battle.attacker_units = attacker_units;
	  his_self.game.state.field_battle.defender_units = defender_units;
	  his_self.game.state.field_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.field_battle.defender_rolls = defender_rolls;
	  his_self.game.state.field_battle.attacker_results = attacker_results;
	  his_self.game.state.field_battle.defender_results = defender_results;
	  his_self.game.state.field_battle.attacker_faction = attacker_faction;
	  his_self.game.state.field_battle.defender_faction = defender_faction;
	  his_self.game.state.field_battle.faction_map = faction_map;

	  //
	  // ottomans may play Janissaries, and some players may attack before each other, so
	  // we take conditional action and move to COUNTER_OR_ACKNOWLEDGE based on the details
	  // of how the battle should execute.
	  //
	  if (attacker_player.tmp_rolls_first == 1 && defender_player.tmp_rolls_first != 1) {
	    let attacker_hits = his_self.game.state.field_battle.attacker_hits;
	    
	    his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);
	    if (faction_map["ottoman"] === attacker_faction) {
	      his_self.updateLog("Attacker hits assigned first...");
	      his_self.game.queue.push(`counter_or_acknowledge\tAttacker hits assigned first\tfield_battle_hits_assignment`);
	      his_self.game.queue.push(`RESETCONFIRMSNEEDED\tall`);
	    }
	  //
	  // defender goes first
	  //
	  } else if (attacker_player.tmp_rolls_first != 1 && defender_player.tmp_rolls_first == 1) {
	    let defender_hits = his_self.game.state.field_battle.defender_hits;
	    his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);
	    if (faction_map["ottoman"] === defender_faction) {
	      his_self.updateLog("Defender hits assigned first...");
	      his_self.game.queue.push(`counter_or_acknowledge\tDefender hits assigned first\tfield_battle_hits_assignment`);
	      his_self.game.queue.push(`RESETCONFIRMSNEEDED\tall`);
	    }
	  } else {
	    let attacker_hits = his_self.game.state.field_battle.attacker_hits;
	    let defender_hits = his_self.game.state.field_battle.defender_hits;
	    his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);
	    if (faction_map["ottoman"] === defender_faction || faction_map["ottoman"] === attacker_faction) {
	      his_self.game.queue.push(`counter_or_acknowledge\tall assigned simultaneously\tfield_battle_pre_hits_assignment`);
	      his_self.game.queue.push(`RESETCONFIRMSNEEDED\tall`);
	    }
	  }

	  return 1;

        }



	if (mv[0] === "field_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[1]];

	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) { 
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) { 
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "mercenary"; }
		        if (zzz == 1) { cannon_fodder = "regular"; }
		        if (zzz == 2) { cannon_fodder = "cavalry"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
		  	    space.units[f].splice(i, 0);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();
		
		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);
		
		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "mercenary"; }
                    if (zzz == 1) { cannon_fodder = "regular"; }
                    if (zzz == 2) { cannon_fodder = "cavalry"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 0);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 0);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map = his_self.game.state.field_battle.faction_map;
	  let attacker_faction = his_self.game.state.field_battle.attacker_faction;
	  let defender_faction = his_self.game.state.field_battle.defender_faction;
          let attacker_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	  let attacker_results = his_self.game.state.field_battle.attacker_results;
	  let defender_results = his_self.game.state.field_battle.defender_results;
	  let attacker_rolls   = his_self.game.state.field_battle.attacker_rolls;
	  let defender_rolls   = his_self.game.state.field_battle.defender_rolls;
	  let attacker_units   = his_self.game.state.field_battle.attacker_units;
	  let defender_units   = his_self.game.state.field_battle.defender_units;

	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // attacker goes first
	  //
          if (attacker_player.tmp_rolls_first == 1 && defender_player.tmp_rolls_first != 1) {

	    //
 	    // assign attacker hits
	    //
console.log("a");
	    his_self.game.state.field_battle.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
console.log("a");
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.field_battle.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    for (let i = 0; i < attacker_hits; i++) {
	      if (defender_results.length > 0) {
		defender_rolls.splice(defender_rolls.length-1, 1);
		defender_results.splice(defender_rolls.length-1, 1);
	      }
	    }

	    //
	    // assign defender hits
	    //
	    his_self.game.state.field_battle.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.field_battle.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.field_battle.attacker_hits = attacker_hits;
	    his_self.game.state.field_battle.defender_hits = defender_hits;

          //
          // defender goes first
          //
          } else if (attacker_player.tmp_rolls_first != 1 && defender_player.tmp_rolls_first == 1) {

	    //
 	    // assign defender hits
	    //
	    his_self.game.state.field_battle.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.field_battle.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    for (let i = 0; i < defender_hits; i++) {
	      if (attacker_results.length > 0) {
		attacker_rolls.splice(attacker_rolls.length-1, 1);
		attacker_results.splice(attacker_rolls.length-1, 1);
	      }
	    }

	    //
	    // check if we can continue
	    //

	    //
	    // assign attacker hits
	    //
console.log("ab");
	    his_self.game.state.field_battle.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
console.log("ab");
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.field_battle.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    his_self.game.state.field_battle.attacker_hits = attacker_hits;
	    his_self.game.state.field_battle.defender_hits = defender_hits;

          } else {

	    //
	    // assign hits simultaneously
	    //
console.log("ac");
	    his_self.game.state.field_battle.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
console.log("ac");
	    his_self.game.state.field_battle.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    attacker_hits = calculate_hits(attacker_player, attacker_results);
	    defender_hits = calculate_hits(defender_player, defender_results);
	    assign_hits(defender_player, attacker_hits);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.field_battle.attacker_hits = attacker_hits;
	    his_self.game.state.field_battle.defender_hits = defender_hits;

          }

console.log("d");
	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.field_battle.attacker_modified_rolls));
console.log("d");
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.field_battle.defender_modified_rolls));
console.log("d");
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_land_units_remaining = attacker_units - defender_hits;
	  let defender_land_units_remaining = defender_units - attacker_hits;

          his_self.game.state.field_battle.attacker_land_units_remaining = attacker_land_units_remaining;
          his_self.game.state.field_battle.defender_land_units_remaining = defender_land_units_remaining;


	  if (attacker_land_units_remaining == 0 && defender_land_units_remaining == 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 regular");
	      his_self.addRegular(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 regular");
	      his_self.addRegular(defender_faction, space);
	    }
	  }

	  //
	  // capture stranded leaders
	  //
	  if (attacker_land_units_remaining == 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_land_units_remaining == 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Winner: "+this.returnFactionName(winner));

	  this.updateLog("Attacker Units Remaining: "+attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_land_units_remaining);

console.log(winner + " --- " + attacker_faction + " --- " + defender_faction);

          //
          // conduct retreats
          //
          if (winner === defender_faction) {

            for (let f in faction_map) {
              let can_faction_retreat = 0;
              if (faction_map[f] === attacker_faction) {
console.log("evaluating for: " + f);
                for (let z = 0; z < space.neighbours.length; z++) {
console.log("evaluating for retreat to: " + space.neighbours[z]);
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], "");
                  if (fluis > 0) {
console.log("yes, we can retreat here...");
                    can_faction_retreat = 1;
                  }
                }

console.log("can the attackers retreat: " + can_faction_retreat);

                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);
                  this.game.queue.push("player_evaluate_post_field_battle_retreat\t"+f+"\t"+space.key);
                }
	        if (can_faction_retreat == 0) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);
	        }
              }
            }
          }
          if (winner === attacker_faction) {

            for (let f in faction_map) {
              let can_faction_retreat = 0;
              if (faction_map[f] === defender_faction) {
console.log("evaluating for 2: " + f);
                for (let z = 0; z < space.neighbours.length; z++) {
console.log("evaluating for retreat to 2: " + space.neighbours[z]);
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], his_self.game.state.attacker_comes_from_this_spacekey);
                  if (fluis > 0) {
console.log("yes, we can retreat 2");
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+attacker_faction+"\t"+space.key);
                  this.game.queue.push("player_evaluate_post_field_battle_retreat\t"+f+"\t"+space.key);
                }
              }
            }
            this.game.queue.push("player_evaluate_fortification\t"+attacker_faction+"\t"+his_self.returnPlayerOfFaction(defender_faction)+"\t"+defender_faction+"\t"+space.key);
          }

console.log("about to go into player evaluate fortification");
console.log(JSON.stringify(this.game.queue));
console.log("done");


          //
          // redisplay
          //
          his_self.displaySpace(space.key);

          return 1;

        }



 	if (mv[0] === "destroy_naval_units") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.space[spacekey]) { space = this.game.space[spacekey]; }
	  if (this.game.navalspace[spacekey]) { space = this.game.navalspace[spacekey]; }

	  units_to_destroy.sort();
	  if (units_to_destroy[0] < units_to_destroy[units_to_destroy.length-1]) {
	    units_to_destroy.reverse();
	  }

	  //
	  // remove from max to minimum to avoid index-out-of-array errors
	  //
	  for (let i = 0; i < units_to_destroy.length; i++) {
	    space.units[faction].splice(i, 1);
	  }

	  return 1;

	}


	if (mv[0] === "naval_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space;
	  if (this.game.spaces[mv[1]]) {
	    space = this.game.spaces[mv[1]];
	  }
	  if (this.game.navalspaces[mv[1]]) {
	    space = this.game.navalspaces[mv[1]];
	  }


	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) { 
	    	max_possible_hits_assignable += his_self.returnFactionSeaUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) { 
		  if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 2; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "corsair"; }
		        if (zzz == 1) { cannon_fodder = "squadron"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
		  	    space.units[f].splice(i, 0);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();
		
		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);
		
		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 2; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "corsair"; }
                    if (zzz == 1) { cannon_fodder = "squadron"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " sunk");
                        space.units[selected_faction].splice(ii, 0);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction sea units next
		  //
		  targets.splice(selected_target-1, 0);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map      = his_self.game.state.naval_battle.faction_map;
	  let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
	  let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	  let attacker_results = his_self.game.state.naval_battle.attacker_results;
	  let defender_results = his_self.game.state.naval_battle.defender_results;
	  let attacker_rolls   = his_self.game.state.naval_battle.attacker_rolls;
	  let defender_rolls   = his_self.game.state.naval_battle.defender_rolls;
	  let attacker_units   = his_self.game.state.naval_battle.attacker_units;
	  let defender_units   = his_self.game.state.naval_battle.defender_units;

	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // assign hits simultaneously
	  //
	  his_self.game.state.naval_battle.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	  his_self.game.state.naval_battle.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	  attacker_hits = calculate_hits(attacker_player, attacker_results);
	  defender_hits = calculate_hits(defender_player, defender_results);
	  assign_hits(defender_player, attacker_hits);
	  assign_hits(attacker_player, defender_hits);

	  his_self.game.state.naval_battle.attacker_hits = attacker_hits;
	  his_self.game.state.naval_battle.defender_hits = defender_hits;

	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.naval_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.naval_battle.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_sea_units_remaining = attacker_units - defender_hits;
	  let defender_sea_units_remaining = defender_units - attacker_hits;

          his_self.game.state.naval_battle.attacker_sea_units_remaining = attacker_sea_units_remaining;
          his_self.game.state.naval_battle.defender_sea_units_remaining = defender_sea_units_remaining;

	  if (attacker_sea_units_remaining <= 0 && defender_sea_units_remaining <= 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 squadron");
	      his_self.addSquadron(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 squadron");
	      his_self.addSquadron(defender_faction, space);
	    }
	  }


	  //
	  // capture stranded leaders
	  //
	  if (attacker_sea_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_sea_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Winner: "+this.returnFactionName(winner));

	  this.updateLog("Attacker Units Remaining: "+attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_land_units_remaining);

console.log(winner + " --- " + attacker_faction + " --- " + defender_faction);

          this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);

          //
          // conduct retreats
          //
	  if (this.game.spaces[space.key]) {

	    //
	    // attacker always retreats from ports
	    //
            this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);

	  } else {

	    //
	    // loser retreats on open seas
	    //
            if (winner === defender_faction) {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);
	    } else {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+defender_faction+"\t"+space.key);
	    }

	  }

          this.game.queue.push("naval_battle_hits_assignment\t"+defender_faction+"\t"+attacker_hits+"\t"+space.key);
          this.game.queue.push("naval_battle_hits_assignment\t"+attacker_faction+"\t"+defender_hits+"\t"+space.key);


          //
          // redisplay
          //
	  if (this.game.spaces[space.key]) {
            his_self.displaySpace(space.key);
	  } else {
            his_self.displayNavalSpace(space.key);
	  }

          return 1;

        }



	if (mv[0] === "assault") {

          this.game.queue.splice(qe, 1);

	  this.game.state.assault = {};

	  //
	  // calculate rolls 
	  //
          let calculate_units = function(faction) {
	    let num = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type != "cavalry" && space.units[faction][i].personage == false) { num++; }
	    }
	    return num;
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_ranking = function(faction) {
	    let highest_battle_ranking = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_ranking > 0) {
	        if (highest_battle_ranking < space.units[faction][i].battle_ranking) {
		  highest_battle_ranking = space.units[faction][i].battle_ranking;
		}
	      }
	    }
	    return highest_battle_ranking;
          }

	  //
	  // this is run when a field battle starts. players have by now 
	  // interceded or played cards that allow them to respond to the 
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let space = this.game.spaces[mv[1]];
	  let attacker = mv[2];
	  let stage = "assault";

	  //
	  // otherwise -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on 
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);

	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	      let dp = his_self.game.players_info[defender_player-1];
	      if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any 
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_units = 0;
	  let defender_units = 0;
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_highest_battle_ranking = 0;
	  let defender_highest_battle_ranking = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      attacker_units += calculate_units(f);
	      if (calculate_highest_battle_ranking(f) > attacker_highest_battle_ranking) {
		attacker_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      defender_units += calculate_units(f);
	      if (calculate_highest_battle_ranking(f) > defender_highest_battle_ranking) {
		defender_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }  
	  }

	  //
	  // calculate how many rolls attacker and defener get in this situation
	  //
	  if (defender_units == 0) {
	    attacker_rolls = attacker_units;
	    attacker_rolls += attacker_highest_battle_ranking;
	    defender_rolls = 1 + defender_highest_battle_ranking;
	  } else {
	    for (let i = 0; i < attacker_units; i++) {
	      if (i%2 === 1) { attacker_rolls++; }
	      attacker_rolls += attacker_highest_battle_ranking;
	    }
	    defender_rolls = 1 + defender_units + defender_highest_battle_ranking;
	  }

	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

	  //
	  // logic forks depending on if any of the players can "go first". in order to 
	  // simplify our implementation we are going to roll the dice now and then apply
	  // the hits either simultaneously or in sequence so that we don't need to re-
	  // implement the above.
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ... rolls: " + attacker_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ... rolls: " + defender_results[i]);
          }

	  //
	  // things get messy and conditional now, because Ottomans may play 
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing 
	  // execution back to the game queue.
	  //


	  //
	  // save battle state
	  //
	  his_self.game.state.assault.attacker_units = attacker_units;
	  his_self.game.state.assault.defender_units = defender_units;
	  his_self.game.state.assault.attacker_rolls = attacker_rolls;
	  his_self.game.state.assault.defender_rolls = defender_rolls;
	  his_self.game.state.assault.attacker_results = attacker_results;
	  his_self.game.state.assault.defender_results = defender_results;
	  his_self.game.state.assault.attacker_faction = attacker_faction;
	  his_self.game.state.assault.defender_faction = defender_faction;
	  his_self.game.state.assault.faction_map = faction_map;

	  his_self.game.queue.push(`assault_continue\t${mv[1]}`);

	  return 1;

        }


	if (mv[0] === "assault_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[1]];

	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) { 
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) { 
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0 && number_of_targets > 0) {

	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "cavalry"; }
		        if (zzz == 1) { cannon_fodder = "mercenary"; }
		        if (zzz == 2) { cannon_fodder = "regular"; }

			let units_len = space.units[f].length;

  	     	        for (let i = 0; i < units_len; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
console.log("removing which unit: " + cannon_fodder + " from " + f);
		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = units_len + 1;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

console.log("removing secondarily!");

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();
		
		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);
		
		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "cavalry"; }
                    if (zzz == 1) { cannon_fodder = "mercenary"; }
                    if (zzz == 2) { cannon_fodder = "regular"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 0);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map      = his_self.game.state.assault.faction_map;
	  let attacker_faction = his_self.game.state.assault.attacker_faction;
	  let defender_faction = his_self.game.state.assault.defender_faction;
          let attacker_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	  let attacker_results = his_self.game.state.assault.attacker_results;
	  let defender_results = his_self.game.state.assault.defender_results;
	  let attacker_rolls   = his_self.game.state.assault.attacker_rolls;
	  let defender_rolls   = his_self.game.state.assault.defender_rolls;
	  let attacker_units   = his_self.game.state.assault.attacker_units;
	  let defender_units   = his_self.game.state.assault.defender_units;

	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // attacker goes first
	  //
          if (attacker_player.tmp_rolls_first == 1 && defender_player.tmp_rolls_first != 1) {

	    //
 	    // assign attacker hits
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.assault.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    for (let i = 0; i < attacker_hits; i++) {
	      if (defender_results.length > 0) {
		defender_rolls.splice(defender_rolls.length-1, 1);
		defender_results.splice(defender_rolls.length-1, 1);
	      }
	    }

	    //
	    // assign defender hits
	    //
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.assault.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          //
          // defender goes first
          //
          } else if (attacker_player.tmp_rolls_first != 1 && defender_player.tmp_rolls_first == 1) {

	    //
 	    // assign defender hits
	    //
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.assault.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    for (let i = 0; i < defender_hits; i++) {
	      if (attacker_results.length > 0) {
		attacker_rolls.splice(attacker_rolls.length-1, 1);
		attacker_results.splice(attacker_rolls.length-1, 1);
	      }
	    }

	    //
	    // check if we can continue
	    //

	    //
	    // assign attacker hits
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.assault.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          } else {

	    //
	    // assign hits simultaneously
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    attacker_hits = calculate_hits(attacker_player, attacker_results);
	    defender_hits = calculate_hits(defender_player, defender_results);
	    assign_hits(defender_player, attacker_hits);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          }

	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.assault.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.assault.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_land_units_remaining = attacker_units - defender_hits;
	  let defender_land_units_remaining = defender_units - attacker_hits;

          his_self.game.state.assault.attacker_land_units_remaining = attacker_land_units_remaining;
          his_self.game.state.assault.defender_land_units_remaining = defender_land_units_remaining;


	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining <= 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 regular");
	      his_self.addRegular(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 regular");
	      his_self.addRegular(defender_faction, space);
	    }
	  }

	  //
	  // capture stranded leaders
	  //
	  if (attacker_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Attacker Units Remaining: "+attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_land_units_remaining);

console.log(winner + " --- " + attacker_faction + " --- " + defender_faction);

          //
          // conduct retreats
          //
          if (defender_land_units_remaining < attacker_land_units_remaining) {

/****
            for (let f in faction_map) {
              let can_faction_retreat = 0;
              if (faction_map[f] === attacker_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], "");
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);
                  this.game.queue.push("player_evaluate_post_field_battle_retreat\t"+f+"\t"+space.key);
                }
	        if (can_faction_retreat == 0) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);
	        }
              }
            }
****/
          }
          if (winner === attacker_faction) {
/****
            for (let f in faction_map) {
              let can_faction_retreat = 0;
              if (faction_map[f] === defender_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], his_self.game.state.attacker_comes_from_this_spacekey);
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+attacker_faction+"\t"+space.key);
                  this.game.queue.push("player_evaluate_post_field_battle_retreat\t"+f+"\t"+space.key);
                }
              }
            }
            this.game.queue.push("player_evaluate_fortification\t"+attacker_faction+"\t"+his_self.returnPlayerOfFaction(defender_faction)+"\t"+defender_faction+"\t"+space.key);
****/
          }

          //
          // redisplay
          //
          his_self.displaySpace(space.key);

          return 1;

        }



	if (mv[0] === "purge_units_and_capture_leaders") {

console.log("purging units and capturing leader");

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureLeader(loser, winner, spacekey, space.units[f][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


	if (mv[0] === "purge_naval_units_and_capture_leaders") {

console.log("purging naval units and capturing leader");

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space;
	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
	  if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureNavalLeader(loser, winner, spacekey, space.units[f][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


        if (mv[0] === "player_evaluate_post_naval_battle_retreat") {

console.log("PLAYER EVALUATE POST FIELD BATTLE RETREAT!");
console.log("loser: " + loser);
console.log("space: " + spacekey);

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

          let faction_map = his_self.game.state.naval_battle.faction_map;
          let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
          let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];

          if (this.game.player == this.returnPlayerOfFaction(loser)) {
            this.playerEvaluateNavalRetreatOpportunity(loser, spacekey);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat at sea");
          }

          return 0;

        }


        if (mv[0] === "player_evaluate_post_field_battle_retreat") {

console.log("PLAYER EVALUATE POST FIELD BATTLE RETREAT!");
console.log("loser: " + loser);
console.log("space: " + spacekey);

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

          let faction_map = his_self.game.state.field_battle.faction_map;
          let attacker_faction = his_self.game.state.field_battle.attacker_faction;
          let defender_faction = his_self.game.state.field_battle.defender_faction;
          let attacker_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
          let attacker_results = his_self.game.state.field_battle.attacker_results;
          let defender_results = his_self.game.state.field_battle.defender_results;
          let attacker_rolls   = his_self.game.state.field_battle.attacker_rolls;
          let defender_rolls   = his_self.game.state.field_battle.defender_rolls;
          let attacker_units   = his_self.game.state.field_battle.attacker_units;
          let defender_units   = his_self.game.state.field_battle.defender_units;
          let attacker_land_units_remaining = his_self.game.state.field_battle.attacker_land_units_remaining;
          let defender_land_units_remaining = his_self.game.state.field_battle.defender_land_units_remaining;


          //
          // fortification has already happened. if the loser is the attacker, they have to retreat
          //
          if (this.game.player == this.returnPlayerOfFaction(loser)) {
            this.playerEvaluateRetreatOpportunity(attacker_faction, spacekey, "", defender_faction);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat");
          }

          return 0;

        }



        if (mv[0] === "found_jesuit_university") {

	  let spacekey = mv[1];

	  this.game.queue.splice(qe, 1);

	  this.updateLog("Jesuit University founded in " + this.game.spaces[spacekey].name);
	  this.game.spaces[spacekey].university = 1;

	  return 1;

	}



	if (mv[0] === "pick_second_round_debaters") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  this.game.state.theological_debate.round++;

	  let x = 0;

	  //
	  // attacker chosen randomly from uncommitted
	  //
          let ad = 0;
          let cd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker) {
	      if (this.game.state.debaters[i].committed == 0) {
	        ad++;
	      } else {
	        cd++;
	      }
	    }
	  }
	  if (ad != 0) {
	    x = this.rollDice(ad) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	        if (x === ad) { this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type; }
	        ad++;
	      }
	    }
	  } else {
	    x = this.rollDice(cd) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 1) {
	        if (x === cd) { this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type; }
	        cd++;
	      }
	    }
	  }
	  

	  //
	  // defender chosen randomly from uncommitted too
	  //
	  let dd = 0;
	      cd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender) {
		if (this.game.state.debaters[i].committed == 1) {
	          dd++;
	        } else {
		  cd++;
	        }
	      }
	    }
	  }
	  if (dd == 0) {
      	    x = this.rollDice(cd) - 1;
  	    dd = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.theological_debate.committed == "committed") {
	        if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	          if (x === dd) { this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type; }
	          dd++;
	        } else {
	          if (x === dd) { this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type; }
	  	  dd++;
	        }
	      }
	    }
	  } else {
      	    x = this.rollDice(cd) - 1;
  	    cd = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.theological_debate.committed == "committed") {
	        if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	          if (x === cd) { this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type; }
	          cd++;
	        } else {
	          if (x === cd) { this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type; }
	  	  cd++;
	        }
	      }
	    }
	  }
	  
	  this.game.queue.splice(qe, 1);

	}

	if (mv[0] === "pre_theological_debate") {

	  let attacker = mv[1];
	  let defender = mv[2];
	  let language_zone = mv[3];
	  let committed_or_uncommitted = mv[4];

	  this.game.state.theological_debate = {};
	  this.game.state.theological_debate.attacker = mv[1];
	  this.game.state.theological_debate.defender = mv[2];
	  this.game.state.theological_debate.language_zone = mv[3];
	  this.game.state.theological_debate.committed = mv[4];
	  this.game.state.theological_debate.round = 1;
	  this.game.state.theological_debate.round1_attacker_debater = "";
	  this.game.state.theological_debate.round1_defender_debater = "";
	  this.game.state.theological_debate.round2_attacker_debater = "";
	  this.game.state.theological_debate.round2_defender_debater = "";
	  this.game.state.theological_debate.selected_papal_debater = "";
	  this.game.state.theological_debate.prohibited_protestant_debater = "";

	  let x = 0;

	  //
	  // attacker picks debater at random from uncommitted
	  //
          let ad = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker) {
	      if (this.game.state.debaters[i].committed == 0) {
	        ad++;
	      }
	    }
	  }
	  x = this.rollDice(ad) - 1;
	  ad = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	      if (x === ad) { this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type; }
	      ad++;
	    }
	  }
	  
	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed != 1) {
	        dd++;
	      }
	    }
	  }

console.log("TOTAL AVAILABLE: " + dd);
	  x = this.rollDice(dd) - 1;
console.log("INDEX SELECTED: " + x);
	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        if (x === dd) { this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type; }
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	        if (x === dd) { this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type; }
	        dd++;
	      }
	    }
	  }

	  
	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "theological_debate") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let language_zone = this.game.state.theological_debate.language_zone;
	  let committed_or_uncommitted = this.game.state.theological_debate.committed;
	  let attacker_idx = 0;
	  let defender_idx = 0;
	  let was_defender_uncommitted = 0;

	  this.game.queue.splice(qe, 1);

	  //
	  // commit debaters if uncommitted
	  //
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.attacker_debater) {
	      attacker_idx = i;
	      if (this.game.state.debaters[i].committed == 0) {
		this.commitDebater(this.game.state.theological_debate.attacker, this.game.state.theological_debate.attacker_debater);
	      }
	    }
	  }

console.log(JSON.stringify(this.game.state.theological_debate));
console.log("ATTACKERS IS: " + this.game.state.theological_debate.attacker_debater);
console.log("DEFENDER IS: "  + this.game.state.theological_debate.defender_debater);

	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.defender_debater) {
	      defender_idx = i;
	      if (this.game.state.debaters[i].committed == 0) {
	        was_defender_uncommitted = 1;
		this.commitDebater(this.game.state.theological_debate.defender, this.game.state.theological_debate.defender_debater);
	      }
	    }
	  }

	  //
	  // open theological debate UI
	  //
	  this.displayTheologicalDebate();
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);
	  

	  //
	  // some wrangling lets defender switch up if Protestant
	  //
	  let attacker_rolls = this.game.state.debaters[attacker_idx].power + 3; // power of debater + 3;
	  let defender_rolls = this.game.state.debaters[defender_idx].power + 1 + was_defender_uncommitted;

	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let x = this.rollDice(6);
	    this.updateLog(attacker + " rolls " + x);
	    if (x >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let x = this.rollDice(6);
	    this.updateLog(defender + " rolls " + x);
	    if (x >= 5) { defender_hits++; }
	  }
	
	  if (attacker_hits == defender_hits) {

	    //
	    // first round of debate moves into second
	    //
	    this.game.state.theological_debate.round++;
	    this.game.queue.push("theological_debate");
	    this.game.queue.push("counter_or_acknowledge\tThe Debate is Tied - Progress to 2nd Round\tdebate");
            this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    this.game.queue.push("pick_second_round_debaters");

	  } else {
	    if (attacker_hits > defender_hits) {
	      this.updateLog("Attacker Wins");
	    } else {
	      this.updateLog("Defender Wins");
	    }
	    this.game.queue.push("counter_or_acknowledge\tThe Debate is Over\tdebate_finished");
            this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  }

	  return 1;

	}




        if (mv[0] === "build_saint_peters") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.state.saint_peters_cathedral['vp'] < 5) {
	    this.updateLog("Papacy progresses with construction of St. Peter's Basilica");
	    this.game.state.saint_peters_cathedral['state'] += 1;
	    this.game.state.saint_peters_cathedral['vp'] += 1;
	    this.game.state.saint_peters_cathedral['state'] = 0;
	  }

	  return 1;

	}

        if (mv[0] === "victory_determination_phase") {


	  this.game.queue.splice(qe, 1);

	  let f = this.calculateVictoryPoints();

/****
//          faction : this.game.players_info[i].factions[ii] ,
//          vp : 0 ,
//          keys : 0 ,
//          religious : 0 ,
//          victory : 0,
//          details : "",
****/

	  for (let faction in f) {
	    if (f.victory == 1) {
	      let player = this.returnPlayerOfFaction(faction);
	      this.endGame([this.game.players[player-1]], f.details);
	    }
	  }

          return 1;
        }
        if (mv[0] === "new_world_phase") {

	  //
	  // no new world phase in 2P games
	  //
	  if (this.game.players.length > 2) {

console.log("NEW WORLD PHASE!");
	    // resolve voyages of exploration

	    // resolve voyages of conquest

	  }

	  //
	  // phase otherwise removed entirely for 2P
	  //

	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "winter_phase") {

	  console.log("Winter Phase!");

	  // Remove loaned naval squadron markers
	  this.returnLoanedUnits();

	  // Remove the Renegade Leader if in play
	  // Return naval units to the nearest port
	  // Return leaders and units to fortified spaces (suffering attrition if there is no clear path to such a space)
	  // Remove major power alliance markers
	  // Add 1 regular to each friendly-controlled capital
	  // Remove all piracy markers
	  // Flip all debaters to their uncommitted (white) side, and
	  // ResolvespecificMandatoryEventsiftheyhavenotoccurred by their “due date”.

	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "action_phase") {

	  this.game.queue.splice(qe, 1);

console.log("NUMBER OF PLAYERS: " + this.game.players);

	  if (this.game.players.length == 2) {
	    this.game.queue.push("play\tprotestant");
	    this.game.queue.push("play\tpapacy");
	    return 1;
	  }

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    this.game.queue.push("play\t"+io[i]);
	  }
          return 1;
        }
        if (mv[0] === "spring_deployment_phase") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.players === 2) {
	    // only papacy moves units
	    this.game.queue.push("spring_deployment\tpapacy");
	  } else {
	    // all players can move units
	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i >= 0; i--) {
	      if (this.isFactionInPlay(io[i])) {
		this.game.queue.push("spring_deployment\t"+io[i]);
	      }
	    }
	  }

          return 1;
        }
        if (mv[0] === "spring_deployment") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);


	  if (this.game.player == player) {
	    this.playerPlaySpringDeployment(faction, player);
	  } else {
	    this.updateStatus(faction.charAt(0).toUpperCase() + faction.slice(1) + " Spring Deployment");
	  }

	  return 0;

	}
        if (mv[0] === "diplomacy_phase") {

	  //
	  // 2-player game? both players play a diplomacy card
	  // AFTER they have been dealt on every turn after T1
	  //
	  if (this.game.state.round > 1) {
    	    this.game.queue.push("play_diplomacy_card\tpapacy");
    	    this.game.queue.push("play_diplomacy_card\tprotestant");
	  }


	  //
	  // 2-player game? Diplomacy Deck
	  //
	  if (this.game.players.length == 2) {
	    for (let i = this.game.players_info.length-1; i >= 0; i--) {
	      for (let z = 0; z < this.game.players_info[i].factions.length; z++) {
    	        this.game.queue.push("DEAL\t2\t"+(i+1)+"\t1");
	      }
	    }
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
	    for (let i = this.game.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t2\t"+(i));
	    }
	    for (let i = this.game.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t2\t"+(i));
	    }
	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
	  }


	  //
	  // The Papacy may end a war they are fighting by playing Papal Bull or by suing for peace. -- start of diplomacy phase
	  //
          this.game.queue.push("papacy_diplomacy_phase_special_turn");


	  this.game.queue.splice(qe, 1);
          return 1;

        }

	if (mv[0] === "papacy_diplomacy_phase_special_turn") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
	    this.playerPlayPapacyDiplomacyPhaseSpecialTurn();
	  } else {
	    this.updateStatus("Papacy Considering Diplomatic Options");
	  }

          return 0;

        }

        if (mv[0] === "card_draw_phase") {

	  //
	  // deal cards and add home card
	  //
	  for (let i = this.game.players_info.length-1; i >= 0; i--) {
	    for (let z = 0; z < this.game.players_info[i].factions.length; z++) {
              let cardnum = this.factions[this.game.players_info[i].factions[z]].returnCardsDealt(this);
    	      this.game.queue.push("hand_to_fhand\t1\t"+(i+1)+"\t"+this.game.players_info[i].factions[z]);
    	      this.game.queue.push("add_home_card\t"+(i+1)+"\t"+this.game.players_info[i].factions[z]);
    	      this.game.queue.push("DEAL\t1\t"+(i+1)+"\t"+(cardnum));
	    }
	  }

	  //
	  // DECKRESTORE copies backed-up back into deck
	  //
          this.game.queue.push("SHUFFLE\t1");
          this.game.queue.push("DECKRESTORE\t1");


	  for (let i = this.game.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKENCRYPT\t1\t"+(i));
	  }
	  for (let i = this.game.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKXOR\t1\t"+(i));
	  }


	  //
	  // new cards this turn
	  //
	  let new_cards = this.returnNewCardsForThisTurn(this.game.state.round);

	  
	  //
	  // re-add discards
	  //
	  let discards = {};
	  for (let i in this.game.deck[0].discards) {
      	    discards[i] = this.game.deck[0].cards[i];
      	    delete this.game.deck[0].cards[i];
    	  }
    	  this.game.deck[0].discards = {};

	  //
	  // our deck for re-shuffling
	  //
	  let reshuffle_cards = {};
	  for (let key in discards) { reshuffle_cards[key] = discards[key]; }
	  for (let key in new_cards) { reshuffle_cards[key] = new_cards[key]; }
console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");


	  let deck_to_deal = this.returnDeck()
	  delete deck_to_deal['001'];
	  delete deck_to_deal['002'];
	  delete deck_to_deal['003'];
	  delete deck_to_deal['004'];
	  delete deck_to_deal['005'];
	  delete deck_to_deal['006'];
	  delete deck_to_deal['007'];
	  delete deck_to_deal['008'];

    	  this.game.queue.push("restore_home_cards_to_deck");
    	  this.game.queue.push("DECK\t1\t"+JSON.stringify(reshuffle_cards));


	  // backup any existing DECK #1
          this.game.queue.push("DECKBACKUP\t1");


	  //
	  // "The Protestant army leader Maurice of Saxony is placed 
	  // on the map at the start of Turn 6. Maurice is the only 
	  // army leader that doesn’t either start the game on the map
	  // or enter via a Mandatory Event. Place Maurice in any 
	  // electorate under Protestant political control."
	  //
//
// is not debater
//
//	  if (this.game.round == 6) {
//    	    this.game.queue.push("place_protestant_debater\tmaurice_of_saxony\tselect");
//	  }
	  if (this.game.round == 2) {
    	    this.game.queue.push("place_protestant_debater\tzwingli\tzurich");
	  }
	  if (this.game.round == 4) {
    	    this.game.queue.push("place_protestant_debater\tcalvin\tgeneva");
	  }

	  //
	  // dynamic - turn after Henry VIII maries Anne Boleyn
	  //
	  if (this.game.round == 6) {
    	    this.game.queue.push("place_protestant_debater\tcranmer\tlondon");
	  }

	  //
	  // "Naval leaders eliminated from play are also brought back 
	  // during the Card Draw Phase. Place them in a friendly port 
	  // if possible. If no friendly port exists, they remain on 
	  // the Turn Track for another turn. Naval units eliminated in 
	  // a previous turn are also returned to each power’s pool of 
	  // units available to be constructed at this time."
	  //
    	  //this.game.queue.push("restore\tnaval_leaders");

	 
	  this.game.queue.splice(qe, 1);
          return 1;

        }

        if (mv[0] === "restore_home_cards_to_deck") {

	  let d = this.returnDeck();
	  this.game.deck[0].cards['001'] = d['001'];
	  this.game.deck[0].cards['002'] = d['002'];
	  this.game.deck[0].cards['003'] = d['003'];
	  this.game.deck[0].cards['004'] = d['004'];
	  this.game.deck[0].cards['005'] = d['005'];
	  this.game.deck[0].cards['006'] = d['006'];
	  this.game.deck[0].cards['007'] = d['007'];
	  this.game.deck[0].cards['008'] = d['008'];
	  this.game.queue.splice(qe, 1);
          return 1;
	}

        if (mv[0] === "play") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);
          this.displayBoard();

	  this.game.state.active_player = player;
	  this.game.state.active_faction = faction;

	  // skip factions not-in-play
	  if (player == -1) { 
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // reset player/state vars and set as active player
	  //
	  this.resetPlayerTurn(player);

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards("Opponent Turn:", this.game.deck[0].fhand[0]);
	  }

	  this.game.queue.splice(qe, 1);
          return 0;
        }
	if (mv[0] === "continue") {

	  let player = mv[1];
	  let faction = mv[2];
	  let card = mv[3];
	  let ops = mv[4];

	  this.game.queue.splice(qe, 1);

	  let player_turn = -1;

	  for (let i = 0; i < this.game.players_info.length; i++) {
	    if (this.game.players_info[i].factions.includes(faction)) {
	      player_turn = i+1;
	    }
	  }

          this.displayBoard();

	  // no-one controls this faction, so skip
	  if (player_turn === -1) { 
	    return 1; 
	  }

	  // let the player who controls play turn
	  if (this.game.player === player_turn) {
	    this.playerPlayOps(card, faction, ops);
	  } else {
	    this.updateStatusAndListCards("Opponent Turn");
	  }
          return 0;
        }


	if (mv[0] === "place_protestant_debater") {

	  this.game.queue.splice(qe, 1);

	  let name = mv[3];
	  let location = mv[4];

	  this.updateLog(unitname + " enters at " + location);
	  this.addDebater("protestant", location, name);
	  if (this.game.spaces[space].religion != "protestant") {
	    this.game.spaces[space].religion = "protestant";
	    this.updateLog(location + " converts to Protestant Religion");
	  }
	  this.displaySpace(location);

	  return 1;

	}

	if (mv[0] === "select_for_catholic_conversion") {

	  let faction = mv[1];
	  let religion = mv[2];
	  let zone = mv[3];

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerSelectSpaceWithFilter(
              "Select Town to Convert Catholic",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "protestant" &&
                  his_self.isSpaceAdjacentToReligion(space, "catholic")
                ) {
                  return 1;
                }
                return 0;
              },

              function(spacekey) {
                his_self.addMove("convert\t"+spacekey+"\tcatholic");
                his_self.endTurn();
              },

              null

            );
          }

	  this.displayVictoryTrack();
	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	if (mv[0] === "select_for_protestant_conversion") {

	  let faction = mv[1];
	  let religion = mv[2];
	  let zone = mv[3];

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerSelectSpaceWithFilter(
              "Select Town to Convert Protestant",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "catholic" &&
                  his_self.isSpaceAdjacentToReligion(space, "protestant")
                ) {
                  return 1;
                }
                return 0;
              },

              function(spacekey) {
                his_self.addMove("convert\t"+spacekey+"\tprotestant");
                his_self.endTurn();
              },

              null

            );
          }

	  this.displayVictoryTrack();
	  this.game.queue.splice(qe, 1);
	  return 0;

        }



	if (mv[0] === "assault") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let space = mv[2];

alert("ASSAULT UNIMPLEMENTED");
	  this.displayVictoryTrack();

	  return 1;

	}

	if (mv[0] === "pacify" || mv[0] === "control") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let space = mv[2];

	  this.game.spaces[space].unrest = 0;
	  this.game.spaces[space].political = faction;

	  this.displaySpace(space);
	  this.displayVictoryTrack();

	  return 1;

	}




	if (mv[0] === "convert") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let religion = mv[2];

	  this.updateLog(this.game.spaces[space].name + " converts to the " + religion + " religion");

	  if (space === "augsburg" && religion === "protestant" && this.game.state.augsburg_electoral_bonus == 0) {
	    this.game.spaces['augsburg'].units['protestant'].push();
    	    this.addRegular("protestant", "augsburg", 2);
	    this.game.state.augsburg_electoral_bonus = 1;
	  }
	  if (space === "mainz" && religion === "protestant" && this.game.state.mainz_electoral_bonus == 0) {
	    this.game.spaces['mainz'].units['protestant'].push();
    	    this.addRegular("protestant", "mainz", 1);
	    this.game.state.mainz_electoral_bonus = 1;
	  }
	  if (space === "trier" && religion === "protestant" && this.game.state.trier_electoral_bonus == 0) {
	    this.game.spaces['trier'].units['protestant'].push();
    	    this.addRegular("protestant", "trier", 1);
	    this.game.state.trier_electoral_bonus = 1;
	  }
	  if (space === "cologne" && religion === "protestant" && this.game.state.cologne_electoral_bonus == 0) {
	    this.game.spaces['cologne'].units['protestant'].push();
    	    this.addRegular("protestant", "cologne", 1);
	    this.game.state.cologne_electoral_bonus = 1;
	  }
	  if (space === "wittenberg" && religion === "protestant" && this.game.state.wittenberg_electoral_bonus == 0) {
	    this.game.spaces['wittenberg'].units['protestant'].push();
    	    this.addRegular("protestant", "wittenberg", 2);
	    this.game.state.wittenberg_electoral_bonus = 1;
	  }
	  if (space === "brandenburg" && religion === "protestant" && this.game.state.brandenburg_electoral_bonus == 0) {
	    this.game.spaces['brandenburg'].units['protestant'].push();
    	    this.addRegular("protestant", "brandenburg", 1);
	    this.game.state.brandenburg_electoral_bonus = 1;
	  }

	  this.game.spaces[space].religion = religion;
	  this.displaySpace(space);
	  this.displayElectorateDisplay();
	  this.displayVictoryTrack();

	  return 1;

	}

	if (mv[0] === "add_home_card") {

	  let player = parseInt(mv[1]);
 	  let faction = mv[2];
 	  let hc = this.returnDeck();

	  if (this.game.player === player) {
	    for (let key in hc) {
	      if (hc[key].faction === faction) {
	        this.game.deck[0].hand.push(key);
	      }
	    }
	  }
	  
	  this.game.queue.splice(qe, 1);
	  return 1;

	}


        if (mv[0] === "play_diplomacy_card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayDiplomacyCard(faction);
	  }

	  return 0;

	}


	if (mv[0] === "hand_to_fhand") {

	  this.game.queue.splice(qe, 1);

	  let deckidx = parseInt(mv[1])-1;
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let fhand_idx = this.returnFactionHandIdx(player, faction);

	  if (this.game.player == player) {

	    if (!this.game.deck[deckidx].fhand) { this.game.deck[deckidx].fhand = []; }
	    while (this.game.deck[deckidx].fhand.length < (fhand_idx+1)) { this.game.deck[deckidx].fhand.push([]); }

	    for (let i = 0; i < this.game.deck[deckidx].hand.length; i++) {
	      this.game.deck[deckidx].fhand[fhand_idx].push(this.game.deck[deckidx].hand[i]);
	    }

	    // and clear the hand we have dealt
	    this.game.deck[deckidx].hand = [];
	  }

	  return 1;

	}

	if (mv[0] === "reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  this.game.state.tmp_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let protestants_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // neighbours
	  //
	  for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {
	    if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
	      c_neighbours++;
	    }
	    if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
	      p_neighbours++;
	    }  
	  }

	  //
	  // language zone
	  //
	  if (this.game.spaces[space].language !== "german") {
	    ties_resolve = "catholic";
 	  }

	  //
	  // temporary bonuses
	  //
	  p_bonus += this.game.state.tmp_protestant_reformation_bonus;
	  c_bonus += this.game.state.tmp_catholic_reformation_bonus;

	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

this.updateLog("Total Rolls: ");
this.updateLog("Protestants: " + p_rolls);

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    this.updateLog("Protestants roll: " + x, 1);
	    if (x > p_high) { p_high = x; }
	  }

this.updateLog("Catholics: " + c_rolls);

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    this.updateLog("Catholics roll: " + x, 1);
	    if (x > c_high) { c_high = x; }
	  }

	  //
	  // do protestants win?
	  //
	  if (p_high > c_high) { protestants_win = 1; }
	  if (p_high == c_high && ties_resolve === "protestant") { protestants_win = 1; }


	  //
	  // handle victory
	  //
	  if (protestants_win == 1) {
	    this.updateLog("Protestants win!");
	    this.game.queue.push("convert\t"+space+"\tprotestant");
	  } else {
	    this.updateLog("Catholics win!");
	  }

	  return 1;

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


