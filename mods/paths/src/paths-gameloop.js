

  //
  // Core Game Logic
  //
  async handleGameLoop() {

    let paths_self = this;

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
	// entry point for every turn in the game
	//
	// NOTE: turns contains rounds in this game, which is a somewhat
	// unusual terminology. the action phase contains 6 rounds per 
	// player, played in sequence.
	//
        if (mv[0] === "turn") {

	  this.game.state.turn++;
	   
this.updateLog(`###############`);
this.updateLog(`### Turn ${this.game.state.turn} ###`);
this.updateLog(`###############`);

	  this.onNewTurn();

          for (let i = 0; i < this.game.state.players_info.length; i++) {
            this.resetPlayerRound((i+1));
          }

	  //
	  // we have reset variables, so redisplay
	  //
	  this.displayBoard();

          this.game.queue.push("draw_strategy_card_phase");
          this.game.queue.push("replacement_phase");
          this.game.queue.push("war_status_phase");
          this.game.queue.push("siege_phase");
          this.game.queue.push("attrition_phase");
          this.game.queue.push("action_phase");
          this.game.queue.push("mandated_offensive_phase");

	  if (this.game.state.turn === 1) {
            this.game.queue.push("guns_of_august");
	  }


	}

	if (mv[0] === "guns_of_august") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player === this.returnPlayerOfFaction("central")) {
	    if (this.game.deck[0].hand.includes("cp01")) {
	      this.addMove("NOTIFY\tCentral Powers start with Guns of August!");
              this.addMove("DEAL\t1\t1\t1"); // deal random other card
	      this.endTurn()
	    } else {
	      this.playerPlayGunsOfAugust();
	    }
	  } else {
	    this.updateStatus("Central Powers considering Guns of August");
	  }

	  return 0;

	}

 	if (mv[0] == "draw_strategy_card_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "replacement_phase") {

	  console.log("###");
	  console.log("### Replacement Phase");
	  console.log("###");

	  this.game.state.rp['central'] = {};
	  this.game.state.rp['allies'] = {};

          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "war_status_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "siege_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "attrition_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "action_phase") {

          this.game.queue.splice(qe, 1);

	  for (let i = 0; i < 6; i++) {
	    this.game.queue.push("play\tallies");
	    this.game.queue.push("play\tcentral");
	  }

	  return 1;
	}
 	if (mv[0] == "mandated_offensive_phase") {

	  let central = this.rollDice();
	  let allies = this.rollDice();
	
 	  if (central == 1) { this.game.state.mandated_offensives.central = "AH"; }
 	  if (central == 2) { this.game.state.mandated_offensives.central = "AH IT"; }
 	  if (central == 3) { this.game.state.mandated_offensives.central = "TU"; }
 	  if (central == 4) { this.game.state.mandated_offensives.central = "GE"; }
 	  if (central == 5) { this.game.state.mandated_offensives.central = ""; }
 	  if (central == 6) { this.game.state.mandated_offensives.central = ""; }
 	  if (allies == 1)  { this.game.state.mandated_offensives.allies = "FR"; }
 	  if (allies == 2)  { this.game.state.mandated_offensives.allies = "FR"; }
 	  if (allies == 3)  { this.game.state.mandated_offensives.allies = "BR"; }
 	  if (allies == 4)  { this.game.state.mandated_offensives.allies = "IT"; }
 	  if (allies == 5)  { this.game.state.mandated_offensives.allies = "IT"; }
 	  if (allies == 6)  { this.game.state.mandated_offensives.allies = "RU"; }

	  this.mandates_overlay.render({ central : central, allies : allies });
          this.game.queue.splice(qe, 1);

	  return 1;
	}


	//////////////
	// GAMEPLAY //
	//////////////
	if (mv[0] == "play") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);
	  let name = this.returnPlayerName(faction);
	  let hand = this.returnPlayerHand();

	  this.onNewTurn();

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	  }
	  
	  return 0;

	}


        if (mv[0] == "init") {
try {
	  // belgium
          this.addUnitToSpace("be_army", "antwerp");
          this.addUnitToSpace("bef_army", "brussels");

	  // france
          this.addTrench("paris", 1);
          this.addUnitToSpace("fr_army05", "sedan");
          this.addUnitToSpace("fr_army06", "paris");
          this.addUnitToSpace("fr_army03", "verdun");
          this.addUnitToSpace("fr_army04", "verdun");
          this.addUnitToSpace("fr_army01", "nancy");
          this.addUnitToSpace("fr_army02", "nancy");
          this.addUnitToSpace("fr_army09", "barleduc");
          this.addUnitToSpace("fr_corps", "belfort");
          this.addUnitToSpace("fr_corps", "grenoble");

	  // germany
	  this.addTrench("metz", 1);
	  this.addTrench("konigsberg", 1);
	  this.addTrench("strasbourg", 1);
          this.addUnitToSpace("ge_army01", "aachen");
          this.addUnitToSpace("ge_army02", "koblenz");
          this.addUnitToSpace("ge_army03", "koblenz");
          this.addUnitToSpace("ge_army04", "metz");
          this.addUnitToSpace("ge_army05", "metz");
          this.addUnitToSpace("ge_army06", "strasbourg");
          this.addUnitToSpace("ge_army08", "insterberg");
          this.addUnitToSpace("ge_corps", "insterberg");
          this.addUnitToSpace("ge_corps", "bremen");
          this.addUnitToSpace("ge_corps", "oppeln");

	  // russia
	  this.addTrench("riga", 1);
	  this.addTrench("odessa", 1);
          this.addUnitToSpace("ru_army01", "kovno");
          this.addUnitToSpace("ru_army02", "lomza");
          this.addUnitToSpace("ru_army04", "ivangorod");
          this.addUnitToSpace("ru_army05", "lublin");
          this.addUnitToSpace("ru_army03", "dubno");
          this.addUnitToSpace("ru_army08", "kamenetspodolski");
          this.addUnitToSpace("ru_corps", "grodno");
          this.addUnitToSpace("ru_corps", "riga");
          this.addUnitToSpace("ru_corps", "szawli");
          this.addUnitToSpace("ru_corps", "odessa");
          this.addUnitToSpace("ru_corps", "lutsk");
          this.addUnitToSpace("ru_corps", "riga");
          this.addUnitToSpace("ru_corps", "batum");

	  // austria
	  this.addTrench("cracow", 1);
	  this.addTrench("trieste", 1);
	  this.addTrench("villach", 1);
          this.addUnitToSpace("ah_corps", "cracow");
          this.addUnitToSpace("ah_corps", "villach");
          this.addUnitToSpace("ah_corps", "timisvar");
          this.addUnitToSpace("ah_corps", "czernowitz");
          this.addUnitToSpace("ah_corps", "stanislau");
          this.addUnitToSpace("ah_army06", "sarajevo");
          this.addUnitToSpace("ah_army05", "novisad");
          this.addUnitToSpace("ah_army02", "munkacs");
          this.addUnitToSpace("ah_army01", "tarnow");
          this.addUnitToSpace("ah_army04", "przemysl");
          this.addUnitToSpace("ah_army03", "tarnopol");

	  // italy
	  this.addTrench("trent", 1);
	  this.addTrench("asiago", 1);
	  this.addTrench("maggiore", 1);
          this.addUnitToSpace("it_corps", "taranto");
          this.addUnitToSpace("it_corps", "rome");
          this.addUnitToSpace("it_corps", "turin");
          this.addUnitToSpace("it_army01", "verona");
          this.addUnitToSpace("it_army02", "udine");
          this.addUnitToSpace("it_army03", "maggiore");
          this.addUnitToSpace("it_army04", "asiago");

	  // reserves boxes
    	  this.addUnitToSpace("ge_army04", "crbox");
    	  this.addUnitToSpace("ge_army06", "crbox");
    	  this.addUnitToSpace("ge_army08", "crbox");
    	  this.addUnitToSpace("fr_army01", "arbox");
    	  this.addUnitToSpace("ru_army09", "arbox");
    	  this.addUnitToSpace("ru_army10", "arbox");
    	  this.addUnitToSpace("br_corps", "arbox");

} catch(err) {console.log("error initing:" + JSON.stringify(err));}

          this.displayBoard();

          this.game.queue.splice(qe, 1);
	  return 1;
        }



	////////////////////////////
	// SHOW AND HIDE OVERLAYS //
	////////////////////////////
	if (mv[0] === "show_overlay") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  if (mv[1] === "zoom") {
	    let lz = mv[2];
	    this.zoom_overlay.render(lz);
          }
          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "hide_overlay") {
	  if (mv[1] === "zoom") { this.theses_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}



	/////////////////////
	// modifying state //
	/////////////////////
  	if (mv[0] === "sr") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source = mv[2];
          let destination = mv[3];
	  let unit_idx = parseInt(mv[4]);
	  let value = parseInt(mv[5]);
	  let card = mv[6];

	  let unit = this.game.spaces[source].units[unit_idx];
	  this.game.spaces[source].units.splice(unit_idx, 1);
	  this.game.spaces[destination].units.push(unit);

	  this.displaySpace(source);
	  this.displaySpace(destination);
	  this.displayReserveBoxes();

	  if (value > 0) {
	    if (this.game.player == this.returnPlayerOfFaction(faction)) {
	      this.playerPlayStrategicRedeployment(faction, card, value);
            } else {
	      this.updateStatus("Opponent Redeploying...");
	    }
	    return 0;
	  } else {
	    return 1;
	  }

	}

  	if (mv[0] === "rp") {

	  let faction = mv[1];
	  let card = mv[2];

    	  let c = this.deck[card];
    
    	  for (let key in c.sr) {
            if (faction == "central") {
              if (!this.game.state.rp["central"][key]) { this.game.state.rp["central"][key] = 0; }
              this.game.state.rp["central"][key] += c.sr[key];
            }
            if (faction == "allies") {
              if (!this.game.state.rp["allies"][key]) { this.game.state.rp["allies"][key] = 0; }
              this.game.state.rp["allies"][key] += c.sr[key];
            }
          } 

	  this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card) + " for Replacement Points");
          this.game.queue.splice(qe, 1);
	  return 1;

	}

        if (mv[0] === "resolve") {

	  this.game.queue.splice(qe, 1);

	  let cmd = "";
	  if (mv[1]) { cmd = mv[1]; }
	  if (this.game.queue.length >= 1) {
	    if (this.game.queue[qe-1].split("\t")[0] === cmd) {
	      this.game.queue.splice(qe-1, 1);
	    }
	  }

	  return 1;

	}

        if (mv[0] === "card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayCard(card, p, faction);
	  }

	  return 0;

	}

	if (mv[0] === "player_play_combat") {

	  //
	  // we do not splice, because combat involves multiple
	  // returns to this, so we only want to clear this once
	  // it is not possible to execute any more combat.
	  //
	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

          let options = this.returnSpacesWithFilter(
            (key) => {
              if (this.game.spaces[key].activated_for_combat == 1) {
		for (let z = 0; z < this.game.spaces[key].units.length; z++) {
		  if (this.game.spaces[key].units[z].attacked == 0) { return 1; }
		}
	        return 0;
	      }
              return 0;
            }
          );
          if (options.length == 0) {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  if (this.game.player == player) {
	    this.playerPlayCombat(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " executing combat");
	  }

	  return 0;

	}

	if (mv[0] === "combat") {

	  let key = mv[1];
	  let selected = JSON.parse(mv[2]);

	  this.game.state.combat = {};
	  this.game.state.combat.key = key;
	  this.game.state.combat.attacker = selected;
	  this.game.state.combat.attacking_faction = this.returnPowerOfUnit(this.game.spaces[selected[0].unit_sourcekey].units[0]);

	  //
	  // remove this from the queue
	  //
	  this.game.queue.splice(qe, 1);

	  let attacker_strength = 0;
	  let defender_strength = 0;

	  for (let i = 0; i < this.game.spaces[key].units.length; i++) {
	    defender_strength += this.game.spaces[key].units[i].combat;
	  }

	  for (let z = 0; z < this.game.state.combat.attacker.length; z++) {
	    let obj = this.game.state.combat.attacker[z];
	    attacker_strength += this.game.spaces[obj.unit_sourcekey].units[obj.unit_idx].combat;
	  }

	  this.game.state.combat.attacker_strength = attacker_strength;
	  this.game.state.combat.defender_strength = defender_strength;

	  //
	  // now show overlay and 
	  //
	  this.game.queue.push("combat_attacker_advance");
	  this.game.queue.push("combat_defender_retreat");
	  this.game.queue.push("combat_determine_outcome");
	  this.game.queue.push("combat_play_combat_cards");
	  this.game.queue.push("combat_evaluate_flank_attack");
	  this.game.queue.push("counter_or_acknowledge\tcombat_cards_trenches");


//3. Play trench-negating Combat Cards
//4. Attempt Flank Attack
//5. Play Combat Cards
//6. Determine DRM
//7. Determine Fire Column
//8. Determine Results
//9. Take Losses
//10. Determine Combat Winner
//11. Defender Retreat
//12. Attacker Advance

	  this.combat_overlay.render();
	  this.combat_overlay.pullHudOverOverlay();

	  return 1;

	}

	if (mv[0] == "combat_play_combat_cards") {

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "combat_recalculate_loss_factor") {

	  let faction = mv[1]; // attacker / defender

	  let attacker_strength = 0;          
	  let defender_strength = 0;          

          for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
            let u = this.game.spaces[this.game.state.combat.key].units[z];
	    if (!u.damaged) {
              defender_strength += u.combat;
	    } else {
              defender_strength += u.rcombat;
	    }
          }

          for (let z = 0; z < this.game.state.combat.attacker.length; z++) {
	    let skey = this.game.state.combat.attacker[z].unit_sourcekey;
	    let sidx = this.game.state.combat.attacker[z].unit_idx;
            let u = this.game.spaces[skey].units[sidx];
	    if (!u.damaged) {
              attacker_strength += u.combat;
	    } else {
              attacker_strength += u.rcombat;
	    }
          }

          this.game.state.combat.attacker_strength = attacker_strength;
          this.game.state.combat.defender_strength = defender_strength;

console.log("RECALCULATE");
console.log("RECALCULATE");
console.log("RECALCULATE");
console.log("RECALCULATE");
console.log("RECALCULATE");
console.log("RECALCULATE");
console.log("RECALCULATE");
console.log(JSON.stringify(this.game.state.combat, null, 2));

	  if (faction == "attacker") {
            this.game.state.combat.attacker_loss_factor = this.returnAttackerLossFactor();
          }

	  if (faction == "defender") {
	    this.game.state.combat.defender_loss_factor = this.returnDefenderLossFactor();
	  }

          if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
            this.game.state.combat.winner = "defender";
          }
          if (this.game.state.combat.attacker_loss_factor < this.game.state.combat.defender_loss_factor) {
            this.game.state.combat.winner = "attacker";
          }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] == "combat_determine_outcome") {

	  //
	  // rolls are either handled synchronously or in sequence
	  //
	  let attacker_drm = 0;
	  let defender_drm = 0;
	  let attacker_roll = 0;
	  let defender_roll = 0;
	  let attacker_modified_roll = 0;
	  let defender_modified_roll = 0;
	  let attacker_power = "allies";
	  let defender_power = "central";
	  let attacker_combat_power = 0;
	  let defender_combat_power = 0;

	  let attacker_table = "corps";
	  let defender_table = "corps";

	  for (let i = 0; i < this.game.spaces[this.game.state.combat.key].units.length; i++) {
	    let unit = this.game.spaces[this.game.state.combat.key].units[i];
	    if (this.returnPowerOfUnit(unit) == "allies") { attacker_power = "central"; defender_power = "allies"; } 
	    if (unit.key.indexOf("army") > 0) { attacker_table = "army"; }
	  }

	  for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
	    let unit = this.game.spaces[this.game.state.combat.attacker[i].unit_sourcekey].units[this.game.state.combat.attacker[i].unit_idx];
	    if (unit.key.indexOf("army") > 0) { defender_table = "army"; }	    
	    unit.attacked = 1;
	  }

	  attacker_roll = this.rollDice();
	  defender_roll = this.rollDice();

	  attacker_modified_roll = attacker_roll + attacker_drm;
	  defender_modified_roll = defender_roll + defender_drm;
	  
	  if (attacker_modified_roll > 6) { attacker_modified_roll = 6; }
	  if (defender_modified_roll > 6) { defender_modified_roll = 6; }
	  if (attacker_modified_roll < 1) { attacker_modified_roll = 1; }
	  if (defender_modified_roll < 1) { defender_modified_roll = 1; }

	  this.game.state.combat.attacker_table = attacker_table;
	  this.game.state.combat.defender_table = defender_table;
	  this.game.state.combat.attacker_power = attacker_power;
	  this.game.state.combat.defender_power = defender_power;
	  this.game.state.combat.attacker_drm = attacker_drm;
	  this.game.state.combat.defender_drm = defender_drm;
	  this.game.state.combat.attacker_roll = attacker_roll;
	  this.game.state.combat.defender_roll = defender_roll;
	  this.game.state.combat.attacker_modified_roll = attacker_modified_roll;
	  this.game.state.combat.defender_modified_roll = defender_modified_roll;
	  this.game.state.combat.attacker_loss_factor = this.returnAttackerLossFactor();
	  this.game.state.combat.defender_loss_factor = this.returnDefenderLossFactor();
	  this.game.state.combat.winner = "none";
	  if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
	    this.game.state.combat.winner = "defender";
	  }
	  if (this.game.state.combat.attacker_loss_factor < this.game.state.combat.defender_loss_factor) {
	    this.game.state.combat.winner = "attacker";
	  }

console.log("#");
console.log("#");
console.log("# combat");
console.log("#");
console.log("#");
console.log(JSON.stringify(this.game.state.combat));


	  if (this.game.state.combat.flank_attack == "attacker") {
	    this.game.queue.push(`combat_assign_hits\tattacker`);
	    this.game.queue.push(`combat_recalculate_loss_factor\tattacker`);
	    this.game.queue.push(`combat_assign_hits\tdefender`);
	  }
	  if (this.game.state.combat.flank_attack == "defender") {
	    this.game.queue.push(`combat_assign_hits\tdefender`);
	    this.game.queue.push(`combat_recalculate_loss_factor\tdefender`);
	    this.game.queue.push(`combat_assign_hits\tattacker`);
	  }
	  //
	  // defender applies losses first if not a flank attack
	  //
	  if (!this.game.state.combat.flank_attack) {
	    this.game.queue.push(`combat_assign_hits\tattacker`);
	    this.game.queue.push(`combat_assign_hits\tdefender`);
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


	if (mv[0] === "combat_assign_hits") {

	  let power = mv[1];
	  let player = 1;
	  let loss_factor = 0;

	  if (power == "attacker") { 
	    player = this.returnPlayerOfFaction(this.game.state.combat.attacker_power);
	    loss_factor = this.game.state.combat.attacker_loss_factor;
	  }
	  if (power == "defender") {
	    player = this.returnPlayerOfFaction(this.game.state.combat.defender_power);
	    loss_factor = this.game.state.combat.defender_loss_factor;
	  }

	  if (this.game.player === player) {
	    this.combat_overlay.hide();
	    this.loss_overlay.render(power);
	  } else {
	    this.combat_overlay.hide();
	    this.loss_overlay.render(power);
	    this.unbindBackButtonFunction();
	    this.updateStatus("Opponent Assigning Losses");
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}


	if (mv[0] === "combat_determine_winner") {

	  if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
	    // loser discards combat cards
	  }
	  if (this.game.state.combat.attacker_loss_factor > this.game.state.combat.defender_loss_factor) {
	    // loser discards combat cards
	  }
	  if (this.game.state.combat.attacker_loss_factor == this.game.state.combat.defender_loss_factor) {
	    // both players lose
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


	if (mv[0] === "combat_defender_retreat") {

	  this.game.queue.splice(qe, 1);
	  let units = this.returnAttackerUnits();
	  let does_defender_retreat = false;

	  if (this.game.state.combat.winner == "defender") {
	    this.updateLog("Defender Wins, no retreat...");
	    return 1;
	  }

	  for (let i = 0; i < units.length; i++) {
	    if (units[i].key.indexOf("army") > 0 && units[i].damaged == false) {
	      does_defender_retreat = true;
	    }
	  }

	  if (does_defender_retreat) {
	    let player = this.returnPlayerOfFaction(this.game.state.combat.defender_power);
	    if (this.game.player == player) {
	      this.playerPlayPostCombatRetreat();
	    } else {
	      this.updateStatus("Opponent Retreating...");
	    }
	    return 0;
	  } else {
	    return 1;
	  }

	}

	if (mv[0] === "combat_attacker_advance") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.state.combat.winner == "defender") {
	    this.updateLog("Defender Wins, no advance...");
	    return 1;
	  }

	  let player = this.returnPlayerOfFaction(this.game.state.combat.attacker_power);
	  if (this.game.player == player) {
	    this.playerPlayAdvance();
	  } else {
	    this.updateStatus("Opponent deciding on advance...");
	  }

	  return 0;
	}


	if (mv[0] == "combat_evaluate_flank_attack") {

	  this.game.queue.splice(qe, 1);

	  if (this.canFlankAttack()) {
	    if (this.game.player == this.returnPlayerOfFaction(this.game.state.combat.attacking_faction)) {
	      this.playerPlayFlankAttack();
	    } else {
	      this.updateStatus("Opponent considering Flank Attack");
	    }
	    return 0;
          }

	  return 1;

	}

	if (mv[0] === "post_combat_cleanup") {

	  let spacekey = this.game.state.combat.key;
	  for (let i = this.game.spaces[spacekey].units.length-1; i >= 0; i--) {
	    let u = this.game.spaces[spacekey].units[i];
	    if (u.destroyed == true) {
	      this.game.spaces[spacekey].units.splice(i, 1);
	    }
	  }

	  this.displaySpace(spacekey);

	  for (let key in this.game.spaces) {
	    let space = this.game.spaces[key];
	    if (space.activated_for_combat || space.activated_for_movement) {
	      for (let z = space.units.length-1; z >= 0 ; z--) {
	        let u = space.units[z];
		if (u.destroyed) { space.units.splice(z, 1); }
	      }
	    }
	    this.displaySpace(key);
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	// eliminates unit from game
	if (mv[0] === "eliminate") {

	  let spacekey = mv[1];
	  let idx = parseInt(mv[2]);

	  let unit = this.game.spaces[spacekey].units[idx];
	  let faction = this.returnPowerOfUnit(unit);
	  this.updateLog(unit.name + " eliminated in " + this.returnSpaceName(spacekey));

	  if (faction == "allies") {
   	    this.game.state.eliminated["allies"].push(unit);
	  } else {
   	    this.game.state.eliminated["central"].push(unit);
	  }

	  this.game.spaces[spacekey].units.splice(idx, 1);	
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

        }
	if (mv[0] === "damage") {

	  let spacekey = mv[1];
	  let idx = parseInt(mv[2]);

	  let unit = this.game.spaces[spacekey].units[idx];
	  if (unit.damaged == false) { unit.damaged = true; } else { unit.destroyed = true; }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "add") {

	  let spacekey = mv[1];
	  let unitkey = mv[2];

	  let unit = this.cloneUnit(unitkey);
	  unit.spacekey = spacekey;
	  this.game.spaces[spacekey].units.push(this.cloneUnit(unitkey));

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] == "flank_attack_attempt") {

	  let action = mv[1];
	  let eligible_spaces = JSON.parse(mv[2]);

console.log("ES: " + eligible_spaces[0]);

	  let drm_modifiers = 0;
          //
          // +1 for every unit without another army adjacent to it
          //
          let flanking_spaces = [];

          for (let i = 0; i < eligible_spaces.length; i++) {
            if (i != action) {
console.log("valid: " + eligible_spaces[i]);
              if (!flanking_spaces.includes(eligible_spaces[i])) {
console.log("it is not a previously-examined flanking space...");
                flanking_spaces.push(eligible_spaces[i]);
console.log("can: " + eligible_spaces[i] + " flank?: " + this.canSpaceFlank(eligible_spaces[i]));
                if (this.canSpaceFlank(eligible_spaces[i])) {
console.log("adding +1 to drm modifiers...");
                  drm_modifiers++;
                }
              }
            }
          }

	  let roll = this.rollDice(6);
	  this.updateLog("roll: " + roll + " (+"+drm_modifiers+")"); 

	  if (roll > (3+drm_modifiers)) {
	    this.game.state.combat.flank_attack = "attacker"; 
	  } else {
	    this.game.state.combat.flank_attack = "defender"; 
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;

        }


	
	if (mv[0] === "player_play_movement") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];

    	  let options = this.returnSpacesWithFilter(
    	    (key) => {
    	      if (this.game.spaces[key].activated_for_movement == 1) { return 1; }
      	      return 0;
      	    }
    	  );

	  if (options.length == 0) { return 1; }

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerPlayMovement(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " executing movement");
	  }

	  return 0;

	}


	if (mv[0] === "player_play_ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let cost = parseInt(mv[3]);
	  let skipend = 0;
	  if (mv[4]) { skipend = parseInt(mv[4]); }
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayOps(faction, card, cost, skipend);    
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing OPS");
	  }

	  return 0;

	}


        if (mv[0] === "activate_for_combat") {

	  let faction = mv[1];
	  let key = mv[2];

	  this.activateSpaceForCombat(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



        if (mv[0] === "activate_for_movement") {

	  let faction = mv[1];
	  let key = mv[2];

	  this.activateSpaceForMovement(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "entrench") {

	  let faction = mv[1];
	  let key = mv[2];
	  let idx = parseInt(mv[3]);

	  this.game.spaces[key].units[idx].moved = 1;

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "retreat") {

	  let faction = mv[1];
	  let sourcekey = mv[2];
	  let sourceidx = parseInt(mv[3]);
	  let destinationkey = mv[4];
	  let player_to_ignore = 0;
	  if (mv[5]) { player_to_ignore = parseInt(mv[5]); }

	  this.game.queue.splice(qe, 1);
	  if (mv[5]) {
	     this.game.queue.push("move\t"+mv[1]+"\t"+mv[2]+"\t"+mv[3]+"\t"+mv[4]+"\t"+mv[5]);
	  } else {
	     this.game.queue.push("move\t"+mv[1]+"\t"+mv[2]+"\t"+mv[3]+"\t"+mv[4]);
	  }

	  this.game.state.combat.retreat_sourcekey = mv[2];
	  this.game.state.combat.retreat_destinationkey = mv[4];

	  return 1;

	}

	if (mv[0] === "move") {

	  let faction = mv[1];
	  let sourcekey = mv[2];
	  let sourceidx = parseInt(mv[3]);
	  let destinationkey = mv[4];
	  let player_to_ignore = 0;
	  if (mv[5]) { player_to_ignore = parseInt(mv[5]); }

	  if (this.game.player != player_to_ignore) {
	    this.moveUnit(sourcekey, sourceidx, destinationkey);
	  }

	  let deactivate_for_movement = true;
          for (let z = 0; z < this.game.spaces[sourcekey].units.length; z++) {
            if (this.game.spaces[sourcekey].units[z].moved == 0) {
	      deactivate_for_movement = false;
	    }
          }
	  if (deactivate_for_movement) {
            this.game.spaces[sourcekey].activated_for_movement = 0;
	    this.displaySpace(sourcekey);
	  }

	  this.game.queue.splice(qe, 1);

	  return 1;
	}


        if (mv[0] === "ops") {

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


	if (mv[0] === "counter_or_acknowledge") {

	  this.game.queue.splice(qe, 1);

	  return 1;

	}



	//
	// objects and cards can add commands
	//
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



