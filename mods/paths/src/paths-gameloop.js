
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
	  this.game.state.round = 0;	   


console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("##################");
console.log("====HANDS====");
console.log(JSON.stringify(this.game.deck[0].hand));
console.log(JSON.stringify(this.game.deck[1].hand));

	  //
	  // remove any "pass" option
	  //
	  for (let z = this.game.deck[0].hand.length-1; z >= 0; z--) {
	    if (this.game.deck[0].hand[z] === "pass") { this.game.deck[0].hand.splice(z, 1); }
	  }
	  for (let z = this.game.deck[1].hand.length-1; z >= 0; z--) {
	    if (this.game.deck[1].hand[z] === "pass") { this.game.deck[1].hand.splice(z, 1); }
	  }

this.updateLog(`###############`);
this.updateLog(`### Turn ${this.game.state.turn} ###`);
this.updateLog(`###############`);
console.log(JSON.stringify(this.game.deck[0].hand));
console.log(JSON.stringify(this.game.deck[1].hand));

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
          this.game.queue.push("evaluate_mandated_offensive_phase");
          this.game.queue.push("war_status_phase");
          this.game.queue.push("siege_phase");
          this.game.queue.push("attrition_phase");
          this.game.queue.push("action_phase");
          this.game.queue.push("mandated_offensive_phase");

	  if (this.game.state.turn === 1) {
            this.game.queue.push("guns_of_august");
            this.game.queue.push("show_overlay\twelcome\tallies");
            this.game.queue.push("show_overlay\twelcome\tcentral");
          }

	  return 1;

	}


        if (mv[0] === "show_overlay") {

          this.game.queue.splice(qe, 1);

          //
          // hide any cardbox
          //
          this.cardbox.hide();

          if (mv[1] === "welcome") {
            let faction = mv[2];
            let player = this.returnPlayerOfFaction(faction);
            if (faction === "central") { player = this.returnPlayerOfFaction("central"); }
            if (faction === "allies") { player = this.returnPlayerOfFaction("allies"); }
            if (this.game.player === player) {
              this.welcome_overlay.render(faction);
              this.game.queue.push("hide_overlay\twelcome");
              if (faction === "central") { this.game.queue.push("ACKNOWLEDGE\tYou are the Central Powers"); }
              if (faction === "allies") { this.game.queue.push("ACKNOWLEDGE\tYou are the Allied Powers"); }
            }
          }

	  return 1;
	}


	//
	// now we just start everyone with Guns of August
	//
	if (mv[0] === "guns_of_august") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player === this.returnPlayerOfFaction("central")) {
	    this.game.deck[0].hand.push("cp01");
	  }

	  //if (this.game.player === this.returnPlayerOfFaction("central")) {
	  //  if (this.game.deck[0].hand.includes("cp01")) {
	  //    this.addMove("NOTIFY\tCentral Powers start with Guns of August!");
          //    this.addMove("DEAL\t1\t1\t1"); // deal random other card
	  //    this.endTurn();
	  //  } else {
	  //    this.playerPlayGunsOfAugust();
	  //  }
	  //} else {
	  //  this.updateStatus("Central Powers considering Guns of August");
	  //}
	  //
	  //return 0;

	}

 	if (mv[0] == "draw_strategy_card_phase") {

          this.game.queue.splice(qe, 1);

	  let all_cards = this.returnDeck("all"); 
          this.game.queue.push("deal_strategy_cards");

	  //
	  // LIMITED WAR CARDS - allied
	  //
  	  if (this.game.state.general_records_track.allies_war_status >= 4 && this.game.state.allies_limited_war_cards_added == false) {

	    this.game.state.allies_limited_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[1].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnLimitedWarDeck("allies");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
            this.game.queue.push("DECKENCRYPT\t2\t2");
            this.game.queue.push("DECKENCRYPT\t2\t1");
            this.game.queue.push("DECKXOR\t2\t2");
            this.game.queue.push("DECKXOR\t2\t1");
            this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }

  	  if (this.game.state.general_records_track.central_war_status >= 4 && this.game.state.central_limited_war_cards_added == false) {
	    this.game.state.central_limited_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[0].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnLimitedWarDeck("central");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
            this.game.queue.push("DECKENCRYPT\t1\t2");
            this.game.queue.push("DECKENCRYPT\t1\t1");
            this.game.queue.push("DECKXOR\t1\t2");
            this.game.queue.push("DECKXOR\t1\t1");
            this.game.queue.push("DECK\t1\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t1");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }
  	  if (this.game.state.general_records_track.allies_war_status >= 11 && this.game.state.allies_total_war_cards_added == false) {
	    this.game.state.allies_total_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[1].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnTotalWarDeck("allies");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
            this.game.queue.push("DECKENCRYPT\t2\t2");
            this.game.queue.push("DECKENCRYPT\t2\t1");
            this.game.queue.push("DECKXOR\t2\t2");
            this.game.queue.push("DECKXOR\t2\t1");
            this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }
  	  if (this.game.state.general_records_track.central_war_status >= 11 && this.game.state.central_total_war_cards_added == false) {
	    this.game.state.central_total_war_cards_added = true;
	
	    let discarded_cards = {};
    	    for (let key in this.game.deck[0].discards) { discarded_cards[key] = all_cards[key]; }
	    let new_cards = this.returnTotalWarDeck("central");
	    for (let key in discarded_cards) { new_cards[key] = discarded_cards[key]; }

            // shuffle in discarded cards
            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
            this.game.queue.push("DECKENCRYPT\t1\t2");
            this.game.queue.push("DECKENCRYPT\t1\t1");
            this.game.queue.push("DECKXOR\t1\t2");
            this.game.queue.push("DECKXOR\t1\t1");
            this.game.queue.push("DECK\t1\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t1");
            this.updateLog("Shuffling discarded cards back into the deck...");

	  }

          return 1;

	}


	if (mv[0] == "deal_strategy_cards") {

	  this.game.queue.splice(qe, 1);

          let allies_cards_needed = (this.game.state.round >= 4)? 6 : 7;
          let central_cards_needed = (this.game.state.round >= 4)? 6 : 7;
      
          if (allies_cards_needed > this.game.deck[1].crypt.length) { allies_cards_needed = this.game.deck[1].crypt.length; }
          if (central_cards_needed > this.game.deck[0].crypt.length) { central_cards_needed = this.game.deck[0].crypt.length; }
          
          this.game.queue.push("DEAL\t1\t1\t"+central_cards_needed);
          this.game.queue.push("DEAL\t2\t2\t"+allies_cards_needed);

	  return 1;

	}


 	if (mv[0] == "replacement_phase") {

          this.game.queue.splice(qe, 1);

	  //
	  // Zeppelin Raids
	  //
	  if (this.game.state.events.zeppelin_raids == 1) {
	    this.updateLog("Zepplin Raids reduce British Replacement Points (-4)...");
	    if (!this.game.state.rp["allies"]["BR"]) { this.game.state.rp["allies"]["BR"] = 0; }
	    this.game.state.rp["allies"]["BR"] -= 4;
	    if (this.game.state.rp["allies"]["BR"] < 0) { this.game.state.rp["allies"]["BR"] = 0; }
	  }

	  //
	  // U-Boats Unleashed
	  //
	  if (this.game.state.events.uboats_unleashed == 1 && this.game.state.events.convoy != 1) {
	    if (!this.game.state.rp["allies"]["BR"]) { this.game.state.rp["allies"]["BR"] = 0; }
	    if (this.game.state.rp["allies"]["BR"] > 1) { this.game.state.rp["allies"]["BR"]--; }
	  }

	  //
	  // Walter Rathenau
	  //
	  if (this.game.state.events.walter_rathenau == 1 && this.game.state.events.independent_air_force != 1) {
	    if (!this.game.state.rp["central"]["GE"]) { this.game.state.rp["central"]["GE"] = 0; }
	    this.updateLog("Germany gets Walter Rathenau bonus...");
	    this.game.state.rp["central"]["GE"]++;
	  }

	  this.game.queue.push("player_play_replacements\tallies");
	  this.game.queue.push("player_play_replacements\tcentral");

	  console.log("###");
	  console.log("### Replacement Phase");
	  console.log("###");

	  return 1;
	}

	if (mv[0] == "player_play_replacements") {

	  let faction = mv[1];
          this.game.queue.splice(qe, 1);

	  //	
	  // skip if no replacement points	
	  //	
	  let count = 0;
	  for (let key in this.game.state.rp[faction]) { count += parseInt(this.game.state.rp[faction][key]); }
	  if (count == 0) { 

alert("no replacement points for... " + faction);

return 1; }

	  if (this.returnPlayerOfFaction(faction) == this.game.player) {
	    this.playerSpendReplacementPoints(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " assigning replacement points...");
	  }

	  return 0;

	}

	if (mv[0] == "finish_replacement_phase") {

	  this.game.state.rp['central'] = {};
	  this.game.state.rp['allies'] = {};
	  
          this.game.queue.splice(qe, 1);
	  return 1;
	}

 	if (mv[0] == "war_status_phase") {

	  //
	  // blockade removes 1 VP if active - done by incrementing event
	  //
	  if (this.game.state.events.blockade > 0) { this.game.state.events.blockade++; }

  	  if (this.game.state.general_records_track.central_war_status >= 4 && this.game.state.central_limited_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("central")) {
	      this.displayCustomOverlay({
          	text : "Central Powers gain Limited War Cards",
          	title : "Limited War!",
          	img : "/paths/img/backgrounds/shells.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }

	    //
	    // Turkey enters the war on the side of the Central Powers
	    //
	    paths_self.convertCountryToPower("turkey", "central");
	    this.game.state.events.turkey = 1;
	    this.addTrench("giresun", 1);
	    this.addTrench("baghdad", 1);
	    this.addUnitToSpace("tu_corps", "adrianople");
	    this.addUnitToSpace("tu_corps", "gallipoli");
	    this.addUnitToSpace("tu_corps", "constantinople");
	    this.addUnitToSpace("tu_corps", "balikesir");
	    this.addUnitToSpace("tu_corps", "ankara");
	    this.addUnitToSpace("tu_corps", "adana");
	    this.addUnitToSpace("tu_corps", "rize");
	    this.addUnitToSpace("tu_corps", "erzerum");
	    this.addUnitToSpace("tu_corps", "baghdad");
	    this.addUnitToSpace("tu_corps", "damascus");
	    this.addUnitToSpace("tu_corps", "gaza");
	    this.addUnitToSpace("tu_corps", "medina");
	    this.displayBoard();

	    this.displayCustomOverlay({
          	text : "Turkey joins the Central Powers" ,
          	title : "Limited War!",
          	img : "/paths/img/backgrounds/entry/turkey-enters-the-war.png",
          	msg : "Turkish units added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
            });

	  }
  	  if (this.game.state.general_records_track.allies_war_status >= 4 && this.game.state.allies_limited_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("allies")) {
	      this.displayCustomOverlay({
          	text : "Allied Nations gain Limited War Cards",
          	title : "Limited War!",
          	img : "/paths/img/backgrounds/shells.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }
	  }
  	  if (this.game.state.general_records_track.allies_war_status >= 11 && this.game.state.allies_total_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("allies")) {
	      this.displayCustomOverlay({
          	text : "Allied Nations gain Total War Cards",
          	title : "Total War!",
          	img : "/paths/img/backgrounds/trench.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }

	  }
  	  if (this.game.state.general_records_track.central_war_status >= 11 && this.game.state.central_total_war_cards_added == false) {
	    if (this.game.player == this.returnPlayerOfFaction("central")) {
	      this.displayCustomOverlay({
          	text : "Central Powers gain Total War Cards",
          	title : "Total War!",
          	img : "/paths/img/backgrounds/trench.png",
          	msg : "new cards added to deck...",
          	styles : [{ key : "backgroundPosition" , val : "bottom" }],
              });
	    }
	  }

          this.game.queue.splice(qe, 1);
	  return 1;
	}

 	if (mv[0] == "siege_phase") {

	  for (let key in this.game.spaces) {
	    let space = this.game.spaces[key];
	    if (space.besieged == true) {
	      if (space.fort > 0) {
		if (space.units.length > 0) {
		  if (this.returnPowerOfUnit(space.units[0]) != space.control) {

		    let roll = this.rollDice(6);
		    if (this.game.state.turn < 2) { roll -= 2; }
		    if (roll > space.fort) {
		      space.fort = -1;
		      this.updateStatus(this.returnSpaceNameForLog(space.key) + " fort destroyed (roll: " + roll + ")");

	              //
	              // switch control
	              //
	              space.control = this.returnPowerOfUnit(space.units[0]);

 	             //
                     // degrade trenches
                     //
                     if (space.trench > 0) { space.trench--; }
		     this.displaySpace(key);
		     this.shakeSpacekey(key);

		    } else {
		      this.updateStatus(this.returnSpaceNameForLog(space.key) + " fort resists siege (roll: " + roll + ")");
		    }

		  }
		}
	      }
	    }
	  }

          this.game.queue.splice(qe, 1);
	  return 1;
	}
 	if (mv[0] == "attrition_phase") {

          this.game.queue.splice(qe, 1);

	  //
	  // look unit-by-unit for units that are out-of-supply
	  //
	  for (let key in this.game.spaces) {
	    if (this.game.spaces[key].units.length > 0 &&
		key != "arbox" && 
		key != "crbox" && 
		key != "aeubox" && 
		key != "ceubox"
	    ) {
	      let power = this.returnPowerOfUnit(this.game.spaces[key].units[0]);
	      let ckey = this.game.spaces[key].units[0].ckey.toLowerCase();

	      if (power == "central" || power == "allies") {

		if (!this.checkSupplyStatus(ckey, key)) {

		  let anyone_in_supply = false;
		  for (let z = 0; z < this.game.spaces[key].units.length; z++) {
		    if (this.game.units[this.game.spaces[key].units[z].key].checkSupplyStatus(this, key)) { anyone_in_supply = true; };
		  }

		  //
		  // eliminate armies and corps
		  //
		  if (anyone_in_supply == false) {
		  for (let z = this.game.spaces[key].units.length-1; z >= 0; z--) {
		    let u = this.game.spaces[key].units[z];
		    if (u.army) {
          	      if (power == "allies") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
			this.game.spaces[key].units.splice(z, 1);
		      }
          	      if (power == "central") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
			this.game.spaces[key].units.splice(z, 1);
		      }
		    }
		    if (u.corps) {
          	      if (power == "allies") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
            		this.game.state.eliminated["allies"].push(this.game.spaces[key].units[z]);
			this.game.spaces[key].units.splice(z, 1);
		      }
          	      if (power == "central") {
			this.updateLog(u.name + " eliminated from " + this.returnSpaceNameForLog(key) + " (out-of-supply)");
            		this.game.state.eliminated["central"].push(this.game.spaces[key].units[z]);
			this.game.spaces[key].units.splice(z, 1);
		      }
		    }
		  }
		  }
		}
	      }
	    }
	  }

	  return 1;

	}

 	if (mv[0] == "action_phase") {

          this.game.queue.splice(qe, 1);

	  //
	  // these will clear when:
	  //  - 1 card left + pass, or 
	  //  - no cards left
	  //
          let cards_needed = (this.game.state.round >= 4)? 6 : 7;
	  for (let z = 0; z < cards_needed+1; z++) {
	    this.game.queue.push("play\tallies");
	    this.game.queue.push("play\tcentral");
	  }

	  return 1;
	}

 	if (mv[0] == "evaluate_mandated_offensive_phase") {

	  let central_fulfills = false;
	  let allies_fulfills = false;

	  if (this.game.state.mandated_offensives.central == "") { central_fulfills = true; }
	  if (this.game.state.mandated_offensives.allies == "") { allies_fulfills = true; }

	  for (let z = 0; z < this.game.state.mo["central"].length; z++) {
	    if (this.game.state.mo["central"][z] == this.game.state.mandated_offensives.central) {
	      central_fulfills = true;
	    }
	  }

	  for (let z = 0; z < this.game.state.mo["allies"].length; z++) {
	    if (this.game.state.mo["allies"][z] == this.game.state.mandated_offensives.allies) {
	      allies_fulfills = true;
	    }
	  }

	  if (!central_fulfills) {
	    this.updateLog("Central Powers -1 VP for failing mandated offensive");
	    this.game.state.mo.vp_bonus--;
	  }
	  if (!allies_fulfills) {
	    this.updateLog("Allied Powers -1 VP for failing mandated offensive");
	    this.game.state.mo.vp_bonus++;
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}


 	if (mv[0] == "mandated_offensive_phase") {

	  let central = this.rollDice();
	  let allies = this.rollDice();
	
	  if (this.game.state.events.hoffman == 1) {
	    this.updateLog("Central Powers get Hoffman +1 bonus...");
	    central++;
	  }	

	  if (this.game.state.events.hl_take_command == 1) {
	    this.updateLog("H-L Take Command effect: no Central MO...");
	    central = 6;
	  }

 	  if (central == 1) { this.game.state.mandated_offensives.central = "AH"; }
 	  if (central == 2) { this.game.state.mandated_offensives.central = "AH IT"; }
	  if (this.game.state.events.italy != 1) { this.game.state.mandated_offensives.central = "AH"; }
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

	  // 7.1.2 If the result is “None” or a currently neutral nation, there is 
	  // no effect. If the nation’s capital (both Budapest and Vienna in the 
	  // case of Austria-Hungary) is currently controlled by the enemy, that 
	  // nation does not have a MO and the MO is shifted one space to the right 
	  // on the MO Table.
	  //

	  //
	  // allies
	  //
	  let shift_required = true;
	  allies--;
	  while (shift_required && allies <= 6) {

	    allies++;
 	    if (allies == 1)  { this.game.state.mandated_offensives.allies = "FR"; }
 	    if (allies == 2)  { this.game.state.mandated_offensives.allies = "FR"; }
 	    if (allies == 3)  { this.game.state.mandated_offensives.allies = "BR"; }
 	    if (allies == 4)  { this.game.state.mandated_offensives.allies = "IT"; }
 	    if (allies == 5)  { this.game.state.mandated_offensives.allies = "IT"; }
 	    if (allies == 6)  { this.game.state.mandated_offensives.allies = "RU"; }
 	    if (allies == 7)  { this.game.state.mandated_offensives.allies = ""; }

	    let c = this.returnCapital(this.game.state.mandated_offensives.allies);
	    for (let z = 0; z < c.length; z++) {
	      if (this.game.spaces[c[z]].besieged == 0 && this.game.spaces[c[z]].control != "allies") {
	      } else {
		shift_required = false;
	      }
	    }

	  }


	  //
	  // central
	  //
	  shift_required = true;
	  central--;
	  while (shift_required && central <= 6) {

	    central++;

 	    if (central == 1) { this.game.state.mandated_offensives.central = "AH"; }
 	    if (central == 2) { this.game.state.mandated_offensives.central = "AH IT"; }
	    if (this.game.state.events.italy != 1) { this.game.state.mandated_offensives.central = "AH"; }
 	    if (central == 3) { this.game.state.mandated_offensives.central = "TU"; }
 	    if (central == 4) { this.game.state.mandated_offensives.central = "GE"; }
 	    if (central == 5) { this.game.state.mandated_offensives.central = ""; }
 	    if (central == 6) { this.game.state.mandated_offensives.central = ""; }
 	    if (central == 7) { this.game.state.mandated_offensives.central = ""; }

	    let ckey = this.game.state.mandated_offensives.central;
	    if (ckey == "AH IT") { ckey = "AH"; }
	    let c = this.returnCapital(ckey);

	    for (let z = 0; z < c.length; z++) {
	      if (this.game.spaces[c[z]].besieged == 0 && this.game.spaces[c[z]].control != "central") {
	      } else {
		shift_required = false;
	      }
	    }

	  }

	  this.displayMandatedOffensiveTracks();
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

	  this.removeSelectable();
	  this.removeOverstackedUnits();
	  this.checkSupplyStatus();

	  this.unbindBackButtonFunction();

console.log("faction: " + faction);
console.log("central_passed: " + this.game.state.central_passed);
console.log("allies_passed: " + this.game.state.allies_passed);

	  if (faction == "central") { this.game.state.round++; }

	  if (faction === "central" && parseInt(this.game.state.central_passed) == 1) {
	    for (let z = 0; z < this.game.deck[0].hand.length; z++) { if (this.game.deck[0].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); } }
	    this.game.queue.splice(qe, 1); 
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	    return 1; 
	  }
	  if (faction === "allies" && parseInt(this.game.state.allies_passed) == 1) {
	    for (let z = 0; z < this.game.deck[1].hand.length; z++) { if (this.game.deck[1].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); } }
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	    this.game.queue.splice(qe, 1);
	    return 1; 
	  }

	  this.onNewRound();

console.log("PLAY: " + this.game.player);
console.log("player: " + player);
console.log("HAND: " + JSON.stringify(hand));

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards(`Opponent Turn`, hand);
	  }
	  
	  return 0;

	}

	if (mv[0] == "pass") {

	  let faction = mv[1];
	  if (faction == "central") {
	    this.game.state.central_passed = 1;
	  } else {
	    this.game.state.allies_passed = 1;
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "record") {

	  let faction = mv[1];
	  let round = parseInt(mv[2]);
	  let action = mv[3];

	  if (faction == "central") {
	    this.game.state.central_rounds.push(action);
	  }
	  if (faction == "allies") {
	    this.game.state.allies_rounds.push(action);
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "add_unit_to_space") {

	  let unit = mv[1];
	  let spacekey = mv[2];
	  let player_to_ignore = 0;
	  if (mv[3]) { player_to_ignore = parseInt(mv[3]); }

	  if (this.game.player != player_to_ignore) {
            this.addUnitToSpace(unit, spacekey);
	  }

	  this.shakeSpacekey(spacekey);

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "discard") {

	  let deck = this.returnDeck();
	  let card = mv[1];

	  this.removeCardFromHand(card);

	  if (deck[card].removeFromDeckAfterPlay(this)) {
	    this.removeCardFromGame(card);
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] == "event") {

	  let deck = this.returnDeck();
	  let card = mv[1];
	  let faction = mv[2];

          this.game.queue.splice(qe, 1);

	  this.updateLog(this.returnFactionName(faction) + " triggers " + this.popup(card));

	  if (deck[card]) {
	    if (deck[card].canEvent(this, faction)) {
	      return deck[card].onEvent(this, faction);
	    }
	  }

	  this.game.queue.push(`ACKNOWLEDGE\t${this.returnFactionName(faction)} triggers ${deck[card].name}`);

	  return 1;

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

	  // montenegro
          this.addUnitToSpace("mn_corps", "cetinje");

	  // serbia
          this.addUnitToSpace("sb_corps", "arbox");
          this.addUnitToSpace("sb_corps", "arbox");
          this.addUnitToSpace("sb_army01", "belgrade");
          this.addUnitToSpace("sb_army02", "valjevo");

	  // italy
	  //this.addTrench("trent", 1);
	  //this.addTrench("asiago", 1);
	  //this.addTrench("maggiore", 1);
          //this.addUnitToSpace("it_corps", "taranto");
          //this.addUnitToSpace("it_corps", "rome");
          //this.addUnitToSpace("it_corps", "turin");
          //this.addUnitToSpace("it_army01", "verona");
          //this.addUnitToSpace("it_army02", "udine");
          //this.addUnitToSpace("it_army03", "maggiore");
          //this.addUnitToSpace("it_army04", "asiago");

	  // reserves boxes
    	  this.addUnitToSpace("ah_corps", "crbox");
    	  this.addUnitToSpace("ah_corps", "crbox");
    	  this.addUnitToSpace("ah_corps", "crbox");
    	  this.addUnitToSpace("ah_corps", "crbox");

    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");
    	  this.addUnitToSpace("ge_corps", "crbox");

    	  this.addUnitToSpace("be_corps", "arbox");

    	  this.addUnitToSpace("sb_corps", "arbox");
    	  this.addUnitToSpace("sb_corps", "arbox");

    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");
    	  this.addUnitToSpace("ru_corps", "arbox");

    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");
    	  this.addUnitToSpace("fr_corps", "arbox");

    	  this.addUnitToSpace("br_corps", "arbox");
    	  this.addUnitToSpace("bef_corps", "arbox");

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


	if (mv[0] === "control") {

	  let faction = mv[1];
	  let spacekey = mv[2];

	  this.game.spaces[spacekey].control = faction;

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

	  this.updateLog(unit.name + " redeploys to " + this.returnSpaceNameForLog(destination));

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



	if (mv[0] === "ws") {

	  let card = mv[1];
	  let faction = mv[2];
	  let ws = parseInt(mv[3]);

	  if (faction == "allies") {
            this.game.state.general_records_track.allies_war_status += ws;
            this.game.state.general_records_track.combined_war_status += ws;
          } else {
            this.game.state.general_records_track.central_war_status += ws;
            this.game.state.general_records_track.combined_war_status += ws;
          }

	  //
	  // Zimmerman Telegram Allowed 
	  //
	  if (this.game.state.general_records_track.combined_war_status >= 30 && this.game.state.us_commitment_track == 1) {
	    this.game.state.us_commitment_track = 2;
	    this.displayUSCommitmentTrack();
	  }

          this.displayGeneralRecordsTrack();

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

  	if (mv[0] === "rp") {

	  let faction = mv[1];
	  let card = mv[2];

    	  let c = this.deck[card];

    	  for (let key in c.rp) {
            if (faction == "central") {
              if (!this.game.state.rp["central"][key]) { this.game.state.rp["central"][key] = 0; }
              this.game.state.rp["central"][key] += parseInt(c.rp[key]);
            }
            if (faction == "allies") {
              if (!this.game.state.rp["allies"][key]) { this.game.state.rp["allies"][key] = 0; }
              this.game.state.rp["allies"][key] += parseInt(c.rp[key]);
            }
          }
	  if (faction == "allies" && this.game.state.events.over_there) {
            if (!this.game.state.rp["allies"]["A"]) { this.game.state.rp["allies"]["A"] = 0; }
            this.game.state.rp["allies"]["A"] += 1;
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
	  // movement has happened, so we...
	  //
	  this.removeOverstackedUnits();

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

    	  //
    	  // deprecated -- remove "pass"
    	  //
    	  for (let z = 0; z < this.game.deck[0].hand.length; z++) {
    	    if (this.game.deck[0].hand[z] == "pass") { this.game.deck[0].hand.splice(z, 1); }
          }
    	  for (let z = 0; z < this.game.deck[1].hand.length; z++) {
    	    if (this.game.deck[1].hand[z] == "pass") { this.game.deck[1].hand.splice(z, 1); }
    	  }

	  let key = mv[1];
	  let selected = JSON.parse(mv[2]);

	  this.game.state.combat = {};
	  this.game.state.combat.key = key;
	  this.game.state.combat.attacker = selected;
	  this.game.state.combat.attacking_faction = this.returnPowerOfUnit(this.game.spaces[selected[0].unit_sourcekey].units[0]);
	  if (this.game.state.combat.attacking_faction == "central") { this.game.state.combat.defending_faction = "allies"; } else { this.game.state.combat.defending_faction = "central"; }
	  this.game.state.combat.attacker_drm = 0;
	  this.game.state.combat.defender_drm = 0;
	  this.game.state.combat.unoccupied_fort = 0;
	  if (this.game.spaces[key].units.length == 0 && this.game.spaces[key].fort > 0) { this.game.state.combat.unoccupied_fort = 1; }

	  //
	  // update log
	  //
	  this.updateLog(this.returnFactionName(this.game.state.combat.attacking_faction) + " attacks " + this.returnSpaceNameForLog(key));

	  //
	  // Great Retreat allows RU units to retreat
	  //
	  if (this.game.state.events.great_retreat == 1 && this.game.state.events.great_retreat_used != 1) {
	    for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	      let u = this.game.spaces[this.game.state.combat.key].units[z];
	      if (u.ckey == "RU") {
		this.game.queue.push("great_retreat\t"+key);
		this.game.state.events.great_retreat_used = 1;
		return 1;
	      }
	    }
	  }

	  //
	  // mandated offensive tracking
	  //
	  let au = this.returnAttackerUnits();
	  if (this.game.state.combat.attacking_faction == "central") {
	    if (this.game.state.mandated_offensives.allies === "AH IT") {

	      // 7.1.6 If the result is “AH (It)” and Italy is at war, an Austro- Hungarian 
	      // unit must attack either a space containing Italian units, a space in Italy, 
	      // or a space containing Allied units tracing supply through a space in Italy. 
	      // If Italy is neutral or its capital is controlled by the CP during the Mandated 
	      // Offensive Phase, move the Mandated Offensive marker to the AH box and treat 
	      // the result as if “AH” had been rolled.
	      //
	      let valid_target = false;
	      let sp = this.game.spaces[this.game.state.combat.key];
	      if (sp.country == "italy") { valid_target = true; } else {
		for (let z = 0; z < sp.units.length; z++) {
		  if (sp.units[z].ckey === "IT") {
		    valid_target = true;
		  }
		}
	      }

	      if (valid_target) {
	        this.game.state.mo["central"].push("AH");
	      }

	    } else {

	      // 7.1.5 To count as a Mandated Offensive, German units must attack an American, 
	      // British, Belgian, or French unit in France, Belgium or Germany. Treat GE 
	      // Mandated Offensives as “None” after the H-L Take Command event is in effect (as 
	      // noted on the CP Mandated Offensive Table). To count as a Mandated Offensive, a 
	      // Turkish unit must attack an Allied unit. The SN cannot satisfy the TU MO.
	      //
	      if (this.game.state.mandated_offensives.allies === "TU") {

	        let valid_target = false;
	        let sp = this.game.spaces[this.game.state.combat.key];
		for (let z = 0; z < sp.units.length; z++) {
		  if (sp.units[z].ckey != "SN") {
		    valid_target = true;
		  }
	        }
	        if (valid_target) {
	          this.game.state.mo["central"].push("TU");
	        }

	      } else {

	        if (this.game.state.mandated_offensives.allies === "GE") {

	          let valid_target = false;
	          let sp = this.game.spaces[this.game.state.combat.key];
		  for (let z = 0; z < sp.units.length; z++) {
		    if (sp.units[z].ckey == "US") { valid_target = true; }
		    if (sp.units[z].ckey == "BR") { valid_target = true; }
		    if (sp.units[z].ckey == "FR") { valid_target = true; }
		    if (sp.units[z].ckey == "BE") { valid_target = true; }
		  }
		  if (valid_target == true && sp.country != "france" && sp.country != "belgium" && sp.country != "germany") {
		    valid_target = false;
		  }

	          if (valid_target) {
	            this.game.state.mo["central"].push("GE");
	          }

		} else {
	          for (let i = 0; i < au.length; i++) {
	            this.game.state.mo["central"].push(au[i].ckey);
	          }
	        }

	      }

	    }
	  }
	  if (this.game.state.combat.attacking_faction == "allies") {
	    for (let i = 0; i < au.length; i++) {

	      //
	      // 1.4 To count as a Mandated Offensive, British or French units must attack 
	      // a German unit in France, Belgium or Germany. (AUS, CND, PT, or ANA do not 
	      // count as British for this purpose nor are they impacted by the Lloyd George 
	      // event.)
	      //
	      if (this.game.state.mandated_offensives.allies == "BR" || this.game.state.mandated_offensives.allies == "FR") {
		let sp = this.game.spaces[this.game.state.combat.key];
		if (sp.country == "belgium" || sp.country == "france" || sp.country == "germany") {
		  for (let z = 0; z < sp.units.length; z++) {
		    if (sp.units[z].ckey == "GE") {
	              this.game.state.mo["allies"].push(this.game.spaces[this.game.state.combat.key].units[i].ckey);
		      z = sp.units.length+1;
		    }
		  }
		}
	      } else {
	        this.game.state.mo["allies"].push(au[i].ckey);
	      }

	    }
	  }

	  //
	  // everything has cleared out, so attackers may advance 
	  //
	  if (this.game.state.events.great_retreat == 1 && this.game.state.events.great_retreat_used == 1) {
	    if (this.game.spaces[this.game.state.combat.key].units.length == 0) {
	      if (this.game.spaces[this.game.state.combat.key].fort == 0) {
	  	this.game.queue.splice(qe, 1);
	  	this.game.queue.push("great_retreat_advance\t"+key); // attackers advance 1
		return 1;
	      }
	    }
	  }

	  //
	  // withdrawal must mark-up withdrawal-eligible corps
	  //
	  for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	    let u = this.game.spaces[this.game.state.combat.key].units[z];
	    if (u.corps) { u.eligible_for_withdrawal_bonus = 1; }
	  }

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

	  //this.combat_overlay.render();
	  //this.combat_overlay.pullHudOverOverlay();

	  return 1;

	}

	if (mv[0] == "combat_play_combat_cards") {

	  // The Attacker may play any number of Combat Card Events whose 
	  // conditions are met by this Combat at the time of Step 5. In 
	  // addition, the Attacker may elect to use any Combat Card Events
	  // that are in front of him whose conditions are met by this Combat 
	  // and which have not been used in a previous Combat during this Action 
	  // Round. After the Attacker plays and selects all his Combat Cards, 
	  // the Defender has the opportunity to play and select Combat Cards 
	  // using the same procedure outlined for the Attacker.
	  // 
	  // Both players examine all played and selected Combat Event Cards to 
	  // determine the final DRM which will affect this Combat. There is also 
	  // a –3 DRM if all attacking units are in the Sinai space. (Attacks 
	  // from the Sinai space in conjunction with another space do not suffer 
	  // the –3 DRM). This step is conducted simultaneously.

	  this.game.queue.push("calculate_combat_card_modifications");
	  this.game.queue.push("defender_select_combat_cards");
	  this.game.queue.push("attacker_select_combat_cards");

	  this.game.state.cc_central_active = [];
	  this.game.state.cc_allies_active = [];

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] == "calculate_combat_card_modifications") {

	  this.game.queue.splice(qe, 1);

	  let deck = this.returnDeck("all");

console.log("#############");
console.log("COMBAT CARDS:");
console.log("#############");
console.log(JSON.stringify(this.game.state.cc_central_active));
console.log(JSON.stringify(this.game.state.cc_allies_active));

	  //
	  // brusilov offensive
	  //
	  if (this.game.state.combat.attacker_power == "allies" && this.game.state.events.brusilov_offensive == 1) {
	    let attacker_units = this.returnAttackerUnits();
            for (let i = 0; i < attacker_units.length; i++) {
              if (attacker_units[i].ckey == "RU") { this.game.state.combat.attacker_drm += 1; i = attacker_units.length; }
            }
	  }

	  for (let i = 0; i < this.game.state.cc_central_active.length; i++) {
	    let card = this.game.state.cc_central_active[i];
	    if (this.game.state.combat.attacker_power == "central") { 
	      this.updateLog("Combat: Attackers play " + this.popup(card));
	      deck[card].onEvent(this, "attacker");
	    } else {
	      this.updateLog("Combat: Defenders play " + this.popup(card));
	      deck[card].onEvent(this, "defender");
	    }
	  }
	  for (let i = 0; i < this.game.state.cc_allies_active.length; i++) {
	    let card = this.game.state.cc_allies_active[i];
	    if (this.game.state.combat.attacker_power == "allies") { 
	      //
	      // kerensky_offensive
	      //
	      if (card === "ap45") {
  	        this.updateLog("Combat: Attackers play " + this.popup(card));
		this.game.state.combat.attacker_drm += 2;
		this.game.state.events.kerensky_offensive = 0;
	      } else {
  	        this.updateLog("Combat: Attackers play " + this.popup(card));
	        deck[card].onEvent(this, "attacker");
	      }
	    } else {
	      this.updateLog("Combat: Defenders play " + this.popup(card));
	      deck[card].onEvent(this, "defender");
	    }
	  }

	  return 1;
	
	}

	if (mv[0] == "defender_select_combat_cards") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player != this.returnPlayerOfFaction(this.game.state.combat.attacking_faction)) {
	    this.playerSelectDefenderCombatCards();
	  } else {
	    this.updateStatus("Defender Selecting Combat Cards...");
	  }

	  return 0;

	}


	if (mv[0] == "attacker_select_combat_cards") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == this.returnPlayerOfFaction(this.game.state.combat.attacking_faction)) {
	    this.playerSelectAttackerCombatCards();
	  } else {
	    this.updateStatus("Attacker Selecting Combat Cards...");
	  }

	  return 0;

	}

	if (mv[0] == "combat_card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card));

	  if (faction == "central") {
	    if (!this.game.state.cc_central_active.includes(card)) { this.game.state.cc_central_active.push(card); }
	    if (!this.game.state.cc_central_on_table.includes(card)) { this.game.state.cc_central_on_table.push(card); }
	    if (!this.game.state.cc_central_played_this_round.includes(card)) { this.game.state.cc_central_played_this_round.push(card); }
	    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	      if (this.game.deck[0].hand[i] == card) { this.game.deck[0].hand.splice(i, 1); }
	    }
	  }
	  if (faction == "allies") {
	    if (!this.game.state.cc_allies_active.includes(card)) { this.game.state.cc_allies_active.push(card); }
	    if (!this.game.state.cc_allies_active.includes(card)) { this.game.state.cc_allies_on_table.push(card); }
	    if (!this.game.state.cc_allies_active.includes(card)) { this.game.queue.push("discard\t"+card); }
	    for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	      if (this.game.deck[1].hand[i] == card) { this.game.deck[1].hand.splice(i, 1); }
	    }
	  }

	  return 1;
	}


	if (mv[0] == "combat_recalculate_loss_factor") {

	  let faction = mv[1]; // attacker / defender

	  let attacker_strength = 0;          
	  let defender_strength = 0;          

	  //
	  // the defender assigns hits first in this case, so any corps that are
	  // destroyed are not eligible to be restored in this case....
	  //
	  if (this.game.state.events.withdrawal && faction == "attacker") {
	    //
	    // the defender can now only restore corps that stil
            //
            for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
              let u = this.game.spaces[this.game.state.combat.key].units[z];
              if (u.eligible_for_withdrawal_bonus == 1 && u.destroyed == 1) { u.eligible_for_withdrawal_bonus = 0; }
            }
	  }

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
	    if (u) {
	      if (!u.damaged) {
                attacker_strength += u.combat;
	      } else {
                attacker_strength += u.rcombat;
	      }
	    }
          }

          this.game.state.combat.attacker_strength = attacker_strength;
          this.game.state.combat.defender_strength = defender_strength;

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
	  let attacker_drm = this.game.state.combat.attacker_drm;
	  let defender_drm = this.game.state.combat.defender_drm;
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

	  //
	  // record which spaces have attacked where, to prevent double-attacks
	  //
	  let attacker_units = this.returnAttackerUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    let spacekey = attacker_units[i].spacekey;
	    if (!this.game.state.attacks[spacekey]) {
	      this.game.state.attacks[spacekey] = [];
	    }
	    this.game.state.attacks[spacekey].push(this.game.state.combat.key);
	  }

	  //
	  // trenches and row shifts
	  //
	  let tshift = this.returnTerrainShift(this.game.state.combat.key);
	  let attacker_column_shift = tshift.attack;
	  let defender_column_shift = tshift.defense;

	  if (this.game.state.combat.unoccupied_fort == 1) {
	    attacker_table = "corps";
	    if (this.game.spaces[this.game.state.combat.key].control == "central") { attacker_power = "central"; defender_power = "allies"; } 
	  } else {
	    for (let i = 0; i < this.game.spaces[this.game.state.combat.key].units.length; i++) {
	      let unit = this.game.spaces[this.game.state.combat.key].units[i];
	      if (this.returnPowerOfUnit(unit) == "allies") { attacker_power = "central"; defender_power = "allies"; } 
	      if (this.game.state.events.yanks_and_tanks == 1 && unit.ckey == "US") { defender_drm += 2; }
	      if (unit.key.indexOf("army") > 0) { attacker_table = "army"; }
	    }
	  }

	  //
	  // sinai -3 DRM modifier
	  //
	  if (["portsaid","cairo","gaza","beersheba"].includes(this.game.state.combat.key)) {
	    let attacker_units = this.returnAttackerUnits();
	    let attacking_from_sinai = false;
	    for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].spacekey == "sinai") { attacking_from_sinai = true; } }
	    for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].spacekey != "sinai") { attacking_from_sinai = false; } }
	    if (attacking_from_sinai == true) {
	      if (attacker_power == "allies" && this.game.state.events.sinai_pipeline == 1) {} else {
		this.updateLog("Sinai -3 DRM modifier punishes attacker...");
	        this.game.state.combat.attacker_drm -= 3;
	        attacker_drm -= 3;
	      }
	    }
	  }

	  for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
	    let unit = this.game.spaces[this.game.state.combat.attacker[i].unit_sourcekey].units[this.game.state.combat.attacker[i].unit_idx];
	    if (unit.key.indexOf("army") > 0) { defender_table = "army"; }	    
	    if (this.game.state.events.yanks_and_tanks == 1 && unit.ckey == "US") { attacker_drm += 2; }
	    unit.attacked = 1;
	  }

	  attacker_roll = this.rollDice();
	  defender_roll = this.rollDice();

	  attacker_modified_roll = attacker_roll + attacker_drm;
	  defender_modified_roll = defender_roll + defender_drm;

	  if (attacker_drm > 0) {
	    this.updateLog(`Attacker rolls: ${attacker_roll} [+${attacker_drm}]`);
	  } else {
	    this.updateLog(`Attacker rolls: ${attacker_roll}`);
	  }	  
	  if (defender_drm > 0) {
	    this.updateLog(`Defender rolls: ${defender_roll} [+${defender_drm}]`);
	  } else {
	    this.updateLog(`Defender rolls: ${defender_roll}`);
	  }	  

	  if (attacker_modified_roll > 6) { attacker_modified_roll = 6; }
	  if (defender_modified_roll > 6) { defender_modified_roll = 6; }
	  if (attacker_modified_roll < 1) { attacker_modified_roll = 1; }
	  if (defender_modified_roll < 1) { defender_modified_roll = 1; }

	  this.game.state.combat.attacker_table = attacker_table;
	  this.game.state.combat.defender_table = defender_table;
	  this.game.state.combat.attacker_power = attacker_power;
	  this.game.state.combat.defender_power = defender_power;
	  //this.game.state.combat.attacker_drm = attacker_drm;
	  //this.game.state.combat.defender_drm = defender_drm;
	  this.game.state.combat.attacker_roll = attacker_roll;
	  this.game.state.combat.defender_roll = defender_roll;
	  this.game.state.combat.attacker_column_shift = attacker_column_shift;
	  this.game.state.combat.defender_column_shift = defender_column_shift;
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

	  //
	  // Wireless Intercepts
	  //
	  if (this.game.state.events.wireless_intercepts == 1) { this.game.state.combat.flank_attack = "attacker"; }


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

	  if (this.game.state.combat.unoccupied_fort == 1) {

	    if (this.game.state.combat.defender_loss_factor > this.game.spaces[this.game.state.combat.key].fort) {
	      this.game.spaces[this.game.state.combat.key].fort = -1;
	      this.displaySpace(this.game.state.combat.key);
	    }

	    this.game.queue.splice(qe, 1);
	    return 1;

	  }

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


	if (mv[0] === "great_retreat_advance") {

	  let spacekey = mv[1];

          let player = this.returnPlayerOfFaction("central");
          if (this.game.player == player) {
	    this.playerPlayGreatAdvance(spacekey);
          } else {
	    this.updateStatus("Central Powers considering advance...");
          }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}

	if (mv[0] === "great_retreat") {

	  let spacekey = mv[1];

          let player = this.returnPlayerOfFaction("allies");
          if (this.game.player == player) {
	    this.playerHandleGreatRetreat(spacekey);
          } else {
	    this.updateStatus("Russian evaluating retreat..."); 
          }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}

	if (mv[0] === "combat_defender_retreat") {

	  this.game.queue.splice(qe, 1);

console.log("CDR 1");

	  let attacker_units = this.returnAttackerUnits();
	  let does_defender_retreat = false;
	  let can_defender_cancel = false;

	  //
	  // withdrawal might still need to restore a unit (flank attacks)
	  //
	  if (this.game.state.events.withdrawal == 1 && this.game.state.events.withdrawal_bonus_used == 0) {
	    let corps_restored = false;
	    for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	      let unit = this.game.spaces[this.game.state.combat.key].units[z];
	      if (unit.damaged && unit.eligible_for_withdrawal_bonus) {
		unit.damaged = 0;
		try { salert(unit.name + " restored with Withdrawal bonus..."); } catch (err) {}
                this.game.state.events.withdrawal_bonus_used = 1;
		corps_restored = true;
	      }
	    }
	    // 12.6.6 If no Corps step was lost, then one Army step loss may be negated.
	    if (corps_restored == false) {
	      for (let z = 0; z < this.game.spaces[this.game.state.combat.key].units.length; z++) {
	        let unit = this.game.spaces[this.game.state.combat.key].units[z];
		if (unit.damaged && unit.army) {
		  unit.damaged = 0;
		  try { salert(unit.name + " restored with Withdrawal bonus..."); } catch (err) {}
		  this.game.state.events.withdrawal_bonus_used = 1;
		}	
	      }
	    } 
	  }        

console.log("CDR 2");

	  //
	  // can we take another stepwise loss to cancel the retreat?
	  //
	  can_defender_cancel = this.canCancelRetreat(this.game.state.combat.key);;
	  if (this.game.spaces[this.game.state.combat.key].units.length == 1) {
	    if (this.game.spaces[this.game.state.combat.key].units[0].damaged == 1) {
	      if (this.game.spaces[this.game.state.combat.key].units[0].corps == 1) {
		can_defender_cancel = false;
	      }
	    }
	  }
	  // withdrawal prevents
	  if (this.game.state.withdrawal == 1) { this.game.state.combat.can_defender_cancel = false; }
	  this.game.state.combat.can_defender_cancel = can_defender_cancel;

console.log("CDR 3");

	  //
	  // no retreating from unoccupied fort
	  //
	  if (this.game.state.combat.unoccupied_fort == 1) { return 1; }

	  //
	  // hide loss overlay
	  //
	  // we do not want to do this entirely automated, so we will leave it open if
	  // we have not clicked
	  //
	  try { this.loss_overlay.showRetreatNotice(); } catch (err) {}

console.log("CDR 4");

	  //
	  // remove all destroyed defender units
	  //
	  for (let z = this.game.spaces[this.game.state.combat.key].units.length-1; z >= 0; z--) {
	    let u = this.game.spaces[this.game.state.combat.key].units[z];
	    if (u.destroyed == true) { this.game.spaces[this.game.state.combat.key].units.splice(z, 1); }
	  }
	  this.displaySpace(this.game.state.combat.key);

console.log("CDR 5 - " + JSON.stringify(this.game.spaces[this.game.state.combat.key]));

	  //
	  // no need to retreat if nothing is left
	  //
	  if (this.game.spaces[this.game.state.combat.key].units.length <= 0) { return 1; } 

console.log("CDR 6");

	  //
	  // no need to retreat if "they shall not pass"
	  //
	  if (this.game.state.events.they_shall_not_pass == 1) {
	    let space = this.game.spaces[this.game.state.combat.key];
	    	if (space.country == "france" && space.fort > 0) {
	      for (let z = space.units.length-1; z >= 0; z--) {
	        let u = space.units[z];
	        if (u.ckey == "FR" && this.game.state.combat.winner == "attacker") {
		  this.updateLog("They Shall Not Pass cancels French retreat...");
	          this.game.state.events.they_shall_not_pass = 0;
		  return 1;
		}
	      }
	    }
	  }

	  if (this.game.state.combat.winner == "defender") {
	    this.updateLog("Defender Wins, no retreat...");
	    return 1;
	  }

	  if (this.game.state.combat.winner == "none") {
	    this.updateLog("Mutual Loss, no retreat...");
	    return 1;
	  }

this.updateLog("Winner of the Combat: " + this.game.state.combat.winner);

	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i]) {
	      if (attacker_units[i].type == "army" && attacker_units[i].damaged == false) {
	        does_defender_retreat = true;
	      }
	    }
	  }

	  if (does_defender_retreat) {
this.updateLog("Defender Power handling retreat: " + this.game.state.combat.defender_power); 
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

	  //
	  // we can advance into destroyed forts
	  //
	  if (this.game.state.combat.unoccupied_fort == 1 && this.game.space[this.game.state.combat.key].fort == -1) {
	    let player = this.returnPlayerOfFaction(this.game.state.combat.attacker_power);
	    if (this.game.player == player) {
	      this.playerPlayAdvance();
	    } else {
	      this.updateStatus("Opponent deciding on advance...");
	    }
	    return 1;
	  }

	  if (this.game.state.combat.winner == "defender") {
	    //this.updateLog("Defender Wins, no advance...");
	    return 1;
	  }

	  if (this.game.state.combat.winner == "none") {
	    //this.updateLog("Mutual Loss, no advance...");
	    return 1;
	  }

	  //
	  // retreat was cancelled for some reason...
	  //
	  if (this.game.spaces[this.game.state.combat.key].units.length > 0) { 
	    this.updateLog("Attacker unable to advance...");
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

	  //
	  // Von Hutier 
	  //
	  if (this.game.state.events.von_hutier == 1) {
	    this.game.state.combat.flank_attack = "attacker";
	    return 1;
	  }


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

	  this.game.queue.splice(qe, 1);

	  //
	  // disable combat events that should disappear
	  //
	  this.game.state.events.von_hutier = 0;

	  if (!this.game.state.combat) { return 1; }

	  let spacekey = this.game.state.combat.key;
	  if (!spacekey) { return 1; }

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

	  //
	  // remove combat cards from loser
	  //
	  let cards = this.returnDeck();
	  if (this.game.state.combat.winner == "central") {
	    for (let i = this.game.state.cc_allies_active.length-1; i >= 0; i--) {
	      let c = this.game.state.cc_allies_active[i];
	      for (let z = 0; z < this.game.state.cc_allies_on_table.length; z++) {
		if (this.game.state.cc_allies_on_table[i] == c) {
		  this.game.state.cc_allies_on_table.splice(i, 1);
		}
	      }
	      if (cards[c].removeFromDeckAfterPlay(this, "allies")) {
	      } else {
		this.game.deck[1].discards.push(c);
	      }
	    }
	  }
	  if (this.game.state.combat.winner == "allies") {
	    for (let i = this.game.state.cc_central_active.length-1; i >= 0; i--) {
	      let c = this.game.state.cc_central_active[i];
	      for (let z = 0; z < this.game.state.cc_allies_on_table.length; z++) {
		if (this.game.state.cc_allies_on_table[i] == c) {
		  this.game.state.cc_allies_on_table.splice(i, 1);
		}
	      }
	      if (cards[c].removeFromDeckAfterPlay(this, "central")) {
		
	      } else {
		this.game.deck[0].discards.push(c);
	      }
	    }
	  }

	  return 1;

	}

	// eliminates unit from game
	if (mv[0] === "eliminate") {

	  let spacekey = mv[1];
	  let idx = parseInt(mv[2]);

	  let unit = this.game.spaces[spacekey].units[idx];
	  let faction = this.returnPowerOfUnit(unit);
	  this.updateLog(unit.name + " eliminated in " + this.returnSpaceNameForLog(spacekey));

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

	if (mv[0] === "repair") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_idx = parseInt(mv[3]);
	  let player_to_ignore = 0;
	  if (mv[4]) { player_to_ignore = parseInt(mv[4]); }

	  if (this.game.player != player_to_ignore) {
	    if (this.game.spaces[spacekey].units[unit_idx].destroyed) {
	      this.game.spaces[spacekey].units[unit_idx].destroyed = 0;
	      this.game.spaces[spacekey].units[unit_idx].damaged = 1;
	    } else {
	      this.game.spaces[spacekey].units[unit_idx].destroyed = 0;
	      this.game.spaces[spacekey].units[unit_idx].damaged = 0;
	    }
	  }

	  this.displaySpace(spacekey);
          this.shakeSpacekey(spacekey);
	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "damage") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let key = mv[2];
	  let damaged = parseInt(mv[3]);
	  let player_to_ignore = 0;
	  if (mv[4]) { player_to_ignore = parseInt(mv[4]); }

	  let is_last_unit = 0;
	  let tmpx = this.game.queue[this.game.queue.length-1].split("\t");
	  if (tmpx[0] !== "damage" && tmpx[0] !== "add") { is_last_unit = 1; }

	  if (player_to_ignore != this.game.player) {
	    let unit = null;
	    let unit_idx = 0;
	    for (let z = 0; z < this.game.spaces[spacekey].units.length; z++) {
	      if (!this.game.spaces[spacekey].units[z].destroyed) {
	        if (damaged == 1) {
	          if (this.game.spaces[spacekey].units[z].damaged == true && key === this.game.spaces[spacekey].units[z].key) {
		    unit = this.game.spaces[spacekey].units[z];
		    unit_idx = z;
	          }
	        } else {
	          if (this.game.spaces[spacekey].units[z].damaged == false && key === this.game.spaces[spacekey].units[z].key) {
		    unit = this.game.spaces[spacekey].units[z];
		    unit_idx = z;
	          }
	        }
	      }
	    }
	    if (unit) {
	      if (unit.damaged == false) {
		unit.damaged = true;
	      } else { 
		unit.destroyed = true;
	      }
	    }
	  }

	  if (is_last_unit) {
            for (let z = this.game.spaces[spacekey].units.length-1; z >= 0; z--) {
              let u = this.game.spaces[spacekey].units[z];
	      let f = this.returnPowerOfUnit(u);
              if (u.destroyed == true) {
		if (f === "central") {
	          this.moveUnit(spacekey, z, "ceubox");
		  this.displaySpace("ceubox");
		} else {
	          this.moveUnit(spacekey, z, "aeubox");
		  this.displaySpace("aeubox");
		}
	      }
            } 
	  }
            
	  this.displaySpace("ceubox");
	  this.displaySpace("aeubox");
	  this.displaySpace(spacekey);
          this.shakeSpacekey(spacekey);

	  return 1;

	}


	if (mv[0] === "remove") {

	  let spacekey = mv[1];
	  let unitkey = mv[2];
	  let player_to_ignore = 0;
	  if (mv[3]) { player_to_ignore = parseInt(mv[3]); }

	  if (player_to_ignore != this.game.player) {
	    for (let z = 0; z < this.game.spaces[spacekey].units.length; z++) {
	      if (this.game.spaces[spacekey].units[z].key === unitkey) {
		this.game.spaces[spacekey].units.splice(z, 1);
		z = this.game.spaces[spacekey].units.length + 2;

		//
		// if removing attacker, update unit_idx of whatever else is there
		//
		if (this.game.state.combat.attacker) {
		  for (let zz = 0; zz < this.game.state.combat.attacker.length; zz++) {
		    if (this.game.state.combat.attacker[zz].unit_sourcekey == spacekey) {
		      if (z < this.game.state.combat.attacker[zz].unit_idx) {
			this.game.state.combat.attacker[zz].unit_idx--;
		      }
		    }
		  }
		}

	      }
	    }
	  }

	  this.displaySpace(spacekey);
	  this.shakeSpacekey(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "add") {

	  let spacekey = mv[1];
	  let unitkey = mv[2];
	  let player_to_ignore = 0;
	  if (mv[3]) { player_to_ignore = parseInt(mv[3]); }

	  if (player_to_ignore != this.game.player) {
	    let unit = this.cloneUnit(unitkey);
	    unit.spacekey = spacekey;
	    this.game.spaces[spacekey].units.push(this.cloneUnit(unitkey));
	  }

	  //
	  // if this is a corps and it is in a spacekey under combat, update
	  //
          if (unitkey.indexOf("corps") > -1) {
	    if (this.game.state.combat.attacker) {
	      for (let z = 0; z < this.game.state.combat.attacker.length; z++) {
  	        if (this.game.state.combat.attacker[z].unit_sourcekey == spacekey) {
	          this.game.state.combat.attacker.push({ key : this.game.state.combat.key , unit_sourcekey : spacekey , unit_idx : this.game.spaces[spacekey].units.length-1 });
		  z = this.game.state.combat.attacker.length + 2;
console.log("ADDACKERS NOW: " + JSON.stringify(this.game.state.combat.attacker));
	        }
	      }
	    }
	  }


	  this.displaySpace(spacekey);
	  this.shakeSpacekey(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] == "flank_attack_attempt") {

	  let action = mv[1];
	  let eligible_spaces = JSON.parse(mv[2]);

	  let drm_modifiers = 0;
          //
          // +1 for every unit without another army adjacent to it
          //
          let flanking_spaces = [];

          for (let i = 0; i < eligible_spaces.length; i++) {
            if (i != action) {
              if (!flanking_spaces.includes(eligible_spaces[i])) {
                flanking_spaces.push(eligible_spaces[i]);
                if (this.canSpaceFlank(eligible_spaces[i])) {
                  drm_modifiers++;
                }
              }
            }
          }

	  let roll = this.rollDice(6);
	  this.updateLog("roll: " + roll + " (+"+drm_modifiers+")"); 

	  if ((roll+drm_modifiers) > 3) {
	    try { salert("Flank Attack Succeeds!"); } catch (err) {}
	    this.game.state.combat.flank_attack = "attacker"; 
	  } else {
	    try { salert("Flank Attack Fails!"); } catch (err) {}
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

	  for (let i = 0; i < this.game.spaces[key].units.length; i++) {
	    this.game.spaces[key].units[i].spacekey = key;
	  }
	  this.activateSpaceForCombat(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



        if (mv[0] === "activate_for_movement") {

	  let faction = mv[1];
	  let key = mv[2];

	  for (let i = 0; i < this.game.spaces[key].units.length; i++) {
	    this.game.spaces[key].units[i].spacekey = key;
	  }
	  this.activateSpaceForMovement(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] === "mef_placement") {

	  let spacekey = mv[1];

	  this.game.state.events.mef = 1;	
	  this.game.state.events.mef_beachhead = spacekey;
	  this.game.spaces[spacekey].control = "allies";
	  this.game.spaces[spacekey].port = 1; // new allied port
          this.addUnitToSpace("mef_army", spacekey);
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] === "entrench") {

	  let faction = mv[1];
	  let key = mv[2];
	  let idx = null;

	  if (mv[3]) { idx = parseInt(mv[3]); }
	  let loss_factor = 0;
	  if (mv[4]) { loss_factor = parseInt(mv[4]) };

	  //
	  // exists if a unit is doing it
	  //
	  if (idx) {
	    if (loss_factor) {
	      this.game.state.entrenchments.push({ spacekey : key , loss_factor : loss_factor});
	    }
	    this.game.spaces[key].units[idx].moved = 1;
	  } else {
	    if (!this.game.spaces[key].trench) { this.game.spaces[key].trench = 0; }
	    if (this.game.spaces[key].trench == 0) { 
	      this.updateLog(this.returnName(faction) + " entrenches in " + this.returnSpaceNameForLog(key));
	    } else {
	      this.updateLog(this.returnName(faction) + " entrenches deeper in " + this.returnSpaceNameForLog(key));
	    }
	    this.game.spaces[key].trench++;
	    if (this.game.spaces[key].trench > 2) { this.game.spaces[key].trench = 2; }
	  }

	  this.displaySpace(key);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "dig_trenches") {

	  if (this.game.state.entrenchments) {
	    for (let i = 0; i < this.game.state.entrenchments.length; i++) {
	      let e = this.game.state.entrenchments[i];
	      let roll = this.rollDice(6);
	      if (this.game.state.entrenchments[i].loss_factor >= roll) {
	        this.updateLog("Trench Success: " + this.game.spaces[e.spacekey].name + " ("+roll+")");
	        this.addTrench(e.spacekey);
	      } else {
	        this.updateLog("Trench Failure: " + this.game.spaces[e.spacekey].name + " ("+roll+")");
	      }
	    }
	  }

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


	if (mv[0] === "selective_acknowledgement") {

	  let player = parseInt(mv[1]);

	  if (this.game.player == player) {
	    this.game.queue.push("ACKNOWLEDGE\tClick to Continue");
	  }

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

	  //
	  // the game logic should prevent units from moving in unless they have
	  // enough strength to besiege a fort, so if this is a fort we want to
	  // toggle the besieged variable if needed.
	  //
	  // note that this does not apply to units moving into a space they control...
	  //
	  if (this.game.spaces[destinationkey].units.length > 0) {

	    if (this.returnPowerOfUnit(this.game.spaces[destinationkey].units[0]) != this.game.spaces[destinationkey].control) {
	      if (this.game.spaces[destinationkey].fort > 0) {
	        this.game.spaces[destinationkey].besieged = 1;
	      } else {
	        //
	        // switch control
	        //
	        this.game.spaces[destinationkey].control = this.returnPowerOfUnit(this.game.spaces[destinationkey].units[0]);

	        //
	        // degrade trenches
	        //
	        if (this.game.spaces[destinationkey].trench > 0) { this.game.spaces[destinationkey].trench--; }
	      }
	    }
	  }

	  //
	  // check if no longer besieged?
	  //
	  if (this.game.spaces[sourcekey].besieged == 1) {
	    if (this.game.spaces[sourcekey].units.length > 0) {
	      if (this.returnPowerOfUnit(this.game.spaces[sourcekey].units[0]) != this.game.spaces[destinationkey].control) {
	        this.game.spaces[sourcekey].besieged = 0;
	      }
	    } else {
	      this.game.spaces[sourcekey].besieged = 0;
	      if (this.game.spaces[sourcekey].fort > 0) {
		//
		// control switches back to original owner of fort
		//
		let spc = this.returnSpaces();
		this.game.spaces[sourcekey].control = spc[sourcekey].control;
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);


	  //
	  // shake the space
	  //
	  this.displaySpace(destinationkey);
	  this.shakeSpacekey(destinationkey);

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


