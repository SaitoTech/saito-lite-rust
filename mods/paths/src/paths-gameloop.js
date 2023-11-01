

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
	}

 	if (mv[0] == "draw_strategy_card_phase") {
          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "replacement_phase") {
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

console.log("PLAYER: " + this.game.player);
console.log("LIve: " + player);
console.log("HAND: " + JSON.stringify(hand));

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards(`${name} is picking a card`, hand);
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

}catch(err) {console.log("error initing:" + JSON.stringify(err));}

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
	  let faction = mv[1];
          this.game.queue.splice(qe, 1);
	  return 1;
	}

  	if (mv[0] === "rp") {

	  let faction = mv[1];
	  let key = mv[2];
	  let value = mv[3];

	  if (!this.game.state.rp[faction][key]) { this.game.state.rp[faction][key] = 0; }
	  this.game.state.rp[faction][key] += parseInt(value);

          this.game.queue.splice(qe, 1);
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

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

          let options = this.returnSpacesWithFilter(
            (key) => {
              if (this.game.spaces[key].activated_for_combat == 1) { return 1; }
              return 0;
            }
          );
          if (options.length == 0) { return 1; }

	  if (this.game.player == player) {
	    this.playerPlayCombat(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " executing combat");
	  }

	  return 0;

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

console.log("how many spaces activated?" + options.length);

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
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayOps(faction, card, cost);    
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

alert("entrench here!");
	  this.game.spaces[key].units[idx].moved = 1;

	  this.game.queue.splice(qe, 1);
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



