
  //
  // Core Game Logic
  //
  async handleGameLoop() {

    let his_self = this;

    if (this.is_first_loop == undefined) {
      this.is_first_loop = 1;
    } else {
      this.is_first_loop = 0;
    }


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
	// entry point for every round in the game
	//
        if (mv[0] === "round") {

	  this.game.state.round++;

          //
          // TODO - sanity placement here as earlier did not catch everything
          // maybe eliminate redundancy in the future.
	  //
          this.returnOverstackedUnitsToCapitals();

this.updateLog(`###############`);
this.updateLog(`### Round ${this.game.state.round} ###`);
this.updateLog(`###############`);

	  this.game.state.cards_left = {};

	  this.onNewRound();
	  this.restoreReformers();
	  this.restoreMilitaryLeaders();

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    this.resetPlayerRound((i+1));
          }

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("ACKNOWLEDGE\tThe Advent of Winter");
	  this.game.queue.push("action_phase");
	  this.game.queue.push("check_interventions"); // players check and report cards that need to trigger waiting/check
	  this.game.queue.push("RESETCONFIRMSNEEDED\tall");

if (this.game.options.scenario != "is_testing") {
	  this.game.queue.push("spring_deployment_phase");
	  this.game.queue.push("NOTIFY\tSpring Deployment is about to start...");
}

	  if (this.game.players.length == 2) {
	    this.game.queue.push("diplomacy_phase_2P");
	  } else {

	    if (this.game.state.starting_round != this.game.state.round) {

if (this.game.options.scenario != "is_testing") {
	      if (this.game.state.round > 1) {

  	        if (this.game.state.events.schmalkaldic_league) {
	          this.game.queue.push("make_declarations_of_war\tprotestant");
	        }
	        this.game.queue.push("make_declarations_of_war\tpapacy");
	        this.game.queue.push("make_declarations_of_war\tfrance");
	        this.game.queue.push("make_declarations_of_war\tengland");
	        this.game.queue.push("make_declarations_of_war\thapsburg");
	        this.game.queue.push("make_declarations_of_war\tottoman");
		if (this.game.state.excommunicated_factions["france"] == 1) {
	          this.game.queue.push("remove_excommunication\tfrance");
		}
		if (this.game.state.excommunicated_factions["england"] == 1) {
	          this.game.queue.push("remove_excommunication\tengland");
		}
		if (this.game.state.excommunicated_factions["hapsburg"] == 1) {
	          this.game.queue.push("remove_excommunication\thapsburg");
		}
	        this.game.queue.push("sue_for_peace\tpapacy");
	        this.game.queue.push("sue_for_peace\tfrance");
	        this.game.queue.push("sue_for_peace\tengland");
	        this.game.queue.push("sue_for_peace\thapsburg");
	        this.game.queue.push("sue_for_peace\tottoman");
	        this.game.queue.push("diplomacy_phase");

	        //this.game.queue.push("ACKNOWLEDGE\tProceed to Diplomatic Proposals");

		if (this.game.state.round > 1) {
  	          this.game.queue.push("card_draw_phase");
		}

		if (this.game.players.length == 2) {

		  this.game.queue.push("halted");
	          this.game.queue.push("winter_retreat_move_units_to_capital\tpapacy");
		  let c = [this.game.players[this.returnPlayerOfFaction("papacy")-1]];
		  this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));

	        } else {

		  if (this.game.players.length == 3) {

		    let c = [this.game.players[this.returnPlayerOfFaction("england")-1],this.game.players[this.returnPlayerOfFaction("hapsburg")-1],this.game.players[this.returnPlayerOfFaction("ottoman")-1]];

		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tprotestant");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tpapacy");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tfrance");
		    this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));

		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tengland");
	            this.game.queue.push("winter_retreat_move_units_to_capital\thapsburg");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tottoman");
		    this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));

		  }

		  if (this.game.players.length == 4) {

		    let c = [this.game.players[this.returnPlayerOfFaction("protestant")-1],this.game.players[this.returnPlayerOfFaction("papacy")-1]];
		    let c2 = [this.game.players[this.returnPlayerOfFaction("france")-1],this.game.players[this.returnPlayerOfFaction("england")-1],this.game.players[this.returnPlayerOfFaction("hapsburg")-1], this.game.players[this.returnPlayerOfFaction("ottoman")-1]];

		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tprotestant");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tpapacy");
		    this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));
		    this.updateStatus("Other factions handling winter retreat...");

		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tfrance");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tengland");
	            this.game.queue.push("winter_retreat_move_units_to_capital\thapsburg");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tottoman");
		    this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c2));
		    this.updateStatus("Other factions handling winter retreat...");

		  }

		  if (this.game.players.length == 5) {

		    let c = [this.game.players[this.returnPlayerOfFaction("protestant")-1]];
		    let c2 = [this.game.players[this.returnPlayerOfFaction("papacy")-1],this.game.players[this.returnPlayerOfFaction("france")-1],this.game.players[this.returnPlayerOfFaction("england")-1],this.game.players[this.returnPlayerOfFaction("hapsburg")-1], this.game.players[this.returnPlayerOfFaction("ottoman")-1]];

		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tprotestant");
		    this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));
		    this.updateStatus("Other factions handling winter retreat...");

		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tpapacy");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tfrance");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tengland");
	            this.game.queue.push("winter_retreat_move_units_to_capital\thapsburg");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tottoman");
		    this.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(c2));
		    this.updateStatus("Other factions handling winter retreat...");

		  }

		  if (this.game.players.length == 6) {
		    this.game.queue.push("halted");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tprotestant");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tpapacy");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tfrance");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tengland");
	            this.game.queue.push("winter_retreat_move_units_to_capital\thapsburg");
	            this.game.queue.push("winter_retreat_move_units_to_capital\tottoman");
		    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
		    this.updateStatus("Other factions handling winter retreat...");
		  }

	        }

	        this.game.queue.push("retreat_to_winter_spaces");
	      }
}
	    }
	  }


	  //
	  // 1532 and testing need cards too!
	  //
	  if (this.game.state.round != 1 && (this.game.state.round == this.game.state.starting_round)) {
	    this.game.queue.push("card_draw_phase");
	  }


	  //
	  // start the game with the Protestant Reformation
	  //
	  if (this.game.state.round == 1) {

if (this.game.options.scenario == "is_testing") {
	    this.game.queue.push("is_testing");
	    this.game.queue.push("card_draw_phase");
} else {
	    if (this.game.players.length == 2) {
	      this.game.queue.push("show_overlay\tvp");
	    }

	    this.game.queue.push("hide_overlay\tdiet_of_worms");
	    this.game.queue.push("diet_of_worms");
	    this.game.queue.push("show_overlay\tdiet_of_worms");
	    this.game.queue.push("card_draw_phase");
	    this.game.queue.push("event\tprotestant\t008");
}

	  } else {

	    //
	    // round 2 - zwingli in zurich
	    //
	    if (this.game.state.round == 2) {
	      this.addDebater("protestant", "oekolampadius-debater");
	      this.addDebater("protestant", "zwingli-debater");
	      this.addReformer("protestant", "zurich", "zwingli-reformer");
	      this.addDebater("papacy", "contarini-debater");
	    }

	    //
	    // round 3
	    //
	    if (this.game.state.round == 3) {
	      this.addDebater("protestant", "bullinger-debater");
	    }

	    //
	    // round 4 - calvin in genoa
	    //
	    if (this.game.state.round == 4) {

	      //
	      // 1532 starts in R4
	      //
	      if (this.game.options.scenario === "1532") {
	        this.game.queue.push("is_1532");
	      }

	      this.addDebater("protestant", "farel-debater");
	      this.addDebater("protestant", "cop-debater");
	      this.addDebater("protestant", "olivetan-debater");
	      this.addDebater("protestant", "calvin-debater");
	      this.addReformer("protestant", "geneva", "calvin-reformer");

	      if (this.game.players.length == 2) {
	        //
	        // Henry VIII marries Anne Boleyn
	        //
	        this.game.state.henry_viii_marital_status = 2;
	      }
	    }

	    //
	    // round 5 - cranmer in london
	    //
	    if (this.game.state.round == 5) {
	      this.addDebater("protestant", "cranmer-debater");
	      this.addDebater("protestant", "latimer-debater");
	      this.addDebater("protestant", "coverdale-debater");
	      this.addReformer("protestant", "london", "cranmer-reformer");
	      this.addDebater("papacy", "pole-debater");
	      this.addDebater("papacy", "caraffa-debater");
	    }

	    //
	    // round 6 - maurice of saxony
	    //
	    if (this.game.state.round == 6) {
	      this.addDebater("protestant", "wishart-debater");
	      this.addDebater("protestant", "knox-debater");
	      this.game.queue.push("protestants-place-maurice-of-saxony-round-six");
	      this.addDebater("papacy", "loyola-debater");
	      this.addDebater("papacy", "faber-debater");
	      this.addDebater("papacy", "canisius-debater");
	    }

	    //
	    // round 6 or higher - England (Mary, Elizabeth and Edward)
	    //
	    // this logic is implemented in newCards
	    //
	    if (this.game.players.length == 2) {
	      if (this.game.state.round >= 6 ) {
                this.game.state.henry_viii_healthy_edward = 1;
                this.game.state.henry_viii_sickly_edward = 0;
                this.game.state.henry_viii_add_elizabeth = 0;
	      }
	    }

	    //
	    // round 7
	    //
	    if (this.game.state.round == 7) {
	      this.addDebater("papacy", "gardiner-debater");
	    }
	  }

	  //
	  // show all - will only trigger for relevant faction
	  //
	  if (this.game.state.round == 1 || (this.game.state.round == this.game.state.starting_round)) {
	    if (this.game.players.length == 2) {
	      this.game.queue.push("show_overlay\twelcome\tprotestant");
	      this.game.queue.push("show_overlay\twelcome\tpapacy");
	    }
	    if (this.game.players.length == 3) {
	      this.game.queue.push("show_overlay\twelcome\tprotestant_england");
	      this.game.queue.push("show_overlay\twelcome\tfrance_ottoman");
	      this.game.queue.push("show_overlay\twelcome\thapsburg_papacy");
	    }
	    if (this.game.players.length == 4) {
	      this.game.queue.push("show_overlay\twelcome\tprotestant_england");
	      this.game.queue.push("show_overlay\twelcome\thapsburg_papacy");
	      this.game.queue.push("show_overlay\twelcome\tfrance");
	      this.game.queue.push("show_overlay\twelcome\tottoman");
	    }
	    if (this.game.players.length == 5) {
	      this.game.queue.push("show_overlay\twelcome\tprotestant_england");
	      this.game.queue.push("show_overlay\twelcome\thapsburg");
	      this.game.queue.push("show_overlay\twelcome\tpapacy");
	      this.game.queue.push("show_overlay\twelcome\tfrance");
	      this.game.queue.push("show_overlay\twelcome\tottoman");
	    }
	    if (this.game.players.length == 6) {
	      this.game.queue.push("show_overlay\twelcome\tprotestant");
	      this.game.queue.push("show_overlay\twelcome\tpapacy");
	      this.game.queue.push("show_overlay\twelcome\thapsburg");
	      this.game.queue.push("show_overlay\twelcome\tengland");
	      this.game.queue.push("show_overlay\twelcome\tfrance");
	      this.game.queue.push("show_overlay\twelcome\tottoman");
	    }
      	    this.game.queue.push("READY");
	  }

          return 1;
        }

        if (mv[0] == "init") {
          this.game.queue.splice(qe, 1);
	  return 1;
        }

	//
	// passing code uses this, it manually puts up ACKNOWLEDGE then restarts
	// so it also inserts this so that when we hit it we remove it and then
	// look for future moves
	//
	if (mv[0] === "unhalt_from_acknowledge_speedup") {

	  let msg = mv[1];
	  this.updateStatus(msg);

	  //
	  // once we get here we aren't halted any more
	  //
	  this.halted = 0;
	  this.is_halted = 0;

	  // do not splice out, because all players need to resolve
	  return 0;
	}

	if (mv[0] === "show_overlay") {

          this.game.queue.splice(qe, 1);

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  this.displayElectorateDisplay();
	  if (mv[1] === "welcome") { 
	    let faction = mv[2];
	    let player = this.returnPlayerOfFaction(faction);
	    if (faction === "protestant_england") { player = this.returnPlayerOfFaction("protestant"); }
	    if (faction === "hapsburg_papacy") { player = this.returnPlayerOfFaction("hapsburg"); }
	    if (faction === "france_ottoman") { player = this.returnPlayerOfFaction("france"); }
	    if (this.game.player === player) { 
	      this.welcome_overlay.render(faction); 
	      this.game.queue.push("hide_overlay\twelcome");
	      if (faction === "protestant") { this.game.queue.push("ACKNOWLEDGE\tYou are the Protestants"); }
	      if (faction === "papacy") { this.game.queue.push("ACKNOWLEDGE\tYou are the Papacy"); }
	      if (faction === "hapsburg") { this.game.queue.push("ACKNOWLEDGE\tYou are the Hapsburgs"); }
	      if (faction === "ottoman") { this.game.queue.push("ACKNOWLEDGE\tYou are the Ottomans"); }
	      if (faction === "france") { this.game.queue.push("ACKNOWLEDGE\tYou are the French"); }
	      if (faction === "england") { this.game.queue.push("ACKNOWLEDGE\tYou are the English"); }
	      if (faction === "protestant_england") { this.game.queue.push("ACKNOWLEDGE\tYou are the Protestants and English"); }
	      if (faction === "france_ottoman") { this.game.queue.push("ACKNOWLEDGE\tYou are the French and Ottomans"); }
	      if (faction === "hapsburg_papacy") { this.game.queue.push("ACKNOWLEDGE\tYou are the Hapsburgs and Papacy"); }
	    }
	  }
	  if (mv[1] === "theses") { this.theses_overlay.render(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.render(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.render(); }
	  if (mv[1] === "winter") { this.winter_overlay.render(); }
	  if (mv[1] === "faction") { this.faction_overlay.render(mv[2]); }
	  if (mv[1] === "vp") { this.vp_overlay.render(); }
	  if (mv[1] === "zoom") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "burn_books") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "publish_treatise") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "theological_debate_and_debaters") { 
	    this.debate_overlay.render(his_self.game.state.theological_debate); 
            this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
            this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);
	  }
	  if (mv[1] === "theological_debate") { this.debate_overlay.render(his_self.game.state.theological_debate); }
	  if (mv[1] === "naval_battle") {
	    if (mv[2] === "post_naval_battle_attackers_win") { this.naval_battle_overlay.attackersWin(his_self.game.state.naval_battle); }
	    if (mv[2] === "post_naval_battle_defenders_win") { this.naval_battle_overlay.defendersWin(his_self.game.state.naval_battle); }
	  }
	  if (mv[1] === "field_battle") {
	    if (mv[2] === "post_field_battle_attackers_win") { this.field_battle_overlay.attackersWin(his_self.game.state.field_battle); }
	    if (mv[2] === "post_field_battle_defenders_win") { this.field_battle_overlay.defendersWin(his_self.game.state.field_battle); }
	  }

	  return 1;
	}
	if (mv[0] === "hide_overlay") {
	  this.displayElectorateDisplay();
	  if (mv[1] === "winter") { this.winter_overlay.pushHudUnderOverlay(); this.winter_overlay.hide(); }
	  if (mv[1] === "welcome") { this.welcome_overlay.pushHudUnderOverlay(); this.welcome_overlay.hide(); }
	  if (mv[1] === "faction") { this.faction_overlay.hide(); }
	  if (mv[1] === "theses") { this.theses_overlay.hide(); }
	  if (mv[1] === "zoom") { this.theses_overlay.hide(); }
	  if (mv[1] === "burn_books") { this.theses_overlay.hide(); }
	  if (mv[1] === "publish_treatise") { this.theses_overlay.hide(); }
	  if (mv[1] === "chateaux") { this.chateaux_overlay.hide(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.hide(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.hide(); }
	  if (mv[1] === "vp") { this.vp_overlay.hide(); }
	  if (mv[1] === "theological_debate") { this.debate_overlay.pushHudUnderOverlay(); this.debate_overlay.hide(); }
	  if (mv[1] === "field_battle") { this.field_battle_overlay.hide(); }
	  if (mv[1] === "siege") { this.assault_overlay.hide(); }
	  if (mv[1] === "assault") { this.assault_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "display_custom_overlay") {

          this.game.queue.splice(qe, 1);

          let card = mv[1];
	  let obj = "";
	  if (mv[2]) { obj = JSON.parse(mv[2]); }
	  let show_overlay = false;

	  //
	  // everyone shows
	  //
	  if (obj == "") {
	    show_overlay = true;
	  //
	  // object contains show / hide info
	  //
	  } else {
	    for (let i = 0; i < obj.show.length; i++) {
	      let f = obj.show[i];
	      if (f == "all" || this.game.player == this.returnPlayerCommandingFaction(f)) {
	        show_overlay = true;
	      }
	    }
	    for (let i = 0; i < obj.hide.length; i++) {
	      let f = obj.hide[i];
	      if (this.game.player == this.returnPlayerCommandingFaction(f)) {
	        show_overlay = false;
	      }
	    }
	  }

	  if (show_overlay) {
	    this.displayCustomOverlay(card);
	  }

	  return 1;
	}

	if (mv[0] === "cards_left") {

          let faction = mv[1];
          let cards_left = parseInt(mv[2]);
	  this.game.state.cards_left[faction] = cards_left;

	  //
	  // we don't send this if we aren't playing event or ops, so if cards_left > 0, we 
	  // do not trigger auto-passing. this "unsets" pass if we have passed earlier, allowing
	  // players to pass and then decide to continue later.
	  //
	  let player = this.returnPlayerCommandingFaction(faction);
          for (let z = 0; z < this.game.state.players_info[player-1].factions.length; z++) {
	    if (this.game.state.players_info[player-1].factions[z] == faction) {
	      this.game.state.players_info[player-1].factions_passed[z] = false;
	    }
	  }
	  this.displayCardsLeft();

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "pass") {
 
          let faction = mv[1];

	  let player = this.returnPlayerOfFaction(faction);
	  if (mv[2]) {
            let cards_left = parseInt(mv[2]);
	    this.game.state.cards_left[faction] = cards_left;
	  }

          for (let z = 0; z < this.game.state.players_info[player-1].factions.length; z++) {
	    if (this.game.state.players_info[player-1].factions[z] == faction) {
	      this.game.state.players_info[player-1].factions_passed[z] = true;
	    }
	  }

	  this.updateLog(this.returnFactionName(faction) + " passes");

	  //
	  // Henry VIII reroll on first pass after 3 roll on pregnancy chart
	  //
	  if (this.game.state.henry_viii_auto_reroll == 1) {
	    this.game.queue.push("advance_henry_viii_marital_status");
	    this.game.state.henry_viii_auto_reroll = 0;
	  }

          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "build") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  this.updateLog(this.returnFactionName(faction) + " builds " + unit_type + " in " + this.returnSpaceName(spacekey), true);

	  //
	  // winterrrr retreat sometimes builds army leaders
	  //
	  if (unit_type == "renegade" || unit_type == "suleiman" || unit_type == "ibrahim-pasha" || unit_type == "charles-v" || unit_type == "duke-of-alva" || unit_type == "ferdinand" || unit_type == "henry-viii" || unit_type == "charles-brandon" || unit_type == "francis-i" || unit_type == "henry-ii" || unit_type == "montmorency" || unit_type == "andrea-doria" || unit_type == "maurice-of-saxony" || unit_type == "dudley" || unit_type == "john-frederick" || unit_type == "philip-hesse") {
	    if (this.game.player != player_to_ignore) {
	      this.addArmyLeader(faction, spacekey, unit_type);
	      this.displaySpace(spacekey);
	      this.game.queue.splice(qe, 1);
	    }
	    return 1;
	  }

	  //
	  // maybe it will try to move navy leaders too
	  //
	  if (unit_type == "barbarossa" || unit_type == "dragut" || unit_type == "andrea-doria") {
	    if (this.game.player != player_to_ignore) {
	      this.addNavyLeader(faction, spacekey, unit_type);
	      this.displaySpace(spacekey);
	      this.game.queue.splice(qe, 1);
	    }
	    return 1;
	  }


	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.game.spaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	    if (land_or_sea === "sea") {
	      this.game.navalspaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "activate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  //
	  // does this trigger the defeat of Hungary-Bohemia? -- will only run once
	  //
          if (faction === "hapsburg" && power == "hungary" && his_self.game.state.events.diplomatic_alliance_triggers_hapsburg_hungary_alliance == 1) {
            this.triggerDefeatOfHungaryBohemia();
	  }

	  this.activateMinorPower(faction, power);
	  this.updateLog(this.returnFactionName(faction) + " now controls " + this.returnFactionName(power));
	  this.displayBoard();

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "deactivate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  this.deactivateMinorPower(faction, power);
	  this.updateLog(this.returnFactionName(faction) + " no longer controls " + this.returnFactionName(power));
	  this.displayBoard();

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "remove_unit") {

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
	      this.removeUnit(faction, spacekey, unit_type);
	    }
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

	  //
	  // check if triggers defeat of Hungary Bohemia
	  //
          this.triggerDefeatOfHungaryBohemia();

	  this.game.queue.splice(qe, 1);
	  return 1;

	}




	if (mv[0] === "winter_retreat_move_units_to_capital") {

	  let faction = mv[1];

	  this.game.queue.splice(qe, 1);

	  let p = this.returnPlayerCommandingFaction(faction);

	  if (this.game.player == p) {
	    this.winter_overlay.hide();
	    this.playerReturnWinterUnits(faction);
	  } else {
	    //this.updateStatus(this.returnFactionName(faction) + " returning units to capital");
	  }

	  // simultaneous so pass-through and resolve clears HALTED
	  return 1;
	  //return 0;

	}


	if (mv[0] === "retreat_to_winter_spaces") {

	  let his_self = this;
	  let moves = [];

	  this.game.queue.splice(qe, 1);


	  for (let spacekey in this.game.spaces) {
	    for (let faction in this.game.spaces[spacekey].units) {

	      let space = this.game.spaces[spacekey];

	      let fluis = 0;
	      if (space.units[faction].length > 0 ) { fluis = this.returnFactionLandUnitsInSpace(faction, spacekey, 0); }
	      if (fluis > 0) {

		//
		// we need to retreat from these spaces
		//
		if (  
			((this.isSpaceFortified(spacekey) && !this.isSpaceControlled(spacekey, faction)) || (!this.isSpaceFortified(spacekey)))
			&&
			(!(space.religion == "protestant" && this.isSpaceElectorate(space.key) && this.game.state.events.schmalkaldic_league != 1))
		) {

		  //
		  // remove siege if needed so units not "besieged" when moved
		  //
		  this.removeSiege(space.key);

		  //
		  // for every unit that needs to be moved
		  //
		  for (let fluis_idx = 0; fluis_idx < fluis; fluis_idx++) {

		    if (fluis_idx < 0) { fluis_idx = 0; }

		    //
		    // find the nearest friendly fortified space w/ less than 4 units
		    //
		    let res = this.returnNearestFriendlyFortifiedSpacesTransitPasses(faction, spacekey, 4);

		    //
		    // if we cannot find any spaces to receive them
		    //
		    if (res.length == 0) {

		      //
		      // destroy stranded units in 2P version
		      //
		      if ((this.game.players.length == 2 && (faction != "protestant" && faction != "papacy")) || this.returnPlayerCommandingFaction(faction) == 0) {
		        for (let z = 0; z < this.game.spaces[spacekey].units[faction].length; z++) {
		          if (this.game.spaces[spacekey].units[faction][z].personage != true && this.game.spaces[spacekey].units[faction][z].reformer != true) {
			    this.game.spaces[spacekey].units[faction].splice(z, 1);
			    z--;
			    // we have moved one guy...
			    fluis--; fluis_idx--;
			  }
	 	        }
		        this.displaySpace(spacekey);

		      //
		      // otherwise attrition + return to capital
		      //
		      // TODO - attrition
		      //
		      } else {

 			let capitals = this.returnCapitals(faction);
			let unitlen = this.game.spaces[spacekey].units[faction].length;
		        for (let z = 0, y = 0, zz = 0; z < unitlen; z++, zz++) {
			  if (capitals[y]) {
		            if (this.game.spaces[spacekey].units[faction][z].reformer != true) {
			      this.game.spaces[capitals[y]].units[faction].push(this.game.spaces[spacekey].units[faction][z]);
			      this.game.spaces[spacekey].units[faction].splice(z, 1);
			      zz--;
			      // we have moved one guy...
			      fluis--; fluis_idx--;
			    }
			  }
			  y++;
			  if (!capitals[y]) { y = 0; }
			  unitlen = this.game.spaces[spacekey].units[faction].length;
			}
		      }

		    //
		    // res.length > 0, so there are nearby fortified spaces
		    //
		    } else {

		      //
		      // how much space do we have?
		      //
		      let options = [];
		      for (let b = 0; b < res.length; b++) {
			options.push(4 - this.returnFactionLandUnitsInSpace(faction, res[b].key));
		      }

		      //
		      // fill those spaces
		      //
		      for (let b = 0; b < res.length; b++) {
			for (let zz = 0; zz < options[b]; zz++) {
			  let unitlen = this.game.spaces[spacekey].units[faction].length;
		          for (let zzz = 0, zzy = 0; zzz < unitlen; zzz++, zzy++) {
		            if (this.game.spaces[spacekey].units[faction][zzy].reformer != true) {
			      this.game.spaces[res[b].key].units[faction].push(this.game.spaces[spacekey].units[faction][zzy]);
			      this.game.spaces[spacekey].units[faction].splice(zzy, 1);
			      zzy--;
			      // we have moved one guy...
			      fluis--; fluis_idx--;

			      //
			      // and show new unit!
			      //
			      this.displaySpace(res[b].key);

			    }
			    unitlen = this.game.spaces[spacekey].units[faction].length;
			  }
			} 
		      }
		    }
		  } // fluis_idx loop

		  //
		  // if the space is besieged undo that, and un-besiege defenders
		  //
		  if (space.besieged > 0) {
		    this.removeSiege(space.key);
		  }

		  this.displaySpace(spacekey);

		} // if we need to retreat
	      } // if there are units here
	    } // loop faction
	  } // loop spacekey

	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

          //
          // fortified spaces - any units in excess of stacking limit returned to capital
          //
	  //this.returnOverstackedUnitsToCapitals();

	  return 1;
        }


        if (mv[0] === "decide_if_mary_i_subverts_protestantism_in_2P") {

	  this.game.queue.splice(qe, 1);

	  let num = this.returnNumberOfProtestantSpacesInLanguageZone("english", 1);
	  let p = this.returnPlayerOfFaction("papacy");
	  let fhand_idx = 0; // faction hand/pool is necessarily 0 in 2P

	  if (num > 0) {
	    this.game.queue.push("process_mary_i_subverts_protestantism_in_2P");
            this.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+"papacy"+"\t1"); // 1 = show overlay
            this.game.queue.push("DEAL\t1\t"+p+"\t"+1);
	  } else {
	    this.game.queue.push("NOTIFY\t"+this.popup("021") + ": no Catholic spaces in England");
	  }

	  return 1;
	}

        if (mv[0] === "process_mary_i_subverts_protestantism_in_2P") {

	  this.game.queue.splice(qe, 1);

	  let player = this.returnPlayerOfFaction("papacy");
	  if (this.game.player == player) {

	    let card_pulled = this.game.deck[0].fhand[0][this.game.deck[0].fhand.length-1];
	    let ops_pulled = this.game.deck[0].cards[card_pulled].ops;

	    if (ops_pulled == 1 || ops_pulled == 2) {
	      this.addMove("mary_i_burn_books");
	    }

	    if (ops_pulled == 3 || ops_pulled == 4) {
	      this.addMove("mary_i_theological_debate");
	    }

	    if (ops_pulled == 5 || ops_pulled == 6) {
	      this.addMove("mary_i_burn_books");
	      this.addMove("mary_i_theological_debate");
	    }

	    this.addMove("ACKNOWLEDGE\tMary I pulls "+this.popup(card_pulled) + "("+this.game.deck[0].cards[card_pulled].ops+" ops)");

	    this.endTurn();
	  }

	  return 0;
	}

	if (mv[0] === "mary_i_burn_books") {

	  this.game.queue.splice(qe, 1);

	  let player = this.returnPlayerOfFaction("papacy");
	  if (this.canPlayerBurnBooksMaryI(this, player, "papacy")) {
	    if (this.game.player == player) {
	      this.playerBurnBooksMaryI(this, player, "papacy");
	    }
	    return 0;
	  }

	  return 1;

	}

	if (mv[0] === "mary_i_theological_debate") {

	  this.game.queue.splice(qe, 1);

	  // thomas more's execution prevents theological debates
          if (this.game.state.events.more_executed_limits_debates == 1) { return 1; }

	  let player = this.returnPlayerOfFaction("papacy");
	  if (this.canPlayerCallTheologicalDebateMaryI(this, player, "papacy")) {
	    if (this.game.player == player) {
	      this.playerCallTheologicalDebateMaryI(this, player, "papacy");
	    }
	    return 0;
	  }

	  return 1;
	}


        if (mv[0] === "mary_i_subverts_protestantism") {

	  this.game.queue.splice(qe, 1);
	  let card = mv[1];
	  let roll = mv[2];
	  let player = this.returnPlayerCommandingFaction("papacy");

	  this.updateLog(`Mary I rolls ${roll}`);

	  if (player == this.game.player) {
	    this.playerPlayMaryI(card, "papacy");
	  }

	  return 0;

	}


	if (mv[0] === "retreat_to_winter_spaces_player_select") {

	  this.game.queue.splice(qe, 1);

	  //
	  // make sure up-to-date
	  //
	  this.displayBoard();

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.winter_overlay.hide();
	    this.playerResolveWinterRetreat(mv[1], mv[2]);
	    return 0;
	  } else {
	    this.winter_overlay.render();
	    this.updateStatus(this.returnFactionName(mv[1]) + " handling winter retreat from " + this.returnSpaceName(mv[2]));
	    if (x > 0) { return 0; }
	  }

	  //
	  // non-player controlled factions skip winter retreat
	  //
	  return 1;

        }

        if (mv[0] === "protestants-place-maurice-of-saxony-round-six") {

	  this.game.queue.splice(qe, 1);

	  let player = this.returnPlayerOfFaction("protestant");

	  if (this.game.player === player) {

            if (0 == his_self.playerSelectSpaceWithFilter(

              "Select Protestant Electorate for Maurice of Saxony (army leader)",

              function(space) {
                if (space.type == "electorate" && space.political == "protestant") { return 1; }
  	        return 0;
              },

              function(spacekey) {
		his_self.updateStatus("Maurice of Saxony enters play...");
                his_self.addMove("add_army_leader\tprotestant\t"+spacekey+"\tmaurice-of-saxony");
                his_self.endTurn();
              },

	      null,

	      true

            )) {
	      his_self.addMove("NOTIFY\tNo valid electorates for Maurice of Saxony to enter - skipping");
	      his_self.endTurn();
	    };

	  } else {
	    this.updateStatus("Protestants placing Maurice of Saxony");
	  }

	  return 0;

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

	  this.displaySpace(from);
	  this.displaySpace(to);

	  return 1;

        }




	if (mv[0] === "retreat_to_winter_ports") {

	  let moves = [];

	  //
	  // make sure board up-to-date
	  //
	  this.displayBoard();

	  this.winter_overlay.render("stage2");

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.navalspaces) {
	    for (let key in this.game.navalspaces[i].units) {
	      if (this.game.navalspaces[i].units[key].length > 0) {
	        let faction = key;
	        let space = this.game.navalspaces[i];
		let res = this.returnNearestFactionControlledPorts(faction, space);
		if (res.length == 1) {
      	          moves.push("move\t"+faction+"\tport\t"+i+"\t"+res[0].key);
		} else {
		  moves.push("retreat_to_winter_ports_player_select\t"+key+"\t"+space.key+"\t"+JSON.stringify(res));
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

	  //
	  // anything left gets swept
	  //
	  this.returnOverstackedUnitsToCapitals();

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_ports_player_select") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let navalspace = mv[2];
	  let ports = JSON.parse(mv[3]);
	  let x = this.returnPlayerCommandingFaction(faction);

	  if (this.game.player === x) {
	    this.winter_overlay.hide();
	    this.playerResolveNavalWinterRetreat(faction, navalspace);
	  } else {
	    this.winter_overlay.render();
	    this.updateStatus(this.returnFactionName(mv[1]) + " winter port retreat from " + this.returnSpaceName(mv[2]));
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

	  this.displayNavalSpace(from);
	  this.displaySpace(to);

	  return 1;

        }

	if (mv[0] === "add_army_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  //
	  // remove if exists elsewhere
	  //
          let eak = his_self.returnSpaceOfPersonage(faction, type);
          let eak_idx = his_self.returnIndexOfPersonageInSpace(faction, type, eak);
	  if (eak != "") { this.game.spaces[spacekey].units[faction].splice(eak_idx, 1); }

	  this.addArmyLeader(faction, spacekey, type);
	  this.displaySpace(spacekey);

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}




	if (mv[0] === "place_mercenaries") {

    	  this.game.queue.splice(qe, 1);

	  let faction_giving = mv[1];
	  let faction_placing = mv[2];
	  let num = parseInt(mv[3]);

	  if (faction_placing === "france") {
	    if (this.returnControlledCapitals("france").length > 0) {
	      this.addMercenary("france", "paris", num);
	    }
	    return 1;
	  }

	  if (faction_placing === "england") {
	    if (this.returnControlledCapitals("england").length > 0) {
	      this.addMercenary("england", "london", num);
	    }
	    return 1;
	  }

	  if (faction_placing === "hapsburg") {

	    if (this.returnControlledCapitals("hapsburg").length == 1) {
	      this.addMercenary("hapsburg", this.returnControlledCapitals("hapsburg")[0], num);
	      return 1;
	    }

	    if (this.game.player == this.returnPlayerOfFaction(faction_placing)) {

              let msg = "Hapsburg - Select Capital for Mercenaries";
              let html = '<ul>';
              html += `<li class="option" id="vienna">Vienna</li>`;
              html += `<li class="option" id="valladolid">Valladolid</li>`;
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);
              $('.option').off();
              $('.option').on('click', function () {

                $('.option').off();
                let action2 = $(this).attr("id");

                his_self.updateStatus("acknowledge...");
		for (let z = 0; z < num; z++) {
	          his_self.addMove("build\tland\thapsburg\tmercenary\t"+action2);
		}
		his_self.endTurn();

  	      });
	    }

	    return 0;
	  }


	  if (faction_placing === "protestant") {

	    let es = this.returnProtestantElectorates();

	    if (es.length == 1) {
	      this.addMercenary("protestant", es[0], num);
	      return 1;
	    }

	    if (this.game.player == this.returnPlayerOfFaction(faction_placing)) {

              let msg = "Protestant - Select Electorate for Mercenaries";
              let html = '<ul>';
	      for (let i = 0; i < es.length; i++) {
                html += `<li class="option" id="${es[i]}">${this.returnSpaceName(es[i])}</li>`;
	      }
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);
              $('.option').off();
              $('.option').on('click', function () {

                $('.option').off();
                let action2 = $(this).attr("id");

                his_self.updateStatus("acknowledge...");
		for (let z = 0; z < num; z++) {
	          his_self.addMove("build\tland\tprotestant\tmercenary\t"+action2);
		}
		his_self.endTurn();

  	      });
	    }

	    return 0;
	  }

	}

	if (mv[0] === "loan_squadron") {

    	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction_giving = mv[1];
	  let source_spacekey = mv[2];
	  let faction_placing = mv[3];
	  let destination_spacekey = mv[4];

	  this.removeUnit(faction_giving, source_spacekey, "squadron");
	  this.addSquadron(faction_placing, destination_spacekey, "squadron");
	  let s = his_self.game.spaces[destination_spacekey];
	  let u = s.units[faction_placing][s.units[faction_placing].length-1];
	  u.owner = faction_giving;

	  return 1;

	}

	if (mv[0] === "give_squadron") {

    	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction_giving = mv[1];
	  let faction_placing = mv[2];

	  let instructions = [];

	  if (this.game.player != this.returnPlayerOfFaction(faction_giving)) {
	    this.updateStatus(this.returnFactionName(faction_giving) + " selecting squadron to give");
	    return 0;
	  }

	  this.winter_overlay.hide();
	  let filter_find_spaces_with_squadrons = function(space) {
	    let s = his_self.game.spaces[spacekey];
	    for (let i = 0; i < s.units[faction_giving].length; i++) {
	      let u = s.units[faction_giving][i];
	      if (u.type == "squadron") { return 1; }
	    }
	    return 0;
	  }
	  let command_function_on_picking_a_space = function(source_spacekey) {

	    his_self.playerSelectSpaceWithFilter(
	      "Select Closest Valid Destination for Squadron",
	      (space) => {
	        if (space.ports.length > 0) {
		  if (his_self.isSpaceControlled(space.key, faction_placing)) {
		    return 1;
		  }
		}
		return 0;
	      },
	      (destination_spacekey) => {
		his_self.addMove("loan_squadron\t"+faction_giving+"\t"+source_spacekey+"\t"+faction_placing+"\t"+destination_spacekey);
	        his_self.winter_overlay.render();
		his_self.endTurn();
	      },
	      null,
	      true,
	    );
	  }

	  for (let z = 0; z < num; z++) {
	    await this.playerSelectSpaceWithFilter(
              "Select Squadron to Loan", 
	      filter_find_spaces_with_squadrons,
	      command_function_on_picking_a_space,
	      null,
	      true
	    );
	  }

	  return 0;

	}

	if (mv[0] === "give_mercenaries") {

    	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction_giving = mv[1];
	  let faction_placing = mv[2];
	  let num = parseInt(mv[3]);

	  let instructions = [];

	  if (this.game.player != this.returnPlayerOfFaction(faction_giving)) {
	    this.updateStatus(this.returnFactionName(faction_giving) + " selecting mercenaries to give");
	    return 0;
	  }

	  this.winter_overlay.hide();
	  let filter_find_spaces_with_mercenaries = function(space) {
	    let s = his_self.game.spaces[spacekey];
	    for (let i = 0; i < s.units[faction_giving].length; i++) {
	      let u = s.units[faction_giving][i];
	      if (u.type == "mercenary") { return 1; }
	    }
	    return 0;
	  }
	  let command_function_on_picking_a_space = function(spacekey) {
	    this.removeUnit(faction_giving, spacekey, "mercenary");
	    instructions.push("remove_unit\tland\t"+faction_giving+"\tmercenary\t"+spacekey+"\t"+his_self.game.player);
	  }

	  for (let z = 0; z < num; z++) {
	    await this.playerSelectSpaceWithFilter(

              "Select Mercenary to Remove", 

	      filter_find_spaces_with_mecenaries,

	      command_function_on_picking_a_space,

	      null,

	      true
	    );
	  }

	  for (let z = instructions.length-1; z > 0; z--) {
	    this.addMove(instructions[z]);
	  }
	  this.endTurn();
	  this.winter_overlay.render();
	  return 0;

	}

	if (mv[0] === "add_navy_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  //
	  // remove if exists elsewhere
	  //
          let eak = his_self.returnSpaceOfPersonage(faction, type);
          let eak_idx = his_self.returnIndexOfPersonageInSpace(faction, type, eak);
	  if (eak != "") { this.game.spaces[spacekey].units[faction].splice(eak_idx, 1); }

	  this.addNavyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "remove_conquest") {
	  let faction = mv[1];
	  for (let i = 0; i < this.game.state.conquests.length; i++) {
	    if (this.game.state.round == this.game.state.conquests[i].round && this.game.state.conquests[i] == faction) {
	      this.game.state.conquests.splice(i, 1);
	    }
	  }
    	  this.game.queue.splice(qe, 1);
	  return 1;
	}
	if (mv[0] === "remove_exploration") {
	  let faction = mv[1];
	  for (let i = 0; i < this.game.state.explorations.length; i++) {
	    if (this.game.state.round == this.game.state.explorations[i].round && this.game.state.explorations[i].faction == faction) {
	      this.game.state.explorations.splice(i, 1);
	    }
	  }
    	  this.game.queue.splice(qe, 1);
	  return 1;
	}
	if (mv[0] === "remove_colony") {
	  let faction = mv[1];
	  for (let i = 0; i < this.game.state.colonies.length; i++) {
	    if (this.game.state.round == this.game.state.colonies[i].round && this.game.state.colonies[i].faction == faction) {
	      this.game.state.colonies.splice(i, 1);
	    }
	  }
    	  this.game.queue.splice(qe, 1);
	  return 1;
	}
	if (mv[0] === "colonize") {
	  let faction = mv[1];
	  this.game.state.colonies.push({
	    faction : faction,
	    resolved :  0 ,
	    round :   this.game.state.round,
	  });
	  this.updateLog(this.returnFactionName(faction) + " founds a colony");
	  this.displayCustomOverlay("colonize", faction);
          this.game.state.may_colonize[faction] = 0;
    	  this.game.queue.splice(qe, 1);
	  this.displayColony();
	  return 1;
	}
	if (mv[0] === "explore") {
	  let faction = mv[1];
	  this.game.state.explorations.push({
	    faction : faction,
	    resolved :  0 ,
	    round :   this.game.state.round,
	  });
	  this.updateLog(this.returnFactionName(faction) + " launches an expedition");
	  this.displayCustomOverlay("explore", faction);
          this.game.state.may_explore[faction] = 0;
    	  this.game.queue.splice(qe, 1);
	  this.displayExploration();
	  return 1;
	}
        if (mv[0] === "award_exploration_bonus") {

	  this.updateStatus("Determining New World Bonus...");

    	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction = mv[1];
	  let explorer = mv[2];
	  let idx = parseInt(mv[3]);
	  let results_idx = idx;
	  let bonus = mv[4];

	  if (bonus === 'stlawrence') {
	    this.game.state.explorations[idx].resolved = 1;
	    this.game.state.explorations[idx].explorer_lost = 0;
	    this.game.state.newworld[bonus].faction = faction;
	    this.game.state.newworld[bonus].claimed = 1;
	    this.game.state.explorations[idx].prize = "St. Lawrence";
	    this.updateLog(this.returnFactionName(faction) + " discovers the St. Lawrence");
	    this.displayCustomOverlay("stlawrence", this.returnFactionName(faction));
	  }
	  if (bonus === 'greatlakes') {
	    this.game.state.explorations[idx].resolved = 1;
	    this.game.state.explorations[idx].explorer_lost = 0;
	    this.game.state.newworld[bonus].faction = faction;
	    this.game.state.newworld[bonus].claimed = 1;
	    this.game.state.explorations[idx].prize = "Great Lakes";
	    this.updateLog(this.returnFactionName(faction) + " discovers the Great Lakes");
	    this.displayCustomOverlay("greatlakes", this.returnFactionName(faction));
	  }
	  if (bonus === 'mississippi') {
	    this.game.state.explorations[idx].resolved = 1;
	    this.game.state.explorations[idx].explorer_lost = 0;
	    this.game.state.newworld[bonus].faction = faction;
	    this.game.state.newworld[bonus].claimed = 1;
	    this.game.state.explorations[idx].prize = "Mississippi";
	    this.updateLog(this.returnFactionName(faction) + " discovers the Mississippi");
	    this.displayCustomOverlay("mississippi", this.returnFactionName(faction));
	  }
	  if (bonus === 'pacificstrait') {
	    this.game.state.explorations[idx].resolved = 1;
	    this.game.state.explorations[idx].explorer_lost = 1;
	    this.game.state.newworld[bonus].faction = faction;
	    this.game.state.newworld[bonus].claimed = 1;
	    this.game.state.explorations[idx].prize = "Pacific Strait";
	    this.updateLog(this.returnFactionName(faction) + " discovers the Pacific Strait");
	    this.displayCustomOverlay("pacificstrait", this.returnFactionName(faction));
	  }
	  if (bonus === 'amazon') {
	    this.game.state.explorations[idx].resolved = 1;
	    this.game.state.explorations[idx].explorer_lost = 1;
	    this.game.state.newworld[bonus].faction = faction;
	    this.game.state.newworld[bonus].claimed = 1;
	    this.game.state.explorations[idx].prize = "Amazon";
	    this.updateLog(this.returnFactionName(faction) + " discovers the Amazon");;
	    this.displayCustomOverlay("amazon", this.returnFactionName(faction));
	  }
	  if (bonus === 'circumnavigation') {

	    //
	    // circumnavigation attempt requires another roll here to claim
	    //
	    let base_x = this.rollDice(6) + this.rollDice(6);
	    let x = base_x + this.game.state.explorations[results_idx].modifiers;

	    this.updateLog("Circumnavigation Roll: " + x + " (" + base_x + "+" + this.game.state.explorations[idx].modifiers +")");

	    if (x > 9) {

	      //
	      // if follow-on attempt from Pacific Strait, add new exploration
	      //
	      if (this.game.state.explorations[idx].prize == "Pacific Strait") {
	        this.game.state.explorations.push({
	          faction : faction,
	          resolved :  0 ,
	          round :   this.game.state.round,
		  base_roll : base_x ,
		  modified_roll : x ,
		  explorer : explorer ,
		  explorer_img : this.explorers[explorer].img ,
		  base : base_x ,
		  total_hits : x ,
		  modifiers : this.game.state.explorations[idx].modifiers ,
		  prize : "-" , 
	        });
		idx = this.game.state.explorations.length-1;
	      }

	      this.updateLog("Circumnavigation Attempt succeeds: " + x + " rolled");
	      this.game.state.explorations[idx].resolved = 1;
	      this.game.state.explorations[idx].explorer_lost = 1;
	      this.game.state.newworld[bonus].faction = faction;
	      this.game.state.newworld[bonus].claimed = 1;
	      this.game.state.explorations[idx].prize = "Circumnavigation";
	      this.updateLog(this.returnFactionName(faction) + " circumnavigates the Globe");
	      this.displayCustomOverlay("circumnavigation", this.returnFactionName(faction));

	    } else {

	      //
	      // if follow-on attempt from Pacific Strait, add new exploration
	      //
	      if (this.game.state.explorations[idx].prize == "Pacific Strait") {
	        this.game.state.explorations.push({
	          faction : faction,
	          resolved :  0 ,
	          round :   this.game.state.round,
		  base_roll: base_x ,
		  modified_roll: x ,
		  explorer : explorer ,
		  explorer_img : this.explorers[explorer].img ,
		  base: base_x ,
		  total_hits : base_x + this.game.state.explorations[idx].modifiers ,
		  modifiers : this.game.state.explorations[idx].modifiers ,
		  prize : "" ,
	        });
	        idx = this.game.state.explorations.length-1;
	      }

	      this.updateLog("Circumnavigation Attempt fails: " + x + " rolled");
	      this.game.state.explorations[idx].resolved = 1;
	      this.game.state.explorations[idx].explorer_lost = 1;
	      this.game.state.explorations[idx].prize = "lost at sea";
	      this.updateLog(this.returnFactionName(faction) + " fails at Circumnavigation ("+x+")");
	      if (this.game.player == this.returnPlayerCommandingFaction(faction)) {
	        this.displayCustomOverlay("lost-at-sea", this.returnFactionName(faction));
	      }
	    }
	  }

	  this.displayVictoryTrack();
	  this.displayNewWorld();

	  return 1;
	}

	if (mv[0] === "resolve_new_world_riches_rolls") {

	  this.updateStatus("Resolving New World Riches...");

	  //
	  // show overlay
	  //
	  this.winter_overlay.render("newworld1");

	  this.updateLog("************************");
	  this.updateLog("*** New World Riches ***");
	  this.updateLog("************************");

	  // reset expected bonuses
	  this.game.state.new_world_bonus = {};
	  this.game.state.new_world_bonus['england'] = 0;
	  this.game.state.new_world_bonus['france'] = 0;
	  this.game.state.new_world_bonus['hapsburg'] = 0;
	  this.game.state.new_world_bonus['protestant'] = 0;
	  this.game.state.new_world_bonus['ottoman'] = 0;
	  this.game.state.new_world_bonus['papacy'] = 0;
	

	  //////////////
	  // COLONIES //
	  //////////////
	  for (let z = 0; z < this.game.state.colonies.length; z++) {

	    let c = this.game.state.colonies[z];
	    let x = this.rollDice(6) + this.rollDice(6);
	    c.base_roll = x;

	    if (this.game.state.plantations[c.faction] == 1) { x++; }
	    if (c.name === "Potosi Silver Mines") { x++; }

	    if (x <= 4) { 
	      c.prize = "destroyed";
	      c.destroyed = 1; 
	      this.game.state.newworld[c.colony].claimed = 0; 
	    }

	    if (x >= 8) { 
	      if (this.game.state.galleons[c.faction] == 1) { x++; }
	    }

	    if (x >= 9) { 
	      c.prize = "bonus card";
	      this.game.state.new_world_bonus[c.faction]++;
	    }

	    c.modified_roll = x;

	  }


	  ///////////////
	  // CONQUESTS //
	  ///////////////
	  for (let i = 0; i < this.game.state.conquests.length; i++) {
	    let c = this.game.state.conquests[i];

	    if (c.prize.indexOf("Maya") > -1 && c.depleted != 1) {
	      let x = this.rollDice(6) + this.rollDice(6);
	      c.bonus_base_roll = x;
	      if (x <= 6) {
		c.depleted = 1;
	      }
	      if ((x == 7 && this.game.state.galleons[c.faction] == 1) || x > 7) {
		this.game.state.new_world_bonus[c.faction]++;
		c.bonus_prize = "bonus card";
	      }
	    }

	    if (c.prize.indexOf("Aztec") > -1 && c.depleted != 1) {
	      let x = this.rollDice(6) + this.rollDice(6);
	      c.bonus_base_roll = x;
	      if (x <= 5) {
		c.depleted = 1;
	      }
	      if ((x == 7 && this.game.state.galleons[c.faction] == 1) || x > 7) {
		this.game.state.new_world_bonus[c.faction]++;
		c.bonus_prize = "bonus card";
	      }
	    }

	    if (c.prize.indexOf("Inca") > -1 && c.depleted != 1) {
	      let x = this.rollDice(6) + this.rollDice(6);
	      c.bonus_base_roll = x;
	      if (x <= 5) {
		c.depleted = 1;
	      }
	      if (x == 6 || (x == 7 && this.game.state.galleons[c.faction] == 1) || x > 7) {
		this.game.state.new_world_bonus[c.faction]++;
		c.bonus_prize = "bonus card";
	      }
	    }

	  }

	  //
	  // huguenaut raiders
	  //
	  for (let i = 0; i < this.game.state.new_world_bonus["hapsburg"]; i++) {
	    let stolen = 0;
	    if (parseInt(his_self.game.state.raiders['france']) == 1) {
	      let x = rollDice(6);
	      his_self.updateLog("French Raiders roll " + x);	
	      if (x == 1) {
	        his_self.updateLog("French Raiders eliminated");	
		his_self.game.state.raiders['france'] = 0;
	      }
	      if (x == 2 && his_self.game.state.galleons['hapsburg'] == 1) {
	        his_self.updateLog("French Raiders eliminated");	
		his_self.game.state.raiders['france'] = 0;
	      }
	      if (x == 3 || x == 4) {
	        his_self.updateLog("French Raiders unsuccessful");	
	      }
	      if (x == 5) {
	        his_self.updateLog("French Raiders steal Hapsburg shipment");	
		his_self.game.state.raiders['france'] = 0;
		his_self.game.state.new_world_bonus['hapsburg']--;
		his_self.game.state.new_world_bonus['france']++;
		stolen = 1;
	      }
	      if (x == 6) {
	        his_self.updateLog("French Raiders steal Hapsburg shipment");	
		his_self.game.state.new_world_bonus['hapsburg']--;
		his_self.game.state.new_world_bonus['france']++;
		stolen = 1;
	      }
	    }
	    if (stolen == 0 && parseInt(his_self.game.state.raiders['england']) == 1) {
	      let x = rollDice(6);
	      his_self.updateLog("English Raiders roll " + x);	
	      if (x == 1) {
	        his_self.updateLog("English Raiders eliminated");	
		his_self.game.state.raiders['england'] = 0;
	      }
	      if (x == 2 && his_self.game.state.galleons['hapsburg'] == 1) {
	        his_self.updateLog("English Raiders eliminated");	
		his_self.game.state.raiders['england'] = 0;
	      }
	      if (x == 3 || x == 4) {
	        his_self.updateLog("English Raiders unsuccessful");	
	      }
	      if (x == 5) {
	        his_self.updateLog("English Raiders steal Hapsburg shipment");	
		his_self.game.state.raiders['england'] = 0;
		his_self.game.state.new_world_bonus['hapsburg']--;
		his_self.game.state.new_world_bonus['england']++;
		stolen = 1;
	      }
	      if (x == 6) {
	        his_self.updateLog("English Raiders steal Hapsburg shipment");	
		his_self.game.state.new_world_bonus['hapsburg']--;
		his_self.game.state.new_world_bonus['england']++;
		stolen = 1;
	      }
	    }
	    if (stolen == 0 && parseInt(his_self.game.state.raiders['protestant']) == 1) {
	      let x = rollDice(6);
	      his_self.updateLog("Protestant Raiders roll " + x);	
	      if (x == 1) {
	        his_self.updateLog("Protestant Raiders eliminated");	
		his_self.game.state.raiders['protestant'] = 0;
	      }
	      if (x == 2 && his_self.game.state.galleons['hapsburg'] == 1) {
	        his_self.updateLog("Protestant Raiders eliminated");	
		his_self.game.state.raiders['protestant'] = 0;
	      }
	      if (x == 3 || x == 4) {
	        his_self.updateLog("Protestant Raiders unsuccessful");	
	      }
	      if (x == 5) {
	        his_self.updateLog("Protestant Raiders steal Hapsburg shipment");	
		his_self.game.state.raiders['protestant'] = 0;
		his_self.game.state.new_world_bonus['hapsburg']--;
		his_self.game.state.new_world_bonus['protestant']++;
		stolen = 1;
	      }
	      if (x == 6) {
	        his_self.updateLog("Protestant Raiders steal Hapsburg shipment");	
		his_self.game.state.new_world_bonus['hapsburg']--;
		his_self.game.state.new_world_bonus['protestant']++;
		stolen = 1;
	      }
	    }
	  }

	  this.newworld_overlay.render("results");
    	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "resolve_new_world_conquests") {
    	  this.game.queue.splice(qe, 1);
	  this.updateStatus("Resolving New World Conquests...");
	  return this.resolveConquests();
        }
	if (mv[0] === "resolve_new_world_colonies") {
    	  this.game.queue.splice(qe, 1);
	  this.updateStatus("Establishing New World Colonies...");
	  return this.resolveColonies();
        }
	if (mv[0] === "resolve_new_world_explorations") {
    	  this.game.queue.splice(qe, 1);
	  this.updateStatus("Resolving New World Exploration Attempts...");
	  return this.resolveExplorations();
        }

	if (mv[0] === "resolve_conquest") {

    	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let idx = parseInt(mv[1]);
	  let faction = this.game.state.conquests[idx].faction;
	  let conquistador = this.game.state.conquests[idx].conquistador;
	  let hits = this.game.state.conquests[idx].hits;
	  let unmodified_hits = hits;
	  this.game.state.conquests[idx].resolved = 1;

	  this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " rolls " + unmodified_hits);

	  if (hits <= 6) {
	    if (this.game.player == this.returnPlayerCommandingFaction(faction)) {
	      this.displayCustomOverlay("killed", faction);
	    }
	    this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " killed by natives");
	    this.game.state.conquests[idx].conquistador_lost = 1;
	    this.game.state.conquests[idx].prize = "killed";
	    this.game.state.conquests[idx].active = 0;
	  }
	  if (hits > 6 && hits <= 8) {
	    this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " makes no conquest");
	    this.game.state.conquests[idx].prize = "-";
	  }
	  if (hits >= 9) {
	    while (hits > 11) { hits--; }
	    if (hits >= 11) {
	      if (this.game.state.newworld['inca'].claimed != 1) {
	        this.game.state.newworld['inca'].claimed = 1;
	        this.game.state.newworld['inca'].faction = faction;
		this.game.state.conquests[idx].prize = "Incan Empire";
	        this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " conquers the Inca (2VP)");
	        this.displayCustomOverlay("inca", this.returnFactionName(faction));
	        this.game.state.conquests[idx].active = 1;
	      } else {
		while (hits > 10) { hits--; }
	      }
	    }
	    if (hits == 10) {
	      if (this.game.state.newworld['aztec'].claimed != 1) {
	        this.game.state.newworld['aztec'].claimed = 1;
	        this.game.state.newworld['aztec'].faction = faction;
		this.game.state.conquests[idx].prize = "Aztec Empire";
	        this.game.state.conquests[idx].active = 1;
	        this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " conquers the Aztec (2VP)");
	        this.displayCustomOverlay("aztec", this.returnFactionName(faction));
	      } else { 
		while (hits >= 10) { hits--; }
	      }
	    }
	    if (hits == 9) {
	      if (this.game.state.newworld['maya'].claimed != 1) {
	        this.game.state.newworld['maya'].claimed = 1;
	        this.game.state.newworld['maya'].faction = faction;
		this.game.state.conquests[idx].prize = "Mayan Empire";
	        this.game.state.conquests[idx].active = 1;
	        this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " conquers the Maya (1VP)");
	        this.displayCustomOverlay("maya", this.returnFactionName(faction));
	      } else {
		this.game.state.conquests[idx].prize = "-";
	        this.updateLog(this.returnFactionName(faction) + ": " + conquistador + " makes no conquest");
	      }
	    }
	  }

	  // conquests don't offer choice, so return for immediate execution
	  return 1;
        }


	if (mv[0] === "resolve_exploration") {

    	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let idx = parseInt(mv[1]);
	  let results_idx = 0;

	  let faction = this.game.state.explorations[idx].faction;
	  let explorer = this.game.state.explorations[idx].explorer;
	  let hits = this.game.state.explorations[idx].hits;
	  let prize = "";
	  this.game.state.explorations[idx].resolved = 1;

	  this.updateStatus("Resolving "+this.returnFactionName(faction) + " Exploration Attempt...");

	  if (hits <= 4) {
	    this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " lost at sea");
	    this.game.state.explorations[idx].prize = "lost at sea";
	    this.game.state.explorations[idx].explorer_lost = 1;

	    // remove Cabot if he dies at sea
	    if (explorer.indexOf("cabot") > -1) { this.removeCardFromGame("099"); }

	  }
	  if (hits > 4 && hits <= 6) {
	    this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " makes no discovery");
	  }
	  if (hits > 6 && hits <= 9) {
	    if (hits == 9) {
	      if (this.game.state.newworld['mississippi'].claimed != 1) {
	        this.game.state.newworld['mississippi'].claimed = 1;
	        this.game.state.newworld['mississippi'].faction = faction;
	        this.game.state.explorations[idx].prize = "Mississippi";
	        this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " discovers the Mississippi (1VP)");
		this.displayCustomOverlay("mississippi", this.returnFactionName(faction));
	      } else { 
		hits--;
	      }
	    }
	    if (hits == 8) {
	      if (this.game.state.newworld['greatlakes'].claimed != 1) {
	        this.game.state.newworld['greatlakes'].claimed = 1;
	        this.game.state.newworld['greatlakes'].faction = faction;
	        this.game.state.explorations[idx].prize = "Great Lakes";
	        this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " discovers the Great Lakes (1VP)");
		this.displayCustomOverlay("greatlakes", this.returnFactionName(faction));
	      } else { 
		hits--;
	      }
	    }
	    if (hits == 7) { 
	      if (this.game.state.newworld['stlawrence'].claimed != 1) {
	        this.game.state.newworld['stlawrence'].claimed = 1;
	        this.game.state.newworld['stlawrence'].faction = faction;
	        this.game.state.explorations[idx].prize = "St. Lawrence";
	        this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " discovers the St. Lawrence (1VP)");
		this.displayCustomOverlay("stlawrence", this.returnFactionName(faction));
	      } else {
	        this.game.state.explorations[idx].prize = "-";
	        this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " makes no discovery");
	      }
	    }
	  }

	  if (hits >= 10) {

	    //
	    // nope out if nothing to claim
	    //
	    if (this.game.state.newworld['stlawrence'].claimed == 1 && this.game.state.newworld['greatlakes'].claimed == 1 && this.game.state.newworld['mississippi'].claimed == 1 && this.game.state.newworld['amazon'].claimed == 1 && this.game.state.newworld['circumnavigation'].claimed == 1) {
	      this.updateLog(this.returnFactionName(faction) + ": " + this.returnExplorerName(explorer) + " makes no discovery");
	      this.game.state.explorations[idx].prize = "-";
	      return 1;
	    }

	    //
	    // otherwise we give the successful faction a manual choice
	    //
	    if (this.game.player == this.returnPlayerCommandingFaction(faction)) {

	      let msg = `${this.returnFactionName(faction)} - Choose Discovery:`;
	      let html = '<ul>';
	      if (this.game.state.newworld['stlawrence'].claimed != 1) {
		html += '<li class="option" id="stlawrence">St. Lawrence (1 VP)</li>';
	      }
	      if (this.game.state.newworld['greatlakes'].claimed != 1) {
		html += '<li class="option" id="greatlakes">The Great Lakes (1 VP)</li>';
	      }
	      if (this.game.state.newworld['mississippi'].claimed != 1) {
		html += '<li class="option" id="mississippi">The Mississippi (1 VP)</li>';
	      }
	      if (this.game.state.newworld['amazon'].claimed != 1) {
		html += '<li class="option" id="amazon">The Amazon (2VP, explorer retires)</li>';
	      }
	      if (this.game.state.newworld['circumnavigation'].claimed != 1) {
		let vp_at_stake = "2";
		if (this.game.state.newworld['pacificstrait'].claimed != 1) { vp_at_stake = "2-4"; }
		html += `<li class="option" id="circumnavigation">Attempt Circumnavigation (${vp_at_stake}VP, explorer retires)</li>`;
	      }

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {
                $('.option').off();
                his_self.updateStatus("acknowledge...");
                let action = $(this).attr("id");

                his_self.addMove("award_exploration_bonus\t"+faction+"\t"+explorer+"\t"+idx+"\t"+action);
		if (action == 'circumnavigation' && his_self.game.state.newworld['pacificstrait'].claimed != 1) {
                  his_self.addMove("award_exploration_bonus\t"+faction+"\t"+explorer+"\t"+idx+"\t"+'pacificstrait');
		}

                his_self.endTurn();
              });

	    }
	  
	    return 0;

	  }
	  return 1;
	}


	if (mv[0] === "conquer") {
	  let faction = mv[1];
	  this.game.state.conquests.push({
	    faction : faction,
	    resolved :  0 ,
	    round :   this.game.state.round,
	  });
	  this.updateLog(this.returnFactionName(faction) + " launches a conquest");
	  this.displayCustomOverlay("conquest", faction);
          this.game.state.may_conquer[faction] = 0;
    	  this.game.queue.splice(qe, 1);
	  this.displayConquest();
	  return 1;
	}


	if (mv[0] === "is_testing") {

	  // SCHMALKALDIC LEAGUE
	  let deck = this.returnDeck(true);
	  deck['013'].onEvent(this, "protestant");

//
// this should be handled in setup now
//
/***
	  if (this.game.players.length > 2) {
	    this.addCard("ottoman", "033");
	  }
          this.addCard("papacy", "035");
          this.addCard("papacy", "036");
          this.addCard("papacy", "032");
          this.addCard("papacy", "029");
          this.addCard("protestant", "026");
          this.addCard("protestant", "027");
          this.addCard("protestant", "033");
          this.addCard("protestant", "025");

	  this.controlSpace("papacy", "linz");
	  this.controlSpace("papacy", "vienna");
	  this.controlSpace("papacy", "graz");
	  this.controlSpace("papacy", "trieste");
	  this.controlSpace("papacy", "venice");
***/
    	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "is_1532") {

	  // SCHMALKALDIC LEAGUE
	  let deck = this.returnDeck(true);
	  deck['013'].onEvent(this, "protestant");

    	  this.game.queue.splice(qe, 1);
	  return 1;

	}


        
        if (mv[0] === "reshuffle_diplomacy_deck") {
          
          this.game.queue.splice(qe, 1);
          
          //
          // DECKRESTORE copies backed-up back into deck
          //
          this.game.queue.push("SHUFFLE\t2");
          this.game.queue.push("DECKRESTORE\t2");          

          for (let i = this.game.state.players_info.length; i > 0; i--) {
            this.game.queue.push("DECKENCRYPT\t2\t"+(i));
          } 
          for (let i = this.game.state.players_info.length; i > 0; i--) {
            this.game.queue.push("DECKXOR\t2\t"+(i));
          }
          
          //
          // re-add discards
          //  
          let discards = {};
          for (let i in this.game.deck[1].discards) {
            discards[i] = this.game.deck[1].cards[i];
            delete this.game.deck[1].cards[i];
          } 
          this.game.deck[1].discards = {};
        
          //  
          // our deck for re-shuffling
          //
          let reshuffle_cards = {};
          for (let key in discards) { reshuffle_cards[key] = discards[key]; }

console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");
          this.game.queue.push("DECK\t2\t"+JSON.stringify(reshuffle_cards));

          // backup any existing DECK #2
          this.game.queue.push("DECKBACKUP\t2");

        }



	if (mv[0] === "diplomacy_submit_proposal") {
	  let p = JSON.parse(mv[1]);
	  this.game.state.diplomacy.push(p);
	  this.game.queue.splice(qe, 1);
	  return 1;
	}


        if (mv[0] === "diplomacy_card_event") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.updateStatus(this.returnFactionName(faction) + " plays " + this.popup(card));
          this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card));
          this.cardbox.hide();

	  this.game.queue.splice(qe, 1);

          let lqe = qe-1;
          if (lqe >= 0) {
            let lmv = this.game.queue[lqe].split("\t");
            if (lmv[0] == "diplomacy_card_event") {
	      this.game.queue.splice(lqe, 1);
	    }
	  }

	  if (!this.diplomatic_deck[card].onEvent(this, faction)) { return 0; }

	  return 1;

	}



        if (mv[0] === "event") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);
          this.game.state.cards_evented.push(card);

          this.updateLog(this.returnFactionName(faction) + " triggers " + this.popup(card));

	  if (!this.deck[card].onEvent(this, faction)) { return 0; }

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

        if (mv[0] === "ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);
 
          this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card) + " for ops");

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayOps(card, faction, opsnum);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing ops");
	  }

	  return 0;

	}

        if (mv[0] === "lock") {

	  let faction = mv[1];
	  let source = mv[2];

	  this.game.queue.splice(qe, 1);

	  for (let i = 0; i < this.game.spaces[source].units[faction].length; i++) {
	    this.game.spaces[source].units[faction][i].locked = 1;
	  }

          return 1;

        }


        if (mv[0] === "move") {

	  let faction = mv[1];
	  let movetype = mv[2];
	  let source = mv[3];
	  let destination = mv[4];
	  let unitidx = parseInt(mv[5]);
	  let skip_avoid_battle = 0;
	  if (mv[6]) { skip_avoid_battle = parseInt(mv[6]); }
	  let is_this_an_interception = 0;
	  if (parseInt(mv[7]) > 0) { is_this_an_interception = 1; }


	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);

	  this.game.queue.splice(qe, 1);

	  if (this.game.state.active_player == this.returnPlayerCommandingFaction(faction)) {
	    this.game.state.attacker_comes_from_this_spacekey = mv[3];
	    this.game.state.player_last_move = "move";
	    this.game.state.player_last_spacekey = destination;
	  }

	  //
	  // winter retreat into port
	  //
	  if (movetype === "port") {

	    let units = this.game.navalspaces[source].units[faction];

	    for (let z = 0; z < units.length; z++) {
	      this.game.spaces[destination].units[faction].push(units[z]);
	    }

	    this.game.navalspaces[source].units[faction] = [];
	    this.displaySpace(source);
	    this.displaySpace(destination);

	  }

	  //
	  // movement at sea
	  //
	  if (movetype === "sea") {

	    //
	    // source = land, destination = sea
	    //
	    if (this.game.spaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.spaces[source].units[faction][unitidx];
 	      unit_to_move.already_moved = 1;
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
	      let actual_unitidx = 0;
	      for (let i = 0; i < this.game.navalspaces[source].units[faction].length; i++) {
		if (this.game.navalspaces[source].units[faction][i].idx === unitidx) {
		  actual_unitidx = i;
		};
	      }

	      let unit_to_move = this.game.navalspaces[source].units[faction][actual_unitidx];
 	      unit_to_move.already_moved = 1;
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(actual_unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = land
	    //
	    if (this.game.navalspaces[source] && this.game.spaces[destination]) {

	      let actual_unitidx = 0;
	      for (let i = 0; i < this.game.navalspaces[source].units[faction].length; i++) {
		if (this.game.navalspaces[source].units[faction][i].idx === unitidx) {
		  actual_unitidx = i;
		};
	      }

	      let unit_to_move = this.game.navalspaces[source].units[faction][actual_unitidx];
 	      unit_to_move.already_moved = 1;
              this.game.spaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(actual_unitidx, 1);
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

	    //
	    // a single move might trigger multiple combat attempts, so we need to loop backwards and 
	    // run this check for each destination.
	    //
	    let current_destination = destination;
	    let current_faction = faction;
            if (qe > 0) {
              let lmv2 = this.game.queue[qe-1].split("\t");
              if (lmv2[0] == "naval_interception_check") {
	  
	        for (let lqe = qe-1; lqe >= 0; lqe--) {

                  let lmv = this.game.queue[lqe].split("\t");
                  if (lmv[0] == "naval_interception_check") {

		    current_faction = lmv[1];
		    current_destination = lmv[2];
		    current_source = lmv[3];

		    let cdest;
	            if (this.game.spaces[current_destination]) {
	              cdest = this.game.spaces[current_destination];
	            }
	            if (this.game.navalspaces[current_destination]) {
	              cdest = this.game.navalspaces[current_destination];
	            }

                    for (let f in cdest.units) {
                      if (cdest.units[f].length > 0 && f != faction) {
                        anyone_else_here = 1;
                      }
                      if (f !== faction && cdest.units[f].length > 0 && this.areEnemies(f, faction)) {
                        if (lqe-1 >= 0) {
                          // added in reverse order
                          if (skip_avoid_battle != 1) {
                            this.game.queue.splice(lqe, 0, "naval_retreat_check\t"+current_faction+"\t"+current_destination+"\t"+current_source);
                          }
                          this.game.queue.splice(lqe, 0, "RESETCONFIRMSNEEDED\tall");
                          this.game.queue.splice(lqe, 0, "counter_or_acknowledge\tNaval Battle is about to begin in "+this.returnSpaceName(current_destination) + "\tnaval_battle");
                          this.game.queue.splice(lqe, 0, "naval_battle\t"+current_destination+"\t"+faction);
                        }
                      }
                    }
                  } else {
                    //
                    // we only update the occupier of the space if the next move is not a "move"
                    // as we require interception check to find out if there are units here already.
                    //
                    if (lmv[0] !== "move" && lqe === (qe-1)) {
                      if (anyone_else_here == 0) {
                        space.occupier = faction;
                      }
		    }
	          }
	        }
	      }
	    }
	  }

	  //
	  // movement on land
	  //
	  if (movetype === "land") {

	    let unit_to_move = this.game.spaces[source].units[faction][unitidx];
 	    unit_to_move.already_moved = 1;
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
	    let number_opposing_land_units = 0;

	    let lqe = qe-1;
	    if (lqe >= 0) {

	      let lmv = this.game.queue[lqe].split("\t");

	      //
	      // this space is not already besieged but it is possible that someone might
	      // intercept and trigger a field battle. This bit of code is confusing queue-management
	      // that screws around with the queue to ensure that commands are added only when 
	      // the last unit has moved into the space.
	      //

	      //
	      // we avoid the field battle and complicated nonsense if moving troops into a foreign war
	      //
	      if (space.key != "persia" && space.key != "egypt" && space.key != "ireland") {

		//
		// this is the last "move" that we will have to process, so this is the point
		// where we check to see if we have to have a field battle, etc. or whether 
		// we need to break the siege.
		//
	        if (lmv[0] == "interception_check" && space.besieged == 0) { // not already besieged

		  //
		  // do we need to break a seige in the place from which we are moving?
		  //
		  let source_space = this.game.spaces[source];
		  let hoiluis = this.returnHostileOrIndependentLandUnitsInSpace(faction, source_space);
		  let myluis = this.returnFactionLandUnitsInSpace(faction, source_space);
		  if (hoiluis > myluis) {
		    let fac = this.returnFactionControllingSpace(source_space);
		    this.game.queue.push("ACKNOWLEDGE\t"+this.returnFactionName(faction) + " retreats after siege broken!");
	            this.game.queue.push("remove_siege\t"+source);
	            this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+fac+"\t"+faction+"\t"+source);
		    this.game.queue.push("player_evaluate_break_siege_retreat_opportunity\t"+faction+"\t"+source);
		  }


	          for (let f in space.units) {

		    // we check not only for NO units, but for NUM land units
	            if (space.units[f].length > 0 && f != faction) {
		      anyone_else_here = 1;
		      for (let z = 0; z < space.units[f].length; z++) {
		        let u = space.units[f][z];
		        if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry") { number_opposing_land_units++; }
		      }
	            }

	            if (f !== faction && this.returnFactionLandUnitsInSpace(f, space) > 0 && !this.areAllies(f, faction)) {

		      if (lqe-1 >= 0) {

			//
		        // added in reverse order
			//
		        if (skip_avoid_battle != 1) {
			  //
		 	  // inactive faction indicates interception - neither retreat nor fortification
			  // should be offered because this movement invovles a player moving defensively
			  // into a space and this move is triggered by another active player, which means
			  // we need a field battle.
			  //
			  if (!is_this_an_interception) {
			    //
			    // active faction
			    //
	                    this.game.queue.splice(lqe, 0, "retreat_check\t"+faction+"\t"+destination+"\t"+source);
			    if (space.besieged == 0) {
	                      this.game.queue.splice(lqe, 0, "fortification_check\t"+faction+"\t"+destination+"\t"+source);
			    } else {
			    }
			  } else {

			  }
		        }

		        //
		        // "move" is used by the intercept command, so we do not want intercepts to be changing the 
		        // software's concept of which faction is the attacker. for this reason, if the active player
		        // is present in the space, we treat them as the attacker.
		        //
		        if (this.returnFactionLandUnitsInSpace(this.game.state.active_faction, space.key) > 0) {
	                  this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+this.game.state.active_faction);
		        } else {
	                  this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+faction);
	                }
	              }
	            }
	          }

		  if ((anyone_else_here == 0 || number_opposing_land_units == 0) && (space.type == "electorate" || space.type == "key" || this.isSpaceFortified(space.key) || space.type == "fortress")) {
		    let f = this.returnFactionControllingSpace(space.key);

		    if (!this.areAllies(f, faction) && f !== faction) {
		      if (space.besieged != 1) { // not if already besieged
		        //
		        // besiege the defenders, and lock the attackers (preventing further movement)
		        //
		        for (let z = 0; z < space.units[f].length; z++) {
			  if (!space.units[f][z].reformer) { space.units[f][z].besieged = true; }
		        }
		        for (let z = 0; z < space.units[faction].length; z++) {
			  if (!space.units[faction][z].reformer) { space.units[faction][z].locked = 1; }
		        }
	 	        space.besieged = 2;
		        this.displaySpace(space.key);
		      }
		    }

	          }

	        } else {

		  //
		  // no-one is around to intercept, but is this assaultable
		  //
		  if (space.type == "electorate" || space.type == "key" || this.isSpaceFortified(space.key) || space.type == "fortress") {
		    let f = this.returnFactionControllingSpace(space.key);
		    if (this.returnFactionLandUnitsInSpace(f, space.key, 1) == 0) {
 		      if (!this.areAllies(f, faction) && f !== faction) {
		        if (space.besieged != 1) { // not if already besieged
	 	          space.besieged = 2;
		          this.displaySpace(space.key);
		        }
		      }
		    }
	          }

		  //
		  // on the very last move we check to see if there are any enemy factions in the 
		  // space and trigger a field battle, deciding first whether the existing forces
		  // are capable of retreating or fortifying.
		  //
		  if (lmv[0] !== "move") {
		    // occupier is antequated
		    space.occupier = faction;

		    let field_battle_triggered = false;

console.log("#");
console.log("#");
console.log("# no-one is around to intercept and we need to check for battle...");
console.log("# skip_avoid_battle: " + skip_avoid_battle);
console.log("#");

		    //
		    // relief forces showing up
		    //
		    for (let f in space.units) {
 		      if (!this.areAllies(f, faction, 1) && f !== faction) {
		        if (this.returnFactionLandUnitsInSpace(f, space.key, 1) > 0 && field_battle_triggered == false) {

			  //
			  // if all the units are besieged we skip field battle because attacker needs to assault
			  //
			  let is_anyone_not_besieged = false;
			  let is_anyone_besieged = false;
			  let is_defender_the_one_who_is_besieged = false;

			  for (let z = 0; z < space.units[f].length; z++) {
			    if (!space.units[f][z].besieged) {
			      is_anyone_not_besieged = true;
			    } else {
			      is_anyone_besieged = true;
			      if (!this.areAllies(f, faction)) { 
				is_defender_the_one_who_is_besieged = true;
			      }
			    }
			  }

			  if (is_anyone_not_besieged) {

console.log(" # --> is anyone not besieged");

			    field_battle_triggered = true;

			    //
			    // but maybe no-one is besieged, in which case we want to offer fortification option
			    // to the defender.
			    //
			    if (is_defender_the_one_who_is_besieged != true) {
	                      this.game.queue.splice(lqe, 0, "fortification_check\t"+faction+"\t"+destination+"\t"+source);
	                      this.game.queue.splice(lqe, 0, "retreat_check\t"+faction+"\t"+destination+"\t"+source);
			    } else {

		              //
		              // someone else is here, so let's trigger a field battle
		              //
			      if (!is_this_an_interception) {
	                        this.game.queue.splice(lqe, 0, "relief_forces\t"+faction+"\t"+destination);
	                        this.game.queue.splice(lqe, 0, "retreat_check\t"+faction+"\t"+destination+"\t"+source);
		              }

			    }


			    //
		            // "move" is used by the intercept command, so we do not want intercepts to be changing the 
		            // software's concept of which faction is the attacker. for this reason, if the active player
		            // is present in the space, we treat them as the attacker.
		            //
		            if (this.returnFactionLandUnitsInSpace(this.game.state.active_faction, space.key) > 0) {
	                      this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+this.game.state.active_faction);
		            } else {
	                      this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+faction);
	                    }
		          }
		        }
		      }
		    }
		  }
	        }
	      } // persia, egypt and irelance
	    }

	    //
	    // did moving remove a siege? check
	    //
	    if (!this.isSpaceBesieged(source)) {
	      this.removeSiege(source);
	    }

	    this.displaySpace(source);
	    this.displaySpace(destination);

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

	  if (space.type !== "electorate" && space.type !== "key" && space.type !== "fortress") {
	    return 1;
	  }

	  //
	  // no units, no fortification check
	  //
	  let fluis = 0;
	  for (let f in this.game.spaces[spacekey].units) {
	    if (f !== attacker && !this.areAllies(this.game.state.active_faction, f, 1)) {
	      fluis += this.returnFactionLandUnitsInSpace(f, spacekey);
	    }
	  }
	  if (fluis == 0) { return 1; }


	  //
	  // whoever is being attacked can retreat into the fortification if they
	  // have 4 or less land units
	  //
	  for (let f in this.game.spaces[spacekey].units) {
	    if (f !== attacker && this.isSpaceControlled(spacekey, f) && !this.areAllies(this.game.state.active_faction, f, 1)) {

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

		      let cp = this.returnPlayerCommandingFaction(cf);

		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+mp+"\t"+spacekey);

		    }

	          } else {

		    //
		    // major or independent power - some player decides
		    //
		    let cp = this.returnPlayerCommandingFaction(f);

		    if (cp != 0) {
		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+f+"\t"+spacekey);


		    } else {

	              //
		      // independent key
	              //
	              // non-player controlled, minor power or independent, so auto-handle
	              //
	              // If there are 4 or fewer land units in a space, they will always withdraw into
	              // the fortifications and try to withstand a siege if their space is entered.
	              // if there are 5 or more land units,they will hold their ground and fight a field
	              // battle. If they lose that field battle, do not retreat their units from the
	              // space as usual. Instead, they retain up to 4 units which withdraw into the
	              // fortifications; all other land units in excess of 4 are eliminated.
	              //
	              // fortify everything
	              //
	              his_self.game.queue.push("NOTIFY\t" + his_self.returnFactionName(f) + " fortifies in " + his_self.returnSpaceName(spacekey));
	              for (let i = 0; i < space.units[f].length; i++) {
	                his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+f+"\t"+JSON.stringify(space.units[f][i]));
	              }
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

        if (mv[0] === "post_field_battle_player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
          let space = this.game.spaces[spacekey];

	  //
	  // if no-one is left to fortify
	  //
	  if (this.game.state.field_battle.defender_land_units_remaining <= 0 && this.game.state.field_battle_attacker_land_units_remaining > 0) {
	    //
	    // immediately besiege if a key
	    //
	    if (space.type === "fortress" || space.type === "electorate" || space.type === "key") {
	      if (space.besieged != 1) { // not if already besieged
                space.besieged = 2; // 2 = cannot attack this round
                space.besieged_factions.push(faction);
	      }
	    }
	    this.displaySpace(spacekey);
	    return 1;
	  }

	  //
	  // if this is not a fortified space, clear and continue
	  //
	  if (space.type !== "fortress" && space.type !== "electorate" && space.type !== "key") {
	    return 1;
	  }

	  //
	  // this was a relief battle, but no formerly-besieged units survived
	  //
	  if (this.game.state.field_battle.relief_battle) {
	    let did_anyone_survive = false;
	    for (let key in space.units) {
	      for (let z = 0; z < space.units[key].length; z++) {
		if (space.units[key][z].relief_force == 1) { did_anyone_survive = true; }
	      }
	    }
	    if (!did_anyone_survive) {
	      return 1;
	    }
	  }

	  //
	  // otherwise, we have to evaluate fortifying
	  //
	  if (this.game.player == player) {
	    this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	    this.playerEvaluateFortification(attacker, faction, spacekey, 1); // 1 = post battle
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	      this.field_battle_overlay.updateInstructions(faction + " considering fortification");
	      this.updateStatus(this.returnFactionName(faction) + " considering fortification");
	    } else {

	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field
	      // battle. If they lose that field battle, do not retreat their units from the
	      // space as usual. Instead, they retain up to 4 units which withdraw into the
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
      	      // this only runs after we have had a battle, so we fortify everything if we still
	      // exist.
      	      //
	      //
	      // fortify everything
	      //
	      for (let i = 0; i < space.units[faction].length; i++) {
	        his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	      }
	      return 1;
	    }
	  }

          return 0;

	}


        if (mv[0] === "player_publish_treatise") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  if (faction == "england") {
	    if (this.game.players.length == 2) { faction = "protestant"; }
	    if (this.game.player === this.returnPlayerCommandingFaction(faction)) {
	      this.playerPublishTreatise(this, this.game.player, "england");
	    }
	  }
	
	  return 0;

	}

	

        if (mv[0] === "player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
	  let space = this.game.spaces[spacekey];

	  let decider = this.returnPlayerCommandingFaction(faction);
	  if (decider > 0) {
	    if (this.game.player == decider) {
	      this.playerEvaluateFortification(attacker, faction, spacekey);
	    } else {
	      this.updateStatus(this.returnFactionName(faction) + " considering fortification");
	    }
	    return 0;
	  } else {
	    //
	    // non-player controlled, minor power or independent, so auto-handle
	    //
	    // If there are 4 or fewer land units in a space, they will always withdraw into
	    // the fortifications and try to withstand a siege if their space is entered.
	    // if there are 5 or more land units,they will hold their ground and fight a field
	    // battle. If they lose that field battle, do not retreat their units from the
	    // space as usual. Instead, they retain up to 4 units which withdraw into the
	    // fortifications; all other land units in excess of 4 are eliminated.
      	    //
      	    // this only runs after we have had a battle, so we fortify everything if we still
	    // exist.
      	    //
	    //
	    // fortify everything
	    //
	    for (let i = 0; i < space.units[faction].length; i++) {
	      his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	    }
	    return 1;
	  }

	}


	if (mv[0] === "unfortify_unit_by_index") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let unit_idx = parseInt(mv[3]);
	  let space = this.game.spaces[spacekey];

	  space.units[faction][unit_idx].relief_force = 0;
	  space.units[faction][unit_idx].besieged = 0;

	  this.displaySpace(spacekey);

	  return 1;

	}
	if (mv[0] === "fortify_unit_by_index") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let unit_idx = parseInt(mv[3]);
	  let space = this.game.spaces[spacekey];

	  if (space.besieged != 1) { // not if already besieged
            space.besieged = 2; // 2 = cannot attack this round
            space.besieged_factions.push(faction);
	  }
	  space.units[faction][unit_idx].besieged = 1;

	  this.displaySpace(spacekey);

	  return 1;

	}

	if (mv[0] === "fortify_unit") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let units = JSON.parse(mv[3]);
	  let space = this.game.spaces[spacekey];

	  if (space.besieged != 1) { // not if already besieged
            space.besieged = 2; // 2 = cannot attack this round
            space.besieged_factions.push(faction);
	  }
	  for (let i = 0; i < space.units[faction].length; i++) {
	    space.units[faction][i].besieged = 1;
	  }

	  this.displaySpace(spacekey);

	  return 1;

        }



        if (mv[0] === "relief_forces_join_battle") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let space = this.game.spaces[spacekey];

	  //
	  // mark relief forces - anyone friendly who is still there
	  //
	  for (let key in space.units) {
	    if (key === faction || this.areAllies(key, faction)) {
	      for (let z = 0; z < space.units[key].length; z++) {
		space.units[key][z].relief_force = 1;
	      }
	    }
	  }

	  let player = this.returnPlayerCommandingFaction(faction);

	  if (this.game.player === player) {
	    this.playerReliefForcesJoinBattle(faction, spacekey);
	  } else {
	    this.updateLog(this.returnFactionName(faction) + " deciding whether besieged units join battle");
	    this.updateStatus(this.returnFactionName(faction) + " deciding whether besieged units join battle");
	  }

	  this.displaySpace(spacekey);

          return 0;

        }



        if (mv[0] === "fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let faction = mv[2];
	  let spacekey = mv[3];
	  let post_battle = 0;
	  if (mv[4]) { post_battle = parseInt(mv[4]); }
	  let space = this.game.spaces[spacekey];

	  let faction_map = this.returnFactionMap(space, attacker, faction);
	  let player = this.returnPlayerCommandingFaction(faction);


	  if (player > 0) {
	    if (this.game.player === player) {
	      this.playerFortifySpace(faction, attacker, spacekey, post_battle);
	    } else {
	      this.updateLog(this.returnFactionName(faction) + " fortifies in " + this.returnSpaceName(spacekey));
	      this.updateStatus(this.returnFactionName(faction) + " fortifying in " + this.returnSpaceName(spacekey));
	    }
	  } else {

	    //
	    // non-player controlled, minor power or independent, so auto-handle
	    //
	    // If there are 4 or fewer land units in a space, they will always withdraw into
	    // the fortifications and try to withstand a siege if their space is entered.
	    // if there are 5 or more land units,they will hold their ground and fight a field
	    // battle. If they lose that field battle, do not retreat their units from the
	    // space as usual. Instead, they retain up to 4 units which withdraw into the
	    // fortifications; all other land units in excess of 4 are eliminated.
      	    //
	    if (space.units[faction].length <= 4) {
	      // fortify everything
	      for (let i = 0; i < space.units[faction].length; i++) {
	        his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	      }
	    } else {
		//
		// go into field battle or next step
		//
	    }
	    this.displaySpace(spacekey);
	    return 1;
	  }

	  this.displaySpace(spacekey);

          return 0;

	}

	if (mv[0] === "remove_siege") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let space = this.game.spaces[spacekey];

	  //
	  // remove siege record from units/space
	  //
	  space.besieged = 0;
	  for (let f in space.units) {
	    for (let i = 0; i < space.units[f].length; i++) {
	      space.units[f][i].relief_force = 0;
	      space.units[f][i].besieged = 0;
	    }
	  }
	  this.displaySpace(spacekey);

	  return 1;

	}

	if (mv[0] === "break_siege") {

	  this.game.queue.splice(qe, 1);

	  let faction_map      = his_self.game.state.assault.faction_map;
	  let attacker_faction = his_self.game.state.assault.attacker_faction;
	  let defender_faction = his_self.game.state.assault.defender_faction;
	  let spacekey         = his_self.game.state.assault.spacekey;
	  let space 	       = his_self.game.spaces[spacekey];
	  let neighbours       = space.neighbours;

	  //
	  // remove siege record from units/space
	  //
	  space.besieged = 0;
	  for (let f in space.units) {
	    for (let i = 0; i < space.units[f].length; i++) {
	      space.units[f][i].relief_force = 0;
	      space.units[f][i].besieged = 0;
	    }
	  }
	  this.displaySpace(spacekey);

	  for (let zz = 0; zz < neighbours.length; zz++) {
            let fluis = this.canFactionRetreatToSpace(attacker_faction, neighbours[zz]);
	    if (fluis) {
              this.game.queue.push("player_evaluate_break_siege_retreat_opportunity\t"+attacker_faction+"\t"+spacekey);
	      zz = neighbours.length+1;
	    }
	  }

	  return 1;

	}


	if (mv[0] === "relief_forces") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let space = this.game.spaces[spacekey];
	
	  let player = this.returnPlayerCommandingFaction(faction);

	  //
	  // if the player is the attacker, not the defender we want
	  // to skip this completely.
	  //
	  let anyone_besieged = 0;
	  for (let z = 0; z < space.units[faction].length; z++) {
	    if (space.units[faction][z].besieged > 0) { anyone_besieged = 1; }
	  }
	  //
	  // pass through if attacker (not besieged)
	  //
	  if (anyone_besieged == 0) { return 1; }

	  if (this.game.player == player) {
	    this.playerEvaluateReliefForce(faction, spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " handling besieged units");
	  }

	  return 0;
	}


        if (mv[0] === "retreat_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  this.game.state.attacker_comes_from_this_spacekey = mv[3];


	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighboursAsArrayOfKeys(spacekey, 0, 0); // 0 cannot intercept across passes or seas
	  let attacking_player = this.returnPlayerOfFaction(attacker);

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_faction_retreat = 0;
	    let player_of_faction = this.returnPlayerCommandingFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction > 0) {
  	      if (io[i] !== attacker && (io[i] != this.game.state.active_faction && !this.areAllies(this.game.state.active_faction, io[i], 1))) {
	        let units_in_space = this.returnFactionLandUnitsInSpace(io[i], spacekey);
	        if (units_in_space > 0) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.canFactionRetreatToSpace(io[i], neighbours[zz], attacker_comes_from_this_spacekey);
	            if (fluis > 0) {
	              let x = "player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+io[i];
		      if (this.game.queue[this.game.queue.length-1] !== x) {
	                this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+io[i]);
		        zz = neighbours.length;
		      }
	            }
	          }
	        }
	      }
	    }

	    for (let zz = 0; zz < this.game.state.activated_powers[io[i]].length; zz++) {
	      let ap = this.game.state.activated_powers[io[i]][zz];
	      if (ap !== attacker && !io.includes(ap) && io[i] != attacker && !this.areAllies(this.game.state.active_faction, ap)) {
	        let units_in_space = this.returnFactionLandUnitsInSpace(ap, spacekey);
	        if (units_in_space > 0) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.canFactionRetreatToSpace(ap, neighbours[zz], attacker_comes_from_this_spacekey);
	            if (fluis > 0) {
		      let x = "player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+ap;
		      if (this.game.queue[this.game.queue.length-1] !== x) {
		        this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+ap);
		        zz = neighbours.length;
	              }
	            }
	          }
	        }
	      }
	    }
	  }

          return 1;

	}

        if (mv[0] === "naval_retreat_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  this.game.state.attacker_comes_from_this_spacekey = mv[3];
	  let space = "";
	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }      
	  if (this.game.navalspaces[spacekey]) { space = this.game.spaces[spacekey]; }      

	  let neighbours = this.returnNeighboursAsArrayOfKeys(spacekey, 0); // 0 cannot intercept across passes
	  let attacking_player = this.returnPlayerOfFaction(attacker);

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_faction_retreat = 0;
	    let player_of_faction = this.returnPlayerCommandingFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction > 0) {
  	      if (io[i] !== attacker) {
	        let units_in_space = this.returnFactionSeaUnitsInSpace(io[i], spacekey);
	        if (units_in_space > 0) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.canFactionRetreatToNavalSpace(io[i], neighbours[zz], attacker_comes_from_this_spacekey);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_naval_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+io[i]);
		      zz = neighbours.length;
	            }
	          }
	        }
	      }
	    }

	    for (let zz = 0; zz < this.game.state.activated_powers[io[i]].length; zz++) {
	      let ap = this.game.state.activated_powers[io[i]][zz];
	      if (ap != attacker && this.returnControllingPower(ap) != this.returnControllingPower(attacker)) {
	        let units_in_space = this.returnFactionSeaUnitsInSpace(ap, spacekey);
	        if (units_in_space > 0) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.canFactionRetreatToNavalSpace(ap, neighbours[zz], attacker_comes_from_this_spacekey);
	            if (fluis > 0) {
		      this.game.queue.push("player_evaluate_naval_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+ap);
		      zz = neighbours.length;
	            }
	          }
	        }
	      }
	    }
	  }

	  this.displaySpace(spacekey);
          return 1;

	}





        if (mv[0] === "player_evaluate_break_siege_retreat_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  // if no-one survived, let's skip the formalities
	  let survivors = this.returnHostileLandUnitsInSpace(attacker, spacekey);
	  if (survivors == 0) { return 1; }

	  if (player_factions.includes(attacker) || this.returnPlayerCommandingFaction(attacker) == this.game.player) {
	    this.playerEvaluateBreakSiegeRetreatOpportunity(attacker, spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(attacker) + " considering retreat");
	  }

	  return 0;

	}



        if (mv[0] === "player_evaluate_retreat_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  let defender = mv[4];
          let space = this.game.spaces[spacekey];

          //
          // you cannot retreat if besieged, so check if besieged, and one besieged unit 
          // means the whole stack is besieged
          //
          if (space.besieged > 0) {
            for (let x = 0; x < space.units[defender].length; x++) {
              if (space.units[defender][x].besieged == 1) { return 1; }
            }
          }


	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender) || this.returnPlayerCommandingFaction(defender) == this.game.player) {
	    this.playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey, defender);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering retreat");
	  }

	  return 0;

	}



        if (mv[0] === "player_evaluate_naval_retreat_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  let defender = mv[4];

	  //
	  // cannot proactively retreat from port
	  //
	  if (this.game.spaces[spacekey]) { return 1; }

	  if (this.returnPlayerCommandingFaction(defender) == this.game.player) {
	    this.playerEvaluateNavalRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey, defender);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering retreat");
	  }

	  return 0;

	}


	if (mv[0] === "naval_retreat") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source_spacekey = mv[2];
	  let destination_spacekey = mv[3];

	  let source;
	  if (this.game.spaces[source_spacekey]) { source = this.game.spaces[source_spacekey]; }
	  if (this.game.navalspaces[source_spacekey]) { source = this.game.navalspaces[source_spacekey]; }

	  let destination;
	  if (this.game.spaces[destination_spacekey]) { destination = this.game.spaces[destination_spacekey]; }
	  if (this.game.navalspaces[destination_spacekey]) { destination = this.game.navalspaces[destination_spacekey]; }


	  for (let i = source.units[faction].length-1; i >= 0; i--) {
	    let u = source.units[faction][i];
	    if (u.land_or_sea == "sea" || u.land_or_sea == "both") {
	      destination.units[faction].push(u);
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

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

	  this.updateLog(this.returnFactionName(faction) + " retreats from " + this.returnSpaceName(from) + " to " + this.returnSpaceName(to));

	  let source = this.game.spaces[from];
	  let destination = this.game.spaces[to];

	  for (let i = source.units[faction].length-1; i >= 0; i--) {
	    let u = source.units[faction][i];
	    if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry" || u.army_leader == true || u.navy_leader == true) {
	      source.units[faction][i].locked = 1;
	      source.units[faction][i].already_moved = true;
	      if (source.units[faction][i].besieged != 1) {
	        destination.units[faction].push(source.units[faction][i]);
	        source.units[faction].splice(i, 1);
	      }
	    }
	  }

	  this.displaySpace(from);
	  this.displaySpace(to);

          return 1;

	}


        if (mv[0] === "interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let includes_cavalry = parseInt(mv[3]);

	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighboursAsArrayOfKeys(spacekey, 0); // 0 cannot intercept across passes
	  let attacking_player = this.returnPlayerCommandingFaction(faction);

	  let already_asked = [];

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_this_faction_enter = false;
	    if (this.areEnemies(io[i], faction)) {
	      let fac = this.returnFactionControllingSpace(spacekey);
	      if (fac != faction && fac != io[i]) {
	        if (this.areAllies(io[i], fac)) { can_this_faction_enter = true; }
	      } else {
		can_this_faction_enter = true;
	      }
	    }


	    if (this.areEnemies(io[i], faction)) {

	      let player_of_faction = this.returnPlayerCommandingFaction(io[i]);
	      if (player_of_faction != attacking_player && player_of_faction != 0) {
  	        if (io[i] !== faction) {

		  let player_needs_adding = 0;

	          for (let zz = 0; zz < neighbours.length; zz++) {
		    if (neighbours[zz] != spacekey) {
	              let fluis = this.returnFactionLandUnitsInSpace(io[i], neighbours[zz]);
	              if (fluis > 0) {
		        if (!already_asked.includes(his_self.returnPlayerCommandingFaction(io[i])) && !already_asked.includes(neighbours[zz])) {
	                  this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+includes_cavalry+"\t"+io[i]+"\t"+neighbours[zz]);
	  	          already_asked.push(neighbours[zz]);
		          player_needs_adding = 1;
		        }
	              }
	            }
	          }
		  if (player_needs_adding) {
	  	    already_asked.push(his_self.returnPlayerCommandingFaction(io[i]));
	          }
	        }
	      }
	    }

	    for (let zzz = 0; zzz < this.game.state.activated_powers[io[i]].length; zzz++) {
	      let ap = this.game.state.activated_powers[io[i]][zzz];
	      if (this.areEnemies(ap, faction)) {
	        if (ap != faction && !already_asked.includes(ap)) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
		    if (neighbours[zz] != spacekey) {
	              let fluis = this.returnFactionLandUnitsInSpace(ap, neighbours[zz]);
	              if (fluis > 0) {
		        if (!already_asked.includes(his_self.returnPlayerCommandingFaction(ap)) && !already_asked.includes(neighbours[zz])) {
	                  this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"0"+"\t"+ap+"\t"+neighbours[zz]);
	  	          already_asked.push(neighbours[zz]);
	                }
	              }
	            }
	          }
	        }
	  	already_asked.push(ap);
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
	  let attacking_player = this.returnPlayerCommandingFaction(faction);

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
	      if (this.areEnemies(io[i], faction)) {
	        let player_of_faction = this.returnPlayerCommandingFaction(io[i]);
	        if (player_of_faction != attacking_player && player_of_faction != 0) {
  	          if (io[i] !== faction) {
	            for (let zz = 0; zz < neighbours.length; zz++) {
	              let fluis = this.returnFactionSeaUnitsInSpace(io[i], neighbours[zz]);
	              if (fluis > 0) {
	                this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+io[i]+"\t"+neighbours[zz]);
	              }
	            }
	          }
	        }
	      }

	      for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	        let ap = this.game.state.activated_powers[io[i]][z];
	        if (this.areEnemies(ap, faction)) {
	          if (ap != faction) {
	            for (let zz = 0; zz < neighbours.length; zz++) {
	              let fluis = this.returnFactionSeaUnitsInSpace(ap, neighbours[zz]);
	              if (fluis > 0) {
	                this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+ap+"\t"+neighbours[zz]);
	              }
	            }
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

          let controller_of_defender = this.returnPlayerCommandingFaction(defender);
                
          if (controller_of_defender == 0) { return 1; }
            
          if (this.game.player == controller_of_defender) {
	    this.playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering naval interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}


        if (mv[0] === "player_evaluate_interception_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = mv[3];
	  let defender = mv[4];
	  let defender_spacekey = mv[5];
	  let controller_of_defender = this.returnPlayerCommandingFaction(defender);
	  let controller_of_attacker = this.returnPlayerCommandingFaction(attacker);
	  let invaded_space = this.game.spaces[spacekey];
	  let defender_space = this.game.spaces[defender_spacekey];

	  //
	  // you cannot intercept if besieged, so check if besieged, and one besieged unit
	  // means the whole stack is besieged
	  //
	  if (defender_space.besieged > 0) {
	    for (let x = 0; x < defender_space.units[defender].length; x++) {
	      if (defender_space.units[defender][x].besieged == 1) { return 1; }
	    }
	  }

	  //
	  // you cannot intercept if the space contains independent units
	  //
	  if (invaded_space.units["independent"].length > 0) { return 1; }

	  //
	  // you cannot intercept if the land units in the space belong to a power
	  // that is not allied to you. an example is Haps being at war with France
	  // and being invited to intercept if the French invade a space with 
	  // British regulars, but England and Haps are not allies.
	  //
	  for (let f in invaded_space.units) {
	    if (this.returnFactionLandUnitsInSpace(f, invaded_space.key) > 0) {
	      if (!this.areAllies(f, attacker) && f != attacker) {
		if (!this.areAllies(f, defender) && f != defender) { 
return 1; }
	      }
	    }
	  }

	  //
	  // you cannot intercept if the space is controlled by non-ally and non-enemy
	  //
	  let fcs = this.returnFactionControllingSpace(invaded_space.key);
	  if (!this.areAllies(fcs, defender, 1) &&  !this.areEnemies(fcs, defender, 1)) { return 1; }

	  //
	  // protestants can't intercept before the League forms
	  //
	  if (defender === "protestant" && this.game.state.events.schmalkaldic_league != 1) {
	    return 1;
	  }

	  if (controller_of_defender == 0) { return 1; }
	  if (controller_of_defender == controller_of_attacker) { return 1; }

	  if (this.game.player == controller_of_defender) {
	    this.playerEvaluateInterceptionOpportunity(attacker, spacekey, attacker_includes_cavalry, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}


        if (mv[0] === "intercept") {

	  this.game.queue.splice(qe, 1);

	  //
	  // in case we had it open to intercept
	  //
	  this.movement_overlay.hide();

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = parseInt(mv[3]);
	  let defender = mv[4];
	  let defender_spacekey = mv[5];
	  let units_to_move_idx = JSON.parse(mv[6]); // is actually obj now
	  let units_to_move = [];

	  //
	  // load actual units to examine them for cavalry, leaders
	  //
	  let s = this.game.spaces[defender_spacekey];
          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[units_to_move_idx[i].faction][units_to_move_idx[i].idx]);
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

//
// IS_TESTING -- ALL INTERCEPTIONS SUCCEED
//
//this.updateLog("IS_TESTING - HITS ON 2");
//hits_on = 2;

	  if (dsum >= hits_on) {

	    try { salert(`${this.returnFactionName(defender)} Interception Succeeds!`); } catch (err) {}
	    this.updateLog(`${this.returnFactionName(defender)} Interception Succeeds!`);

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
	      if (lmv[0] !== "player_evaluate_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[4] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		}
	      }
	    }

	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    let factions = {};
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      factions[units_to_move_idx[i].faction] = [];
	      for (let z = 0; z < 100; z++) { factions[units_to_move_idx[i].faction][z] = ""; }
	    }
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      let m = "move\t"+units_to_move_idx[i].faction+"\tland\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i].idx+"\t1\t1"; // 1 = skip avoid battle, 1 = is interception
	      factions[units_to_move_idx[i].faction][units_to_move_idx[i].idx] = m;
	    }

	    for (let f in factions) {
	      for (let z = 99; z >= 0; z--) {
		if (factions[f][z] != "") {
	          his_self.game.queue.splice((index_to_insert_moves+1), 0, factions[f][z]);
		}
	      }
	    }

	    let m = "lock\t"+defender+"\t"+spacekey; // 1 = skip avoid battle
	    his_self.game.queue.splice((index_to_insert_moves+1), 0, m);
	    his_self.game.queue.splice((index_to_insert_moves+1), 0, ("field_battle\t"+spacekey+"\t"+attacker));

	  } else {
	    try { salert(`${this.returnFactionName(defender)} Interception Fails!`); } catch (err) {}
	    this.updateLog(`${this.returnFactionName(defender)} Interception Fails!`);
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
	    units_to_move.push(s.units[defender][units_to_move_idx[i].idx]);
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

	    try { salert(`${this.returnFactionName(defender)} Naval Interception Succeeds!`); } catch (err) {}
	    this.updateLog(`${this.returnFactionName(defender)} Naval Interception Succeeds!`);

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
	    let factions = {};
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      factions[units_to_move_idx[i].faction] = [100];
	    }
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      let m = "move\t"+units_to_move_idx[i].faction+"\tland\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i].idx+"\t"+1; // 1 = skip avoid battle
	      factions[units_to_move_idx[i].faction][units_to_move_idx[i].idx] = m;
	    }
	    for (let f in factions) {
	      for (let z = 100; z >= 0; z--) {
		if (factions[f][z]) {
	          his_self.game.queue.splice((index_to_insert_moves+1), 0, factions[f][z]);
		}
	      }
	    }


	  } else {
	    try { salert(`${this.returnFactionName(defender)} Naval Interception Fails!`); } catch (err) {}
	    this.updateLog(`${this.returnFactionName(defender)} Naval Interception Fails!`);
	  }

	  return 1;

	}

        if (mv[0] === "diet_of_worms_hapsburgs") {

	  this.factionbar.setActive("hapsburg");

	  let game_self = this;
	  let x = [];
          let fhand_idx = 0;
          if (this.game.player == this.returnPlayerCommandingFaction("hapsburg")) {
	    fhand_idx = this.returnFactionHandIdx(this.game.player, "hapsburg");
	  }
	  for (let i = 0; i < this.game.deck[0].fhand[fhand_idx].length; i++) {
	    if (this.game.deck[0].cards[this.game.deck[0].fhand[fhand_idx][i]].type === "mandatory") {} else { x.push(this.game.deck[0].fhand[fhand_idx][i]); }
	  }

	  if (this.game.player != this.returnPlayerCommandingFaction("hapsburg")) {
            this.updateStatusAndListCards("Hapsburgs Selecting Card for the Diet of Worms", x);
	  } else {
            this.updateStatusAndListCards("Hapsburgs - Select Card to indicate your Commitment to Debate", x);
            this.attachCardboxEvents(async function(card) {
	      game_self.game_help.hide();
              game_self.updateStatus("You picked: " + game_self.deck[card].name);
              game_self.addMove("discard\thapsburg\t"+card);
              game_self.addMove("diet_of_worms_hapsburg_resolve\t"+card);
              game_self.endTurn();

            });
	  }

	  this.game.queue.splice(qe, 1);
          return 0;

	}

        if (mv[0] === "diet_of_worms_hapsburg_resolve") {

	  let card = mv[1];
	  this.game.state.sp.push(card);
	  this.game.queue.splice(qe, 1);
          return 1;

	}

        if (mv[0] === "diet_of_worms") {

	  this.factionbar.setActive(["protestant","papacy"]);

	  let game_self = this;
	  let my_faction = "";

  this.game_help.render(TutorialTemplate, {
    help : `Diet of Worms` ,
    content : `

	The Diet of Worms was an Imperial Assembly convened by the Hapsburg Emperor in 1521 in the Free Imperial City of Worms. Its focus of discussion was on Martin Luther's critique of the Catholic Church and the question of whether he would recant. Luther refused to recant and the assembly ended with him fleeing Worms under the protection of Frederick III of Saxony before being condemned as a heretic by the religious and political establishment.

	<p></p>

	In simulating this event, the Protestant and Papacy both pick a card to reflect their level of commitment to the debate. In the two player game, the Protestants add +4 to the value of the card selected, while the Papacy pulls a card from the deck and adds its value. In all other games, the Hapsburg player contributes the second card for the Papacy.

	<p></p>

	Both players roll the appropriate number of dice and hit on all rolls of 5 or 6. The winner flips the difference in hits to the Protestant or Catholic faith.

    `,
    img : "/his/img/backgrounds/diet_of_worms.jpeg",
    line1 : "diet",
    line2 : "of worms?",
    fontsize : "2.1rem" ,
  });



	  // first time it happens, lets update menu
	  this.displayCardsLeft();

          game_self.game.queue.push("resolve_diet_of_worms");

	  //
	  // papacy controls haps in 3P / 4P
	  //
	  if (this.game.players.length > 2) {
            game_self.game.queue.push("diet_of_worms_hapsburgs");
	  }

	  //
	  // or we flip hapsburg card from deck if 2-player game
	  //
	  if (game_self.game.players.length == 2) {
	    // hapsburg card goes to pool
            game_self.game.queue.push("POOLDEAL\t1\t1\t1"); // deck 1
            game_self.game.queue.push("POOL\t1"); // deck 1
	  }

          //
          // remove mandatory events from both hands
	  //
	  let x = [];
          let fhand_idx = 0;
          if (this.game.player == this.returnPlayerCommandingFaction("papacy")) {
	    fhand_idx = this.returnFactionHandIdx(this.game.player, "papacy");
	    my_faction = "Papacy";
	  }
          if (this.game.player == this.returnPlayerCommandingFaction("protestant")) {
	    fhand_idx = this.returnFactionHandIdx(this.game.player, "protestant");
	    my_faction = "Protestants";
	  }
	  for (let i = 0; i < this.game.deck[0].fhand[fhand_idx].length; i++) {
	    if (this.game.deck[0].cards[this.game.deck[0].fhand[fhand_idx][i]].type === "mandatory") {} else { x.push(this.game.deck[0].fhand[fhand_idx][i]); }
	  }

	  if (this.game.player != this.returnPlayerCommandingFaction("papacy") && this.game.player != this.returnPlayerCommandingFaction("protestant")) {

            this.updateStatusAndListCards("Protestants and Papacy assemble at the Diet of Worms", x);

            let hash1 = game_self.app.crypto.hash("");    // my card
            let hash2 = game_self.app.crypto.hash(Math.random().toString());  // my secret
            let hash3 = game_self.app.crypto.hash(hash2 + hash1);             // combined hash

	    let privateKey = await game_self.app.wallet.getPrivateKey();

            let card_sig = game_self.app.crypto.signMessage("", privateKey);
            let hash2_sig = game_self.app.crypto.signMessage(hash2, privateKey);
            let hash3_sig = game_self.app.crypto.signMessage(hash3, privateKey);

            game_self.game.spick_card = "";
            game_self.game.spick_hash = hash2;
 
            game_self.addMove("SIMULTANEOUS_PICK\t"+game_self.game.player+"\t"+hash3+"\t"+hash3_sig);
            game_self.endTurn();

	  } else {

            this.updateStatusAndListCards(my_faction + " - Select Card to indicate your Commitment to Debate", x);
            this.attachCardboxEvents(async function(card) {

  	      //
	      // hide triangular help if game start -- papacy and other factions
	      //
	      game_self.game_help.hide();

              game_self.updateStatus("You picked: " + game_self.deck[card].name);

              let hash1 = game_self.app.crypto.hash(card);    // my card
              let hash2 = game_self.app.crypto.hash(Math.random().toString());  // my secret
              let hash3 = game_self.app.crypto.hash(hash2 + hash1);             // combined hash

	      let privateKey = await game_self.app.wallet.getPrivateKey();

              let card_sig = game_self.app.crypto.signMessage(card, privateKey);
              let hash2_sig = game_self.app.crypto.signMessage(hash2, privateKey);
              let hash3_sig = game_self.app.crypto.signMessage(hash3, privateKey);

              game_self.game.spick_card = card;
              game_self.game.spick_hash = hash2;
 
              game_self.addMove("SIMULTANEOUS_PICK\t"+game_self.game.player+"\t"+hash3+"\t"+hash3_sig);
              game_self.endTurn();

            });
	  }

	  this.game.queue.splice(qe, 1);
          return 0;
        }

	if (mv[0] === "resolve_diet_of_worms") {

	  this.game.queue.splice(qe, 1);

	  let protestant = this.returnPlayerOfFaction("protestant");
	  let papacy = this.returnPlayerOfFaction("papacy");
	  let protestant_arolls = [];
	  let papacy_arolls = [];

	  let all_players_but_protestant = [];
	  let all_players_but_papacy = [];
          for (let i = 1; i <= this.game.players.length; i++) {
	    if (i != protestant) { all_players_but_protestant.push(i); }
	    if (i != papacy) { all_players_but_papacy.push(i); }
	  }

	  let protestant_card = this.game.deck[0].cards[this.game.state.sp[protestant-1]];
	  let papacy_card = this.game.deck[0].cards[this.game.state.sp[papacy-1]];
	  let hapsburg_card = "";
	  if (this.game.players.length == 2) {
	    hapsburg_card = this.game.pool[0].hand[0];
	  } else {
	    hapsburg_card = this.game.state.sp[this.game.state.sp.length-1]; // hapsburgs added to last slot
	  }

	  this.updateLog("*************************");
	  this.updateLog("*** The Diet of Worms ***");
	  this.updateLog("*************************");
	  this.updateLog("Protestants select: " + this.popup(this.game.state.sp[protestant-1]));
	  this.updateLog("Papacy selects: " + this.popup(this.game.state.sp[papacy-1]));
	  this.updateLog("Hapsburgs select: " + this.popup(hapsburg_card));

	  //
	  // show card in overlay
	  //
	  this.diet_of_worms_overlay.render();
	  this.diet_of_worms_overlay.addCardToCardfan(this.game.state.sp[protestant-1], "protestant");
	  this.diet_of_worms_overlay.addCardToCardfan(this.game.state.sp[papacy-1], "catholic");
	  this.diet_of_worms_overlay.addCardToCardfan(hapsburg_card, "catholic");

	  //
	  // discard the selected cards
	  //
	  this.game.queue.push("discard\tprotestant\t"+this.game.state.sp[protestant-1]);
	  this.game.queue.push("discard\tpapacy\t"+this.game.state.sp[papacy-1]);
	  this.game.queue.push("discard\tall\t"+hapsburg_card);



	  //
	  // 3. roll protestant dice: The Protestant player adds 4 to the CP value of his card.
	  // This total represents the number of dice he now rolls. Each roll of a “5” or a “6”
	  // is considered to be a hit.
	  //
	  // 4. roll papal and Hapsburg dice: The Papal player rolls a num- ber of dice equal to
	  // the CP value of his card. The Hapsburg player does the same. Each roll of a “5” or a
	  // “6” is considered to be a hit. These two powers combine their hits into a Catholic total.
	  //
	  // 5. protestant victory: If the number of Protestant hits exceeds the number of Catholic
	  // hits, the Protestant power flips a number of spaces equal to the number of extra hits he
	  // rolled to Protestant influence. All spaces flipped must be in the German language zone.
	  // Spaces flipped must be adjacent to another Protestant space; spaces that were just
	  // flipped in this step can be used as the required adjacent Protestant space.
	  //
	  // 6. Catholic Victory: If the number of Catholic hits exceeds the number of Protestant hits,
	  // the Papacy flips a number of spaces equal to the number of extra hits he rolled to Catholic
	  // influence. All spaces flipped must be in the German language zone. Spaces flipped must be
	  // adjacent to another Catholic space; spaces that were just flipped in this step can be used
	  // as the required adjacent Catholic space.
	  //

	  let protestant_rolls = protestant_card.ops + 4;
	  let protestant_hits = 0;

	  for (let i = 0; i < protestant_rolls; i++) {
	    let x = this.rollDice(6);
	    protestant_arolls.push(x);
	    if (x >= 5) { protestant_hits++; }
	  }

	  let papacy_rolls = papacy_card.ops;
	  let papacy_hits = 0;

	  for (let i = 0; i < papacy_rolls; i++) {
	    let x = this.rollDice(6);
	    papacy_arolls.push(x);
	    if (x >= 5) { papacy_hits++; }
	  }

 	  if (this.game.deck[0].cards[hapsburg_card].type != "mandatory") {
	    for (let i = 0; i < this.game.deck[0].cards[hapsburg_card].ops; i++) {
	      papacy_rolls++;
	      let x = this.rollDice(6);
	      papacy_arolls.push(x);
	      if (x >= 5) { papacy_hits++; }
	    }
	  } else {
	    for (let i = 0; i < 2; i++) {
	      papacy_rolls++;
	      let x = this.rollDice(6);
	      papacy_arolls.push(x);
	      if (x >= 5) { papacy_hits++; }
	    }
	  }

	  this.updateLog("Protestants ("+protestant_hits+") vs. Catholics ("+papacy_hits+")");


	  if (protestant_hits > papacy_hits) {
	    this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "protestant" , difference : (protestant_hits - papacy_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	    this.game.queue.push("hide_overlay\ttheses");
	    let total_conversion_attempts = protestant_hits - papacy_hits;
	    for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfCatholicSpacesInLanguageZone("", 1); i++) {
	      this.game.queue.push("select_for_protestant_conversion\tprotestant\tgerman");
	    }
  	    this.game.queue.push("STATUS\tProtestants selecting towns to convert...\t"+JSON.stringify(all_players_but_protestant));
  	    this.game.queue.push("show_overlay\ttheses");
  	    this.game.queue.push("ACKNOWLEDGE\tProtestants win Diet of Worms");
	  } else {
	    if (protestant_hits < papacy_hits) {
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "papacy" , difference : (papacy_hits - protestant_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("hide_overlay\ttheses");
	      let total_conversion_attempts = papacy_hits - protestant_hits;
	      for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfProtestantSpacesInLanguageZone("", 1); i++) {
	        this.game.queue.push("select_for_catholic_conversion\tpapacy\tgerman");
	      }
  	      this.game.queue.push("STATUS\tPapacy selecting towns to convert...\t"+JSON.stringify(all_players_but_papacy));
  	      this.game.queue.push("show_overlay\ttheses");
  	      this.game.queue.push("ACKNOWLEDGE\tPapacy wins Diet of Worms");
	    } else {
  	      //
              // report results
              //
	      this.updateLog("Diet of Worms ends in tie.");
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "none" , difference : 0 , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("ACKNOWLEDGE\tDiet of Worms ends in a Stalemate");
	    }
	  }

          return 1;

	}

	//
	// this does not auto-remove, it needs to be preceded by a RESETCONFIRMSNEEDED
	// for however many people need to have the opportunity to counter or acknowledge.
	//
	if (mv[0] === "insert_before_counter_or_acknowledge") {

          this.game.queue.splice(qe, 1);

	  let insert = "";
	  for (let i = 1; i < mv.length; i++) {
	    if (i > 1) { insert += "\t"; }
	    insert += mv[i];
	  }

	  for (let i = this.game.queue.length-1; i >= 0; i--) {
	    let lqe = this.game.queue[i];
	    let lmv = lqe.split("\t");
	    if (lmv[0] === "counter_or_acknowledge") {
	      this.game.queue.splice(i, 0, insert);
	      i = 0;
	    }
	  }

	  return 1;

        }

	//
	// exists to be removed by counter_or_acknowledge
	//
	if (mv[0] === "halted") {
	  // in order to avoid hangs, we auto-broadcast our RESOLVE again
	  // if we reach this...
	  if (this.is_first_loop == 1) {
alert("workaround bug-fix: if you see this error the game is attempting to unlock a potentially frozen situation. this may cause issues, please flag for dev team if game does not recover");
	    this.addMove("RESOLVE\t"+this.publicKey);
	    this.endTurn();
	  }
	  return 0;
	}
	if (mv[0] === "counter_or_acknowledge") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  //
	  // if i have already confirmed, we only splice and pass-through if everyone else has confirmed
	  // otherwise we will set ack to 0 and return 0 which halts execution. so we should never clear 
	  // splice anything out except here...
	  //
	  if (this.game.confirms_needed[this.game.player-1] == 0) {

	    let ack = 1;

	    for (let i = 0; i < this.game.confirms_needed.length; i++) {
	      if (this.game.confirms_needed[i] >= 1) { ack = 0; }
	    }
	    //
	    // if everyone has returned, splice out counter_or_acknowledge
 	    // and continue to the next move on the game queue
	    //
	    if (ack == 1) { 
	      this.game.queue.splice(qe, 1);
	    }

	    this.updateStatus("acknowledged");
	    return ack;
	  }

	  //
	  // if we get this far i have not confirmed and others may or may
	  // not have confirmed, but we want at least to check to see wheter
	  // i want to just click ACKNOWLEDGE or take an action that might
	  // affect future gameplay (such as playing a card)....
	  //
	  let msg = mv[1];
	  let stage = "";
	  if (mv[2]) { stage = mv[2]; }
	  let extra = "";
	  if (mv[3]) { extra = mv[3]; }

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

	  let html = '<ul>';

	  let menu_index = [];
	  let menu_triggers = [];
	  let attach_menu_events = 0;

    	  html += '<li class="option" id="ok">acknowledge</li>';

          let z = this.returnEventObjects();
	  for (let i = 0; i < z.length; i++) {

	    //
	    // maybe event has been removed, will fail
	    //
	    try {

	    if (z[i].key !== this.game.state.active_card) {
              if (z[i].menuOptionTriggers(this, stage, this.game.player, extra) == 1) {
                let x = z[i].menuOption(this, stage, this.game.player, extra);
		if (x.html) {
                  html += x.html;
	          z[i].faction = x.faction; // add faction
	          menu_index.push(i);
	          menu_triggers.push(x.event);
	          attach_menu_events = 1;
	        }
	      }
	    }

	    } catch (err) {}

	  }
	  html += '</ul>';

	  //
	  // skipping, and no options for active player -- skip completely
	  //
	  if (this.game.state.skip_counter_or_acknowledge == 1) {
	    if (attach_menu_events == 0) {
	      //
	      // replaces so we do not sent 2x
	      //
	      his_self.game.queue[his_self.game.queue.length-1] = "halted";
//if (his_self.game.confirms_needed[his_self.game.player-1] == 1) {
	      his_self.game.confirms_needed[his_self.game.player-1] = 1;
              his_self.addMove("RESOLVE\t"+his_self.publicKey);
//}
              his_self.endTurn();
	      his_self.updateStatus("skipping acknowledge...");
	      return 0;
	    }
	  }


	  //
	  // in faster_play mode, we will switch to HALTED if there are 
	  // no other options. this halts OUR game but allows others to continue
	  // to play more rapidly, which helps speed-up games where network connections
	  // can be a little slow, at the cost of leaking a small amount of information
	  // about player hands from the speed of the response (i.e. a fast response 
	  // likely means an automatic response, which likely means no cards permitting
	  // intervention are in-hand.
	  //
	  if (this.faster_play == 1 && menu_index.length == 0 && attach_menu_events != 1 && this.isGameHalted() != 1) {

	    //
	    // we don't need to HALT the game because the game will not progress
	    // until all players have hit RESOLVE anyway. 
	    //
            let my_specific_game_id = his_self.game.id;
	    his_self.is_halted = 1;
	    his_self.halted = 1;
            his_self.game.queue[his_self.game.queue.length-1] = "HALTED\tWaiting for Game to Continue\t"+his_self.publicKey;
            his_self.hud.back_button = false;

      	    let html = '<ul><li class="option" id="ok">acknowledge</li></ul>';
            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              $('.option').off();
              let action = $(this).attr("id");

              his_self.game = his_self.loadGame(my_specific_game_id);

	      // tell game engine we can move
	      his_self.is_halted = 0;
	      his_self.halted = 0;
	      his_self.gaming_active = 0;

              his_self.updateStatus('continuing...');

              //
              // our own move will have been ticked into the future queue, along with
	      // anyone else's so we skip restartQueue() which will freeze if it sees
	      // that we have moves still pending, but should clear if it now finds 
	      // UNHALT is the latest instruction and this resolve is coming from us!
              //
	      his_self.processFutureMoves();

	    });

//if (his_self.game.confirms_needed[his_self.game.player-1] == 1) {
            his_self.addMove("RESOLVE\t"+his_self.publicKey);
            his_self.endTurn();
//}
            return 0;

	  }

	  this.updateStatusWithOptions(msg, html);
	  let deck = his_self.returnDeck(true);

	  $('.option').off();
	  $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
	    if (deck[action2]) {
	      his_self.cardbox.show(his_self.returnCardImage(action2));
	    }
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.show(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.show(action2);
	    }
          });
	  $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
	    if (deck[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	  });
          $('.option').on('click', async function () {

            let action2 = $(this).attr("id");

	    //
	    // prevent blocking
	    //
	    his_self.cardbox.hide();

            //
            // events in play
            //
            if (attach_menu_events == 1) {
              for (let i = 0; i < menu_triggers.length; i++) {
                if (action2 == menu_triggers[i]) {
                  $(this).remove();
		  his_self.updateStatus("acknowledged...");
	          // manually add, to avoid re-processing
	          if (his_self.game.confirms_needed[his_self.game.player-1] == 1) {
	            //his_self.game.confirms_needed[his_self.game.player-1] = 2;
                    his_self.prependMove("RESOLVE\t"+his_self.publicKey);
		    z[menu_index[i]].menuOptionActivated(his_self, stage, his_self.game.player, z[menu_index[i]].faction);
                  }
                  return 0;
                }
              }
            }

            if (action2 == "ok") {
	      //
	      // this ensures we clear regardless of choice
	      //
	      // manually add, to avoid re-processing
	      if (his_self.game.confirms_needed[his_self.game.player-1] == 1) {
                his_self.prependMove("RESOLVE\t"+his_self.publicKey);
	        his_self.updateStatus("acknowledged");
                his_self.endTurn();
              }
	      return 0;
            }

          });

	  return 0;

	}



	if (mv[0] === "naval_battle") {

	  //
	  // people are still moving stuff in
	  //
	  if (qe > 0) {
	    let lmv = "";
	    for (let i = qe-1; i > 0; i--) {
	      lmv = this.game.queue[i].split("\t");
	      if (lmv[0] === "naval_battle" && lmv[1] == mv[1]) {
          	this.game.queue.splice(qe, 1);
		return 1;
	      }
	    }
	  }
 
          this.game.queue.splice(qe, 1);

	  //
	  // we will create this object dynamically
	  //
	  this.game.state.naval_battle = {};

	  //
	  // calculate rolls
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
	    let units = [];
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].personage == false) {
		if (space.units[faction][i].land_or_sea === "sea" || space.units[faction][i].land_or_sea === "both") {
	          rolls++;
		  if (space.units[faction][i].type === "squadron") {
	            rolls++;
		  }
	          units.push(space.units[faction][i].key);
	        }
	      }
	    }
	    return { rolls : rolls , units : units };
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_rating = function(faction) {
	    let highest_battle_rating = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_rating > 0) {
	        if (highest_battle_rating < space.units[faction][i].battle_rating) {
		  highest_battle_rating = space.units[faction][i].battle_rating;
		}
	      }
	    }
	    return highest_battle_rating;
          }
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

	  //
	  // this is run when a naval battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a nearby sea or port if 
	  // possible. as such, the rest of this function simply handles
	  // the battle on the high-seas.
	  //
	  let his_self = this;
	  let space = "";
	  let spacekey = mv[1];
	  let is_battle_in_port = false;

	  //
	  // either in port
	  //
	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; is_battle_in_port = true; }
	  if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }
	  let attacker = mv[2];
	  let stage = "naval_battle";


          //
          // stop naval battle if only attacker is left (retreat)
          //
          let fluis = 0;
          let attacker_fluis = this.returnFactionNavalUnitsInSpace(attacker, spacekey);
          for (let f in space.units) {
            if (!this.areAllies(attacker, f, 1)) {
              fluis += this.returnFactionNavalUnitsInSpace(f, spacekey);
            }
          }
          if (fluis == 0 || attacker_fluis == 0) {
            return 1;
          }



	  //
	  // who is here?
	  //
	  // in sea battles an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);
	  let is_janissaries_possible = false;


	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnNavalFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {

	    //
	    // check for janissaries in this loop
	    //
	    if (f === "ottoman" && space.units["ottoman"].length > 0) {
	      if (!his_self.game.deck[0].discards['001']) {
	        if (!this.game.queue.includes("discard\tottoman\t001")) { is_janissaries_possible = true; }
	      }
	    }


	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
try {
	      let p = his_self.game.state.players_info[his_self.returnPlayerCommandingFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p && ap) {
	        if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
} catch (err) {}
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
try {
	      let p = his_self.game.state.players_info[his_self.returnPlayerCommandingFaction(defender_faction)-1];
	      let dp = his_self.game.state.players_info[defender_player-1];
	      if (p && dp) {
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
} catch (err) {}
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any
	  // bonuses that affect combat will have been copied over to those players
	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 0;
	  if (is_battle_in_port) { defender_rolls++; }
	  let attacker_units = [];
	  let defender_units = [];
	  if (is_battle_in_port) { defender_units.push('port defense'); }
	  let attacker_units_faction = [];
	  let defender_units_faction = [defender_faction];
	  let attacker_highest_battle_rating = 0;
	  let defender_highest_battle_rating = 0;
	  let attacker_highest_battle_rating_figure = "";
	  let defender_highest_battle_rating_figure = "";

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {

	      let x = calculate_rolls(f);

	      attacker_rolls += x.rolls;
	      attacker_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { attacker_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > attacker_highest_battle_rating) {
		attacker_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {

	      let x = calculate_rolls(f);
	      defender_rolls += x.rolls;
	      defender_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { defender_units_faction.push(f); }

	      if (calculate_highest_battle_rating(f) > defender_highest_battle_rating) {
		defender_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	  }

	  //
	  // add rolls for highest battle ranking
	  //
	  for (let z = 0; z < attacker_highest_battle_rating; z++) {
	    attacker_rolls++;
	  }
	  for (let z = 0; z < defender_highest_battle_rating; z++) {
	    defender_rolls++;
	  }

	  //
	  // add bonus rolls
	  //
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
	  // modify rolls as needed
	  //
	  let attacker_modified_rolls = attacker_results;
	  let defender_modified_rolls = attacker_results;
  	  if (his_self.game.state.naval_battle.attacker_player > 0) {
	    attacker_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.naval_battle.attacker_player-1], attacker_results);
	  }
  	  if (his_self.game.state.naval_battle.defender_player > 0) {
 	    defender_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.naval_battle.defender_player-1], defender_results);
	  }

	  for (let i = 0; i < attacker_modified_rolls; i++) {
	    if (attacker_modified_rolls[i] >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_modified_rolls; i++) {
	    if (defender_modified_rolls[i] >= 5) { defender_hits++; }
	  }

	  //
	  // we have now rolled all of the dice that we need to roll at this stage
	  // and the results have been pushed into the naval_battle object. but there
	  // is still the possibility that someone might want to intervene...
	  //
	  // things get extra messy and conditional now, because Ottomans may play
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing
	  // execution back to the game queue via counter/acknowledge. those independent
	  // functions can then manipulate the naval_battle object directly before
	  // permitting it to fall-through..
	  //

	  //
	  // save battle state
	  //
          his_self.game.state.naval_battle.spacekey = mv[1];
          his_self.game.state.naval_battle.spacekey = mv[1];
	  his_self.game.state.naval_battle.attacker_units = attacker_units;
	  his_self.game.state.naval_battle.defender_units = defender_units;
	  his_self.game.state.naval_battle.attacker_units_faction = attacker_units_faction;
	  his_self.game.state.naval_battle.defender_units_faction = defender_units_faction;
	  his_self.game.state.naval_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.naval_battle.defender_rolls = defender_rolls;
	  his_self.game.state.naval_battle.attacker_modified_rolls = attacker_modified_rolls;
	  his_self.game.state.naval_battle.defender_modified_rolls = defender_modified_rolls;
	  his_self.game.state.naval_battle.attacker_hits = attacker_hits;
	  his_self.game.state.naval_battle.defender_hits = defender_hits;
	  his_self.game.state.naval_battle.attacker_units_destroyed = [];
	  his_self.game.state.naval_battle.defender_units_destroyed = [];
	  his_self.game.state.naval_battle.attacker_results = attacker_results;
	  his_self.game.state.naval_battle.defender_results = defender_results;
	  his_self.game.state.naval_battle.attacker_faction = attacker_faction;
	  his_self.game.state.naval_battle.defender_faction = defender_faction;
	  his_self.game.state.naval_battle.attacker_player = his_self.returnPlayerCommandingFaction(attacker_faction);
	  his_self.game.state.naval_battle.defender_player = his_self.returnPlayerCommandingFaction(defender_faction);
	  his_self.game.state.naval_battle.attacker_highest_battle_rating = attacker_highest_battle_rating;
	  his_self.game.state.naval_battle.defender_highest_battle_rating = defender_highest_battle_rating;
	  his_self.game.state.naval_battle.defender_hits_first = 0;
	  his_self.game.state.naval_battle.attacker_hits_first = 0;
	  his_self.game.state.naval_battle.defender_hits_first = 0;
	  his_self.game.state.naval_battle.faction_map = faction_map;
	  his_self.game.state.naval_battle.is_battle_in_port = is_battle_in_port;

	  let ap = {};
	  let dp = {};

	  if (attacker_player > 0) { ap = this.game.state.players_info[attacker_player-1]; }
	  if (defender_player > 0) { dp = this.game.state.players_info[defender_player-1]; }

	  //
	  // ottomans may play Janissaries, and some players may attack before each other, so
	  // we take conditional action and move to COUNTER_OR_ACKNOWLEDGE based on the details
	  // of how the battle should execute. the most important division is if one player
	  // "goes first" in which case they knock away from potential hits from the other
	  // side.
	  //
	  his_self.game.queue.push(`naval_battle_continue\t${mv[1]}`);

	  if (ap.tmp_roll_first == 1 && dp.tmp_roll_first != 1) {
	    his_self.game.state.naval_battle.attacker_hits_first = 1;
	    his_self.game.queue.push("naval_battle_assign_hits\t"+his_self.game.state.naval_battle.defender_faction);
	    his_self.game.queue.push("naval_battle_assign_hits\t"+his_self.game.state.naval_battle.attacker_faction);
	    his_self.game.queue.push("ACKNOWLEDGE\tProceed to Hits Assignment");
	  } else if (ap.tmp_roll_first != 1 && dp.tmp_roll_first == 1) {
	    his_self.game.state.naval_battle.defender_hits_first = 1;
	    his_self.game.queue.push("naval_battle_assign_hits\t"+his_self.game.state.naval_battle.attacker_faction);
	    his_self.game.queue.push("naval_battle_assign_hits\t"+his_self.game.state.naval_battle.defender_faction);
	    his_self.game.queue.push("ACKNOWLEDGE\tProceed to Hits Assignment");
	  } else {
	    his_self.game.queue.push("naval_battle_assign_hits\t"+his_self.game.state.naval_battle.attacker_faction);
	    his_self.game.queue.push("naval_battle_assign_hits\t"+his_self.game.state.naval_battle.defender_faction);
	    his_self.game.queue.push("ACKNOWLEDGE\tProceed to Hits Assignment");
	  }

	  //
	  // this should stop execution while we are looking at the pre-naval battle overlay
	  //
	  his_self.game.queue.push("naval_battle_assign_hits_render");
          if (is_janissaries_possible) {
            his_self.game.queue.push("counter_or_acknowledge\tOttomans considering playing Janissaries\tjanissaries_naval\t"+space.key); 
            his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          }
	  his_self.game.queue.push("counter_or_acknowledge\tNaval Battle commences in "+space.name + "\tpre_naval_battle_rolls\t"+space.key);
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          
          
          his_self.naval_battle_overlay.renderPreNavalBattle(his_self.game.state.naval_battle);
          his_self.naval_battle_overlay.pullHudOverOverlay();

	  return 1;

        }



	if (mv[0] === "field_battle") {

	  //
	  // people are still moving stuff in
	  //
	  if (qe > 0) {
	    let lmv = "";
	    for (let i = qe-1; i > 0; i--) {
	      lmv = this.game.queue[i].split("\t");
	      if (lmv[0] === "field_battle" && lmv[1] == mv[1]) {
          	this.game.queue.splice(qe, 1);
		return 1;
	      }
	    }
	  }
 
          this.game.queue.splice(qe, 1);

	  //
	  // we will create this object dynamically
	  //
	  this.game.state.field_battle = {};

	  //
	  // calculate rolls
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
	    let units = [];
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].personage == false && space.units[faction][i].besieged == 0) {
		if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	          rolls++;
		  units.push(space.units[faction][i].key);
	        }
	      }
	    }
	    return { rolls : rolls , units : units };
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_rating = function(faction) {
	    let highest_battle_rating = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_rating > 0 && space.units[faction][i].besieged == 0) {
	        if (highest_battle_rating < space.units[faction][i].battle_rating) {
		  highest_battle_rating = space.units[faction][i].battle_rating;
		}
	      }
	    }
	    return highest_battle_rating;
          }
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

	  //
	  // this is run when a field battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a fortress if available. as
	  // such, the rest of this function moves to to handle the on-the-
	  // ground conflict.
	  //
	  let his_self = this;
	  let spacekey = mv[1];
	  let attacker = mv[2];
	  let space = this.game.spaces[spacekey];
	  let stage = "field_battle";


          //
          // if there is no-one here but the attacker, we want to stop the field battle 
	  // because it is pointless...
          //
          let fluis = 0;
          for (let f in this.game.spaces[spacekey].units) {
            if (f !== attacker && !this.areAllies(this.game.state.active_faction, f, 1)) {
              fluis += this.returnFactionLandUnitsInSpace(f, spacekey);
            }
          }
          if (fluis == 0) { 
	    return 1; 
	  }


	  //
	  // the first thing we check is whether the land units that control the space have
	  // withdrawn into fortifications, as if that is the case then land battle is avoided
	  // note that besieged 2 means it is the same turn that the place was put under siege
	  //
	  if (space.besieged == 2) {
	    //
	    // we can hit this point if there is an intercept from the player that controls the 
	    // space, moving into a space that was undefended and was put under siege when the 
	    // opponent moved in. in order to guard against this, we check to see if there are
	    // any units that have withdrawn into the space..
	    //
	    let anyone_home = false;
	    for (let f in this.game.spaces[spacekey].units) {
	      for (let z = 0; z < this.game.spaces[spacekey].units[f].length; z++) {
		if (this.game.spaces[spacekey].units[f][z].besieged != 0) { anyone_home = true; }
	      }
	    }

	    if (anyone_home == true) {
	      this.updateLog("Field Battle avoided by defenders withdrawing into fortifications");
	      this.game.queue.push("ACKNOWLEDGE\tField Battle avoided by defenders retreating into fortification");
	      //
	      // and redraw
	      //
	      this.displaySpace(space.key);
	      return 1;
	    } else {
	      this.game.queue.push(`field_battle\t${spacekey}\t${attacker}`);
	      this.game.queue.push(`fortification_check\t${attacker}\t${spacekey}\t${his_self.game.state.attacker_comes_from_this_spacekey}`);
	      return 1;
	    }

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
	  let is_janissaries_possible = false;

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

	    //
	    // check for janissaries in this loop
	    //
	    if (f === "ottoman" && space.units["ottoman"].length > 0) {
	      if (!his_self.game.deck[0].discards['001']) {
	        is_janissaries_possible = true;
	      }
	    }

	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p && ap) {
	        if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	      let dp = his_self.game.state.players_info[defender_player-1];
	      if (p && dp) {
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any
	  // bonuses that affect combat will have been copied over to those players
	  //
	  // we can how start building the field_battle object, which will contain
	  // the information, die rolls, modified die rolls, needed to carry out the
	  // conflict.
	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_units = [];
	  let defender_units = ['defender'];

	  //
	  // no defender bonus in foreign wars
	  //
	  if (space.key === "persia" || space.key === "egypt" || space.key === "ireland") {
	    defender_rolls = 0;
	    defender_units = [];
	  }

	  let attacker_units_faction = [];
	  let defender_units_faction = [defender_faction];
	  let attacker_highest_battle_rating = 0;
	  let defender_highest_battle_rating = 0;
	  let attacker_highest_battle_rating_figure = "";
	  let defender_highest_battle_rating_figure = "";

	  let unbesieged_defender_units = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      let x = calculate_rolls(f);
	      attacker_rolls += x.rolls;
	      attacker_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { attacker_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > attacker_highest_battle_rating) {
		attacker_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      for (let z = 0; z < space.units[f].length; z++) {
		let u = space.units[f][z];
		if (u.type == "regular" || u.type == "cavalry" || u.type == "mercenary") {
		  if (u.besieged == 0) { unbesieged_defender_units++; }
		}
	      }
	      let x = calculate_rolls(f);
	      defender_rolls += x.rolls;
	      defender_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { defender_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > defender_highest_battle_rating) {
		defender_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	  }

	  //
	  // if the defender has no units in the space and this is a fortified space
	  // we don't want to go into hits assignment because we cannot actually have
	  // a field battle, so we just nope out and put the space immediately under 
	  // siege.
	  //
 	  // <= 1 because defenders get that bonus hit
	  //
	  let no_defender_units = false;
	  if (defender_units.length < 1) { no_defender_units = true; } else {
	    if (defender_units[0] == "defender") {
 	      if (defender_units.length == 1) { no_defender_units = true; }
	    }
	  }
	  if (no_defender_units == true && (space.type == "electorate" || space.type == "key" || this.isSpaceFortified(space.key) || space.type == "fortress")) {
	    if (space.besieged != 1) { // not if already besieged
	      space.besieged = 2;
	      this.updateLog(space.name + " put under siege.");
	    }
	    this.displaySpace(space.key);
	    return 1;	    
	  }

	  //
	  // no unbesieged defender units
	  //
	  if (unbesieged_defender_units == 0) {
	    this.displaySpace(space.key);
	    return 1;
	  }


	  //
	  // if the defender has no units (retreat?) then we just exit the field battle
	  // immediately since there is no battle at all. note that we have already handled
	  // edge-cases with siege/assault above.
	  //
	  if (no_defender_units == true) {
	    this.displaySpace(space.key);
	    return 1;	    
	  }

	  //
	  // add rolls for highest battle ranking
	  //
	  for (let z = 0; z < attacker_highest_battle_rating; z++) {
	    attacker_rolls++;
	  }
	  for (let z = 0; z < defender_highest_battle_rating; z++) {
	    defender_rolls++;
	  }

	  //
	  // add bonus rolls
	  //
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
	  // modify rolls as needed
	  //
	  let attacker_modified_rolls = attacker_results;
	  let defender_modified_rolls = defender_results;
  	  if (his_self.game.state.field_battle.attacker_player > 0) {
	    attacker_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.field_battle.attacker_player-1], attacker_results);
	  }

  	  if (his_self.game.state.field_battle.defender_player > 0) {
 	    defender_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.field_battle.defender_player-1], defender_results);
	  }

	  for (let i = 0; i < attacker_modified_rolls; i++) {
	    if (attacker_modified_rolls[i] >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_modified_rolls; i++) {
	    if (defender_modified_rolls[i] >= 5) { defender_hits++; }
	  }

	  //
	  // we have now rolled all of the dice that we need to roll at this stage
	  // and the results have been pushed into the field_battle object. but there
	  // is still the possibility that someone might want to intervene...
	  //
	  // things get extra messy and conditional now, because Ottomans may play
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing
	  // execution back to the game queue via counter/acknowledge. those independent
	  // functions can then manipulate the field_battle object directly before
	  // permitting it to fall-through..
	  //
          his_self.game.state.field_battle.spacekey = mv[1];
	  his_self.game.state.field_battle.attacker_units = attacker_units;
	  his_self.game.state.field_battle.defender_units = defender_units;
	  his_self.game.state.field_battle.attacker_units_faction = attacker_units_faction;
	  his_self.game.state.field_battle.defender_units_faction = defender_units_faction;
	  his_self.game.state.field_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.field_battle.defender_rolls = defender_rolls;
	  his_self.game.state.field_battle.attacker_modified_rolls = attacker_modified_rolls;
	  his_self.game.state.field_battle.defender_modified_rolls = defender_modified_rolls;
	  his_self.game.state.field_battle.attacker_hits = attacker_hits;
	  his_self.game.state.field_battle.defender_hits = defender_hits;
	  his_self.game.state.field_battle.attacker_units_destroyed = [];
	  his_self.game.state.field_battle.defender_units_destroyed = [];
	  his_self.game.state.field_battle.attacker_results = attacker_results;
	  his_self.game.state.field_battle.defender_results = defender_results;
	  his_self.game.state.field_battle.attacker_faction = attacker_faction;
	  his_self.game.state.field_battle.defender_faction = defender_faction;
	  his_self.game.state.field_battle.attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
	  his_self.game.state.field_battle.defender_player = his_self.returnPlayerOfFaction(defender_faction);
	  his_self.game.state.field_battle.attacker_highest_battle_rating = attacker_highest_battle_rating;
	  his_self.game.state.field_battle.defender_highest_battle_rating = defender_highest_battle_rating;
	  his_self.game.state.field_battle.defender_hits_first = 0;
	  his_self.game.state.field_battle.attacker_hits_first = 0;
	  his_self.game.state.field_battle.defender_hits_first = 0;
	  his_self.game.state.field_battle.faction_map = faction_map;

console.log("FIELD BATTLE: " + JSON.stringify(his_self.game.state.field_battle));


	  let ap = {};
	  let dp = {};

	  if (attacker_player > 0) { ap = this.game.state.players_info[attacker_player-1]; }
	  if (defender_player > 0) { dp = this.game.state.players_info[defender_player-1]; }

	  //
	  // ottomans may play Janissaries, and some players may attack before each other, so
	  // we take conditional action and move to COUNTER_OR_ACKNOWLEDGE based on the details
	  // of how the battle should execute. the most important division is if one player
	  // "goes first" in which case they knock away from potential hits from the other
	  // side.
	  //
	  his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);

	  if (ap.tmp_roll_first == 1 && dp.tmp_roll_first != 1) {
	    his_self.game.state.field_battle.attacker_hits_first = 1;
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	  } else if (ap.tmp_roll_first != 1 && dp.tmp_roll_first == 1) {
	    his_self.game.state.field_battle.defender_hits_first = 1;
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	  } else {
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	  }
	  //
	  // this should stop execution while we are looking at the pre-field battle overlay
	  //
	  let from_whom = his_self.returnArrayOfPlayersInSpacekey(space.key);
if (from_whom.includes(this.game.players[this.game.player-1])) {
	  his_self.game.queue.push("ACKNOWLEDGE\tProceed to Assign Hits");
}
	  his_self.game.queue.push("field_battle_assign_hits_render");
	  if (is_janissaries_possible) {
	    his_self.game.queue.push("counter_or_acknowledge\tOttomans considering playing Janissaries\tjanissaries\t"+space.key);
            his_self.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(from_whom));
	  }
	  his_self.game.queue.push("counter_or_acknowledge\tField Battle is about to begin in "+space.name + "\tpre_field_battle_rolls\t"+space.key);
          his_self.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(from_whom));
          his_self.field_battle_overlay.renderPreFieldBattle(his_self.game.state.field_battle);
          his_self.field_battle_overlay.pullHudOverOverlay();

	  return 1;

        }


        if (mv[0] === "field_battle_assign_hits") {

	  //
	  // major powers may assign hits completely to minor allies, but they have
	  // to split hits, with a random roll used to determine who takes the extra
	  // hit ON DEFENSE. the active power assigns hits independently to any land
	  // units who attack.
	  //
	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  let space = this.game.spaces[this.game.state.field_battle.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // we auto-assign the hits to independent, non-player controlled units
	  // this function handles that.
	  //
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;
	    let faction_map = his_self.game.state.field_battle.faction_map;

	    if (faction === "independent") {
	      max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(faction, space);
	    } else {
	      //
	      // max hits to assign are the faction land units
	      //
	      for (let f in his_self.game.state.faction_map) {
	        if (faction_map[f] === faction) {
	      	  max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	        }
	      }
	    }

	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }

	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

console.log("testing...");

	      let number_of_targets = 0;

	      //
	      // first we calculate starting faction targets
	      //
	      if (faction != "independent") {
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      } else {
		number_of_targets = 1;
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction || (f == "independent" && faction == "independent")) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "mercenary"; }
		        if (zzz == 1) { cannon_fodder = "regular"; }
		        if (zzz == 2) { cannon_fodder = "cavalry"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder && space.units[f][i].besieged == 0) {

			    //
			    // and remove from field battle unit
			    //
		            if (faction === his_self.game.state.field_battle_attacker_faction) {
			      for (let z = 0; z < his_self.game.state.field_battle.attacker_units.length; z++) {
			        let u = his_self.game.state.field_battle.attacker_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.field_battle.attacker_units_destroyed.includes(z)) {
			            his_self.game.state.field_battle.attacker_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }
		            if (faction === his_self.game.state.field_battle_defender_faction) {
			      for (let z = 0; z < his_self.game.state.field_battle.defender_units.length; z++) {
			        let u = his_self.game.state.field_battle.defender_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.field_battle.defender_units_destroyed.includes(z)) {
			            his_self.game.state.field_battle.defender_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }

		  	    space.units[f].splice(i, 1);
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
                      if (space.units[selected_faction][ii].type === cannon_fodder && space.units[selected_faction][ii].besieged == 0) {

			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
	  		his_self.game.state.field_battle.attacker_units_destroyed = [];
	  		his_self.game.state.field_battle.defender_units_destroyed = [];

                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }


	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {
	    if (faction === this.game.state.field_battle.attacker_faction) {
	      assign_hits(faction, this.game.state.field_battle.defender_hits);
	    } else {
	      assign_hits(faction, this.game.state.field_battle.attacker_hits);
	    }
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.updateInstructions("Independent Hits Assigned");
	    return 1;
	  }


	  //
	  // no hits assignment if no hits
	  //
	  //
	  if (faction === this.game.state.field_battle.attacker_faction) {
	    if (this.game.state.field_battle.defender_hits == 0) { return 1; }
	  } else {
	    if (this.game.state.field_battle.attacker_hits == 0) { return 1; }
	  }


	  //
	  // if we hit this point we need manual intervention to assign the hits.
	  // the attacker can assign hits however they prefer if others join them
	  // in the attack, but if two major powers share defense then the hits
	  // are divided evenly among them.
	  //
          let hits_to_assign = this.game.state.field_battle.attacker_hits;
          let defending_factions = [];
          let defending_factions_count = 0;
          let defending_major_powers = 0;
          let defending_factions_hits = [];
	  let units_capable_of_taking_hits = 0;
	  for (let f in this.game.state.field_battle.faction_map) {
	    if (this.game.state.field_battle.faction_map[f] == faction || f == faction) {
	      units_capable_of_taking_hits += this.returnFactionLandUnitsInSpace(f, this.game.state.field_battle.spacekey);
	      if (this.isMajorPower(f)) {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
	    }
          }
	  //
	  // this can happen if only minor powers, but controlled by major power
	  //
	  if (defending_factions_hits.length == 0) {
	    for (let f in this.game.state.field_battle.faction_map) {
	      if (this.game.state.field_battle.faction_map[f] == faction || f == faction) {
	        units_capable_of_taking_hits += this.returnFactionLandUnitsInSpace(f, this.game.state.field_battle.spacekey);
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
            }
          }

	  // this is needed, but we shouldn't hit it
	  //if (defending_faction_hits.length == 0) {
	  //  return 1;
	  //}

	  if (units_capable_of_taking_hits == 0) {
	    return 1;
	  }

	  //
	  // every gets shared hits
	  //

console.log("hits to assign: " + hits_to_assign);
console.log("defending factions hits: " + defending_factions_hits);

	  while (hits_to_assign > defending_factions_hits.length) {
console.log(hits_to_assign + " > " + defending_factions_hits.length);
	    for (let i = 0; i < defending_factions_hits.length; i++) { defending_factions_hits[i]++; }
	    hits_to_assign -= defending_factions_hits.length;
	  }

	  //
	  // randomly assign remainder
	  //
	  let already_punished = [];
	  for (let i = 0; i < hits_to_assign; i++) {
	    let unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    while (already_punished.includes(unlucky_faction)) {
console.log("unlucky faction spinout...");
	      unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    }
	    defending_factions_hits[unlucky_faction]++;
	    already_punished.push(unlucky_faction);
	  }

	  //
	  // defending major powers
	  //
	  if (defending_major_powers > 0 && this.game.state.field_battle.faction_map[faction] == this.game.state.field_battle.defender_faction) {
	    for (let i = 0; i < defending_factions_hits.length; i++) {
  	      this.game.queue.push(`field_battle_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
	    }
	    return 1;
	  }

console.log("about to assign hits directly...");

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.assignHits(his_self.game.state.field_battle, faction);
	  } else {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
	    his_self.updateStatus(this.returnFactionName(faction) + " Assigning Hits");
            his_self.field_battle_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;

	}



        if (mv[0] === "naval_battle_assign_hits") {

	  //
	  // major powers may assign hits completely to minor allies.
	  //
	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  let space;
	  let is_battle_in_port = false;
	  if (this.game.spaces[this.game.state.naval_battle.spacekey]) { is_battle_in_port = true; space = this.game.spaces[this.game.state.naval_battle.spacekey]; }
	  if (this.game.navalspaces[this.game.state.naval_battle.spacekey]) { is_battle_in_port = true; space = this.game.navalspaces[this.game.state.naval_battle.spacekey]; }

          this.game.queue.splice(qe, 1);

	  //
	  // this auto-assigns hits to squadrons...
	  //
	  let assign_hits = function(faction, hits) {
	    for (let z = space.units[faction].length-1; assign_hits >= 2 && z >= 0; z--) {
	      if (space.units[faction][z].type == "squadron") {
		space.units[faction].splice(z, 1);
		assign_hits-=2;
	      }
	    }
	  }

	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {
	    if (faction == this.game.state.naval_battle.attacker_faction) {
	      if (this.game.state.naval_battle.defender_hits > 0) {
	        assign_hits(faction, this.game.state.naval_battle.defender_hits);
	      }
	    } else {
	      if (this.game.state.naval_battle.attacker_hits > 0) {
	        assign_hits(faction, this.game.state.naval_battle.attacker_hits);
	      }
	    }

            his_self.naval_battle_overlay.renderNavalBattle(his_self.game.state.naval_battle);
            his_self.naval_battle_overlay.updateInstructions("Independent Hits Assigned");

	    return 1;

	  } else {

            his_self.naval_battle_overlay.renderNavalBattle(his_self.game.state.naval_battle);
	    if (his_self.game.player == this.returnPlayerCommandingFaction(faction)) {
	      if (his_self.returnPlayerCommandingFaction(faction) == his_self.returnPlayerCommandingFaction(his_self.game.state.naval_battle.attacker_faction)) {
	        if (this.game.state.naval_battle.defender_hits > 0) {
                  his_self.naval_battle_overlay.assignHits(his_self.game.state.naval_battle, faction);
	        } else {
		  his_self.endTurn();
		}
	      } else {
	        if (this.game.state.naval_battle.attacker_hits > 0) {
                  his_self.naval_battle_overlay.assignHits(his_self.game.state.naval_battle, faction);
	        } else {
		  his_self.endTurn();
		}
	      }
	    } else {
	      if (his_self.returnPlayerCommandingFaction(faction) == his_self.returnPlayerCommandingFaction(this.game.state.naval_battle.attacker_faction)) {
	        if (this.game.state.naval_battle.defender_hits > 0) {
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " Assigning Hits");
	        } else {
		  his_self.updateStatus(his_self.returnFactionName(faction) + " - Fleet Survives Intact");
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " Unscathed - click to continue");
		}
	      } else {
	        if (this.game.state.naval_battle.attacker_hits > 0) {
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " Assigning Hits");
	        } else {
		  his_self.updateStatus(his_self.returnFactionName(faction) + " - Fleet Survives Intact");
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " Unscathed - click to continue");
		}
	      }
	    }
	  }

	  return 0;

	}





        if (mv[0] === "assault_assign_hits") {

	  //
	  // major powers may assign hits completely to minor allies, but they have
	  // to split hits, with a random roll used to determine who takes the extra
	  // hit ON DEFENSE. the active power assigns hits independently to any land
	  // units who attack.
	  //
	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  let space = this.game.spaces[this.game.state.assault.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // we auto-assign the hits to independent, non-player controlled units
	  // this function handles that.
	  //
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;
	    let faction_map = his_self.game.state.assault.faction_map;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] == faction) {
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }

	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] == faction) {
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
	          if (faction_map[f] == faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "mercenary"; }
		        if (zzz == 1) { cannon_fodder = "regular"; }
		        if (zzz == 2) { cannon_fodder = "cavalry"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type == cannon_fodder) {

			    //
			    // and remove from field battle unit
			    //
		            if (faction == his_self.game.state.assault_attacker_faction) {
			      for (let z = 0; z < his_self.game.state.assault.attacker_units.length; z++) {
			        let u = his_self.game.state.assault.attacker_units[z];
			        if (u.type == cannon_fodder) {
			          if (!his_self.game.state.assault.attacker_units_destroyed.includes(z)) {
			            his_self.game.state.assault.attacker_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }
		            if (faction == his_self.game.state.assault_defender_faction) {
			      for (let z = 0; z < his_self.game.state.assault.defender_units.length; z++) {
			        let u = his_self.game.state.assault.defender_units[z];
			        if (u.type == cannon_fodder) {
			          if (!his_self.game.state.assault.defender_units_destroyed.includes(z)) {
			            his_self.game.state.assault.defender_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }

		  	    space.units[f].splice(i, 1);
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
	          if (faction_map[f] == faction) {
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
                      if (space.units[selected_faction][ii].type == cannon_fodder) {

			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
	  		his_self.game.state.assault.attacker_units_destroyed = [];
	  		his_self.game.state.assault.defender_units_destroyed = [];

                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {

	    if (faction == this.game.state.assault.attacker_faction) {
	      assign_hits(faction, this.game.state.assault.defender_hits);
	    } else {
	      assign_hits(faction, this.game.state.assault.attacker_hits);
	    }

            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.updateInstructions("Independent Hits Assigned");
	    his_self.assault_overlay.pullHudOverOverlay();

	    return 1;
	  }

	  //
	  // no hits assignment if no hits
	  //
	  //
	  if (faction == this.game.state.assault.attacker_faction) {
	    if (this.game.state.assault.defender_hits == 0) { return 1; }
	  } else {
	    if (this.game.state.assault.attacker_hits == 0) { return 1; }
	  }

	  //
	  // if we hit this point we need manual intervention to assign the hits.
	  // the attacker can assign hits however they prefer if others join them
	  // in the attack, but if two major powers share defense then the hits
	  // are divided evenly among them.
	  //
          let hits_to_assign = this.game.state.assault.attacker_hits;
	  if (faction == this.game.state.assault.attacker_faction) {
            hits_to_assign = this.game.state.assault.defender_hits;
	  }

          let defending_factions = [];
          let defending_factions_count = 0;
          let defending_major_powers = 0;
          let defending_factions_hits = [];
	  let major_power = false;
	  let multiple_major_powers = false;
	  let defender_units_capable_of_taking_hits = 0;
	  for (let f in this.game.state.assault.faction_map) {
	    if (this.game.state.assault.faction_map[f] == faction) {
	      defender_units_capable_of_taking_hits += this.returnFactionLandUnitsInSpace(f, this.game.state.assault.spacekey);
	      if (this.isMajorPower(f)) {
		if (major_power) { multiple_major_powers = true; }
	        defending_factions.push(f);
                defending_factions_hits.push(0);
		major_power = true;
		defending_major_powers++;
	      } else {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
	    }
	  }

	  //
	  // no-one to take hits
	  //
	  if (defender_units_capable_of_taking_hits == 0) { return 1; }

	  //
	  // every gets shared hits
	  //
	  if (multiple_major_powers) {
  	    if (defending_factions_hits.length > 0) {
	      while (major_power == true && hits_to_assign > defending_factions_hits.length) {
	        for (let i = 0; i < defending_factions_hits.length; i++) { defending_factions_hits[i]++; }
	        hits_to_assign -= defending_factions_hits.length;
	      }
	    }

	    //
	    // randomly assign remainder
	    //
	    let already_punished = [];
	    if (defending_factions_hits.length > 0 && hits_to_assign > 0) {
	      for (let i = 0; i < hits_to_assign; i++) {
	        let unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	        while (already_punished.includes(unlucky_faction)) {
	          unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	        }
	        defending_factions_hits[unlucky_faction]++;
	        already_punished.push(unlucky_faction);
	      }
	      hits_to_assign = 0;
	    }

	    //
	    // defending major powers
	    //
	    for (let i = 0; i < defending_factions_hits.length; i++) {
  	      this.game.queue.push(`assault_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
	    }
	    return 1;
	  }

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.assignHits(his_self.game.state.assault, faction);
	  } else {
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
	    his_self.updateStatus(this.returnFactionName(faction) + " Assigning Hits");
            his_self.assault_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;

	}

        //
        // variant of above when major powers have to split hits assignments
        //
	if (mv[0] === "field_battle_manually_assign_hits") {

	  let his_self = this;
	  let faction = mv[1];
	  let hits = parseInt(mv[2]);
	  let player = this.returnPlayerOfFaction(faction);
	  let space = this.game.spaces[this.game.state.field_battle.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.assignHitsManually(his_self.game.state.field_battle, faction, hits);
	  } else {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;
        }

        //
        // variant of above when major powers have to split hits assignments
        //
	if (mv[0] === "assault_manually_assign_hits") {

	  let his_self = this;
	  let faction = mv[1];
	  let hits = parseInt(mv[2]);
	  let player = this.returnPlayerOfFaction(faction);
	  let space = this.game.spaces[this.game.state.assault.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.assignHitsManually(his_self.game.state.assault, faction, hits);
	  } else {
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;
        }

        if (mv[0] === "assault_show_hits_render") {
          this.game.queue.splice(qe, 1);
          this.assault_overlay.render(his_self.game.state.assault);
          this.assault_overlay.pullHudOverOverlay();
          return 1;
        }
          
	if (mv[0] === "assault_assign_hits_render") {
          this.game.queue.splice(qe, 1);
          this.assault_overlay.render(his_self.game.state.assault);
          this.assault_overlay.pullHudOverOverlay();
	  return 1;
	}

	if (mv[0] === "naval_battle_assign_hits_render") {
          this.game.queue.splice(qe, 1);
          this.naval_battle_overlay.render(his_self.game.state.naval_battle);
	  return 1;
	}

	if (mv[0] === "field_battle_assign_hits_render") {
          this.game.queue.splice(qe, 1);
          this.field_battle_overlay.render(his_self.game.state.field_battle);
          this.field_battle_overlay.pullHudOverOverlay();
	  return 1;
	}


	if (mv[0] === "destroy_faction_units_in_spacekey") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let space = null;

          this.game.queue.splice(qe, 1);

	  try { if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; } } catch (err) {}
	  try { if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; } } catch (err) {}

	  let is_processed = false;

	  if (this.game.state.field_battle) {
	    if (this.game.state.field_battle.spacekey == spacekey) {
	      for (let f in this.game.state.field_battle.faction_map) {
	        if (this.game.state.field_battle.faction_map[f] == faction) {
	          is_processed = true;
		  for (let z = 0; z < space.units[f].length; z++) {
		    let u = space.units[f][z];
		    if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry" || u.type == "squadron" || u.type == "corsair") {
		      space.units[f].splice(z, 1);
		      z--;
		    }
		  }
		}
	      }
	    }
	  }
	  if (is_processed == false && this.game.state.assault) {
	    if (this.game.state.assault.spacekey == spacekey) {
	      for (let f in this.game.state.assault.faction_map) {
	        if (this.game.state.assault.faction_map[f] == faction) {
		  is_processed = true;
		  for (let z = 0; z < space.units[f].length; z++) {
		    let u = space.units[f][z];
		    if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry" || u.type == "squadron" || u.type == "corsair") {
		      space.units[f].splice(z, 1);
		      z--;
		    }
		  }
	        }
	      }
	    }
	  }

	  if (is_processed == false) {
	    for (let z = space.units[faction].length-1; z >= 0; z--) {
	      let u = space.units[faction][z];
	      if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry" || u.type == "squadron" || u.type == "corsair") {
	        space.units[faction].splice(z, 1);
	      }
	    }
	  }

          this.refreshBoardUnits();
	  this.displaySpace(spacekey);

	  return 1;
	}




 	if (mv[0] === "siege_destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

          this.game.queue.splice(qe, 1);

	  let space = this.game.spaces[spacekey];
	  let unit_destroyed = false;

	  for (let i = 0; i < space.units[faction].length && unit_destroyed == false; i++) {
	    if (space.units[faction][i].type == unit_type) {
	      if (this.game.state.assault.faction_map[faction] == this.game.state.assault.attacker_faction) {
		for (let z = 0; z < this.game.state.assault.attacker_units_units.length; z++) {
		  if (this.game.state.assault.attacker_units_units[z].type == space.units[faction][i].type) {
		    if (!this.game.state.assault.attacker_units_destroyed.includes(z)) {
		      this.game.state.assault.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.assault.defender_units_units.length; z++) {
		  if (this.game.state.assault.defender_units_units[z].type == space.units[faction][i].type) {
		    if (!this.game.state.assault.defender_units_destroyed.includes(z)) {
		      this.game.state.assault.defender_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      }
	      space.units[faction].splice(i, 1);
	      unit_destroyed = true;
	    }
	  }

	  return 1;

	}

 	if (mv[0] === "field_battle_destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

          this.game.queue.splice(qe, 1);

	  let space = this.game.spaces[spacekey];
	  let unit_destroyed = false;

	  for (let i = 0; i < space.units[faction].length && unit_destroyed == false; i++) {
	    if (space.units[faction][i].type == unit_type) {
	      if (this.game.state.field_battle.faction_map[faction] == this.game.state.field_battle.attacker_faction) {
		for (let z = 0; z < this.game.state.field_battle.attacker_units.length; z++) {
		  if (this.game.state.field_battle.attacker_units[z] == space.units[faction][i].type) {
		    if (!this.game.state.field_battle.attacker_units_destroyed.includes(z)) {
		      this.game.state.field_battle.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.field_battle.defender_units.length; z++) {
		  if (this.game.state.field_battle.defender_units[z].type == space.units[faction][i].type) {
		    if (!this.game.state.field_battle.defender_units_destroyed.includes(z)) {
		      this.game.state.field_battle.defender_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      }
	      space.units[faction].splice(i, 1);
	      unit_destroyed = true;
	    }
	  }

	  return 1;

	}



 	if (mv[0] === "naval_battle_destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

          this.game.queue.splice(qe, 1);

	  let space;
          if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
          if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }
	  let unit_destroyed = false;

	  for (let i = 0; i < space.units[faction].length && unit_destroyed == false; i++) {
	    if (space.units[faction][i].type == unit_type) {
	      if (this.game.state.naval_battle.faction_map[faction] == this.game.state.naval_battle.attacker_faction) {
		for (let z = 0; z < this.game.state.naval_battle.attacker_units.length; z++) {
		  if (this.game.state.naval_battle.attacker_units[z] == space.units[faction][i].type) {
		    if (!this.game.state.naval_battle.attacker_units_destroyed.includes(z)) {
		      this.game.state.naval_battle.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.naval_battle.defender_units.length; z++) {
		  if (this.game.state.naval_battle.defender_units[z].type == space.units[faction][i].type) {
		    if (!this.game.state.naval_battle.defender_units_destroyed.includes(z)) {
		      this.game.state.naval_battle.defender_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      }
	      space.units[faction].splice(i, 1);
	      unit_destroyed = true;
	    }
	  }

	  return 1;

	}


	if (mv[0] === "foreign-war-cleanup") {

          this.game.state.foreign_wars_fought_this_impulse.push(spacekey);

          this.game.queue.splice(qe, 1);
	  let faction = "ottoman";
	  let spacekey = mv[1];
	  if (spacekey == "ireland") { faction = "england"; }

	  //
	  // no need for cleanup unless battle is over
	  //
	  if (!this.doesSpaceHaveNonFactionUnits(spacekey, faction)) {

	    if (spacekey == "ireland") { this.updateLog("Revolt in Ireland finishes, English forces return to London"); }
	    if (spacekey == "persia") { this.updateLog("War in Persia finishes, Turkish forces return to Istanbul"); }
	    if (spacekey == "egypt") { this.updateLog("Revolt in Egypt finishes, Turkish forces return to Istanbul"); }

	    //
	    // move all soldiers back to capital (if controlled)
	    //
	    let s = this.game.spaces[spacekey];
	    if (faction == "england") {
	      for (let i = 0; i < s.units[faction].length; i++) {
	        this.game.spaces["london"].units["england"].push(s.units[faction][i]);
	      }
	      s.units[faction] = [];
	    }

	    if (faction == "ottoman") {
	      for (let i = 0; i < s.units[faction].length; i++) {
	        this.game.spaces["istanbul"].units["ottoman"].push(s.units[faction][i]);
	      }
	      s.units[faction] = [];
	    }

	    //
	    // remove -1 war effect
	    //
	    if (spacekey == "ireland") {
	      this.game.state.england_war_winner_vp++;
              this.game.state.events.revolt_in_ireland = 0;
              this.hideIreland();
	    }
	    if (spacekey == "persia") {
	      this.game.state.ottoman_war_winner_vp++;
              this.game.state.events.war_in_persia = 0;
              this.hidePersia();
	    }
	    if (spacekey == "egypt") {
	      this.game.state.ottoman_war_winner_vp++;
              this.game.state.events.revolt_in_egypt = 0;
              this.hideEgypt();
	    }
	  }

	  return 1;

	}

	if (mv[0] === "field_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[1]];

	  //
	  // foreign wars handle their own post-battle clean-up
	  //
	  if (mv[1] == "persia" || mv[1] == "ireland" || mv[1] == "egypt") {
	    his_self.game.queue.push("foreign-war-cleanup\t"+mv[1]);
	    return 1;
	  }

	  //
	  // hits assignment happens here
	  //
	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.field_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.field_battle.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + his_self.game.state.field_battle.attacker_hits);
	  his_self.updateLog("Defender Hits: " + his_self.game.state.field_battle.defender_hits);

	  this.field_battle_overlay.renderFieldBattle(this.game.state.field_battle);

	  //
	  // who won ?
	  //
	  let winner = his_self.game.state.field_battle.defender_faction;
	  if (his_self.game.state.field_battle.attacker_hits > his_self.game.state.field_battle.defender_hits) {
	    winner = his_self.game.state.field_battle.attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
          his_self.game.state.field_battle.attacker_land_units_remaining = his_self.game.state.field_battle.attacker_units.length - his_self.game.state.field_battle.defender_hits;
	  let du = 0;
	  for (let i = 0; i < his_self.game.state.field_battle.defender_units.length; i++) {
	    if (his_self.game.state.field_battle.defender_units[i] != "defender") { du++; }
	  }
	  his_self.game.state.field_battle.defender_land_units_remaining = du - his_self.game.state.field_battle.attacker_hits;

	  if (his_self.game.state.field_battle.attacker_land_units_remaining == 0 && his_self.game.state.field_battle.defender_land_units_remaining == 0) {
	    if (his_self.game.state.field_battle.attacker_rolls > his_self.game.state.field_battle.defender_rolls) {
	      his_self.updateLog("Attacker adds 1 regular");
	      his_self.addRegular(his_self.game.state.field_battle.attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 regular");
	      his_self.addRegular(his_self.game.state.field_battle.defender_faction, space);
	    }
	  }


	  //
	  // capture stranded leaders
	  //
	  if (his_self.game.state.field_battle.attacker_land_units_remaining == 0) {
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.defender_faction, his_self.game.state.field_battle.attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (his_self.game.state.field_battle.defender_land_units_remaining == 0) {
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.attacker_faction, his_self.game.state.field_battle.defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }


	  //
	  // sack of rome exits
	  //
	  if (this.game.state.events.sack_of_rome == 1) {
	    return 1;
	  }

	  //
	  // unexpected war -- everyone retreats or gets destroyed
	  //
	  if (his_self.game.state.events.unexpected_war == 1) {
            for (let f in his_self.game.state.field_battle.faction_map) {
              if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.attacker_faction) {
	        this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
              }
              if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.defender_faction) {
	        this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
              }
	    }
            this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
            this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	    this.displaySpace(space.key);
	    return 1;
	  }


          //
          // conduct retreats
          //
          if (winner === his_self.game.state.field_battle.defender_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_defenders_win");

	    //
	    // do any attacking units remain
	    //
	    let do_any_attacker_units_remain = false;
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.attacker_faction) {
		if (his_self.returnFactionLandUnitsInSpace(f, space.key) > 0) { do_any_attacker_units_remain = true; break; }
	      }
	    }

            //
            // if the space is besieged and the attacker controls it, this was a field battle triggered by the 
	    // defender putting it under siege earlier, in which case we want to permit the attacker to re-fortify
	    // IF there are any attacker units that survived...
	    //
            if (this.isSpaceControlled(space.key, his_self.game.state.field_battle.attacker_faction) && space.besieged > 0 && his_self.game.state.active_faction == his_self.game.state.attacker_faction) {
	      // attacker and defender oddly reversed
	      if (do_any_attacker_units_remain) {
                this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
                this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.defender_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.attacker_faction)+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
	      }

            } else {

              for (let f in his_self.game.state.field_battle.faction_map) {
                let can_faction_retreat = 0;
                if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.attacker_faction) {
		  if (his_self.returnFactionLandUnitsInSpace(f, space.key) > 0) {
                    for (let z = 0; z < space.neighbours.length; z++) {
		      //
		      // attacker must retreat into space it entered from -- if controlled by ally
		      //
		      if (space.neighbours[z] == this.game.state.attacker_comes_from_this_spacekey) {
		        let fac = this.returnFactionControllingSpace(space.neighbours[z]);
		        if (fac == f || this.areAllies(fac, f)) { can_faction_retreat = 1; }
		      }
                    }
                    if (can_faction_retreat == 1) {
                      this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	  	      if (his_self.game.state.field_battle.attacker_land_units_remaining > 0) {
                        this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                      }
                    }
	            if (can_faction_retreat == 0) {
                      this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	            }
		  } else {
                    this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
		  }
                }
	      }
	      if (this.isSpaceControlled(space.key, his_self.game.state.field_battle.attacker_faction)) {
		// attacker here means "not me", since "I'm fortifying"
                this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.defender_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.attacker_faction)+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
	      }
	    }
          }

          if (winner == his_self.game.state.field_battle.attacker_faction) {

            for (let f in his_self.game.state.field_battle.faction_map) {
              if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.defender_faction) {
                this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
	      }
	    }

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_attackers_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.defender_faction) {
	        if (his_self.returnFactionLandUnitsInSpace(f, space.key) > 0) {
                  for (let z = 0; z < space.neighbours.length; z++) {
                    let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], his_self.game.state.attacker_comes_from_this_spacekey);
                    if (fluis > 0) {
                      can_faction_retreat = 1;
                    }
                  }
                  if (can_faction_retreat == 1) {
                    this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
		    if (his_self.game.state.field_battle.defender_land_units_remaining > 0) {
		      this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                    }
                  }
		  if (space.units[f].length > 0) {
		    if (his_self.isSpaceControlled(space.key, his_self.game.state.field_battle.defender_faction)) {
                      this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.attacker_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.defender_faction)+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	            }
	          }
	        } else {
		  // no retreat possible
                  this.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
		}
              }
            }

        
            //
            // if the space is besieged and is friendly to the attacker, un-besiege defenders
            // 
            if (this.isSpaceFriendly(his_self.game.state.field_battle.spacekey, his_self.game.state.field_battle.attacker_faction) && space.besieged > 0) {
              space.besieged = 0;
              for (let key in space.units) {
                for (let ii = 0; ii < space.units[key].length; ii++) {
                  space.units[key][ii].besieged = 0;
                }
              }
            }

	    //
	    // if the space does not belong to the attacker and is a key, we put it under seige
	    //
	    if (!this.isSpaceFriendly(his_self.game.state.field_battle.spacekey, his_self.game.state.field_battle.attacker_faction) && space.besieged == 0 && (space.type == "key" || space.type == "electorate" || space.type == "fortress")) {
	      this.game.queue.push("besiege_space\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
	    }


	    let defender_player = this.returnPlayerCommandingFaction(his_self.game.state.field_battle.defender_faction);
	    let attacker_player = this.returnPlayerCommandingFaction(his_self.game.state.field_battle.attacker_faction);

	    //
	    // if the defender is the active player AND controls the space, they can fortify
	    //
	    if (defender_player == this.game.state.active_player && this.isSpaceControlled(his_self.game.state.field_battle.spacekey, his_self.game.state.field_battle.defender_faction)) {
              this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.attacker_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.defender_faction)+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	    // otherwise they need to retreat
	    } else {
              for (let f in his_self.game.state.field_battle.faction_map) {
                let can_faction_retreat = 0;
                if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.defender_faction) {
                  for (let z = 0; z < space.neighbours.length; z++) {
                    let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], "");
                    if (fluis > 0) {
                      can_faction_retreat = 1;
                    }
                  }
                  if (can_faction_retreat == 1) {
                    this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
		    if (his_self.game.state.field_battle.defender_land_units_remaining > 0) {
                      this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                    }
                  }
	          if (can_faction_retreat == 0) {
                    this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
	          }
                }
              }
	    }
          }


          //
          // redisplay
          //
          his_self.displaySpace(space.key);

	  //
	  // show field battle overlay
	  //
          his_self.field_battle_overlay.renderPostFieldBattle(his_self.game.state.field_battle);
          his_self.field_battle_overlay.pullHudOverOverlay();

	  //
	  // reset
	  //
	  his_self.game.state.field_battle.relief_force = 0;

          return 1;

        }


	if (mv[0] === "besiege_space") {

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let space = this.game.spaces[spacekey];

	  if (space) {
	    if (space.besieged == 0) {
              space.besieged = 2;
              for (let key in space.units) {
	        if (!this.areAllies(key, attacker)) {
                  for (let ii = 0; ii < space.units[key].length; ii++) {
                    space.units[key][ii].besieged = 1;
                  }
                }
              }
            }
          }

          this.game.queue.splice(qe, 1);
	  return 1;
	}


 	if (mv[0] === "destroy_unit_by_type") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

	  if (this.game.spaces[spacekey]) {
	    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
	      if (this.game.spaces[spacekey].units[faction][i].type == unit_type) {
	        this.game.spaces[spacekey].units[faction].splice(i, 1);
		i = this.game.spaces[spacekey].units[faction].length + 10;
		break;
	      }
	    }
	  }
	  if (this.game.navalspaces[spacekey]) {
	    for (let i = 0; i < this.game.navalspaces[spacekey].units[faction].length; i++) {
	      if (this.game.navalspaces[spacekey].units[faction][i].type == unit_type) {
	        this.game.navalspaces[spacekey].units[faction].splice(i, 1);
		i = this.game.navalspaces[spacekey].units[faction].length + 10;
		break;
	      }
	    }
	  }

	  this.updateLog(this.returnFactionName(faction) + " " + unit_type + " destroyed in " + this.returnSpaceName(spacekey));
	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);
          this.game.queue.splice(qe, 1);

	  //
	  // check if triggers defeat of Hungary Bohemia
	  //
          this.triggerDefeatOfHungaryBohemia();

	  return 1;

        }
 	if (mv[0] === "destroy_unit_by_index") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_idx = parseInt(mv[3]);

	  if (this.game.spaces[spacekey]) {
	    this.game.spaces[spacekey].units[faction].splice(unit_idx, 1);
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

	  //
	  // check if triggers defeat of Hungary Bohemia
	  //
          this.triggerDefeatOfHungaryBohemia();


          this.game.queue.splice(qe, 1);
	  return 1;

	}

 	if (mv[0] === "destroy_units") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }

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

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displayBoard();

	  //
	  // check if triggers defeat of Hungary Bohemia
	  //
          this.triggerDefeatOfHungaryBohemia();


	  return 1;

	}



	if (mv[0] === "piracy") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;

	  let faction = mv[1];
	  let target_navalspace = mv[2];
	  let target_port = mv[3];
	  let target_faction = "";


	  let anti_piracy_rolls = [];
	  let anti_piracy_faction = [];
	  let anti_piracy_unittype = [];
	  let piracy_rolls = [];
	  let piracy_faction = [];
	  let piracy_unittype = [];

	  let dragut = false;
      	  let barbarossa = false;

          this.game.state.events.ottoman_piracy_seazones.push(target_navalspace);
	  this.showPiracyMarker(target_navalspace);

      	  let target_space = this.game.navalspaces[target_navalspace];
      	  let adjacent_spaces = [];
	  let ports = [];

 	  let io = this.returnImpulseOrder();
 	  let factions_at_war_with_ottoman = his_self.returnEnemies("ottoman", true); // true = include minor powers

    	  for (let i = 0; i < target_space.neighbours.length; i++) {
    	    adjacent_spaces.push(his_self.game.navalspaces[target_space.neighbours[i]]);
    	  } 
    	  for (let i = 0; i < target_space.ports.length; i++) {
    	    adjacent_spaces.push(his_self.game.spaces[target_space.ports[i]]);
    	  } 

          ports = target_space.ports;
    	  for (let i = 0; i < target_space.units[faction].length; i++) {
    	    if (target_space.units[faction][i].type == "dragut") { dragut = true; }
    	    if (target_space.units[faction][i].type == "barbarossa") { barbarossa = true; }
    	  } 
          
          target_faction = this.game.spaces[target_port].political;
          if (target_faction == "") { target_faction = this.game.spaces[target_port].home; }
          if (!factions_at_war_with_ottoman.includes(target_faction)) { factions_at_war_with_ottoman.push(target_faction); }
          let opponent_dice = 0;


          //
          // targetted player dice
          // 2 dice per naval squadron in sea zone
          //
          for (let z = 0; z < target_space.units[target_faction].length; z++) {
            if (target_space.units[target_faction][z].type == "squadron") {
	      opponent_dice += 2;
	      anti_piracy_faction.push(target_faction);
	      anti_piracy_unittype.push("squadron");
	      anti_piracy_faction.push(target_faction);
	      anti_piracy_unittype.push("squadron");
	    }
          }

          //
          // 1 dice for their own or at-war-with-ottoman power (incl. minor) in port or adjacent sea-zone
          //
          for (let i = 0; i < adjacent_spaces.length; i++) {
            for (let k = 0; k < factions_at_war_with_ottoman.length; k++) {
              for (let z = 0; z < adjacent_spaces[i].units[factions_at_war_with_ottoman[k]].length; z++) {
                let u = adjacent_spaces[i].units[factions_at_war_with_ottoman[k]][z];
                if (u.type == "squadron") {
                  opponent_dice++;
	          anti_piracy_faction.push(factions_at_war_with_ottoman[k]);
	          anti_piracy_unittype.push("squadron");
                }
              }
            }
          }

          //
          // 1 dice for each fortres controlled by target, power at war, or St. John -- fortress adjacent
          //
          if (target_space.key == "atlantic" || target_space.key == "barbary") {
            let x = his_self.returnFactionControllingSpace("gibraltar");
            if (factions_at_war_with_ottoman.includes(x)) { 
	      anti_piracy_faction.push("gibraltar");
	      anti_piracy_unittype.push("fortress");
	      opponent_dice++;
	    }
          }
          if (target_space.key == "africa" || target_space.key == "ionian") {
            let x = his_self.returnFactionControllingSpace("malta");
            if (factions_at_war_with_ottoman.includes(x)) {
	      anti_piracy_faction.push("malta");
	      anti_piracy_unittype.push("fortress");
	      opponent_dice++;
            }
          }
          if (target_space.key == "africa" || target_space.key == "aegean") {
            let x = his_self.returnFactionControllingSpace("corfu");
            if (factions_at_war_with_ottoman.includes(x)) {
	      anti_piracy_faction.push("corfu");
	      anti_piracy_unittype.push("fortress");
	      opponent_dice++;
	    }
          }
          if (target_space.key == "adriatic" || target_space.key == "ionian") {
            let x = his_self.returnFactionControllingSpace("candia");
            if (factions_at_war_with_ottoman.includes(x)) {
	      anti_piracy_faction.push("candia");
	      anti_piracy_unittype.push("fortress");
	      opponent_dice++;
	    }
          }
          if (his_self.game.state.knights_of_st_john != "") {
            let indspace = his_self.game.spaces[his_self.game.state.knights_of_st_john];
            if (indspace.unrest == 0 && indspace.besieged == 0) {
              for (let b = 0; b < indspace.ports.length; b++) {
                if (indspace.ports[b] == target_space.key) {
	          anti_piracy_faction.push(indspace.ports[b]);
	          anti_piracy_unittype.push("fortress");
                  opponent_dice++;
                }
              }
            }
          }

	  his_self.updateLog("Anti-Piracy Dice: " + opponent_dice);

          //
          // eliminate 1 corsair for each hit of 5 or 6
          //
          let hits = 0;
          for (let i = 0; i < opponent_dice; i++) {
	    let x = his_self.rollDice(6);
	    anti_piracy_rolls.push(x);
	    if (x >= 5) { hits++; }
          }

	  his_self.updateLog("Anti-Piracy Dice: " + opponent_dice);
	  his_self.updateLog("Anti-Piracy Rolls: " + JSON.stringify(anti_piracy_rolls));

	  if (hits > 0) {
	    for (let z = 0; hits > 0 && z < target_space.units["ottoman"].length; z++) {
	      let u = target_space.units["ottoman"][z];
	      if (u.type == "corsair") {
		target_space.units["ottoman"].splice(z, 1);
	        hits--;
		z--;
	      }
	    }
	  }

	  //
	  // how many corsairs left
	  //
	  let corsairs_remaining = 0;
	  for (let z = 0; z < target_space.units["ottoman"].length; z++) {
	    if (target_space.units["ottoman"][z].type == "corsair") {
	      corsairs_remaining++;
	    }
	  }

	  //
	  // how many target ports
	  //
	  let targetted_ports = 0;
	  for (let z = 0; z < target_space.ports.length; z++) {
	    if (his_self.returnFactionControllingSpace(target_space.ports[z]) == target_faction) {
	      targetted_ports++;
	    }
	  }


	  let piracy_dice = 0;

	  if (corsairs_remaining > 0) {
	    if (targetted_ports == 1) {
	      piracy_dice = 1;
	      piracy_unittype.push("corsairs");
	      piracy_faction.push("targetting single port");
	    } else {
	      if (corsairs_remaining == 1) {
	 	piracy_dice = 1;
	        piracy_unittype.push("corsairs");
	        piracy_faction.push("targeting multiple ports");
	      } else {
	 	if (corsairs_remaining > 1) {
		  piracy_dice = 2;
	          piracy_unittype.push("corsairs");
	          piracy_unittype.push("corsairs");
	          piracy_faction.push("targetting multiple ports");
	          piracy_faction.push("targetting multiple ports");
		}
	      }
	    }
	  }

	  if (piracy_dice == 0) {
	    his_self.updateLog("No corsairs remaining - piracy cancelled");
	    return 1;
	  }

	  if (barbarossa) {
	    piracy_dice += 1;
	    piracy_unittype.push("barbarossa");
	    piracy_faction.push("pirate leader");
	  }
	  if (dragut) {
	    piracy_dice += 2;
	    piracy_unittype.push("dragut");
	    piracy_faction.push("pirate leader");
	    piracy_unittype.push("dragut");
	    piracy_faction.push("pirate leader");
	  }

	  his_self.updateLog("Piracy dice: " + piracy_dice);

	  let piracy_hits = 0;
	  piracy_rolls = [];
	  for (let i = 0; i < piracy_dice; i++) {
	    let x = his_self.rollDice(6);
	    piracy_rolls.push(x);
	    if (x >= 5) { piracy_hits++; }
	  }

	  his_self.updateLog("Piracy rolls: " + JSON.stringify(piracy_rolls));



	  //
	  // create piracy object foroverlay
	  //
	  let pobj = {
	    anti_piracy_rolls : anti_piracy_rolls,
	    anti_piracy_faction : anti_piracy_faction,
	    anti_piracy_unittype : anti_piracy_unittype,
	    piracy_rolls : piracy_rolls,
	    piracy_faction : piracy_faction,
	    piracy_unittype : piracy_unittype,
	  };


	  this.piracy_overlay.render(pobj);

	  if (piracy_hits > 0) {
            if (his_self.game.state.events.julia_gonzaga_activated == 1 && target_navalspace == "tyrrhenian") {
              his_self.game.queue.push("SETVAR\tstate\tevents\tottoman_julia_gonzaga_vp\t1");
	    }
	    his_self.game.queue.push("piracy_hits\t"+target_faction+"\t"+piracy_hits+"\t"+target_port+"\t"+target_navalspace);
	  }

	  return 1;

	}



	// Machiavelli, Defeat of Hungary a
	// Three Event cards (Schmalkaldic League, Machiavelli: “The Prince”, and Six Wives of Henry VIII) create a state of war 
	// during the Action Phase. The Ottoman defeat of Hungary may trigger a state of war with the Hapsburg during the Action 
	// Phase (Section 22.5). Finally, the activation of a minor power can create a state of war between major powers 
	// (Section 22.2). Add an appropriate marker to the Diplomatic Status Display when any of these five events occurs.
	// If naval units of the two powers now at war occupy the same sea zone, fight an immediate naval battle between the 
	// two powers. If the number of hits is equal, both sides must retreat (an exception to the usual naval combat rule)
	//
	if (mv[0] === "unexpected_war") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction1 = mv[1];
	  let faction2 = mv[2];

          his_self.game.queue.push("SETVAR\tstate\tevents\tunexpected_war\t0");

	  for (let key in his_self.game.navalspaces) {
	    let faction1_present = 0;
	    let faction2_present = 0;
	    let space = his_self.game.navalspaces[key];
	    for (let f in space.units) {
	      if (space.units[f].length > 0) {
		if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction1)) {
		  faction1_present = 1;
	        }
		if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction2)) {
		  faction2_present = 1;
	        }
	      }
	    }
	    if (faction1_present == 1 && faction2_present == 1) {
              his_self.game.queue.push("naval_battle\t"+key+"\t"+faction1);
	    }
	  }

	  for (let key in his_self.game.spaces) {
	    let faction1_present = 0;
	    let faction2_present = 0;
	    let space = his_self.game.spaces[key];
	    for (let f in space.units) {
	      if (space.units[f].length > 0) {
		if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction1)) {
		  faction1_present = 1;
	        }
		if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction2)) {
		  faction2_present = 1;
	        }
	      }
	    }
	    if (faction1_present == 1 && faction2_present == 1) {
	      if (!his_self.isSpaceBesieged(key)) {
		// attacker will be one that does not control the space
		let fac = his_self.returnFactionControllingSpace(key);
		if (his_self.areAllies(fac, faction1)) {
                  his_self.game.queue.push("field_battle\t"+key+"\t"+faction2);
		} else {
                  his_self.game.queue.push("field_battle\t"+key+"\t"+faction1);
		}
	      }
	    }
	  }

          his_self.game.queue.push("SETVAR\tstate\tevents\tunexpected_war\t1");
	  return 1;

	}


	if (mv[0] === "piracy_hits") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction = mv[1];
	  let hits = parseInt(mv[2]);
	  let target_port = mv[3];
	  let target_navalspace = mv[4];
	  let hits_given = 0;
          let squadron_count = 0;
          let card_count = 0;
	  let vp_count = 0;

	  let squadrons_offered = 0;
	  let cards_offered = 0;
	  let vp_offered = 0;

	  let options = ["eliminate","card","vp"];
	  let issued = [];

	  //
	  // cannot choose an option with no benefits, and must choose all possible
	  // options before giving one a second time. in order to know how many times
	  // we can issue a card or sacrifice a squadron, we need to know how many
	  // of those exist.
	  //
	  // first count squadrons that can be removed
	  //
          let target_space = this.game.spaces[target_port];
          target_navalspace = this.game.navalspaces[target_navalspace];
          let adjacent_spaces = [];

          for (let i = 0; i < target_navalspace.ports.length; i++) {
            adjacent_spaces.push(target_navalspace.ports[i]);
          }
	  adjacent_spaces.push(mv[4]);
          for (let i = 0; i < target_navalspace.neighbours.length; i++) {
            adjacent_spaces.push(target_navalspace.neighbours[i]);
          }
          for (let p = 0; p < adjacent_spaces.length; p++) {
	    let ts = adjacent_spaces[p];
	    let s = null;
	    if (this.game.spaces[ts]) { s = this.game.spaces[ts]; }
	    if (this.game.navalspaces[ts]) { s = this.game.navalspaces[ts]; }

            for (let key in s.units) {
	      if (this.returnControllingPower(key) == faction) {
	        for (let i = 0; i < s.units[key].length; i++) {
		  if (s.units[key][i].type == "squadron") {
		    squadron_count++;
		  }
		}
	      }
	    }
	  }

          //let squadron_count = 0;
          //let card_count = 0;
	  //let vp_count = 0;
	  //let squadrons_offered = 0;
	  //let cards_offered = 0;
	  //let vp_offered = 0;

	  let total_vp_issuable = 10 - this.game.state.events.ottoman_piracy_vp;
	  let total_cards_issuable = 0;
	  let total_squadrons_issuable = squadron_count;

	  let vp_issuable = true;
	  let cards_issuable = true;
	  let squadrons_issuable = true;

	  if (total_vp_issuable == 0) { vp_issuable = false; }
	  if (total_cards_issuable == 0) { cards_issuable = false; }
	  if (total_squadrons_issuable == 0) { squadrons_issuable = false; }

	  let selectPiracyRewards = function(selectPiracyRewards) {

            let msg = `Offer the Ottoman Empire which Reward (${(hits_given+1)} of ${hits})? `;
            let html = '<ul>';

	    if (total_vp_issuable > vp_count) {
	      if (!(vp_count > card_count && cards_issuable == true) && !(vp_count > squadron_count && squadrons_issuable == true)) {
                html += `<li class="option" id="vp">give vp</li>`;
	      }	
	    }	
	    if (total_cards_issuable > card_count) {
	      if (!(card_count > vp_count && vp_issuable == true) && !(card_count > squadron_count && squadrons_issuable == true)) {
                html += `<li class="option" id="card">give card draw</li>`;
	      }	
	    }	
	    if (total_squadrons_issuable > squadron_count) {
	      if (!(squadron_count > card_count && cards_issuable == true) && (squadron_count > vp_count && vp_issuable == true)) {
                html += `<li class="option" id="squadron">destroy squadron</li>`;
	      }	
	    }	
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);
            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");
              $('.option').off();
	      hits_given++;

	      if (action == "vp") {
		vp_count++;
		his_self.addMove("piracy_reward_vp");
	      }
	      if (action == "card") {
		card_count++;
		his_self.addMove("piracy_reward_card\t"+faction);
	      }
	      if (action == "squadron") {
		his_self.addMove("piracy_reward_squadron\t"+faction+"\t"+mv[4]);
		squadron_count++;
	      }

	      if (hits_given < hits) {
	        selectPiracyRewards(selectPiracyRewards);
	      } else {
                his_self.updateStatus("acknowledge...");
	        his_self.endTurn();
	      }
	    });
          }

          if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

            let fhand_idx = this.returnFactionHandIdx(his_self.game.player, faction);
	    let card_count = this.game.deck[0].fhand[fhand_idx].length;
	    if (faction == "hapsburg" && !this.game.deck[0].discards['002']) { card_count--; }
	    if (faction == "england" && !this.game.deck[0].discards['003']) { card_count--; }
	    if (faction == "france" && !this.game.deck[0].discards['004']) { card_count--; }
	    if (faction == "papacy" && !this.game.deck[0].discards['005']) { card_count--; }
	    if (faction == "papacy" && !this.game.deck[0].discards['006']) { card_count--; }
	    if (faction == "protestant" && !this.game.deck[0].discards['007']) { card_count--; }
	    total_cards_issuable = card_count;
	    if (total_cards_issuable > 0) { cards_issuable = true; }

            selectPiracyRewards(selectPiracyRewards);

          } else {
            his_self.updateStatus(his_self.returnFactionName(faction) + " issuing Piracy Rewards");
          }

	  return 0;

	}

	if (mv[0] === "piracy_reward_vp") {
          this.game.queue.splice(qe, 1);
	  this.game.state.events.ottoman_piracy_vp++;
	  his_self.updateLog("Ottoman Empire earns VP from Piracy");
	  return 1;
	}

	if (mv[0] === "piracy_reward_card") {
          this.game.queue.splice(qe, 1);
	  this.game.queue.push("pull_card\tottoman\t"+mv[1]);
	  his_self.updateLog("Ottoman Empire earns Bonus Card from Piracy");
	  return 1;
	}

	if (mv[0] === "piracy_reward_squadron") {
          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let faction = mv[1];
	  let target_navalspace = mv[2];
	  let squadron_rich_targets = [];
          let target_space = this.game.navalspaces[target_navalspace];
          let adjacent_spaces = [];
          for (let i = 0; i < target_space.ports.length; i++) {
            adjacent_spaces.push(his_self.game.spaces[target_space.ports[i]]);
          }
	  adjacent_spaces.push(target_navalspace);
          for (let i = 0; i < target_space.neighbours.length; i++) {
            adjacent_spaces.push(his_self.game.spaces[target_space.ports[i]]);
          }
          for (let p = 0; p < adjacent_spaces.length; p++) {
	    let ts = adjacent_spaces[p];
	    let s = null;
	    if (this.game.spaces[ts]) { s = this.game.spaces[ts]; }
	    if (this.game.navalspaces[ts]) { s = this.game.navalspaces[ts]; }
            for (let key in s.units) {
	      if (this.returnControllingPower(key) == faction) {
	        for (let i = 0; i < s.units[key].length; i++) {
		  if (s.units[key][i].type == "squadron") {
		    if (!squadron_rich_targets.includes(key)) {
		      squadron_rich_targets.push(key);
		    }
		  }
		}
	      }
	    }
	  }

	  if (his_self.game.player === his_self.returnPlayerCommandingFaction(faction)) {
            let msg = "Destroy Squadron: ";
            let html = '<ul>';
	    for (let i = 0; i < squadron_rich_targets.length; i++) {
	      html += `<div class="option" id="${squadron_rich_targets[i]}">${his_self.returnPlaceName(squadron_rich_targets[i])}</div>`;
	    }
	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);
            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");
              $('.option').off();

	      his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " destroys squadron in " + his_self.returnSpaceName(action));
	      his_self.addMove("destroy_unit_by_type\t"+faction+"\t"+action+"\t"+"squadron");
	      his_self.endTurn();

	    });
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " destroying squadron...");
	  }

	  return 0;

	}


 	if (mv[0] === "destroy_naval_units") {
          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
	  if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

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

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displayBoard();

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
	      if (faction_map[f] == faction) {
	    	max_possible_hits_assignable += his_self.returnFactionSeaUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 1) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] == faction) {
		  if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 1) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] == faction) {
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 2; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "corsair"; }
		        if (zzz == 1) { cannon_fodder = "squadron"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type == cannon_fodder) {
		  	    space.units[f].splice(i, 1);
			    hits_to_assign -= 2;
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
	          if (faction_map[f] == faction) {
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
	      while (hits_to_assign > 1) {

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
                      if (space.units[selected_faction][ii].type == cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " sunk");
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign -= 2;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction sea units next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }

	  }

	  let faction_map       = his_self.game.state.naval_battle.faction_map;
	  let attacker_faction  = his_self.game.state.naval_battle.attacker_faction;
	  let defender_faction  = his_self.game.state.naval_battle.defender_faction;
          let attacker_player   = his_self.returnPlayerOfFaction(attacker_faction);
          let defender_player   = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_results  = his_self.game.state.naval_battle.attacker_results;
	  let defender_results  = his_self.game.state.naval_battle.defender_results;
	  let attacker_rolls    = his_self.game.state.naval_battle.attacker_rolls;
	  let defender_rolls    = his_self.game.state.naval_battle.defender_rolls;
	  let attacker_units    = his_self.game.state.naval_battle.attacker_units;
	  let defender_units    = his_self.game.state.naval_battle.defender_units;
	  let is_battle_in_port = his_self.game.state.naval_battle.is_battle_in_port;

	  let winner	        = defender_faction;
	  let attacker_hits     = 0;
	  let defender_hits     = 0;

	  //
	  // assign hits simultaneously
	  //
	  if (attacker_player > 0) {
	    let ap = his_self.game.state.players_info[attacker_player-1];
	    his_self.game.state.naval_battle.attacker_modified_rolls = modify_rolls(ap, attacker_results);
	  }

	  if (defender_player > 0) {
	    let dp = his_self.game.state.players_info[defender_player-1];
	    his_self.game.state.naval_battle.defender_modified_rolls = modify_rolls(dp, defender_results);
	  }

	  attacker_hits = calculate_hits(attacker_player, attacker_results);
	  defender_hits = calculate_hits(defender_player, defender_results);

	  if (attacker_player == 0) {
	    assign_hits(attacker_faction, defender_hits);
          }
	  if (defender_player == 0) {
	    assign_hits(defender_faction, attacker_hits);
          }

	  his_self.game.state.naval_battle.attacker_hits = attacker_hits;
	  his_self.game.state.naval_battle.defender_hits = defender_hits;

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  his_self.updateLog("Winner: " + winner);
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);
	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.naval_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.naval_battle.defender_modified_rolls));


	  //
	  // calculate units remaining
	  //
	  let attacker_sea_units_remaining = 0;
	  let defender_sea_units_remaining = 0;
	  for (let z = 0; z < space.units[attacker_faction].length; z++) {
	    let u = space.units[attacker_faction][z];
   	    if (u.type == "squadron" || u.type == "corsair") {
	      attacker_sea_units_remaining++;
	    }
	  }
	  for (let z = 0; z < space.units[defender_faction].length; z++) {
	    let u = space.units[defender_faction][z];
   	    if (u.type == "squadron" || u.type == "corsair") {
	      defender_sea_units_remaining++;
	    }
	  }

          his_self.game.state.naval_battle.attacker_sea_units_remaining = attacker_sea_units_remaining;
          his_self.game.state.naval_battle.defender_sea_units_remaining = defender_sea_units_remaining;

	  if (attacker_sea_units_remaining <= 0 && defender_sea_units_remaining <= 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 squadron");
	      his_self.addNavalSquadron(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 squadron");
	      his_self.addNavalSquadron(defender_faction, space);
	    }
	  }

	  //
	  // capture stranded leaders
	  //
	  if (attacker_sea_units_remaining <= 0) {
	    let f = attacker_faction;
	    for (let i = space.units[f].length-1; i >= 0; i--) {
	      his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
	      space.units[f].splice(i, 1);
	    }
	  }
	  if (defender_sea_units_remaining <= 0) {
	    let f = defender_faction;
	    for (let i = space.units[f].length-1; i >= 0; i--) {
	      his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
	      space.units[f].splice(i, 1);
	    }
	  }

          //          
          // unexpected war -- everyone retreats or gets destroyed
          //   
          if (his_self.game.state.events.unexpected_war == 1) {
            for (let f in his_self.game.state.naval_battle.faction_map) {
              if (his_self.game.state.naval_battle.faction_map[f] == his_self.game.state.naval_battle.attacker_faction) {
                this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.naval_battle.defender_faction+"\t"+space.key);
              }     
              if (his_self.game.state.naval_battle.faction_map[f] == his_self.game.state.naval_battle.defender_faction) {
                this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.naval_battle.attacker_faction+"\t"+space.key);
              }       
            }
	    if (attacker_sea_units_remaining > 0) {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+his_self.game.state.naval_battle.attacker_faction+"\t"+space.key);
	    }
	    if (defender_sea_units_remaining > 0) {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+his_self.game.state.naval_battle.defender_faction+"\t"+space.key);
	    }

	    this.displaySpace(space.key);
	    this.displayNavalSpace(space.key);
            return 1;
          }           

	  this.displaySpace(space.key);
	  this.displayNavalSpace(space.key);

	  this.updateLog("Winner: "+this.returnFactionName(winner));
	  this.updateLog("Attacker Units Remaining: "+attacker_sea_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_sea_units_remaining);


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
            if (winner == defender_faction) {
	      if (attacker_sea_units_remaining > 0) {
                this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+attacker_faction+"\t"+space.key);
                this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);
	      }
	    } else {
	      if (defender_sea_units_remaining > 0) {
                this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);
                this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+defender_faction+"\t"+space.key);
	      }
	    }

	  }

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
          this.game.state.assaulted_this_impulse = 1;

	  //
	  // calculate rolls
	  //
          let calculate_units = function(faction, space) {
	    let num = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type != "cavalry" && space.units[faction][i].personage == false) { num++; }
	    }
	    return num;
          }

	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_rating = function(faction) {
	    let highest_battle_rating = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_rating > 0) {
	        if (space.units[faction][i].gout != true) {
	          if (highest_battle_rating < space.units[faction][i].battle_rating) {
		    highest_battle_rating = space.units[faction][i].battle_rating;
		  }
		}
	      }
	    }
	    return highest_battle_rating;
          }


	  //
	  // this is run when a field battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let space = this.game.spaces[mv[2]];
	  let stage = "assault";

	  //
	  // keep track of assaulted spaces
	  //
 	  this.game.state.spaces_assaulted_this_turn.push(spacekey);

	  //
	  // prevent from being assaulted again
	  //
          space.besieged == 2;

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

	  //
	  // defender-identification can backfire if the attacker is the only faction
	  // in the space. so we want to safeguard against this and set the defender
	  // to whomever is controlling the space in the event that we cannot find
	  // anyone but the attacker here.
	  //
	  if (defender_faction == attacker_faction) {
	    defender_faction = his_self.returnFactionControllingSpace(space);
	  }

 	  let attacker_player = his_self.returnPlayerCommandingFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerCommandingFaction(defender_faction);

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
	    if (f !== attacker_faction && faction_map[f] == attacker_faction) {
	      try {
	      let p = his_self.game.state.players_info[his_self.returnPlayerCommandingFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) {
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	        }
	      }
	      } catch (err) {}
	    }
	    if (f !== defender_faction && faction_map[f] == defender_faction) {
	      try {
	      if (defender_player > 0) {
	        let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	        let dp = his_self.game.state.players_info[defender_player-1];
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	   	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
	      } catch (err) {}
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
          let attacker_units_units = [];
          let defender_units_units = [];
          let attacker_units_faction = [];
          let defender_units_faction = [defender_faction];
	  let attacker_highest_battle_rating = 0;
	  let defender_highest_battle_rating = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] == attacker_faction) {
	      let x = his_self.returnFactionLandUnitsInSpace(f, space);
	      attacker_units += x;
	      for (let i = 0; i < space.units[f].length; i++) {
		if (space.units[f][i].type == "regular" || space.units[f][i].type == "mercenary" || space.units[f][i].type == "cavalry") {
		  attacker_units_units.push(space.units[f][i]);
	        }
	      }
	      for (let i = 0; i < x; i++) { attacker_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > attacker_highest_battle_rating) {
		attacker_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	    if (faction_map[f] == defender_faction) {
	      let x = his_self.returnFactionLandUnitsInSpace(f, space);
	      defender_units += x;
	      for (let i = 0; i < space.units[f].length; i++) {
		if (space.units[f][i].type == "regular" || space.units[f][i].type == "mercenary" || space.units[f][i].type == "cavalry") {
		  defender_units_units.push(space.units[f][i]);
	        }
	      }
	      for (let i = 0; i < x; i++) { defender_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > defender_highest_battle_rating) {
		defender_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	  }

	  //
	  // calculate how many rolls attacker and defender get in this situation
	  //
	  if (defender_units == 0) {
	    attacker_rolls = attacker_units;
	    attacker_rolls += attacker_highest_battle_rating;
	    defender_rolls = 1 + defender_highest_battle_rating;
	  } else {
	    for (let i = 0; i < attacker_units; i++) {
	      if (i%2 === 0) { attacker_rolls++; }
	    }
	    attacker_rolls += attacker_highest_battle_rating;
	    defender_rolls = 1 + defender_units + defender_highest_battle_rating;
	  }

	  if (attacker_player > 0) {
	    if (his_self.game.state.players_info[attacker_player-1].tmp_roll_bonus) {
	      attacker_rolls += parseInt(his_self.game.state.players_info[attacker_player-1].tmp_roll_bonus);
	    }
	  }
	  if (defender_player > 0) {
	    if (his_self.game.state.players_info[defender_player-1].tmp_roll_bonus) {
	      defender_rolls += parseInt(his_self.game.state.players_info[defender_player-1].tmp_roll_bonus);
	    }
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
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ...: " + attacker_results[i]);
          }
	  this.updateLog("Attackers: " + attacker_rolls + " rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ...: " + defender_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " rolls");
	  this.updateLog("************************");
	  this.updateLog("******** Assault *******");
	  this.updateLog("************************");


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
	  his_self.game.state.assault.attacker_units_units = attacker_units_units;
	  his_self.game.state.assault.defender_units_units = defender_units_units;
	  his_self.game.state.assault.attacker_units_faction = attacker_units_faction;
	  his_self.game.state.assault.defender_units_faction = defender_units_faction;
	  his_self.game.state.assault.attacker_rolls = attacker_rolls;
	  his_self.game.state.assault.defender_rolls = defender_rolls;
	  his_self.game.state.assault.attacker_results = attacker_results;
	  his_self.game.state.assault.defender_results = defender_results;
	  his_self.game.state.assault.attacker_faction = attacker_faction;
	  his_self.game.state.assault.defender_faction = defender_faction;
	  his_self.game.state.assault.faction_map = faction_map;
	  his_self.game.state.assault.spacekey = spacekey;
	  his_self.game.state.assault.attacker_player = attacker_player;
	  his_self.game.state.assault.defender_player = defender_player;
	  his_self.game.state.assault.attacker_modified_rolls = attacker_rolls;
	  his_self.game.state.assault.defender_modified_rolls = defender_rolls;
          his_self.game.state.assault.attacker_hits = attacker_hits;
          his_self.game.state.assault.defender_hits = defender_hits;
          his_self.game.state.assault.attacker_units_destroyed = [];
          his_self.game.state.assault.defender_units_destroyed = [];
          his_self.game.state.assault.attacker_hits_first = 0;
          his_self.game.state.assault.defender_hits_first = 0;
          
	  his_self.game.queue.push(`assault_continue\t${mv[1]}\t${mv[2]}`);

          let ap = {};
          let dp = {};

          if (attacker_player > 0) { ap = this.game.state.players_info[attacker_player-1]; }
          if (defender_player > 0) { dp = this.game.state.players_info[defender_player-1]; }

          //
          // we stop here for intercession by cards that need to execute before the die rolls
	  // are assigned but after they have been rolled.
          //
          if (ap.tmp_roll_first == 1 && dp.tmp_roll_first != 1) {
            his_self.game.state.assault.attacker_hits_first = 1;
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.defender_faction);
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.attacker_faction);
          } else if (ap.tmp_roll_first != 1 && dp.tmp_roll_first == 1) {
            his_self.game.state.field_battle.defender_hits_first = 1;
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.attacker_faction);
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.defender_faction);
          } else {
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.attacker_faction);
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.defender_faction);
          }

          //
          // this should stop execution while we are looking at the pre-field battle overlay
          //
	  his_self.game.queue.push("ACKNOWLEDGE\tProceed to Assign Hits");
	  let from_whom = his_self.returnArrayOfPlayersInSpacekey(space.key);
          his_self.game.queue.push("assault_assign_hits_render");
          his_self.game.queue.push("assault_show_hits_render");
          his_self.game.queue.push("counter_or_acknowledge\tAssault is about to begin in "+space.name + "\tpre_assault_rolls");
          //his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\t"+JSON.stringify(from_whom));

          his_self.assault_overlay.renderPreAssault(his_self.game.state.assault);
          his_self.assault_overlay.pullHudOverOverlay();

          return 1;

        }


	if (mv[0] === "assault_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[2]];

	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {

	    if (!player.tmp_roll_modifiers) {
	      return roll_array;
	    }

	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                } else {
                  modified_rolls.push(modded_roll);
		}
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                } else {
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
	      if (faction_map[f] == faction) {
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
	        if (faction_map[f] == faction) {
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0 && number_of_targets > 0) {

	        for (let f in faction_map) {
	          if (faction_map[f] == faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "cavalry"; }
		        if (zzz == 1) { cannon_fodder = "mercenary"; }
		        if (zzz == 2) { cannon_fodder = "regular"; }

			let units_len = space.units[f].length;

  	     	        for (let i = 0; i < units_len; i++) {
	   	          if (space.units[f][i].type == cannon_fodder) {
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
	          if (faction_map[f] == faction) {
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
                    if (zzz == 0) { cannon_fodder = "cavalry"; }
                    if (zzz == 1) { cannon_fodder = "mercenary"; }
                    if (zzz == 2) { cannon_fodder = "regular"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type == cannon_fodder) {
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
	  let ap = his_self.returnPlayerOfFaction(attacker_faction);
	  let dp = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_player = {};
	  let defender_player = {};
	  if (ap > 0) { attacker_player  = his_self.game.state.players_info[ap-1]; }
          if (dp > 0) { defender_player  = his_self.game.state.players_info[dp-1]; }
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

	  //
	  // attacker and defender both wiped out
	  //
	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining >= 0) {

	    space.besieged = 0;
	    space.unrest = 0;

	    //
	    // remove besieged
	    //
	    for (let key in space.units) {
	      for (let i = 0; i < space.units[key].length; i++) {
	        space.units[key][i].besieged = 0;
	      }
	    }
	    //
	    // updarte log
	    //
	    this.updateLog("Winner: "+this.returnFactionName(defender_faction));
	  }

	  //
	  // mutually assured destruction
	  //
	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining <= 0) {

	    //
	    // no-one survived, so just end siege
	    //
	    this.removeSiege(space.key);
	    space.unrest = false;
	    this.updateLog("Siege in " + this.returnSpaceName(space.key) + " ends");

	  }

	  //
	  // capture stranded leaders
	  //
	  if (attacker_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] == attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  if (defender_land_units_remaining <= 0 && attacker_hits > 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] == defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

          //
          // conduct retreats
          //
          if (defender_land_units_remaining < attacker_land_units_remaining) {

	    //
	    // no land units remain
	    //
	    if (defender_land_units_remaining <= 0 && attacker_land_units_remaining > 0 && attacker_hits > 0) {
	      this.removeSiege(space.key);
	      space.unrest = 0;
	      this.controlSpace(attacker_faction, space.key);
	      this.updateLog(this.returnFactionName(attacker_faction) + " wins seige, controls " + this.returnSpaceName(space.key));
	    }

          } else {

            if (attacker_land_units_remaining == 0) {
	      this.removeSiege(space.key);
	      space.unrest = 0;
	      this.updateLog(this.returnFactionName(defender_faction) + " breaks seige, controls " + this.returnSpaceName(space.key));
	    } else {
	      his_self.game.queue.push("purge_units_and_capture_leaders_if_unbesieged\t"+attacker_faction+"\t"+defender_faction+"\t"+space.key);
              his_self.game.queue.push("break_siege");
              his_self.game.queue.push("hide_overlay\tassault");
	    }
	  }

          //
          // redisplay
          //
	  his_self.refreshBoardUnits();
          his_self.displaySpace(space.key);

	  //
	  // check if triggers defeat of Hungary Bohemia
	  //
          this.triggerDefeatOfHungaryBohemia();


          return 1;

        }



	if (mv[0] === "purge_units_and_capture_leaders_if_unbesieged") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.units[loser].length > 0) {
	    for (let z = 0; z < space.units[loser].length; z++) {
	      if (space.units[loser][z].army_leader == 1) {
	        this.captureLeader(loser, winner, spacekey, space.units[loser][z]);
	      } else {
	        if (space.units[loser][z].besieged == 0) { space.units[loser].splice(z, 1); z--; }
	      }
	    }
	  }

	  return 1;

	}


	if (mv[0] === "purge_units_and_capture_leaders") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureLeader(loser, winner, spacekey, space.units[loser][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


	if (mv[0] === "purge_naval_units_and_capture_leaders") {

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

	  this.displaySpace(space.key);
	  this.displayNavalSpace(space.key);

	  return 1;

	}


        if (mv[0] === "player_evaluate_post_naval_battle_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

	  let commanding_player = this.returnPlayerCommandingFaction(loser);
	  if (commanding_player == 0) { return 1; }

          if (this.game.player == commanding_player) {
            this.playerEvaluateNavalRetreatOpportunity(loser, spacekey, "", loser, true);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat at sea");
          }

          return 0;

        }


        if (mv[0] === "post_field_battle_player_evaluate_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

	  //
	  // auto-skip if there are < 4 loser units and they are fortified
	  //
	  let unfortified_units = 0;
	  let fortified_units = 0;
	  for (let i = 0; i < this.game.spaces[spacekey].units[loser].length; i++) {
	    if (this.game.spaces[spacekey].units[loser][i].besieged == 0) {
	      unfortified_units++;
	    }
	  }
	  if (unfortified_units == 0) {
	    // disabled MAR 26 -- splicing is above
	    //this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // auto-skip if loser cannot retreat because they have no land units
	  //
	  let loser_can_retreat = false;
	  for (let i = 0; i < this.game.spaces[spacekey].units[loser].length; i++) {
	    if (["regular", "mercenary", "calvary"].includes(this.game.spaces[spacekey].units[loser][i].type)) { loser_can_retreat = true; }
	  }
	  if (loser_can_retreat == false) { return 1; }

          let faction_map = his_self.game.state.field_battle.faction_map;
          let attacker_faction = his_self.game.state.field_battle.attacker_faction;
          let defender_faction = his_self.game.state.field_battle.defender_faction;
          let ap = his_self.returnPlayerOfFaction(attacker_faction);
          let dp = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_player = {};
	  let defender_player = {};
          if (ap > 0) { attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1]; }
	  if (dp > 0) { defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1]; }
          let attacker_results = his_self.game.state.field_battle.attacker_results;
          let defender_results = his_self.game.state.field_battle.defender_results;
          let attacker_rolls   = his_self.game.state.field_battle.attacker_rolls;
          let defender_rolls   = his_self.game.state.field_battle.defender_rolls;
          let attacker_units   = his_self.game.state.field_battle.attacker_units;
          let defender_units   = his_self.game.state.field_battle.defender_units;
          let attacker_land_units_remaining = his_self.game.state.field_battle.attacker_land_units_remaining;
          let defender_land_units_remaining = his_self.game.state.field_battle.defender_land_units_remaining;
          let attacker_comes_from_this_spacekey = his_self.game.state.attacker_comes_from_this_spacekey; // from state

          //
          // fortification has already happened. if the loser is the attacker, they have to retreat
          //
          if (loser === attacker_faction) {
	    let winning_faction = defender_faction;
	    if (this.game.player == this.returnPlayerCommandingFaction(loser)) {
	      if (this.game.state.field_battle.relief_battle) {
		this.playerEvaluateBreakSiegeRetreatOpportunity(loser, spacekey);
	      } else {
	        this.playerEvaluatePostBattleRetreatOpportunity(loser, winning_faction, attacker_faction, spacekey, this.game.state.attacker_comes_from_this_spacekey);
	      }
            } else {
              this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat");
            }
          } else {
	    let winning_faction = attacker_faction;
	    if (this.game.player == this.returnPlayerCommandingFaction(loser)) {
	      if (this.game.state.field_battle.relief_battle) {
		this.playerEvaluateBreakSiegeRetreatOpportunity(loser, spacekey);
	      } else {
	        this.playerEvaluatePostBattleRetreatOpportunity(loser, winning_faction, attacker_faction, spacekey, this.game.state.attacker_comes_from_this_spacekey);
	      }
            } else {
              this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat");
            }
          }

          return 0;

        }



        if (mv[0] === "found_jesuit_university") {

	  let spacekey = mv[1];

	  this.game.queue.splice(qe, 1);

	  this.updateLog("Jesuit University founded in " + this.game.spaces[spacekey].name);
	  this.game.spaces[spacekey].university = 1;
	  this.displaySpace(spacekey);

	  return 1;

	}



	if (mv[0] === "pick_second_round_debaters") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let committed = this.game.state.theological_debate.committed;
	  // 2nd round defaults to uncommitted
	  let language_zone = this.game.state.theological_debate.language_zone;
	  this.game.state.theological_debate.round++;
	  let prohibited_protestant_debater = this.game.state.theological_debate.prohibited_protestant_debater;

          this.game.state.theological_debate.attacker_debater = ""; // resetting
          this.game.state.theological_debate.defender_debater = "";

	  let x = 0;

	  let attacker_enters_uncommitted = 1;

          let ad = 0;
          for (let i = 0; i < this.game.state.debaters.length; i++) {
            if (this.game.state.debaters[i].owner == attacker) {
              if (this.game.state.debaters[i].committed == 0) {
                if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
                  ad++;
                }
              }
            }
          }
          if (ad == 0) {
            for (let i = 0; i < this.game.state.debaters.length; i++) {
              if (this.game.state.debaters[i].owner == attacker) {
                if (this.game.state.debaters[i].committed == 1) {
                  if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
                    ad++;
                    attacker_enters_uncommitted = 0;
                  }
                }
              }
            }
          }

	  x = this.rollDice(ad) - 1;
          ad = 0;
          for (let i = 0; i < this.game.state.debaters.length; i++) {
            if (this.game.state.debaters[i].owner == attacker) {
              if ((attacker_enters_uncommitted == 1 && this.game.state.debaters[i].committed == 0) || (attacker_enters_uncommitted == 0 && this.game.state.debaters[i].committed == 1)) {
                if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
                  if (x == ad) {
                    this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
                    this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
                    this.game.state.theological_debate.attacker_debater_entered_uncommitted = attacker_enters_uncommitted;
                  }
                  ad++;
                }
              }
            }
          }


          //
          // defender chosen randomly from uncommitted if available
          //
	  let uncommitted_defender = 1;
          let dd = 0;
          for (let i = 0; i < this.game.state.debaters.length; i++) {
            if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
              if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
                dd++;
              }
            }
          }
	  if (dd == 0) {
	    uncommitted_defender = 0;
            for (let i = 0; i < this.game.state.debaters.length; i++) {
              if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
                if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
                  dd++;
                }
              }
            }
	  }

          x = this.rollDice(dd) - 1;
          dd = 0;
          for (let i = 0; i < this.game.state.debaters.length; i++) {
            if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
              if (uncommitted_defender == 0) {
                if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
                  if (x === dd) {
                    this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
                    this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
                    this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
                  }
                  dd++;
                }
              } else {
                if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
                  if (x === dd) {
                    this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
                    this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
                    this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
                    this.game.state.theological_debate.defender_debater_bonus++;
                  }
                  dd++;
                }
              }
            }
          }

	  //
	  // it is possible that we fall through because there are no eligible debaters. in this case
	  // we simply grab a committed debater in a follow-up random sweep.
	  //
	  if (this.game.state.theological_debate.defender_debater === "") {
	    dd = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	        if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	          dd++;
	        }
	      }
	    }
	    x = this.rollDice(dd) - 1;
	    for (let i = 0, j = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	        if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	          if (x === j) {
		    this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		    this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	            this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
	          }
		  j++;
	        }
	      }
	    }
	  }
          if (this.game.state.theological_debate.attacker_debater === "") {
            dd = 0;
            for (let i = 0; i < this.game.state.debaters.length; i++) {
              if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 1) {
                dd++;
              }
            }
            x = this.rollDice(dd) - 1;
            for (let i = 0, j = 0; i < this.game.state.debaters.length; i++) {
              if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 1) {
                if (x === j) {
                  this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
                  this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
                  this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
                }
                j++;
              }
            }
          }

          this.game.state.theological_debate.round2_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round2_defender_debater = this.game.state.theological_debate.defender_debater;

	  this.updateLog(this.game.state.theological_debate.attacker_debater + " vs. " + this.game.state.theological_debate.defender_debater);

	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "pick_first_round_debaters") {

	  let attacker = mv[1];
	  let defender = mv[2];
	  let language_zone = mv[3];
	  let committed = mv[4];
	  if (parseInt(mv[4]) === 1) { committed = "committed"; };
	  if (parseInt(mv[4]) === 0) { committed = "uncommitted"; };
	  let selected_papal_debater = "";
	  if (mv[5]) { selected_papal_debater = mv[5]; }
	  let prohibited_protestant_debater = "";
	  if (mv[6]) { prohibited_protestant_debater = mv[6]; }

	  this.updateLog(this.returnFactionName(attacker) + " targets " + committed + " debater");

	  this.game.state.theological_debate = {};
	  this.game.state.theological_debate.attacker_rolls = 0;
	  this.game.state.theological_debate.defender_rolls = 0;
	  this.game.state.theological_debate.adice = [];
	  this.game.state.theological_debate.ddice = [];
	  this.game.state.theological_debate.attacker = mv[1];
	  this.game.state.theological_debate.defender = mv[2];
	  this.game.state.theological_debate.language_zone = mv[3];
	  this.game.state.theological_debate.committed = committed;
	  this.game.state.theological_debate.round = 1;
	  this.game.state.theological_debate.round1_attacker_debater = "";
	  this.game.state.theological_debate.round1_defender_debater = "";
	  this.game.state.theological_debate.round2_attacker_debater = "";
	  this.game.state.theological_debate.round2_defender_debater = "";
	  this.game.state.theological_debate.attacker_debater = "";
	  this.game.state.theological_debate.defender_debater = "";
	  this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
	  this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
	  this.game.state.theological_debate.attacker_debater_power = 0;
	  this.game.state.theological_debate.defender_debater_power = 0;
	  this.game.state.theological_debate.attacker_debater_bonus = 3;
	  this.game.state.theological_debate.defender_debater_bonus = 1;
	  this.game.state.theological_debate.selected_papal_debater = "";
	  this.game.state.theological_debate.prohibited_protestant_debater = "";
	  this.game.state.theological_debate.attacker_faction = attacker;
	  this.game.state.theological_debate.defender_faction = defender;

	  let x = 0;

	  let attacker_enters_uncommitted = 1;

	  //
	  // Henry Petitions for Divorce pre-selects 
	  //
	  if (this.game.state.events.henry_petitions_for_divorce_grant == 1) {
	    selected_papal_debater = "campeggio-debater";
	  }

	  //
	  // papacy can select their attacker, or attacker picks debater at random from uncommitted
	  //
	  if (selected_papal_debater != "") {
	    this.game.state.theological_debate.attacker_debater = selected_papal_debater;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (selected_papal_debater == this.game.state.debaters[i].type) {
  	        this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
		if (!this.game.state.debaters[i].committed) {
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
		}
	      }
	    }
	  } else {
            let ad = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker) {
	        if (this.game.state.debaters[i].committed == 0) {
		  if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	            ad++;
	          }
	        }
	      }
	    }

	    if (ad == 0) {
	      for (let i = 0; i < this.game.state.debaters.length; i++) {
	        if (this.game.state.debaters[i].owner == attacker) {
	          if (this.game.state.debaters[i].committed == 1) {
		    if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	              ad++;
	  	      attacker_enters_uncommitted = 0;
	            }
	          }
	        }
	      }
	    }

	    x = this.rollDice(ad) - 1;
	    ad = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker) {
		if ((attacker_enters_uncommitted == 1 && this.game.state.debaters[i].committed == 0) || (attacker_enters_uncommitted == 0 && this.game.state.debaters[i].committed == 1)) {
		  if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	            if (x == ad) {
	  	      this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		      this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	              this.game.state.theological_debate.attacker_debater_entered_uncommitted = attacker_enters_uncommitted;
	            }
	            ad++;
	          }
	        }
	      }
	    }
	  }

	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	      if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
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
	    }
	  }

	  x = this.rollDice(dd) - 1;

	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	      if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	        if (this.game.state.theological_debate.committed == "committed") {
	          if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	            if (x === dd) {
		      this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		      this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	              this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
	            }
	            dd++;
	          }
	        } else {
	          if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	            if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	              if (x === dd) {
		        this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		        this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	                this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
	                this.game.state.theological_debate.defender_debater_bonus++;
		      }
	              dd++;
		    }
	          }
	        }
	      }
	    }
	  }


	  this.updateLog(this.game.state.theological_debate.attacker_debater + " vs. " + this.game.state.theological_debate.defender_debater);

          this.game.state.theological_debate.round1_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round1_defender_debater = this.game.state.theological_debate.defender_debater;

	  //
	  // and show it...
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "commit") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let debater = mv[2];
	  let activate_it = 0;

	  this.updateLog(this.returnFactionName(faction) + " commits " + this.popup(debater));

	  if (parseInt(mv[3]) > 0) { activate_it = parseInt(mv[3]); }
	  this.commitDebater(faction, debater, activate_it);

	  return 1;

        }

	if (mv[0] === "player_call_theological_debate") {
	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  if (this.game.player == player) {
	    this.playerCallTheologicalDebate(this, player, faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " calling theological debate");
	  }
	  return 0;
	}

        if (mv[0] === "theological_debate") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let language_zone = this.game.state.theological_debate.language_zone;
	  let committed = this.game.state.theological_debate.committed;
	  let attacker_idx = 0;
	  let defender_idx = 0;
	  let was_defender_uncommitted = 0;

	  this.game.queue.splice(qe, 1);

	  //
	  // commit attacker if uncommitted
	  //
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.attacker_debater) {
	      attacker_idx = i;
	      if (!this.isCommitted(this.game.state.theological_debate.attacker_debater)) {
		this.commitDebater(this.game.state.theological_debate.attacker, this.game.state.theological_debate.attacker_debater, 0);
	      }
	    }
	  }

	  //
	  // defender power and bonus check is complicated because of Here I Stand
	  //
	  let defender_debater_power = 1;
	  let defender_debater_bonus = 0;

	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.defender_debater) {
	      defender_idx = i;
	      defender_debater_power = this.game.state.debaters[defender_idx].power;
	      if (!this.isCommitted(this.game.state.theological_debate.defender_debater)) {
	        was_defender_uncommitted = 1;
		this.commitDebater(this.game.state.theological_debate.defender, this.game.state.theological_debate.defender_debater, 0);
	      }
	    }
	  }
	  for (let i = 0; i < this.game.state.excommunicated.length; i++) {
	    if (this.game.state.excommunicated[i].debater) {
	      if (this.game.state.excommunicated[i].debater.type === this.game.state.theological_debate.defender_debater) {
	        defender_debater_power = this.game.state.excommunicated[i].debater.power;
	        if (this.game.state.excommunicated[i].debater.committed == 0) {
	          was_defender_uncommitted = 1;
	  	  this.game.state.excommunicated[i].debater.committed = 1;
	        }
	      }
	    }
	  }


	  let attacker_debater_power = 1;
	  let attacker_debater_bonus = 3;

	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.attacker_debater) {
	      attacker_idx = i;
	      attacker_debater_power = this.game.state.debaters[attacker_idx].power;
	      if (this.game.state.debaters[i].committed == 0) {
		this.commitDebater(this.game.state.theological_debate.attacker, this.game.state.theological_debate.attacker_debater, 0);
	      }
	    }
	  }
	  for (let i = 0; i < this.game.state.excommunicated.length; i++) {
	    if (this.game.state.excommunicated[i].debater) {
	      if (this.game.state.excommunicated[i].debater.type === this.game.state.theological_debate.attacker_debater) {
	        attacker_debater_power = this.game.state.excommunicated[i].debater.power;
	        if (this.game.state.excommunicated[i].debater.committed == 0) {
	  	  this.game.state.excommunicated[i].debater.committed = 1;
	        }
	      }
	    }
	  }

	  //
	  // even Luther gets 3 if invoked w/ Here I Stand as attacker
	  //
	  let attacker_rolls = attacker_debater_power + 3;
	  //
	  // defender_debater_power handled above - Luther because may be excommunicated
	  //
	  defender_debater_bonus = 1 + was_defender_uncommitted;
	  let defender_rolls = defender_debater_power + 1 + was_defender_uncommitted;

	  //
	  // papal inquisition
	  //
	  if (attacker === "papacy" && this.game.state.events.papal_inquisition_debate_bonus == 1) {
	    attacker_rolls += 2;
	  }

	  //
	  // thomas more
	  //
	  if (this.game.state.events.more_bonus == 1) {
	    attacker_rolls += 1;
	    if (language_zone == "english") {
	      attacker_rolls += 2;
	    }
	  }

	  //
	  // eck-debator bonus
	  //
	  if (attacker === "papacy" && this.game.state.theological_debate.attacker_debater === "eck-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) {
	    attacker_rolls++;
	  }

	  //
	  // gardiner-debater bonus
	  //
	  if (attacker === "papacy" && this.game.state.theological_debate.attacker_debater === "gardiner-debater" && this.game.state.theological_debate.language_zone === "english" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
	    attacker_rolls++;
	  }

	  //
	  // augsburg confession
	  //
	  if (attacker === "papacy" && this.game.state.events.augsburg_confession == 1) {
	    attacker_rolls--;
	  }

	  let attacker_hits = 0;
	  let defender_hits = 0;
	  let adice = [];
	  let ddice = [];

	  for (let i = 0; i < attacker_rolls; i++) {
	    let x = this.rollDice(6);
	    adice.push(x);
	    if (x >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let x = this.rollDice(6);
	    ddice.push(x);
	    if (x >= 5) { defender_hits++; }
	  }

	  this.updateLog(this.popup(this.game.state.theological_debate.attacker_debater) + " vs " + this.popup(this.game.state.theological_debate.defender_debater) + ` [${attacker_hits}/${defender_hits}]`);

	  //
	  //
	  //
	  this.game.state.theological_debate.attacker_rolls = attacker_rolls;
	  this.game.state.theological_debate.defender_rolls = defender_rolls;
	  this.game.state.theological_debate.adice = adice;
	  this.game.state.theological_debate.ddice = ddice;
	  this.game.state.theological_debate.attacker_debater_power = attacker_debater_power;
	  this.game.state.theological_debate.defender_debater_power = defender_debater_power;
	  this.game.state.theological_debate.attacker_debater_bonus = attacker_debater_bonus;
	  this.game.state.theological_debate.defender_debater_bonus = defender_debater_bonus;

	  if (attacker_hits == defender_hits) {
	    this.game.state.theological_debate.status = "Inconclusive - Second Round";
	  } else {
	    if (attacker_hits > defender_hits) {
	      this.game.state.theological_debate.status = this.returnFactionName(this.game.state.theological_debate.attacker_faction) + " Wins";
	    } else {
	      this.game.state.theological_debate.status = this.returnFactionName(this.game.state.theological_debate.defender_faction) + " Wins";
	    }
	  }

	  //
	  // open theological debate UI
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  if (attacker_hits == defender_hits) {

	    //
	    // first round of debate moves into second
	    //
	    this.game.state.theological_debate.round++;
	    if (this.game.state.theological_debate.round > 2) {

	      this.game.queue.push("counter_or_acknowledge\tTie - Debate Ends Inconclusively");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    } else {

	      this.game.queue.push("theological_debate");
	      this.game.queue.push("counter_or_acknowledge\tTheological Debate: 2nd Round\tdebate\t" + language_zone);
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate_and_debaters");
	      this.game.queue.push("pick_second_round_debaters");
	      this.game.queue.push("counter_or_acknowledge\tThe Debate is Tied - Progress to 2nd Round");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    }

	  } else {

	    let bonus_conversions = 0;

	    //
	    // if aleander is in play, flip extra space
	    //
	    if ((this.game.state.theological_debate.attacker_debater === "aleander-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) || (this.game.state.theological_debate.defender_debater === "aleander-debater")) {
	      this.updateLog(this.popup("aleander-debater") + " bonus: +1 conversion");
	      bonus_conversions = 1;
	    }

	    if (attacker_hits > defender_hits) {

	      let total_spaces_to_convert = attacker_hits - defender_hits;
	      let unaltered_total_spaces_to_convert = total_spaces_to_convert;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone("", 1);
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone, 1);
	      if (defender === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone, 1); }

	      //
	      // if campeggio is the debater, we have 1/3 chance of ignoring result
	      //

	      if (this.game.state.theological_debate.defender_debater === "campeggio-debater" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
		let roll = this.rollDice(6);
	        if (roll >= 5) {
	          this.updateLog(this.popup("campeggio-debater") + " rolls: " + roll + " debate loss discarded");
		  total_spaces_to_convert = 0;
		  bonus_conversions = 0;
	        } else {
	          this.updateLog(this.popup("campeggio-debater") + " rolls: " + roll + " debate loss sustained");
	 	}
	      }

	      if ((bonus_conversions+total_spaces_to_convert) == 1) {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space`);
	      } else {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces`);
	      }


	      //
	      // reduce number of convertible spaces to total available to convert
	      //
	      let flip_this_number = total_spaces_to_convert + bonus_conversions;
	      if (this.game.state.theological_debate.attacker_faction == "papacy" && this.returnNumberOfProtestantSpacesInLanguageZone("", 1) < flip_this_number) {
	        this.updateLog("Protestants only have " + this.returnNumberOfProtestantSpacesInLanguageZone("", 1) + " spaces to flip");
	        flip_this_number = this.returnNumberOfProtestantSpacesInLanguageZone("", 1);
	      }


	      //
	      // attacker has more hits, is defender burned?
	      //
	      if (unaltered_total_spaces_to_convert > this.game.state.theological_debate.defender_debater_power) {
		if (this.game.state.theological_debate.attacker_faction === "papacy") {
		  this.burnDebater(this.game.state.theological_debate.defender_debater);
		} else {
		  this.disgraceDebater(this.game.state.theological_debate.defender_debater);
		}
	      }

	      this.game.queue.push("hide_overlay\tzoom\t"+language_zone);


	      for (let i = flip_this_number; i >= 1; i--) {
	        if (i > (total_spaces_in_zone+bonus_conversions)) {
		  if (attacker === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy");
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant");
		  }
		} else {
		  if (attacker === "papacy") {
  		    this.game.queue.push("select_for_catholic_conversion\tpapacy\t"+language_zone);
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant\t"+language_zone);
		  }
		}
	      }
	      //
	      this.game.queue.push("show_overlay\tzoom\t"+language_zone);
	      this.game.queue.push("hide_overlay\ttheological_debate");
	      if ((total_spaces_to_convert+bonus_conversions) == 1) {
		this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${(total_spaces_to_convert+bonus_conversions)} Space`);
	      } else { 
	        this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${(total_spaces_to_convert+bonus_conversions)} Spaces`);
              }
	      this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    //
	    // defender has more hits than attacker
	    //
	    } else {

	      let total_spaces_to_convert = defender_hits - attacker_hits;
	      let unaltered_total_spaces_to_convert = total_spaces_to_convert;
defender_hits - attacker_hits;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone("", 1);
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone, 1);
	      if (attacker === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone, 1); }

	      //
	      // if campeggio is the debater, we have 1/3 chance of ignoring result
	      //
	      if (this.game.state.theological_debate.attacker_debater === "campeggio-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) {
		let roll = this.rollDice(6);
	        if (roll >= 5) {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss discarded");
		  total_spaces_to_convert = 0;
		  bonus_conversions = 0;
	        } else {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss sustained");
	 	}
	      }


	      if ((total_spaces_to_convert+bonus_conversions) == 1) {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space`);
	      } else {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces`);
	      }

	      //
	      // reduce number of convertible spaces to total available to convert
	      //
	      let flip_this_number = total_spaces_to_convert + bonus_conversions;

	      if (this.game.state.theological_debate.defender_faction == "papacy" && this.returnNumberOfProtestantSpacesInLanguageZone("", 1) < flip_this_number) {
	        this.updateLog("Protestants only have " + this.returnNumberOfProtestantSpacesInLanguageZone("", 1) + " spaces to flip");
	        flip_this_number = this.returnNumberOfProtestantSpacesInLanguageZone("", 1);
	      }

	      //
	      // defender has more hits, is attacker burned?
	      //
	      if (unaltered_total_spaces_to_convert > this.game.state.theological_debate.attacker_debater_power) {
	        if (this.game.state.theological_debate.attacker_faction === "protestant") {
		  this.burnDebater(this.game.state.theological_debate.attacker_debater);
	 	} else {
		  this.disgraceDebater(this.game.state.theological_debate.attacker_debater);
		}
	      }

	      this.game.queue.push("hide_overlay\tzoom\t"+language_zone);

	      for (let i = flip_this_number; i >= 1; i--) {
	        if (i > total_spaces_in_zone) {
		  if (defender === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy");
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant");
		  }
		} else {
		  if (defender === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy\t"+language_zone);
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant\t"+language_zone);
		  }
		}
	      }
	      this.game.queue.push("show_overlay\tzoom\t"+language_zone);
	      this.game.queue.push("hide_overlay\ttheological_debate");
	      if ((total_spaces_to_convert+bonus_conversions) == 1) { 
		this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space`);
	      } else {
		this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces`);
              }
	      this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");
	    }
	  }

	  return 1;

	}



        if (mv[0] === "translation") {

	  let zone = mv[1];
	  let ops = 1;
	  if (mv[2]) { if (parseInt(mv[2]) > ops) { ops = parseInt(mv[2]); } }
          let player = this.returnPlayerOfFaction("protestant");

	  this.game.queue.splice(qe, 1);

	  for (let z = 0; z < ops; z++) {
	    if (zone === "german") {
	      if (this.game.state.translations['new']['german'] >= 6) {
	        this.updateLog("Protestants translate Old Testament (german)");
	        this.game.state.translations['full']['german']++;
		if (this.game.state.translations['full']['german'] == 10) {
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.state.german_bible_translation_bonus = 1;
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	          his_self.updateLog("Protestants +1 VP for completing German Bible");
		}
	        if (this.game.state.translations['full']['german'] > 10) { this.game.state.translations['full']['german'] = 10; }
  	      } else {
	        this.updateLog("Protestants translate New Testament (german)");
	        this.game.state.translations['new']['german']++;
		if (this.game.state.translations['new']['german'] == 6) {
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      }
	    }
	    if (zone === "french") {
	      if (this.game.state.translations['new']['french'] >= 6) {
	        this.updateLog("Protestants translate Old Testament (french)");
	        this.game.state.translations['full']['french']++;
		if (this.game.state.translations['full']['french'] == 10) {
		  // protestant gets 1 roll bonus at start
	          his_self.game.state.french_bible_translation_bonus = 1;
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	          his_self.updateLog("Protestants +1 VP for completing French Bible");
		}
	        if (this.game.state.translations['full']['french'] > 10) { this.game.state.translations['full']['french'] = 10; }
	      } else {
	        this.updateLog("Protestants translate New Testament (french)");
	        this.game.state.translations['new']['french']++;
		if (this.game.state.translations['new']['french'] == 6) {
		  // protestant gets 1 roll bonus at start
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      }
	    }
	    if (zone === "english") {
	      if (this.game.state.translations['new']['english'] >= 6) { 
	        this.updateLog("Protestants translate Old Testament (english)");
	        this.game.state.translations['full']['english']++;
		if (this.game.state.translations['full']['english'] == 10) {
		  // protestant gets 1 roll bonus at start
	          his_self.game.state.english_bible_translation_bonus = 1;
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	          his_self.updateLog("Protestants +1 VP for completing English Bible");
		}
	        if (this.game.state.translations['full']['english'] > 10) { this.game.state.translations['full']['english'] = 10; }
	      } else {
	        this.updateLog("Protestants translate New Testament (english)");
	        this.game.state.translations['new']['english']++;
		if (this.game.state.translations['new']['english'] == 6) {
		  // protestant gets 1 roll bonus at start
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      }
	    }
	  }

	  his_self.faction_overlay.render("protestant");
	  his_self.faction_overlay.updateNotice("Protestants advance in Bible Translation");

	  return 1;
        }


	if (mv[0] === "build_saint_peters_with_cp") {

	  let ops = parseInt(mv[1]);

	  this.game.queue.splice(qe, 1);

          for (let i = 0; i < ops; i++) {
            his_self.game.queue.push("build_saint_peters");
          }

	  return 1;

	}

        if (mv[0] === "build_saint_peters") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.state.saint_peters_cathedral['vp'] < 5) {
	    this.updateLog("Papacy builds St. Peter's Basilica");
	    this.game.state.saint_peters_cathedral['state'] += 1;
	    if (this.game.state.saint_peters_cathedral['state'] >= 5) {
	      this.game.state.saint_peters_cathedral['state'] = 0;
	      this.updateLog(this.returnFactionName("papacy") + " +1 VP from St. Peter's Basilica");
	      this.game.state.saint_peters_cathedral['vp'] += 1;
	    }
	  }

	  his_self.faction_overlay.render("papacy");
	  his_self.faction_overlay.updateNotice("Papacy progresses with Saint Peter's Construction");

	  return 1;

	}

        if (mv[0] === "victory_determination_phase") {

	  this.game.queue.splice(qe, 1);

	  let f = this.calculateVictoryPoints();

	  for (let faction in f) {
	    if (f[faction].victory == 1) {
	      //
	      // show scoring points - situation
	      //
	      this.vp_overlay.render();

	      this.updateLog(this.returnFactionName(faction) + " wins: " + f[faction].reason);
	      this.updateStatus(this.returnFactionName(faction) + " wins: " + f[faction].reason);
	      return 0;
	    }
	  }

          return 1;

        }




        if (mv[0] === "new_world_phase") {

	  this.game.queue.splice(qe, 1);


	  //
	  // new world phase only in > 2P games
	  //
	  if (this.game.players.length > 2) {
	    this.game.queue.push("resolve_new_world_riches_rolls");
	    this.game.queue.push("resolve_new_world_colonies");
	    this.game.queue.push("resolve_new_world_conquests");
	    this.game.queue.push("resolve_new_world_explorations");
	  }

	  //
	  // phase otherwise removed entirely for 2P
	  //
          return 1;

        }
        if (mv[0] === "winter_phase") {

	  this.factionbar.setActive();

	  // show the winter overlay to let people know WTF is happening
	  this.winter_overlay.render("stage1");

	  // unset any sieges
	  this.removeSieges();

	  // Remove loaned naval squadron markers
	  this.returnLoanedUnits();

	  // Flip all debaters to their uncommitted (white) side, and
	  this.restoreDebaters();

	  // unset alliances
	  let powers = ["hapsburg","ottoman","england","france","papacy","protestant"];
	  for (let i = 0; i < powers.length; i++) {
	    for (let z = 0; z < powers.length; z++) {	    
	      if (i != z) {
		this.unsetAllies(powers[i], powers[z]);
	      }
	    }
	  }

	  // remove Renegade Leader if in play
	  let rl_f = "";
	  let rl_s = "";
	  rl_s = his_self.returnSpaceOfPersonage("hapsburg", "renegade");
          if (rl_s) { rl_f = "hapsburg"; }
	  rl_s = his_self.returnSpaceOfPersonage("papacy", "renegade");
          if (rl_s) { rl_f = "papacy"; }
	  rl_s = his_self.returnSpaceOfPersonage("england", "renegade");
          if (rl_s) { rl_f = "england"; }
	  rl_s = his_self.returnSpaceOfPersonage("france", "renegade");
          if (rl_s) { rl_f = "france"; }
	  rl_s = his_self.returnSpaceOfPersonage("ottoman", "renegade");
          if (rl_s) { rl_f = "ottoman"; }
	  rl_s = his_self.returnSpaceOfPersonage("protestant", "renegade");
          if (rl_s) { rl_f = "protestant"; }
	  if (rl_f != "") {
	    for (let key in his_self.game.spaces) {
	      for (let z = 0; z < his_self.game.spaces[key].units[rl_f].length; z++) {
		if (his_self.game.spaces[key].units[rl_f][z].type == "renegade") {
		  his_self.game.splaces[key].units[rl_f].splice(z, 1);
		  z--;
		}
	      }
	    }
	  }

	  // Remove major power alliance markers
	  this.unsetAllies("hapsburg", "papacy");
	  this.unsetAllies("hapsburg", "england");
	  this.unsetAllies("hapsburg", "france");
	  this.unsetAllies("hapsburg", "ottoman");
	  this.unsetAllies("hapsburg", "protestant");
	  this.unsetAllies("papacy", "england");
	  this.unsetAllies("papacy", "france");
	  this.unsetAllies("papacy", "ottoman");
	  this.unsetAllies("papacy", "protestant");
	  this.unsetAllies("england", "france");
	  this.unsetAllies("england", "ottoman");
	  this.unsetAllies("england", "protestant");
	  this.unsetAllies("france", "ottoman");
	  this.unsetAllies("france", "protestant");
	  this.unsetAllies("ottoman", "protestant");

	  // Add 1 regular to each friendly-controlled capital
	  if (this.isSpaceControlled("rome", "papacy")) { this.game.queue.push("build\tland\tpapacy\tregular\trome\t0"); }
	  // only to non-papacy if > 2P game
	  if (this.game.players.length > 2) {
	    if (this.isSpaceControlled("london", "england")) { this.game.queue.push("build\tland\tengland\tregular\tlondon\t0"); }
	    if (this.isSpaceControlled("paris", "france")) { this.game.queue.push("build\tland\tfrance\tregular\tparis\t0"); }
	    if (this.isSpaceControlled("valladolid", "hapsburg")) { this.game.queue.push("build\tland\thapsburg\tregular\tvalladolid\t0"); }
	    if (this.isSpaceControlled("vienna", "hapsburg")) { this.game.queue.push("build\tland\thapsburg\tregular\tvienna\t0"); }
	    if (this.isSpaceControlled("istanbul", "ottoman")) { this.game.queue.push("build\tland\tottoman\tregular\tistanbul\t0"); }
	  }

	  // Remove all piracy markers
	  // ResolvespecificMandatoryEventsiftheyhavenotoccurred by their “due date”.

	  //
	  // Clement VII takes the Papacy by the end of round two
	  //
	  if (this.game.state.round == 2 && this.game.state.events.clement_vii != 1) {
	    this.game.queue.push("display_custom_overlay\t010");
	    this.game.queue.push("remove\tpapacy\t010");
	    this.game.queue.push("event\tpapacy\t010");
	  }
	  //
	  // Paul III takes the Papacy by the end of round 4
	  //
	  if (this.game.state.round == 4 && this.game.state.events.paul_iii != 1) {
	    this.game.queue.push("display_custom_overlay\t014");
	    this.game.queue.push("remove\tpapacy\t014");
	    this.game.queue.push("event\tpapacy\t014");
	  }
	  //
	  // Barbary Pirates form by end of round 3 (not in 2P game)
	  //
	  if (this.game.players.length > 2 && this.game.state.round == 3 && this.game.state.events.barbary_pirates != 1) {
	    this.game.queue.push("display_custom_overlay\t009");
	    this.game.queue.push("remove\tottoman\t009");
	    this.game.queue.push("event\tottoman\t009");
	  }
	  //
	  // Society of Jesus forms by end of round 6
	  //
	  if (this.game.state.round == 6 && this.game.state.events.society_of_jesus != 1) {
	    this.game.queue.push("ACKNOWLEDGE\tTurn 6: Society of Jesus Forms");
	    this.game.queue.push("remove\tprotestant\t015");
	    this.game.queue.push("event\tprotestant\t015");
	  }
	  //
	  // form Schmalkaldic League if unformed by end of round 4
	  //
	  if (this.game.state.round == 4 && this.game.state.events.schmalkaldic_league != 1) {
	    this.game.queue.push("ACKNOWLEDGE\tTurn 4: Schmalkaldic League Forms");
	    this.game.queue.push("remove\tprotestant\t013");
	    // custom overlay is shown here
	    this.game.queue.push("event\tprotestant\t013");
	  }

	  // Return naval units to the nearest port
	  this.game.queue.push("retreat_to_winter_ports");

	  // Return leaders and units to fortified spaces (suffering attrition if there is no clear path to such a space)
	  this.game.queue.push("retreat_to_winter_spaces");

	  this.game.queue.splice(qe, 1);
          return 1;
        }


	// must be removed by RESOLVES -- but handled automatically
	if (mv[0] === "check_interventions") {

	  this.updateStatus("preparing for Action Phase...");

	  if (this.game.confirms_needed[this.game.player-1] == 1) {

	    //
	    // we do not want to run this command multiple times, sending 
	    // extra RESOLVES because we receive another RESOLVE before 
	    // ours, so we swap out this for a HALTED command.
	    //
	    this.game.queue[his_self.game.queue.length-1] = "halted";
	    this.addMove("RESOLVE\t"+this.publicKey);

	    //
	    // Wartburg permits intervention in events
	    //
	    if (this.game.player == this.returnPlayerOfFaction("protestant")) {
              let fhand_idx = this.returnFactionHandIdx(this.game.player, "protestant");
	      for (let i = 0; i < this.game.deck[0].fhand[fhand_idx].length; i++) {
	        if (this.game.deck[0].fhand[fhand_idx][i] == "037") {
                  this.addMove("SETVAR\tstate\tevents\tintervention_on_events_possible\t1");
		  i == this.game.deck[0].fhand[fhand_idx].length+1;
	        };
	      }
	    }

	    //
	    // Gout and Foul Weather block moves
	    //
	    for (let z = 0; z < this.game.deck[0].fhand.length; z++) {
	      for (let i = 0; i < this.game.deck[0].fhand[z].length; i++) {
	        if (this.game.deck[0].fhand[z][i] == "032" || this.game.deck[0].fhand[z][i] == "031") {
                  this.addMove("SETVAR\tstate\tevents\tintervention_on_movement_possible\t1");
                  this.addMove("SETVAR\tstate\tevents\tintervention_on_assault_possible\t1");
		  i = this.game.deck[0].fhand[z].length+1;
	        };
	      }
	    }

	    this.endTurn();

	  }

          return 0;

	}



        if (mv[0] === "action_phase") {

	  this.winter_overlay.hide();

	  this.game.state.impulse++;

	  let targs = {
      	    line1 : "new to", 
    	    line2 : "game",
    	    fontsize : "2.1rem" ,
	  }

//
// Game Help Menu first Turn
//
if (this.game.state.round == 1 && this.game.state.impulse == 1) {
          if (this.game.player == this.returnPlayerCommandingFaction("protestant")) {
	    targs.line2 = "protestants";
            this.game_help.renderCustomOverlay("protestant", targs);
          } else {
            if (this.game.player == this.returnPlayerCommandingFaction("ottoman")) {
	      targs.line2 = "ottomans";
              this.game_help.renderCustomOverlay("ottoman", targs);
            } else {
              if (this.game.player == this.returnPlayerCommandingFaction("hapsburg")) {
	        targs.line2 = "hapsburgs";
                this.game_help.renderCustomOverlay("hapsburg", targs);
              } else {
                if (this.game.player == this.returnPlayerCommandingFaction("papacy")) {
	          targs.line2 = "papacy";
                  this.game_help.renderCustomOverlay("papacy", targs);
                } else {
                  if (this.game.player == this.returnPlayerCommandingFaction("england")) {
	            targs.line2 = "england";
                    this.game_help.renderCustomOverlay("england", targs);
                  } else {
                    if (this.game.player == this.returnPlayerCommandingFaction("france")) {
	              targs.line2 = "france";
                      this.game_help.renderCustomOverlay("france", targs);
                    } else {
                    }
                  }
                }
              }
            }
          }
}

	  //
	  // check if we are really ready for a new round, or just need another loop
	  // until all of the players have passed. note that players who have passed 
	  // and have more than their admin_rating (saved cards) are forced to eventually
	  // stop passing and play....
	  //
	  let factions_in_play = [];
	  let factions_force_pass = [];


	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	      let faction = this.game.state.players_info[i].factions[z];
	      if (this.game.state.players_info[i].factions_passed[z] == false) {
		if (!this.game.state.skip_next_impulse.includes(this.game.state.players_info[i].factions[z])) {
		  factions_in_play.push(this.game.state.players_info[i].factions[z]);
		} else {
		  for (let ii = 0; ii < this.game.state.skip_next_impulse.length; ii++) {
		    if (this.game.state.skip_next_impulse[ii] === this.game.state.players_info[i].factions[z]) {
		      this.game.state.skip_next_impulse.splice(ii, 1);
		      factions_force_pass.push(this.game.state.players_info[i].factions[z]);
		    }
		  }
		}
	      } else {
		// they passed but maybe they have more cards left than their admin rating?
		let far = this.factions[faction].returnAdminRating(this);
	        if (far < this.game.state.cards_left[faction]) {
		  factions_in_play.push(this.game.state.players_info[i].factions[z]);
	        }
	      }
	    }
	  }

	  //
	  // if anyone is left to play, everyone with cards left needs to pass again
	  //
          if (factions_in_play.length > 0) {
	    for (let i = 0; i < this.game.state.players_info.length; i++) {
	      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	        let f = this.game.state.players_info[i].factions[z];
	        if (!factions_in_play.includes(f) && !factions_force_pass.includes(f)) {

		  let is_activated_power = false;
	          let io = this.returnImpulseOrder();
		  for (let y = 0; y < io.length; y++) {
		    if (this.game.state.activated_powers[io[y]].includes(f)) { is_activated_power = true; }
		  }
		  if (!is_activated_power) {
	    	    factions_in_play.push(f);
		  }
	        }
	      }
	    }
	  }


	  //
	  // players still to go...
	  //
	  if (factions_in_play.length > 0) {


	    //
	    // add save instruction!
	    //
	    this.game.queue.push("SAVE");

	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i >= 0; i--) {
	      for (let k = 0; k < factions_in_play.length; k++) {
	        if (factions_in_play[k] === io[i]) {
	          this.game.queue.push("play\t"+io[i]);
		  k = factions_in_play.length+2;
	        }
	      }
	      for (let k = 0; i < factions_force_pass.length; k++) {
	        if (factions_force_pass[k] === io[i]) {
	          this.game.queue.push("skipturn\t"+io[i]);
		  k = factions_force_pass.length+2;
	        }
	      }
	    }
	    return 1;
	  }

	  //
	  // move past action phase if no-one left to play
	  //
	  this.game.queue.splice(qe, 1);
          return 1;
        }

        if (mv[0] === "spring_deployment_phase") {

	  this.game.queue.splice(qe, 1);

	  //
	  // hide winter overlay
	  //
	  this.game_help.hide();
	  this.winter_overlay.hide();


//
// hide any other help (scoring!);
//
if (this.game.state.round > 1) {
  this.game_help.hide();
}
//
//
//
if (this.game.player == this.returnPlayerCommandingFaction("papacy") && this.round == 1) {
  this.game_help.render(TutorialTemplate, {
    help : `Spring Deployment` ,
    content : `
	Spring Deployment takes place at the start of every round. It allows players
 	to move units from their capital to any space connected to it via a line of 
	uninterrupted control.
	<p></p>
	The Papacy normally skips Spring Deployment in the first round. Later in the game
	it often uses Spring Deployment to move troops north into Europe to assist with
	Counter-Reformation attempts.
    `,
    line1 : "spring" ,
    line2 : "deployment" ,
    fontsize : "2.1rem" ,
    img : `/his/img/backgrounds/tutorials/spring_deployment.jpeg`,
  });
}


	  if (this.game.players.length === 2) {
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

	  if (faction === "protestant") { return 1; }
	  if (player == 0) { return 1; }

	  if (this.game.player == player) {
	    this.playerPlaySpringDeployment(faction, player);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " Spring Deployment");
	  }

	  return 0;

	}

	//
	// this is a 3P++ game
	//
        if (mv[0] === "diplomacy_reject") {
	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];

	  let idx = parseInt(mv[2]);
	  let proposal = this.game.state.diplomacy[idx];
	  let terms = this.convertTermsToText(idx);
	  for (let i = terms.length-1; i >= 0; i--) { this.updateLog("  "+terms[i]); }
	  this.updateLog(this.returnFactionName(faction) + " rejects " + this.returnFactionName(proposal.proposer) + " offer:");
	  this.game.state.diplomacy.splice(idx, 1);
	  return 1;

	}
        if (mv[0] === "diplomacy_accept") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let idx = parseInt(mv[2]);

	  let proposal = this.game.state.diplomacy[idx];
	  let terms = this.convertTermsToText(proposal);
	  for (let i = terms.length-1; i >= 0; i--) { this.updateLog("  "+terms[i]); }
	  this.updateLog(this.returnFactionName(faction) + " accepts " + this.returnFactionName(proposal.proposer) + " offer:");

	  for (let i = 0; i < proposal.parties.length; i++) { 
	    if (!proposal.confirms) { proposal.confirms = []; }
	    if (proposal.confirms.length < (i+1)) { proposal.confirms.push(0); }
	    if (proposal.parties[i] === faction || proposal.parties[i] === proposal.proposer) {
	      proposal.confirms[i] = 1;
	    }
	  }

	  let all_confirmed = true;
	  for (let i = 0; i < proposal.confirms.length; i++) { 
	    if (proposal.confirms[i] != 1) {
	     all_confirmed = false;
	    }
	  }

	  if (all_confirmed == true) {
	    this.updateLog(this.returnFactionName(proposal.proposer) + " offer takes effect.");
	    for (let i = proposal.terms.length-1; i >= 0; i--) {
	      this.game.queue.push(proposal.terms[i]);
	    }
	    this.game.state.diplomacy.splice(idx, 1);
	    this.diplomacy_propose_overlay.purgeProposals();
	  }

	  return 1;

	}
        if (mv[0] === "diplomacy_phase") {

	  this.game.queue.splice(qe, 1);

if (this.game.state.round == 1) {
this.game_help.render(TutorialTemplate, {
  help : `What is the Diplomacy Phase?` ,
    content : `       
        
In the Diplomacy Phase, factions propose and accept binding agreements in Impulse Order, starting with the Ottoman Empire, Hapsburg Empire, England, France, Papacy and finishing with the Protestants. Proposals cannot be offered by a later faction to an earlier faction, so if a later faction desires an agreement with the Ottomans they must propose it.

	<p></p>

Players are allowed to communicate in secret during this phase. The most commonly negotiated terms are Alliances, which permit factions to move through spaces controlled by their allies, join forces to fight common enemies and retreat into allied spaces if defeated in battle. Factions can also "spring deploy" through allied territory as if it is their own. Factions can also agree to terminate a war, offer bonus cards, or yield strategic keys.

	<p></p>

If this is your first game, it is usually fine to skip the diplomacy phase until you have a better sense of how the game plays.

    `,              
    img : "/his/img/backgrounds/tutorials/diplomacy.jpg",
    line1 : "what is", 
    line2 : "diplomacy?",
    fontsize : "2.1rem" ,
});  
}
	  this.game.state.diplomacy = [];

	  if (this.game.players.length == 2) {
	    this.game.queue.push("confirm_and_propose_diplomatic_proposals\tprotestant");
	    this.game.queue.push("confirm_and_propose_diplomatic_proposals\tpapacy");
	    return 1;
	  }

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    this.game.queue.push("confirm_and_propose_diplomatic_proposals\t"+io[i]);
	  }

	  return 1;

	}

	if (mv[0] === "confirm_diplomatic_proposal") {

	  let faction = mv[1];
	  let proposal_idx = parseInt(mv[2]);
	  let proposal = this.game.state.diplomacy[proposal_idx];
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.diplomacy_confirm_overlay.render(faction, proposal_idx);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " reviewing diplomatic proposal...");
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}

	if (mv[0] === "confirm_and_propose_diplomatic_proposals") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  this.winter_overlay.render("stage5");

	  //
	  // first, if there are any outstanding proposals that
	  // involve this faction, we need to ask them one-by-one
	  // if they agree or disagree. if they agree and are the
	  // last to agree, it will immediately execute.
	  //
	  let anything_to_review = false;
	  for (let i = 0; i < this.game.state.diplomacy.length; i++) {
	    if (this.game.state.diplomacy[i].parties.includes(faction)) {
	      for (let z = 0; z < this.game.state.diplomacy[i].parties.length; z++) {
		if (this.game.state.diplomacy[i].parties[z] == faction && this.game.state.diplomacy[i].confirms[z] != 1) {
	          this.game.queue.push("confirm_diplomatic_proposal\t"+faction+"\t"+i);
	          anything_to_review = true;
	        }
	      }
	    }
	  }
	  if (anything_to_review) { 
	    // we have pushed to the queue, so will return and pass-
	    // through when all proposals are fine.
	    return 1;
	  }

	  //
	  // protestants cannot make new proposals....
	  //
	  if (faction === "protestant") {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // there are no proposals left
	  //
	  if (player === this.game.player) {
	    // makes sure old data purged from last faction we did
	    this.diplomacy_propose_overlay.purgeProposals();
	    this.diplomacy_propose_overlay.render(faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " considering diplomatic proposals");
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}



	if (mv[0] === "remove_excommunication") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];

          if (this.game.state.excommunicated_factions[faction] != 1) { return 1; }

	  if (this.game.player == this.returnPlayerCommandingFaction(faction)) {
	    this.playerManuallyRemoveExcommunication(this, faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " considering Removing Excommunication");
	  }

	  return 0;

	}




	if (mv[0] === "sue_for_peace") {

	  this.game.queue.splice(qe, 1);

	  this.winter_overlay.render("stage6");

	  let faction = mv[1];
	  let can_faction_sue_for_peace = this.canFactionSueForPeace(faction);

	  if (can_faction_sue_for_peace.length == 0) { return 1; }


	  if (this.game.player == this.returnPlayerCommandingFaction(faction)) {
	    this.playerSueForPeace(this, faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " considering Peace Suit");
	  }

	  return 0;

	}



	if (mv[0] === "make_declarations_of_war") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  this.winter_overlay.render("stage7");

	  if (this.game.player == player) {
	    this.playerMakeDeclarationsOfWar(this, faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " considering Declarations of War");
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}



        if (mv[0] === "diplomacy_phase_2P") {

	  //
	  // hide winter overlay
	  //
	  this.winter_overlay.hide();

	  // removed besieged spaces
	  this.removeBesiegedSpaces();

	  //
	  // remove french, hapsburg and ottoman army leaders
	  //
	  let rf = ["hapsburg", "france", "ottoman"];
	  for (let key in this.game.spaces) {
	    for (let z = 0; z < rf.length; z++) {
	      let f = rf[z];
	      for (let i = 0; i < this.game.spaces[key].units[f].length; i++) {
		let u = this.game.spaces[key].units[f][i];
		if (u.army_leader || u.navy_leader) {
		  this.game.spaces[key].units[f].splice(i, 1);
		  i--;
		  this.displaySpace(key);
		}
	      }
	    }
	  }

//
// Papacy 
//
/***********
if (this.game.state.round == 2) {
  this.game_help.render(TutorialTemplate, {
    help : `Diplomacy Phase` ,
    content : `
	In the two-player version of Here I Stand, the Diplomatic Stage starts with the Papacy having the option
	to end any wars it is in with third powers such as France or the Ottomans. Terminating any war will give 
	the Protestants a "War Winner" VP.
	</p></p>
	Both players are then dealt two cards from a special Diplomatic Deck and must choose one to event. These
	cards trigger actions affecting the other factions on the board.
	<p></p>
	If diplomatic events put a player at war with either the Papacy or the Protestants, that faction can be 
	controlled by the opposing faction during their turn. Once the Schmalkaldic League has formed, for instance,
	the Papacy also controls the Hapsburgs.
    `,
    line1 : "learn" ,
    line2 : "diplomacy" ,
    fontsize : "2.1rem" ,
    img : `/his/img/backgrounds/tutorials/the_ambassadors_depart.png`,
  });
}
******/     


	  //
	  // multiplayer has diplomacy phase
	  //
	  if (this.game.players.length > 2) {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // no diplomacy phase round 1
	  //
	  if (this.game.state.round == 1 || (this.game.state.round <= this.game.state.starting_round)) {

            this.game.queue.push("SHUFFLE\t2");
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t2\t"+(i));
	    }
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t2\t"+(i));
	    }

	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));

	    this.game.queue.splice(qe, 1);
	    return 1;

	  }

	  //
	  // 2-player game? both players play a diplomacy card
	  // AFTER they have been dealt on every turn after T1
	  //
	  if (this.game.state.round > 1) {
    	    this.game.queue.push("play_diplomacy_card\tprotestant");
    	    this.game.queue.push("play_diplomacy_card\tpapacy");
	  }

	  //
	  // 2-player game? Diplomacy Deck
	  //
	  if (this.game.players.length == 2) {

	    let cards_to_deal = 2;
	    if (this.game.state.round > 2) { cards_to_deal = 1; }

	    for (let i = this.game.state.players_info.length-1; i >= 0; i--) {
	      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
    	        this.game.queue.push("DEAL\t2\t"+(i+1)+"\t"+cards_to_deal);
	      }
	    }
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t2\t"+(i));
	    }
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t2\t"+(i));
	    }
	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
	  }

	  //
	  // The Papacy may end a war they are fighting by playing Papal Bull or by suing for peace. -- start of diplomacy phase
	  //
          let is_papacy_at_war = false;
          let factions = ["genoa","venice","scotland","ottoman","france","england","hungary","hapsburg"];
          for (let i = 0; i < factions.length; i++) { if (this.areEnemies(factions[i], "papacy")) { is_papacy_at_war = true; } }
          if (is_papacy_at_war == true) {
            this.game.queue.push("papacy_diplomacy_phase_special_turn");
            this.game.queue.push("counter_or_acknowledge\tPapacy Special Diplomacy Phase");
  	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
          }

	  this.game.queue.splice(qe, 1);
          return 1;

        }


	if (mv[0] === "war_loser_regain_leaders_for_vp_or_cards") {

	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let loser = mv[1];
	  let winner = mv[2];
	
	  let p2 = this.returnPlayerCommandingFaction(winner);
          let target_leaders = 0;

          for (let z = 0; z < his_self.game.state.players_info[p2-1].captured.length; z++) {
            if (his_self.game.state.players_info[p2-1].captured[z].faction == loser) {
              target_leaders++;
            }
          }

	  if (target_leaders == 0) { return 1; }
	
	  if (this.game.player == this.returnPlayerOfFaction(loser)) {
	    this.playerRegainLeadersForVPOrCards(loser, winner);
	  } else {
	    this.updateStatus(this.returnFactionName(loser) + " Considering Regaining Leaders");
	  }

          return 0;

        }


	if (mv[0] === "war_loser_regain_spaces_for_vp_or_cards") {

	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let loser = mv[1];
	  let winner = mv[2];

          let target_spaces = his_self.countSpacesWithFilter(
            function(space) {
              if (space.home == loser && space.political == winner) { return 1; }
	      return 0;
	    }
          );

	  if (target_spaces < 2) { return 1; }
 
	  if (this.game.player == this.returnPlayerOfFaction(loser)) {
	    this.playerRegainSpacesForVPOrCards(loser, winner);
	  } else {
	    this.updateStatus(this.returnFactionName(loser) + " Considering Regaining Home Keys");
	  }

          return 0;

        }

	if (mv[0] === "war_loser_regain_keys_for_vp") {

	  this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let loser = mv[1];
	  let winner = mv[2];

	  if (this.game.player == this.returnPlayerOfFaction(loser)) {
	    this.playerRegainKeysForVP(loser, winner);
	  } else {
	    this.updateStatus(this.returnFactionName(loser) + " Considering Regaining Home Keys");
	  }

          return 0;

        }

	if (mv[0] === "player_play_papacy_regain_spaces_for_vp") {

	  this.game.queue.splice(qe, 1);

          let enemies = [];
	  let factions = ["genoa","venice","scotland","ottoman","france","england","hungary","hapsburg"];
	  for (let i = 0; i < factions.length; i++) { if (this.areEnemies(factions[i], "papacy")) { enemies.push(factions[i]); } }

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
	    this.playerPlayPapacyRegainSpacesForVP();
	  } else {
	    this.updateStatus("Papacy Considering Regaining Spaces");
	  }

          return 0;

	}


	if (mv[0] === "papacy_diplomacy_phase_special_turn") {

	  this.game.queue.splice(qe, 1);

	  let is_papacy_at_war = false;
          let enemies = [];
	  let factions = ["ottoman","france","england","hapsburg"];
	  for (let i = 0; i < factions.length; i++) { if (this.areEnemies(factions[i], "papacy")) { enemies.push(factions[i]); is_papacy_at_war = true; } }

	  if (is_papacy_at_war == false) {
	    this.updateLog("Papacy is not at War, skipping special pre-diplomacy stage...");
	    return 1;
	  }

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
	    this.playerPlayPapacyDiplomacyPhaseSpecialTurn(enemies);
	  } else {
	    this.updateStatus("Papacy Considering Diplomatic Options to End War");
	  }

          return 0;

        }

	if (mv[0] === "unset_enemies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetEnemies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;
	  
	}
        if (mv[0] === "unset_allies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetAllies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;
	  
	}

	if (mv[0] === "display_vp_track") {
	
	  this.displayVictoryTrack();
	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "display_new_world") {
	  this.game.queue.splice(qe, 1);
	  this.displayNewWorld();
	  return 1;
	}


	if (mv[0] === "war") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let locale = mv[2];

	  this.game.queue.push("field_battle\t"+locale+"\t"+faction);

	  return 1;

	}

	if (mv[0] === "natural_ally_intervention") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let natural_ally = mv[2];
	  let enemy = mv[3];
	  let cost = parseInt(mv[4]);
	  let reason = mv[5];
	  let his_self = this;

	  let p = this.returnPlayerOfFaction(faction);
	  if (p == 0) { return 1; }

	  if (this.game.player == p) {

	    if (!this.canPlayerSelectOps(faction, cost)) {
	      his_self.endTurn();
	      return 0;
	    }

	    if (p === this.game.player) {

              let msg = "Intervene for " + this.returnFactionName(natural_ally) + " against " + this.returnFactionName(enemy);
	      if (cost > 0) { msg += " (cost: "+cost+")"; }
              let html = '<ul>';
              html += `<li class="option" id="yes">declare war</li>`;
              html += `<li class="option" id="no">do not intervene</li>`;
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                $('.option').off();
                his_self.updateStatus("acknowledge...");
                let action = $(this).attr("id");

	        if (action === "yes") {
	  	  if (cost > 0) {
		    his_self.playerSelectOps(faction, cost, (card) => {
		      his_self.addMove("discard\t"+faction+"\t"+card);
	              his_self.addMove("unexpected_war\t"+faction+"\t"+enemy);
		      his_self.addMove("declare_war\t"+faction+"\t"+enemy);
		      his_self.addMove("set_allies\t"+faction+"\t"+natural_ally);
		      his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" declares war");
		      his_self.endTurn();
		    });
		  } else {
	            his_self.addMove("unexpected_war\t"+faction+"\t"+enemy);
		    his_self.addMove("declare_war\t"+faction+"\t"+enemy);
		    his_self.addMove("set_allies\t"+faction+"\t"+natural_ally);
		    his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" declares war");
		    his_self.endTurn();
		  }
	        }

	        if (action === "no") {
		  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" defers to intervene");
		  his_self.endTurn();
	        }

	      });	
	    }	
	  } else {
            this.updateStatus(this.returnFactionName(faction) + " considering intervening for " + this.returnFactionName(natural_ally) + " against " + this.returnFactionName(enemy));
	  }

	  return 0;

	}


	if (mv[0] === "declare_peace" || mv[0] === "set_peace" || mv[0] === "end_war") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetEnemies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  this.displayWarBox();

	  return 1;

	}

	if (mv[0] === "declare_war" || mv[0] === "set_enemies") {

	  this.game.queue.splice(qe, 1);

	  let f1 = mv[1];
	  let f2 = mv[2];
	  let skip_natural_ally_intervention = 0;
	  if (parseInt(mv[3])) { skip_natural_ally_intervention = 1; }

	  this.updateLog(this.returnFactionName(f1) + " declares war on " + this.returnFactionName(f2));

  	  this.setEnemies(f1, f2);

	  if (!skip_natural_ally_intervention) {
	    if (f2 == "scotland") {
	      his_self.game.queue.push(`natural_ally_intervention\tfrance\tscotland\t${f1}\t2\t${this.returnFactionName(f1)} declares war on Scotland`);
	    }
	    if (f2 == "venice") {
	      his_self.game.queue.push(`natural_ally_intervention\tpapacy\tvenice\t${f1}\t2\t${this.returnFactionName(f1)} declares war on Venice`);
	    }
	  }


	  this.displayWarBox();

	  return 1;

	}

	if (mv[0] === "declare_alliance" || mv[0] === "set_allies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setAllies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "unset_activated_power") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetActivatedPower(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "set_activated_power" || mv[0] === "set_activated_powers") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setActivatedPower(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}



	//
	// this checks we have not been dealt a removed card (can happen if Clement VII is floating 
	// around the undealt cards and removed. and asks for a new one if this is the case.
	//
	if (mv[0] === "check_replacement_cards") {

	  this.game.queue.splice(qe, 1);
	  faction = mv[1];

	  let num = 0;
	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player == p) {

	    this.updateStatus("checking "+this.returnFactionName(faction)+" has no removed cards...");

            let fhand_idx = this.returnFactionHandIdx(p, faction);
	
	    if (fhand_idx == -1) {

	      //
	      // TESTING can trigger but we are good - continue!
	      //
	      this.endTurn();
	      return;

	    }

  	    while (this.game.deck[0].fhand.length < (fhand_idx+1)) { this.game.deck[0].fhand.push([]); }
	    for (let zz = 0; zz < this.game.deck[0].fhand[fhand_idx].length; zz++) {
	      let c = this.game.deck[0].fhand[fhand_idx][zz];
	      if (this.game.state.removed.includes(c)) {
	        this.game.deck[0].fhand[fhand_idx].splice(zz, 1);
		num++;
		zz--;
	      }
	    }

	    //
	    // we need a new/replacement card
	    //
	    if (num > 0) {

	      //
	      // not good - deal another!
	      //
	      this.addMove("check_replacement_cards\t"+faction);
    	      this.addMove("hand_to_fhand\t1\t"+p+"\t"+faction);
    	      this.addMove("DEAL\t1\t"+p+"\t"+(num));
	      this.endTurn();

	    } else {

	      //
	      // we are good - continue!
	      //
	      this.endTurn();
	    }

	  } else {
	    this.updateStatus("checking "+this.returnFactionName(faction)+" has no removed cards...");
	  }

	  return 0;

	}

        if (mv[0] === "card_draw_phase") {

	  if (this.game.state.round > 1) {
	    this.winter_overlay.render("stage4");
	  }


	  //
	  // deal cards and add home card
	  //
	  for (let i = this.game.state.players_info.length-1; i >= 0; i--) {
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {

	      //
	      // sanity check we are major power
	      //
	      let f = this.game.state.players_info[i].factions[z];

	      if (f === "protestant" || f === "hapsburg" || f === "papacy" || f === "england" || f === "ottoman" || f === "france") {

                let cardnum = this.factions[this.game.state.players_info[i].factions[z]].returnCardsDealt(this);

		//
		// is_testing
		//
		if (this.game.options.scenario == "is_testing") { cardnum = 5; }

	        //
	        // fuggers card -1
	        //
                if (this.game.state.events.fuggers === this.game.state.players_info[i].factions[z]) {
		  cardnum--;
	  	  this.game.state.events.fuggers = "";
	        }

	        //
	        // war in persia
	        //
                if (this.game.state.events.war_in_persia == 1 && f === "ottoman") {
		  this.updateLog("Ottomans penalized -1 card for War in Persia");
		  cardnum--;
	        }

	        //
	        // war in egypt
	        //
                if (this.game.state.events.revolt_in_egypt == 1 && f === "ottoman") {
		  this.updateLog("Ottomans penalized -1 card for Revolt in Egypt");
		  cardnum--;
	        }

	        //
	        // war in egypt
	        //
                if (this.game.state.events.revolt_in_ireland == 1 && f === "england") {
		  this.updateLog("Ottomans penalized -1 card for Revolt in Ireland");
		  cardnum--;
	        }

		//
		// new world card bonus
		//
	  	if (f == "england" && this.game.state.new_world_bonus['england'] > 0) { cardnum += this.game.state.new_world_bonus['england']; }
	  	if (f == "france" && this.game.state.new_world_bonus['france'] > 0) { cardnum += this.game.state.new_world_bonus['france']; }
	  	if (f == "hapsburg" && this.game.state.new_world_bonus['hapsburg'] > 0) { cardnum += this.game.state.new_world_bonus['hapsburg']; }
	  	if (f == "ottoman" && this.game.state.new_world_bonus['ottoman'] > 0) { cardnum += this.game.state.new_world_bonus['ottoman']; }
	  	if (f == "papacy" && this.game.state.new_world_bonus['papacy'] > 0) { cardnum += this.game.state.new_world_bonus['papacy']; }
	  	if (f == "protestant" && this.game.state.new_world_bonus['protestant'] > 0) { cardnum += this.game.state.new_world_bonus['protestant']; }

		//
		// sanity check
		//
		if (cardnum < 0) { cardnum = 0; }

    	        this.game.queue.push("check_replacement_cards\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("hand_to_fhand\t1\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("add_home_card\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("DEAL\t1\t"+(i+1)+"\t"+(cardnum));

		//
	        // try to update cards_left
		//
	        if (!this.game.state.cards_left[this.game.state.players_info[i].factions[z]]) {
	          this.game.state.cards_left[this.game.state.players_info[i].factions[z]] = 0;
	        }
	        this.game.state.cards_left[this.game.state.players_info[i].factions[z]] += cardnum;

		//
		// and display cards left
		//
		this.displayCardsLeft();

	      }
	    }
	  }

	  //
	  // DECKRESTORE copies backed-up back into deck
	  //
          this.game.queue.push("SHUFFLE\t1");
          this.game.queue.push("DECKRESTORE\t1");

	  for (let i = this.game.state.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKENCRYPT\t1\t"+(i));
	  }
	  for (let i = this.game.state.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKXOR\t1\t"+(i));
	  }

	  //
	  // re-add discards
	  //
	  let discards = {};
	  for (let i in this.game.deck[0].discards) {
      	    discards[i] = this.game.deck[0].cards[i];
      	    delete this.game.deck[0].cards[i];
    	  }
	  for (let i in this.game.deck[0].removed) {
      	    delete this.game.deck[0].cards[i];
      	    delete discards[i];
    	  }
	  //
	  // remove any removed cards again for sanity sake (i.e. Clement VII)
	  //
	  for (let z = 0; z < this.game.state.removed.length; z++) {
      	    delete this.game.deck[0].cards[this.game.state.removed[z]];
      	    delete discards[this.game.state.removed[z]];
	  }
    	  this.game.deck[0].discards = {};

	  //
	  // our deck for re-shuffling
	  //
	  let reshuffle_cards = {};
	  for (let key in discards) {
	    if (key !== "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
	      reshuffle_cards[key] = discards[key];
	    }
	  }


	  //
	  // remove home cards 
	  //
	  if (this.game.deck[0].cards['001']) { delete this.game.deck[0].cards['001']; }
	  if (this.game.deck[0].cards['002']) { delete this.game.deck[0].cards['002']; }
	  if (this.game.deck[0].cards['003']) { delete this.game.deck[0].cards['003']; }
	  if (this.game.deck[0].cards['004']) { delete this.game.deck[0].cards['004']; }
	  if (this.game.deck[0].cards['005']) { delete this.game.deck[0].cards['005']; }
	  if (this.game.deck[0].cards['006']) { delete this.game.deck[0].cards['006']; }
	  if (this.game.deck[0].cards['007']) { delete this.game.deck[0].cards['007']; }
	  if (this.game.deck[0].cards['008']) { delete this.game.deck[0].cards['008']; }


	  //
	  // new cards this turn
	  //
	  if (this.game.state.starting_round >= this.game.state.round && this.game.state.starting_round > 1) {
	    this.game.state.round = 0;
	    for (let i = this.game.state.round; i < this.game.state.starting_round; i++) {
	      this.game.state.round++;
	      let deck_to_deal = this.returnNewCardsForThisTurn(this.game.state.round);

console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("return new cards for this turn: " + this.game.state.round);

	      for (let key in deck_to_deal) { 
	        if (key !== "001" && key !== "002" && key !== "003" && key !== "004" && key !== "005" && key !== "006" && key !== "007" && key !== "008") {
	          reshuffle_cards[key] = deck_to_deal[key]; 
	        }
	      }
	    }
	  } else {
	    let deck_to_deal = this.returnNewCardsForThisTurn(this.game.state.round);
	    for (let key in deck_to_deal) { 
	      if (key !== "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
	        reshuffle_cards[key] = deck_to_deal[key]; 
	      }
	    }
	  }


console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");
console.log(JSON.stringify(reshuffle_cards));

    	  this.game.queue.push("restore_home_cards_to_deck");
    	  this.game.queue.push("DECK\t1\t"+JSON.stringify(reshuffle_cards));

	  // backup any existing DECK #1
          this.game.queue.push("DECKBACKUP\t1");


	  //
	  // remove any card bonuses
	  //
  	  this.game.state.papacy_card_bonus = 0;
  	  this.game.state.protestant_card_bonus = 0;
  	  this.game.state.ottoman_card_bonus = 0;
  	  this.game.state.france_card_bonus = 0;
  	  this.game.state.england_card_bonus = 0;
  	  this.game.state.hapsburg_card_bonus = 0;


	  this.game.queue.splice(qe, 1);
          return 1;

        }

        if (mv[0] === "restore_home_cards_to_deck") {

	  let d = this.returnDeck();
	  this.deck['008'] = d['008'];
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

	// removes from game
	if (mv[0] === "remove") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  if (!this.game.state.removed.includes(card)) { 
	    this.updateLog(this.popup(card) + " removed from deck");
	  }
	  this.removeCardFromGame(card);

	  return 1;

	}


	// pull card
	if (mv[0] === "pull_card") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let home_card_permitted = 0;
	  if (parseInt(mv[3]) > 0) { home_card_permitted = 1; }

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p2) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_giving);
	    let roll = this.rollDice(this.game.deck[0].fhand[fhand_idx].length) - 1;

            let is_this_home_card = 0;
            let pulled = this.game.deck[0].fhand[fhand_idx][roll];
            if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
              is_this_home_card = 1;
            }

	    let looped_once = false;
            if (home_card_permitted == 0 && is_this_home_card == 1) {
              while (roll >= 0 && is_this_home_card == 1) {
                is_this_home_card = 0;
                roll--;
                if (roll < 0) {
		  if (looped_once == false) { 
		    looped_once = true;
		    roll = this.game.deck[0].fhand[fhand_idx].length-1;
		  } else {
                    this.addMove("NOTIFY\t"+this.returnFactionName(faction)+ " has no non-home cards to pull");
                    this.endTurn();
                    return 0;
	          }
                }
                let pulled = this.game.deck[0].fhand[fhand_idx][roll];
                if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
                  is_this_home_card = 1;
                }
              }
            }

	    let card = this.game.deck[0].fhand[fhand_idx][roll];
	    this.addMove("give_card\t"+faction_taking+"\t"+faction_giving+"\t"+card);
	    this.endTurn();
	  } else {
	    this.rollDice();
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	// requestreveal hand
	if (mv[0] === "request_reveal_hand") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p2) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_giving);
	    this.addMove("reveal_hand\t"+faction_taking+"\t"+faction_giving+"\t"+JSON.stringify(his_self.game.deck[0].fhand[fhand_idx]));
	    this.endTurn();
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	// reveal hand
	if (mv[0] === "reveal_hand") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let cards = JSON.parse(mv[3]);

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p1) {
	    for (let i = 0; i < cards.length; i++) {
	      this.updateLog(" * " + this.popup(cards[i]));
	    }
	    this.updateLog(this.returnFactionName(faction_giving) + " Hand: ");
	  }

	  //
	  // does this show our cards
	  //
	  this.deck_overlay.render("hand", cards);

	  this.game.queue.splice(qe, 1);
	  return 1;

        }

	// give card
	if (mv[0] === "give_card") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let card = mv[3];

	  if (card == "undefined") { 
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  this.updateLog(this.returnFactionName(faction_taking) + " pulls " + this.popup(card));

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);
	  this.game.state.last_pulled_card = card;


	  //
	  // update cards left
	  //
	  this.game.state.cards_left[faction_taking] += 1;
	  this.game.state.cards_left[faction_giving] -= 1;
	  if (this.game.state.cards_left[faction_giving] < 0) { 
	    this.game.state.cards_left[faction_taking] -= 1;
	    this.game.state.cards_left[faction_giving] = 0;
	  }
	  this.displayCardsLeft();


	  if (this.game.player == p2) {
	    for (let i = 0; i < this.game.deck[0].fhand.length; i++) {
	      for (let z = 0; z < this.game.deck[0].fhand[i].length; z++) {
		if (this.game.deck[0].fhand[i][z] === card) {
		  this.game.deck[0].fhand[i].splice(z, 1);
		  z--;
		}
	      }
	    }
	  }

	  if (this.game.player == p1) {
            let fhand_idx = this.returnFactionHandIdx(p1, faction_taking);
	    this.game.deck[0].fhand[fhand_idx].push(card);
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

        }

	// fortify a spacekey
	if (mv[0] === "fortify") {

	  let spacekey = mv[1];
	  this.game.spaces[spacekey].fortified = 1;
	  if (this.game.spaces[spacekey].type != "electorate" && this.game.spaces[spacekey].type != "key") { this.game.spaces[spacekey].type = "fortress"; }
	  this.game.queue.splice(qe, 1);

	  this.displaySpace(spacekey);

	  return 1;

	}



	if (mv[0] === "discard_diplomacy_card") {

	  let faction = mv[1];
	  let card = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  //
	  // move into discards
	  //
	  this.game.deck[1].discards[card] = this.game.deck[1].cards[card];

	  //
	  // and remove from hand
	  //
	  if (this.game.player === player_of_faction) {
	    for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	      if (this.game.deck[1].hand[i] === card) {
		this.game.deck[1].hand.splice(i, 1);
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "select_and_discard") {

	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
          let fhand_idx = this.returnFactionHandIdx(player, faction);
	  let cards = [];

	  if (player == this.game.player) {

	    cards = this.game.deck[0].fhand[fhand_idx];
	    if (mv[2]) { cards = JSON.parse(mv[2]); }

            let msg = "Select Card to Discard:";
            let html = '<ul>';
	    let any_choice = false;
	    for (let i = 0; i < cards.length; i++) {
              if (his_self.game.deck[0].cards[cards[i]].type != "mandatory" && parseInt(cards[i]) > 7) {
		any_choice = true;
                html += `<li class="option showcard" id="${cards[i]}">${his_self.game.deck[0].cards[cards[i]].name}</li>`;
              }
            }
            html += '</ul>';

	    if (any_choice == false) { his_self.endTurn(); return; }

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {
              $('.option').off();
              his_self.updateStatus("acknowledge...");
              let action = $(this).attr("id");
              his_self.addMove("discard\t"+faction+"\t"+action);
              his_self.endTurn();
            });
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " selecting discard");
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

	}

        //
        // use "discard" when the card being discarded is known 
        //
	if (mv[0] === "discard") {

	  let faction = mv[1];
	  let card = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);
	  let already_discarded = false;

	  if (this.game.deck[0].discards[card]) { already_discarded = true; }
	  //
	  // move into discards
	  //
	  this.game.deck[0].discards[card] = this.game.deck[0].cards[card];

	  //
	  // and remove from hand
	  //
	  if (this.game.player === player_of_faction) {
            let fhand_idx = this.returnFactionHandIdx(player_of_faction, faction);
	    for (let i = 0; i < this.game.deck[0].fhand[fhand_idx].length; i++) {
	      if (this.game.deck[0].fhand[fhand_idx][i] === card) {
		this.game.deck[0].fhand[fhand_idx].splice(i, 1);
	      }
	    }
	  }

	  //
	  // and update cards left
	  //
          if (already_discarded == false && this.game.state.cards_left[faction]) {
            if (this.game.state.cards_left[faction] > 0) {
	      this.game.state.cards_left[faction]--;
	      this.displayCardsLeft();
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	// skip next impulse
	if (mv[0] === "skip_next_impulse") {

	  let target_faction = mv[1];

	  this.game.state.skip_next_impulse.push(target_faction);

	  this.game.queue.splice(qe, 1);
          return 1;
        }


	if (mv[0] === "unexcommunicate_faction") {

	  let faction = mv[1];
	  this.unexcommunicateFaction(faction);
	  this.game.queue.splice(qe, 1);

          return 1;

	}

	// discards N cards from faction hand
	if (mv[0] === "excommunicate_faction") {

	  let faction = mv[1];
	  this.excommunicateFaction(faction);
	  this.displayCustomOverlay("excommunication", faction);
	  this.game.queue.splice(qe, 1);

          return 1;

	}

	// discards N cards from faction hand
	if (mv[0] === "excommunicate_reformer") {

	  let reformer = mv[1];

	  this.game.queue.splice(qe, 1);

	  this.excommunicateReformer(reformer);
	  this.displayBoard();

          return 1;
        }


	//
	// discards N cards from faction hand
	//
	// this cannot pick the home card
	//
	if (mv[0] === "discard_random") {

	  let faction = mv[1];
	  let home_card_permitted = 0;
	  if (parseInt(mv[2]) > 0) { home_card_permitted = parseInt(mv[2]); }
	  let num = 1;

	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	    if (this.game.player == player_of_faction) {

              let fhand_idx = this.returnFactionHandIdx(player_of_faction, faction);
	      let num_cards = this.game.deck[0].fhand[fhand_idx].length;
	      if (num_cards == 0) {
		this.rollDice(6);
		this.addMove("NOTIFY\t"+this.returnFactionName(faction)+ " has no cards to discard");
		this.endTurn();
		return 0;
	      }

	      let discards = [];
	      if (num_cards < num) { num = num_cards; }
	      let roll = this.rollDice(num_cards) - 1;
	      let is_this_home_card = 0;
	      let pulled = this.game.deck[0].fhand[fhand_idx][roll];
	      if (pulled === "001" || pulled === "002" || pulled === "003" || pulled === "004" || pulled === "005" || pulled === "006" || pulled === "007") {
		is_this_home_card = 1;
	      }

	      if (home_card_permitted == 0 && is_this_home_card == 1) {
		let is_looped = false;
	        while (roll >= 0 && is_this_home_card == 1) {
		  is_this_home_card = 0;
		  roll--;
		  if (roll == -1) {
		    if (is_looped == true) {
		      this.addMove("NOTIFY\t"+this.returnFactionName(faction)+ " has no non-home cards to discard");
		      this.endTurn();
		      return 0;
		    } else {
		      is_looped = true;
		      roll = this.game.deck[0].fhand[fhand_idx].length-1;
		    }
		  }
	      	  let pulled = this.game.deck[0].fhand[fhand_idx][roll];
	      	  if (pulled === "001" || pulled === "002" || pulled === "003" || pulled === "004" || pulled === "005" || pulled === "006" || pulled === "007") {
		    is_this_home_card = 1;
		  }
		}
	      }

	      discards.push(roll);
	      discards.sort();
	      for (let zz = 0; zz < discards.length; zz++) {
	        this.addMove("discard\t"+faction+"\t"+this.game.deck[0].fhand[fhand_idx][discards[zz]]);
	        this.addMove("NOTIFY\t"+this.returnFactionName(faction)+" discards "+this.popup(this.game.deck[0].fhand[fhand_idx][discards[zz]]));
	      }
	      this.endTurn();

	    } else {
	      this.rollDice(6);
	    }


	  return 0;

	}

	if (mv[0] === "skipturn") {

	    this.game.queue.splice(qe, 1);
	    return 1;
	}

        if (mv[0] === "play") {

	  let faction = mv[1];

	  this.factionbar.setActive(faction);

	  let player = this.returnPlayerOfFaction(faction);

	  // update board display
	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
          this.displayBoard();
	  this.displayCardsLeft();

	  //
	  // if everyone has passed, we can avoid this
	  //
	  let everyone_has_passed = true;
	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	      if (this.game.state.players_info[i].factions_passed[z] != true) { everyone_has_passed = false; }
	    }
	  }
	  if (everyone_has_passed == true) {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // new impulse
	  //
          this.resetBesiegedSpaces();
          this.onNewImpulse();

	  //
	  // hide unneeded overlays
	  //
	  this.debate_overlay.hide();
	  this.theses_overlay.hide();

	  this.game.state.active_card = "";
	  this.game.state.active_player = player;
	  this.game.state.active_faction = faction;

	  // skip factions not-in-play
	  if (player == -1) {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // skip turn if required
	  //
	  if (this.game.state.skip_next_impulse.includes(faction)) {
	    for (let i = 0; i < this.game.state.skip_next_impulse.length; i++) {
	      if (this.game.state.skip_next_impulse[i] == faction) {
		this.game.state.skip_next_impulse.splice(i, 1);
	      }
	    }
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
	    let f = this.game.state.players_info[this.game.player-1].factions[0];
	    let fhand_idx = 0;
	    try {
	      f = this.game.state.players_info[this.game.player-1].active_faction;
	      fhand_idx = this.game.state.players_info[this.game.player-1].active_faction_idx;
	    } catch (err) {
	    }
	    this.updateStatusAndListCards(`${this.returnFactionName(f)} - Opponent Turn: `, this.game.deck[0].fhand[fhand_idx], () => {});
	  }

	  this.game.queue.splice(qe, 1);
          return 0;
        }
	if (mv[0] === "continue") {

	  let player = mv[1];
	  let faction = mv[2];
	  let card = mv[3];
	  let ops = parseInt(mv[4]);
	  let limit = "";
	  if (mv[5]) { limit = mv[5]; }

	  //
	  // cache our last move, as we will sometimes show a sub-menu if
	  // there is another obvious move and we want to allow the player
	  // to avoid wandering through the menu to make progress on their
	  // turn.
	  //
	  let player_last_move = this.game.state.player_last_move;
	  let player_last_spacekey = this.game.state.player_last_spacekey;

	  //
	  // now reset them so we have a "clean slate" for our next move
	  //
	  this.game.state.player_last_move = "";
	  this.game.state.player_last_spacekey = "";


	  this.game.queue.splice(qe, 1);

	  let player_turn = -1;

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    if (this.game.state.players_info[i].factions.includes(faction)) {
	      player_turn = i+1;
	    }
	  }

	  //
	  // hide unneeded overlays
	  //
	  this.debate_overlay.hide();
	  this.theses_overlay.hide();

          this.displayBoard();

	  // no-one controls this faction, so skip
	  if (player_turn === -1) {
	    return 1;
	  }

	  // let the player who controls play turn
	  if (this.game.player === player_turn) {

	    let mycallback = [];

	    if (player_last_move == "move") {
	      if (player_last_spacekey != "") {
		if (this.game.spaces[player_last_spacekey]) {
		  if (!this.isSpaceBesieged(this.game.spaces[player_last_spacekey])) {
 	            mycallback.push({ text : "continue move" , mycallback : () => {this.playerContinueToMoveFormationInClear(his_self, this.game.player, faction, player_last_spacekey, 1, (ops)); }});
	            if (!this.isSpaceControlled(faction, player_last_spacekey) && this.game.spaces[player_last_spacekey].type == "town" && !this.areAllies(faction, this.returnFactionControllingSpace(player_last_spacekey))) {
 	              mycallback.push({ text : "control town" , mycallback : () => {
		        if (ops > 1) {
                          his_self.addMove(`continue\t${mv[1]}\t${mv[2]}\t${mv[3]}\t${ops-1}\t${mv[5]}`);
                          his_self.game.queue.push("SETVAR\tstate\tplayer_last_move\tmove");
                          his_self.game.queue.push("SETVAR\tstate\tplayer_last_spacekey\t"+player_last_spacekey);
		        }
                        his_self.addMove("pacify\t"+faction+"\t"+player_last_spacekey);
                        his_self.endTurn();
	 	      }});
	            }
	          }
	        }
	      }
	    }
 	    mycallback.push({ text : "back to menu" , mycallback : () => { this.playerPlayOps(card, faction, ops, limit); }});
	    this.playerAcknowledgeNotice(`You have ${ops} OPS remaining...`, mycallback);
	  } else {
	    this.hideOverlays();
	    this.updateStatusAndListCards("Opponent Turn", his_self.game.deck[0].fhand[0], () => {});
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
	    this.updateLog(this.returnSpaceName(location) + " converts Protestant");
	  }
	  this.displaySpace(location);

	  return 1;

	}

	if (mv[0] === "select_for_catholic_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  let force_in_zone = false;
	  if (mv[2]) { zone = mv[2]; }
	  if (mv[3]) { force_in_zone = true; }

	  this.game.queue.splice(qe, 1);

	  let available_spaces = this.returnNumberOfProtestantSpacesInLanguageZone(zone, 1);
	  if (available_spaces == 0) {
	    if (force_in_zone) { 
	      return 1; 
	    } else { 
	      zone = ""; 
	    }
	  }
	  if (1 > this.returnNumberOfProtestantSpacesInLanguageZone(zone, 1)) {
	    return 1;
	  }

	  if (this.theses_overlay.visible) { this.theses_overlay.pushHudUnderOverlay(); }

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
		  (
                    his_self.isSpaceAdjacentToReligion(space, "catholic")
                    ||
                    his_self.isSpaceAPortInTheSameSeaZoneAsACatholicPort(space)
		  )
                ) {
		  if (space.language == zone || zone == "" || zone == "all") {
                    return 1;
                  }
                }
                return 0;
              },

              function(spacekey) {
    	        his_self.updateStatusWithOptions(`Converting ${his_self.returnSpaceName(spacekey)}`);
                his_self.addMove("convert\t"+spacekey+"\tcatholic");
                his_self.endTurn();
              },

              null,

	      true

            );

          } else {
	    this.updateStatus("Player selecting space to convert Catholic");
	  }
	  this.displayVictoryTrack();
	  return 0;

        }

	if (mv[0] === "select_for_protestant_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  let force_in_zone = false;
	  if (mv[2]) { zone = mv[2]; }
	  if (mv[3]) { force_in_zone = true; }

	  this.game.queue.splice(qe, 1);

	  let available_spaces = this.returnNumberOfCatholicSpacesInLanguageZone(zone, 1);
	  if (available_spaces == 0) {
	    if (force_in_zone) { 
	      return 1; 
	    } else { 
	      zone = ""; 
	    }
	  }
	  if (1 > this.returnNumberOfCatholicSpacesInLanguageZone(zone, 1)) {
	    return 1;
	  }

	  if (this.theses_overlay.visible) { this.theses_overlay.pushHudUnderOverlay(); }

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
		  (
                        his_self.isSpaceAdjacentToProtestantReformer(space, "protestant")
                        ||
                        his_self.isSpaceAdjacentToReligion(space, "protestant")
                        ||
                        his_self.doesSpaceContainProtestantReformer(space)
                        ||
                        his_self.isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space)
		  )
                ) {
		  if (space.language == zone || zone == "" || zone == "all") {
                    return 1;
                  }
                }
                return 0;
              },

              function(spacekey) {
    	        his_self.updateStatusWithOptions(`Reforming ${his_self.returnSpaceName(spacekey)}`);
                his_self.addMove("convert\t"+spacekey+"\tprotestant");
                his_self.endTurn();
              },

              null,

	      true

            );
          } else {
	    this.updateStatus("Player selecting space to convert Protestant");
	  }

	  this.displayVictoryTrack();
	  return 0;

        }



	if (mv[0] === "assault") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let space = mv[2];

	  this.displayVictoryTrack();

	  return 1;

	}


 	if (mv[0] === "unrest") {

	  let spacekey = mv[1];
	  this.game.spaces[spacekey].unrest = 1;
	  this.updateLog(this.returnSpaceName(spacekey) + " enters unrest");
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

 	if (mv[0] === "remove_unrest") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  this.game.spaces[spacekey].unrest = 0;
	  this.updateLog(this.returnSpaceName(spacekey) + " out of unrest");
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


 	if (mv[0] === "player_add_unrest") {

	  let faction = mv[1];
	  let zone = mv[2];
	  let religion = mv[3];
	  let player = this.returnPlayerOfFaction(faction);


	  if (this.game.player == player) {
	    this.playerAddUnrest(this, faction, zone, religion);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " stirring unrest");
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "withdraw_to_nearest_fortified_space") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source_spacekey = mv[2];
	  let source_space = this.game.spaces[source_spacekey];

	  //
	  // move the units here
	  //
          let land_units = [];
          let naval_units = [];

	  for (let i = 0; i < source_space.units[faction].length; i++) {
	    let u = source_space.units[faction][i];
	    if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry" || u.army_leader == true) {
	      land_units.push(u);
	      source_space.units[faction].splice(i, 1);
	      i--;
	    } else {
	      // navy leaders that are army leaders treated as army leaders primarily
	      if (u.type == "squadron" || u.type == "corsair" || u.navy_leader == true) {
	        naval_units.push(u);
	        source_space.units[faction].splice(i, 1);
	        i--;
	      }
	    }
	  }

	  //
	  // find nearest fortified unit
	  //
	  let not_these_land_spaces = [];
	  let not_these_naval_spaces = [];
	  let all_land_units_repositioned = false;
	  let all_naval_units_repositioned = false;

	  //
	  // land units
	  //
	  while (all_land_units_repositioned == false) {
            let found_space = his_self.returnNearestSpaceWithFilter(
	      source_spacekey ,
              function(spacekey) {
                if ( !not_these_land_spaces.includes(spacekey) && his_self.game.spaces[spacekey].home == faction && (his_self.isSpaceFortified(spacekey) || his_self.game.spaces[spacekey].type == "key" || his_self.game.spaces[spacekey].type == "electorate" || his_self.game.spaces[spacekey].type == "fortress")) {
		  if (his_self.returnFactionLandUnitsInSpace(faction, spacekey) < 4) { return 1; }
		}
                return 0;
              },
              function(propagation_filter) {
                return 1;
              },
              0,
              1,
            );
	    let loop_limit = land_units.length;
	    for (let i = 0; i < loop_limit; i++) {
	      if (his_self.returnFactionLandUnitsInSpace(faction, found_space[0].key) < 4) {
		his_self.game.spaces[found_space[0].key].units[faction].push(land_units[i]);
		land_units.splice(i, 1);
		i--;
	        loop_limit = land_units.length;
	      }
	      his_self.displaySpace(found_space[0].key);
	    }
	    if (land_units.length == 0) { all_land_units_repositioned = true; }
	  }

	  //
	  // naval units
	  //
	  while (all_naval_units_repositioned == false) {
            let found_space = his_self.returnNearestSpaceWithFilter(
	      source_spacekey ,
              function(spacekey) {
                if (his_self.game.spaces[spacekey].ports.length > 0 && his_self.game.spaces[spacekey].home == faction && (his_self.isSpaceFortified(spacekey) || his_self.game.spaces[spacekey].type == "key" || his_self.game.spaces[spacekey].type == "electorate" || his_self.game.spaces[spacekey].type == "fortress")) {
		  return 1;
		}
                return 0;
              },
              function(propagation_filter) {
                return 1;
              },
              0,
              1,
            );
	    if (found_space.length > 0) {
	      for (let z = 0; z < naval_units.length; z++) {
	        his_self.game.spaces[found_space[0].key].units[faction].push(naval_units[z]);
	      }
	      naval_units = [];
	      his_self.displaySpace(found_space[0].key);
	    }
	    all_naval_units_repositioned = true;
	  }

	  return 1;

	}

	if (mv[0] === "pacify" || mv[0] === "control") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let space = mv[2];
	  let religion = this.game.spaces[space].religion;

	  this.game.spaces[space].unrest = 0;

	  //
	  // 2P restriction on which keys can 
	  //
	  if (this.game.players.length == 2) {
	    if (space != "metz" && space != "liege" && this.game.spaces[space].language != "german" && this.game.spaces[space].language != "italian") { 
	      this.updateLog("NOTE: only Metz, Liege and German and Italian spaces may change control in the 2P game");
	    } else {
	      this.updateLog(this.returnFactionName(faction) + " controls " + this.returnSpaceName(space));
	      this.game.spaces[space].political = faction;
	    }
	  } else {
	    this.updateLog(this.returnFactionName(faction) + " controls " + this.returnSpaceName(space));
	    this.game.spaces[space].political = faction;
	  }


	  //
	  // capture any leaders
	  //
	  for (let f in this.game.spaces[space].units) {
	    if (!this.areAllies(f, faction)) {
	      for (let z = 0; z < this.game.spaces[space].units[f].length; z++) {
	        his_self.captureLeader(faction, f, space, this.game.spaces[space].units[f][z]);
	      };
	    }
	  }

	  this.game.spaces[space].political = faction;

	  //
	  // post schmalkaldic_league
	  //
	  if (faction === "protestant") {
            if (space === "augsburg" && religion === "protestant" && this.game.state.augsburg_electoral_bonus == 0 && this.game.state.events.schmalkaldic_league == 1) {
              this.game.spaces['augsburg'].units['protestant'].push();
              this.addRegular("protestant", "augsburg", 2);
              this.game.state.augsburg_electoral_bonus = 1;
            }
            if (space === "mainz" && religion === "protestant" && this.game.state.mainz_electoral_bonus == 0 && this.game.state.events.schmalkaldic_league == 1) {
              this.game.spaces['mainz'].units['protestant'].push();
              this.addRegular("protestant", "mainz", 1);
              this.game.state.mainz_electoral_bonus = 1;
            }
            if (space === "trier" && religion === "protestant" && this.game.state.trier_electoral_bonus == 0 && this.game.state.events.schmalkaldic_league == 1) {
              this.game.spaces['trier'].units['protestant'].push();
              this.addRegular("protestant", "trier", 1);
              this.game.state.trier_electoral_bonus = 1;
            }
            if (space === "cologne" && religion === "protestant" && this.game.state.cologne_electoral_bonus == 0 && this.game.state.events.schmalkaldic_league == 1) {
              this.game.spaces['cologne'].units['protestant'].push();
              this.addRegular("protestant", "cologne", 1);
              this.game.state.cologne_electoral_bonus = 1;
            }
            if (space === "wittenberg" && religion === "protestant" && this.game.state.wittenberg_electoral_bonus == 0 && this.game.state.events.schmalkaldic_league == 1) {
              this.game.spaces['wittenberg'].units['protestant'].push();
              this.addRegular("protestant", "wittenberg", 2);
              this.game.state.wittenberg_electoral_bonus = 1;
            }
            if (space === "brandenburg" && religion === "protestant" && this.game.state.brandenburg_electoral_bonus == 0 && this.game.state.events.schmalkaldic_league == 1) {
              this.game.spaces['brandenburg'].units['protestant'].push();
              this.addRegular("protestant", "brandenburg", 1);
              this.game.state.brandenburg_electoral_bonus = 1;
            }
          }



	  this.displaySpace(space);
	  this.displayVictoryTrack();


          //
          // military victory
          //
	  let keys = this.returnNumberOfKeysControlledByFaction(faction);
	  if (faction === "hapsburg" && keys >= this.game.state.autowin_hapsburg_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "ottoman" && keys >= this.game.state.autowin_ottoman_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "france" && keys >= this.game.state.autowin_france_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "england" && keys >= this.game.state.autowin_england_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "papacy" && keys >= this.game.state.autowin_papacy_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }

	  return 1;

	}




	if (mv[0] === "convert") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let religion = mv[2];

	  if (religion == "protestant") {
	    this.updateLog(this.returnSpaceName(space) + " converts Protestant");
	    this.updateStatus(this.returnSpaceName(space) + " converts Protestant");
	  } else {
	    this.updateLog(this.returnSpaceName(space) + " converts Catholic");
	    this.updateStatus(this.returnSpaceName(space) + " converts Catholic");
	  }

	  if (space === "augsburg" && religion === "protestant" && this.game.state.augsburg_electoral_bonus == 0 && (this.game.state.events.schmalkaldic_league == 0 || this.isSpaceControlled(space, "protestant"))) {
    	    this.addRegular("protestant", "augsburg", 2);
	    this.game.state.augsburg_electoral_bonus = 1;
	  }
	  if (space === "mainz" && religion === "protestant" && this.game.state.mainz_electoral_bonus == 0 && (this.game.state.events.schmalkaldic_league == 0 || this.isSpaceControlled(space, "protestant"))) {
    	    this.addRegular("protestant", "mainz", 1);
	    this.game.state.mainz_electoral_bonus = 1;
	  }
	  if (space === "trier" && religion === "protestant" && this.game.state.trier_electoral_bonus == 0 && (this.game.state.events.schmalkaldic_league == 0 || this.isSpaceControlled(space, "protestant"))) {
    	    this.addRegular("protestant", "trier", 1);
	    this.game.state.trier_electoral_bonus = 1;
	  }
	  if (space === "cologne" && religion === "protestant" && this.game.state.cologne_electoral_bonus == 0 && (this.game.state.events.schmalkaldic_league == 0 || this.isSpaceControlled(space, "protestant"))) {
    	    this.addRegular("protestant", "cologne", 1);
	    this.game.state.cologne_electoral_bonus = 1;
	  }
	  if (space === "wittenberg" && religion === "protestant" && this.game.state.wittenberg_electoral_bonus == 0 && (this.game.state.events.schmalkaldic_league == 0 || this.isSpaceControlled(space, "protestant"))) {
    	    this.addRegular("protestant", "wittenberg", 2);
	    this.game.state.wittenberg_electoral_bonus = 1;
	  }
	  if (space === "brandenburg" && religion === "protestant" && this.game.state.brandenburg_electoral_bonus == 0 && (this.game.state.events.schmalkaldic_league == 0 || this.isSpaceControlled(space, "protestant"))) {
    	    this.addRegular("protestant", "brandenburg", 1);
	    this.game.state.brandenburg_electoral_bonus = 1;
	  }

	  this.game.spaces[space].religion = religion;
	  this.displaySpace(space);
	  this.displayElectorateDisplay();
	  this.displayVictoryTrack();

	  //
	  // check for victory condition
	  //
          if (this.returnNumberOfProtestantSpacesInLanguageZone() >= 50) {
	    let player = this.returnPlayerOfFaction("protestant");
	    this.sendGameOverTransaction([this.game.players[player-1]], "Religious Victory");
	    return 0;
	  }

	  return 1;

	}

	if (mv[0] === "add_home_card") {

	  let player = parseInt(mv[1]);
 	  let faction = mv[2];
 	  let hc = this.returnDeck();

	  for (let key in hc) {
	    if (hc[key].faction === faction) {
	      if (!this.game.state.cards_left[faction]) { this.game.state.cards_left[faction] = 0; }
	      this.game.state.cards_left[faction]++;
	      if (this.game.player === player) {
                let fhand_idx = this.returnFactionHandIdx(player, faction);
                if (!this.game.deck[0].fhand) { this.game.deck[0].fhand = []; }
                while (this.game.deck[0].fhand.length <= fhand_idx) { this.game.deck[0].fhand.push([]); }
	        this.game.deck[0].fhand[fhand_idx].push(key);
	      }
	    }
	  }

	  this.displayCardsLeft();
	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "play_diplomacy_card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayDiplomacyCard(faction);
	  } else {
	    if (faction == "papacy") {
  	      this.updateStatusAndListCards("Papacy playing their Diplomacy Card", this.game.deck[1].hand, () => {});
	    } else {
  	      this.updateStatusAndListCards("Protestants playing their Diplomacy Card", this.game.deck[1].hand, () => {});
	    }
	  }

	  return 0;

	}


	if (mv[0] === "faction_assigns_hits_first_field_battle") {

	  this.game.queue.splice(qe, 1);
	  let which_player = "";

	  if (mv[1] === "defender") {
	    this.game.state.field_battle.defender_hits_first = 1;
	    which_player = "defender";
	  }

	  if (mv[1] === "attacker") {

	    let reversed = false;
	    which_player = "defender";
	    this.game.state.field_battle.attacker_hits_first = 1;

	    for (let z = this.game.queue.length-1; reversed == false && z >= 1; z--) {

	      let mt = this.game.queue[z].split("\t");
	      let mb = this.game.queue[z-1].split("\t");

	      if (mt === "field_battle_assign_hits" && mb === "field_battle_assign_hits") {
		let x = this.game.queue[z];
		let y = this.game.queue[z-1];
		this.game.queue[z] = y;
		this.game.queue[z-1] = x;
	      }

	      reversed = true;
	    }
	  }

	  return 1;
	}
	if (mv[0] === "faction_assigns_hits_first_naval_battle") {

	  this.game.queue.splice(qe, 1);

	  let which_player = "";
	  if (mv[1] === "defender") {
	    this.game.state.naval_battle.defender_hits_first = 1;
	    which_player == "defender";
	  }

	  if (mv[1] === "attacker") {

	    let reversed = false;
	    this.game.state.naval_battle.attacker_hits_first = 1;
	    which_player == "defender";

	    for (let z = this.game.queue.length-1; reversed == false && z >= 1; z--) {

	      let mt = this.game.queue[z].split("\t");
	      let mb = this.game.queue[z-1].split("\t");

	      if (mt === "naval_battle_assign_hits" && mb === "naval_battle_assign_hits") {
		let x = this.game.queue[z];
		let y = this.game.queue[z-1];
		this.game.queue[z] = y;
		this.game.queue[z-1] = x;
	      }

	      reversed = true;
	    }
	  }

	  return 1;
	}


	// swiss mercenaries and landsnechts
	if (mv[0] === "add_units_before_field_battle") {

	  let his_self = this;
	  let faction = mv[1];
	  let unittype = mv[2];
	  let num = parseInt(mv[3]);

	  if (his_self.game.player === his_self.returnPlayerCommandingFaction(faction)) {
            his_self.playerPlaceUnitsInSpaceWithFilter(unittype, num, faction,
              function(space) {
                if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
                if (!his_self.isSpaceFriendly(space.key, faction)) { return 0; }
                if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
                return 0;
              },
              function(spacekey) {
		if (his_self.game.state.field_battle.spacekey == spacekey) {
		  his_self.addMove("add_field_battle_bonus_rolls\t"+faction+"\t"+1+"\t"+unittype);
		}
	      } ,
              null ,
              true
            );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " placing units...");
	  }

	  this.game.queue.splice(qe, 1);

	  return 0;

	}

	if (mv[0] === "add_field_battle_bonus_rolls") {

	  let his_self = this;
	  let faction = mv[1];
	  let bonus = parseInt(mv[2]);
	  let comment = "bonus";
 	  if (mv[3]) { comment = mv[3]; }

	  let is_attacker = true;
	  if (his_self.game.state.field_battle.faction_map[faction] === his_self.game.state.field_battle.defender_faction) { is_attacker = false; }

          //
          // add five bonus rolls
          //
	  if (is_attacker) {
            for (let i = 0; i < bonus; i++) {
              let x = his_self.rollDice(6);
              if (x >= 5) { his_self.game.state.field_battle.attacker_hits++; }
              if (his_self.game.state.field_battle.tercios == 1) { if (x >= 4 && x < 5) { his_self.game.state.field_battle.attacker_hits++; } }
              his_self.game.state.field_battle.attacker_results.push(x);
              his_self.game.state.field_battle.attacker_modified_rolls.push(x);
              his_self.game.state.field_battle.attacker_units.push(comment);
              his_self.game.state.field_battle.attacker_units_faction.push(faction);
            }
          } else {
            for (let i = 0; i < bonus; i++) {
              let x = his_self.rollDice(6);
              if (x >= 5) { his_self.game.state.field_battle.defender_hits++; }
              if (his_self.game.state.field_battle.tercios == 1) { if (x >= 4 && x < 5) { his_self.game.state.field_battle.defender_hits++; } }
              his_self.game.state.field_battle.defender_results.push(x);
              his_self.game.state.field_battle.defender_modified_rolls.push(x);
              his_self.game.state.field_battle.defender_units.push(comment);
              his_self.game.state.field_battle.defender_units_faction.push(faction);
            }
	  }

          his_self.field_battle_overlay.render(his_self.game.state.field_battle, 1);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] === "add_assault_bonus_rolls") {

	  let his_self = this;
	  let faction = mv[1];
	  let bonus = parseInt(mv[2]);
	  let comment = "bonus";
 	  if (mv[3]) { comment = mv[3]; }

	  let is_attacker = true;
	  if (his_self.game.state.assault.faction_map[faction] === his_self.game.state.assault.defender_faction) { is_attacker = false; }


          //
          // add five bonus rolls
          //
	  if (is_attacker) {
            for (let i = 0; i < bonus; i++) {
              let x = his_self.rollDice(6);
              if (x >= 5) { his_self.game.state.assault.attacker_hits++; }
              if (his_self.game.state.assault.siege_artillery == 1) { if (x >= 3 && x < 5) { his_self.game.state.assault.attacker_hits++; } }
              his_self.game.state.assault.attacker_modified_rolls.push(x);
              his_self.game.state.assault.attacker_units_units.push(comment);
              his_self.game.state.assault.attacker_units_faction.push(faction);
            }
          } else {
            for (let i = 0; i < bonus; i++) {
              let x = his_self.rollDice(6);
              if (x >= 5) { his_self.game.state.assault.defender_hits++; }
              if (his_self.game.state.assault.siege_artillery == 1) { if (x >= 3 && x < 5) { his_self.game.state.assault.attacker_hits++; } }
              his_self.game.state.assault.defender_modified_rolls.push(x);
              his_self.game.state.assault.defender_units_units.push(comment);
              his_self.game.state.assault.defender_units_faction.push(faction);
            }
	  }

          his_self.assault_overlay.render(his_self.game.state.assault);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "add_naval_battle_bonus_rolls") {

	  let his_self = this;
	  let faction = mv[1];
	  let bonus = parseInt(mv[2]);
	  let comment = "bonus";
 	  if (mv[3]) { comment = mv[3]; }

	  let is_attacker = true;
	  if (his_self.game.state.naval_battle.defender_faction === faction) { is_attacker = false; }


          //
          // add five bonus rolls
          //
	  if (is_attacker) {
            for (let i = 0; i < bonus; i++) {
              let x = his_self.rollDice(6);
              if (x >= 5) { his_self.game.state.naval_battle.attacker_hits++; }
              his_self.game.state.naval_battle.attacker_modified_rolls.push(x);
              his_self.game.state.naval_battle.attacker_units.push(comment);
              his_self.game.state.naval_battle.attacker_units_faction.push(faction);
            }
          } else {
            for (let i = 0; i < bonus; i++) {
              let x = his_self.rollDice(6);
              if (x >= 5) { his_self.game.state.naval_battle.defender_hits++; }
              his_self.game.state.naval_battle.defender_modified_rolls.push(x);
              his_self.game.state.naval_battle.defender_units.push(comment);
              his_self.game.state.naval_battle.defender_units_faction.push(faction);
            }
	  }

          his_self.naval_battle_overlay.render(his_self.game.state.naval_battle);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}



	if (mv[0] === "hand_to_fhand") {

	  this.game.queue.splice(qe, 1);

	  let deckidx = parseInt(mv[1])-1;
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let show_overlay = false;
	  if (mv[4]) { show_overlay = true; }
	  let fhand_idx = this.returnFactionHandIdx(player, faction);
	  let cards = [];

	  if (this.game.player == player) {
	    if (!this.game.deck[deckidx].fhand) { this.game.deck[deckidx].fhand = []; }
	    while (this.game.deck[deckidx].fhand.length < (fhand_idx+1)) { this.game.deck[deckidx].fhand.push([]); }

	    for (let i = 0; i < this.game.deck[deckidx].hand.length; i++) {
	      this.game.deck[deckidx].fhand[fhand_idx].push(this.game.deck[deckidx].hand[i]);
	      cards.push(this.game.deck[deckidx].hand[i]);
	    }

	    // and clear the hand we have dealt
	    this.game.deck[deckidx].hand = [];

	    if (show_overlay) {
	      this.deck_overlay.render('hand', cards);
	    }

	  }

	  return 1;

	}

	if (mv[0] === "remove_translation_bonus") {
	  this.game.queue.splice(qe, 1);
	  this.game.state.tmp_protestant_translation_bonus = 0;
	  this.game.state.english_bible_translation_bonus = 0;
	  this.game.state.french_bible_translation_bonus = 0;
	  this.game.state.german_bible_translation_bonus = 0;
	  this.game.state.tmp_protestant_translation_bonus = 0;
	  return 1;
	}

	if (mv[0] === "reformation") {

	  //
	  // hide triangular help if game start
	  //
	  if (this.game.player == this.returnPlayerCommandingFaction("protestant")) {
	    this.game_help.hide();
	  }

	  this.game.queue.splice(qe, 1);


	  let space = mv[1];
	  let target_language_zone = mv[2] || "german";
	  this.game.state.tmp_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let p_roll_desc = [];
	  let c_roll_desc = [];

	  let protestants_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // neighbours
	  //
	  for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {

	    if (!this.game.spaces[space].pass.includes(this.game.spaces[space].neighbours[i]) && !this.game.spaces[this.game.spaces[space].neighbours[i]].unrest) {
	      if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
	        c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
	        c_neighbours++;
	      }
	      if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
	        p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
	        p_neighbours++;
	      }
	      if (this.hasProtestantLandUnits(this.game.spaces[space].neighbours[i])) {
	        p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
	        p_rolls++;
	      }
	      if (this.hasCatholicLandUnits(this.game.spaces[space].neighbours[i])) {
	        c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
	        c_rolls++;
	      }
	      if (this.hasProtestantReformer(this.game.spaces[space].neighbours[i])) {
	        p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "reformer"});
	        p_rolls++;
	      }
	      if (this.game.spaces[this.game.spaces[space].neighbours[i]].university) {
	        c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "jesuit university"});
	        c_rolls++;
	      }
	    }
	  }

	  //
	  // ourselves
	  //
	  if (this.hasProtestantLandUnits(space)) {
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    p_rolls++;
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    p_rolls++;
	  }
	  if (this.hasCatholicLandUnits(space)) {
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    c_rolls++;
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    c_rolls++;
	  }
	  if (this.hasProtestantReformer(space)) {
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
	    p_rolls++;
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
	    p_rolls++;
	  }
	  if (this.game.spaces[space].university) {
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
	    c_rolls++;
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
	    c_rolls++;
	  }

	  //
	  // language zone
	  //
	  if (this.game.spaces[space].language !== target_language_zone && target_language_zone != "all") {
	    ties_resolve = "catholic";
 	  }

	  //
	  // everyone gets a minimum of one roll
	  //
	  if (p_rolls == 0 && p_neighbours == 0) {
	    p_roll_desc.push({ name : "basic roll" , desc : "no adjacency or influence"});
	    p_rolls++;
	  }
	  if (c_rolls == 0 && c_neighbours == 0) {
	    c_roll_desc.push({ name : "basic roll" , desc : "no adjacency or influence"});
	    c_rolls++;
	  }

	  //
	  // temporary bonuses
	  //
	  if (this.game.state.printing_press_active) {
	    p_rolls++;
	    p_roll_desc.push({ name : "Bonus" , desc : "printing press"});
	  }
	  if (this.game.state.tmp_protestant_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_protestant_reformation_bonus_spaces.includes(space)) {
	      p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
	      this.game.state.tmp_protestant_reformation_bonus--;
	      if (this.game.state.tmp_protestant_reformation_bonus < 0) { this.game.state.tmp_protestant_reformation_bonus = 0; }
	    }
	  }
	  if (this.game.state.tmp_catholic_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_catholic_reformation_bonus_spaces.includes(space)) {
	      c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
	      this.game.state.tmp_catholic_reformation_bonus--;
	      if (this.game.state.tmp_catholic_reformation_bonus < 0) { this.game.state.tmp_catholic_reformation_bonus = 0; }
	    }
	  }

	  for (let i = 0; i < this.game.state.tmp_protestant_reformation_bonus; i++) {
	    p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
	  }
	  for (let i = 0; i < this.game.state.tmp_catholic_reformation_bonus; i++) {
	    c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
	  }
	  p_bonus += this.game.state.tmp_protestant_reformation_bonus;
	  c_bonus += this.game.state.tmp_catholic_reformation_bonus;


	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

          //
          // everyone rolls at least 1 dice
          //
          if (c_rolls == 0) {
	    c_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    c_rolls = 1;
	  }
          if (p_rolls == 0) {
	    p_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    p_rolls = 1;
	  }

	  let pdice = [];
	  let cdice = [];

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    if (this.game.state.events.calvins_institutes == 1 && this.game.spaces[space].language === "french") {
	      if (i == 0) { this.updateLog("Calvin's Institutes modifies Protestant rolls by +1"); }
	      x++;
	    }
	    if (this.game.state.english_bible_translation_bonus == 1 || this.game.state.french_bible_translation_bonus == 1 || this.game.state.german_bible_translation_bonus == 1) { x++; }
	    if (x > p_high) { p_high = x; }
	    pdice.push(x);
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    if (x > c_high) { c_high = x; }
	    cdice.push(x);
	  }

	  //
	  // do protestants win?
	  //
	  if (p_high > c_high) { protestants_win = 1; }
	  if (p_high == c_high && ties_resolve === "protestant") { protestants_win = 1; }

	  //
	  //
	  //
	  let obj = {};
	  obj.key = mv[1];
          obj.name = this.spaces[space].name;
	  obj.pdice = pdice;
	  obj.cdice = cdice;
	  obj.p_roll_desc = p_roll_desc;
	  obj.c_roll_desc = c_roll_desc;
	  obj.p_high = p_high;
	  obj.c_high = c_high;
	  obj.reformation = true;
	  obj.counter_reformation = false;
          obj.protestants_win = protestants_win;
	  this.reformation_overlay.render(obj);

	  //
	  // handle victory
	  //
	  if (protestants_win == 1) {
	    this.game.queue.push("convert\t"+space+"\tprotestant");
	  } else {
	    if (parseInt(this.game.state.events.carlstadt_debater) == 1) {
	      // unrest
	      this.game.queue.push("unrest\t"+space);
	    }
	    this.updateLog(this.returnSpaceName(space) + " remains Catholic");
	  }

	  return 1;

	}


	if (mv[0] === "counter_reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let target_language_zone = mv[2] || "german";
	  this.game.state.tmp_counter_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let p_roll_desc = [];
	  let c_roll_desc = [];

	  let catholics_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // language zone
	  //
	  //if (this.game.spaces[space].language === target_language_zone) {
	  //
	  // catholics win ties if Paul III or Julius III are Pope
	  //
	  if (this.game.state.leaders.paul_iii == 1 || this.game.state.leaders.julius_iii == 1) {
	    ties_resolve = "catholic";
	  }
 	  //}

          //
          // neighbours
          //
          for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {
	    if (!this.game.spaces[space].pass.includes(this.game.spaces[space].neighbours[i]) && !this.game.spaces[this.game.spaces[space].neighbours[i]].unrest) {
            if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
              c_neighbours++;
            }
            if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
              p_neighbours++;
            }
            if (this.hasProtestantLandUnits(this.game.spaces[space].neighbours[i])) {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
              p_rolls++;
            }
            if (this.hasCatholicLandUnits(this.game.spaces[space].neighbours[i])) {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
              c_rolls++;
            }
            if (this.hasProtestantReformer(this.game.spaces[space].neighbours[i])) {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "reformer"});
              p_rolls++;
            }
            if (this.game.spaces[this.game.spaces[space].neighbours[i]].university) {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "jesuit university"});
              c_rolls++;
            }
            }
          }

          //
          // ourselves
          //
          if (this.hasProtestantLandUnits(space)) {
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            p_rolls++;
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            p_rolls++;
          }
          if (this.hasCatholicLandUnits(space)) {
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            c_rolls++;
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            c_rolls++;
          }
          if (this.hasProtestantReformer(space)) {
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
            p_rolls++;
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
            p_rolls++;
          }
          if (this.game.spaces[space].university) {
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
            c_rolls++;
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
            c_rolls++;
          }

	  //
	  // temporary bonuses
	  //
	  if (this.game.state.tmp_protestant_counter_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_protestant_counter_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_protestant_counter_reformation_bonus--;
	      if (this.game.state.tmp_protestant_counter_reformation_bonus < 0) { this.game.state.tmp_protestant_counter_reformation_bonus = 0; }
	    }
	  }
	  if (this.game.state.tmp_catholic_counter_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_catholic_counter_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_catholic_counter_reformation_bonus--;
	      if (this.game.state.tmp_catholic_counter_reformation_bonus < 0) { this.game.state.tmp_catholic_counter_reformation_bonus = 0; }
	    }
	  }

          for (let i = 0; i < this.game.state.tmp_protestant_counter_reformation_bonus; i++) {
            p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
          }
          for (let i = 0; i < this.game.state.tmp_catholic_counter_reformation_bonus; i++) {
            c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
          }
          p_bonus += this.game.state.tmp_protestant_counter_reformation_bonus;
          c_bonus += this.game.state.tmp_catholic_counter_reformation_bonus;

	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

	  //
	  // everyone rolls at least 1 dice
	  //
          if (c_rolls == 0) {
	    c_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    c_rolls = 1;
	  }
          if (p_rolls == 0) {
	    p_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    p_rolls = 1;
	  }

	  let pdice = [];
	  let cdice = [];

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    pdice.push(x);
	    if (x > p_high) { p_high = x; }
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    if (his_self.game.state.events.augsburg_confession == 1) { x--; }
	    cdice.push(x);
	    if (x > c_high) { c_high = x; }
	  }

	  //
	  // do catholics win?
	  //
	  if (p_high < c_high) { catholics_win = 1; }
	  if (p_high == c_high && ties_resolve === "catholics") { catholics_win = 1; }

          //
          // render results
          //
          let obj = {};
          obj.key = mv[1];
          obj.name = this.spaces[space].name;
          obj.pdice = pdice;
          obj.cdice = cdice;
          obj.pdice = pdice;
          obj.cdice = cdice;
          obj.p_roll_desc = p_roll_desc;
          obj.c_roll_desc = c_roll_desc;
          obj.p_high = p_high;
          obj.c_high = c_high;
	  obj.reformation = false;
	  obj.counter_reformation = true;
          obj.catholics_win = catholics_win;
	  obj.protestants_win = 1;
	  if (catholics_win) { obj.protestants_win = 0; }
          this.reformation_overlay.render(obj);

	  //
	  // handle victory
	  //
	  if (catholics_win == 1) {
	    this.game.queue.push("convert\t"+space+"\tcatholic");
	  } else {
	    this.updateLog(this.returnSpaceName(space) + " remains Protestant");
	  }

	  return 1;

	}


	//
	// objects and cards can add commands
	//
        for (let i in z) {
	  //
	  // an action may have removed a card / event
	  //
	  if (z[i]) {
            if (!z[i].handleGameLoop(this, qe, mv)) { return 0; }
	  }
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



