

  //
  // Core Game Logic
  //
  async handleGameLoop() {

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
	// entry point for every round in the game
	//
        if (mv[0] === "round") {

	  this.game.state.round++;

this.updateLog(`###############`);
this.updateLog(`### Round ${this.game.state.round} ###`);
this.updateLog(`###############`);

	  this.game.state.cards_left = {};

	  this.onNewRound();
	  this.restoreReformers();
	  this.restoreMilitaryLeaders();
	  this.unexcommunicateReformers();

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    this.resetPlayerRound((i+1));
          }

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("ACKNOWLEDGE\tThe Advent of Winter");
	  //this.game.queue.push("counter_or_acknowledge\tThe Advent of Winter\twinter_phase");
	  //this.game.queue.push("show_overlay\twinter");
	  //this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  this.game.queue.push("action_phase");
	  this.game.queue.push("spring_deployment_phase");
	  this.game.queue.push("counter_or_acknowledge\tSpring Deployment is about to Start\tpre_spring_deployment");
	  this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  this.game.queue.push("diplomacy_phase");




	  //
	  // start the game with the Protestant Reformation
	  //
	  if (this.game.state.round == 1) {

if (this.game.state.scenario == "is_testing") {
  this.game.queue.push("is_testing");
} else {
  this.game.queue.push("hide_overlay\tdiet_of_worms");
  this.game.queue.push("diet_of_worms");
  this.game.queue.push("show_overlay\tdiet_of_worms");
}

	    //
	    // cards dealt before diet of worms
	    //
	    this.game.queue.push("card_draw_phase");
if (this.game.state.scenario != "is_testing") {
	    this.game.queue.push("event\tprotestant\t008");
	    this.game.queue.push("game_help_start");
}

	  } else {

	    this.game.queue.push("card_draw_phase");

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
	      this.addDebater("protestant", "farel-debater");
	      this.addDebater("protestant", "cop-debater");
	      this.addDebater("protestant", "olivetan-debater");
	      this.addDebater("protestant", "calvin-debater");
	      this.addReformer("protestant", "geneva", "calvin-reformer");
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
	    // round 7
	    //
	    if (this.game.state.round == 7) {
	      this.addDebater("papacy", "gardiner-debater");
	    }

	  }

	  //
	  // show all - will only trigger for relevant faction
	  //
	  if (this.game.state.round == 1) {
	    this.game.queue.push("show_overlay\twelcome\tprotestant");
	    this.game.queue.push("show_overlay\twelcome\tpapacy");
	    this.game.queue.push("show_overlay\twelcome\tengland");
	    this.game.queue.push("show_overlay\twelcome\tfrance");
	    this.game.queue.push("show_overlay\twelcome\thapsburg");
	    this.game.queue.push("show_overlay\twelcome\tottoman");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  }

          return 1;
        }

        if (mv[0] == "init") {
          this.game.queue.splice(qe, 1);
	  return 1;
        }

	if (mv[0] === "halt") {
	  return 0;
	}

	if (mv[0] === "show_overlay") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  this.displayElectorateDisplay();
	  if (mv[1] === "welcome") { 
	    let faction = mv[2];
	    let player = this.returnPlayerOfFaction(faction);
	    if (this.game.player === player) { 
	      this.welcome_overlay.render(faction); 
	      this.game.queue.push("hide_overlay\twelcome");
	      if (faction == "protestant") { this.game.queue.push("counter_or_acknowledge\tYou are the Protestants"); }
	      if (faction == "papacy") { this.game.queue.push("counter_or_acknowledge\tYou are the Papacy"); }
	      if (faction == "hapsburg") { this.game.queue.push("counter_or_acknowledge\tYou are the Hapsburgs"); }
	      if (faction == "ottoman") { this.game.queue.push("counter_or_acknowledge\tYou are the Ottomans"); }
	      if (faction == "france") { this.game.queue.push("counter_or_acknowledge\tYou are the French"); }
	      if (faction == "england") { this.game.queue.push("counter_or_acknowledge\tYou are the English"); }
	    }
	  }
	  if (mv[1] === "theses") { this.theses_overlay.render(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.render(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.render(); }
	  if (mv[1] === "winter") { this.winter_overlay.render(); }
	  if (mv[1] === "faction") { this.faction_overlay.render(mv[2]); }
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
          this.game.queue.splice(qe, 1);
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
	  if (mv[1] === "theological_debate") { this.debate_overlay.pushHudUnderOverlay(); this.debate_overlay.hide(); }
	  if (mv[1] === "field_battle") { this.field_battle_overlay.hide(); }
	  if (mv[1] === "siege") { this.assault_overlay.hide(); }
	  if (mv[1] === "assault") { this.assault_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "cards_left") {

          let faction = mv[1];
          let cards_left = parseInt(mv[2]);
	  this.game.state.cards_left[faction] = cards_left;

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

	  this.activateMinorPower(faction, power);
	  this.displayBoard();

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "game_help_start") {

	  this.game.queue.splice(qe, 1);

  this.game_help.render(TutorialTemplate, {
    help : `First Time Playing?` ,
    content : `
	Here I Stand opens with the publication of Luther's 95 Theses in 1517, which marked the start of the Reformation. 
	The Protestant player then makes a series of reformation attempts which spread out from Wittenberg, each attempt 
	made in a space adjacent to an existing Protestant space or Protestant reformer.
	<p></p>
	The Protestants get VP for converting spaces. They should also aim to convert the six major German Electorates 
	on the board (Wittenberg, Brandenburg, Mainz, Trier, Augsburg, Cologne). Capturing these spaces will add Protestant 
	regulars to the map, which will in turn assist with reforming neighbouring spaces.
	<p></p>
	The 95 Theses is followed by the Diet of Worms, an assembly convened in 1521 by the Holy Roman Emperor 
	in the Imperial Free City of Worms. Martin Luther was summoned to the Diet where he refused to recant and was 
	declared a heretic. This assembly is emulated by having all players pick a card representing their level of 
	commitment to the assembly, then rolling dice to see the outcome on German public opinion.
    `,
    img : "/his/img/backgrounds/tutorials/95theses.jpg",
    line1 : "first",
    line2 : "time here?",
    fontsize : "2.1rem" ,
  });

// HACK

	  return 1;

	}
	if (mv[0] === "deactivate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  this.deactivateMinorPower(faction, power);
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

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "winter_attrition") {

	  let faction = mv[1];
	  let spacekey = mv[2];

	  this.game.spaces[spacekey].units[faction] = [];

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
		// && clause permits Hapsburgs in Tunis for instance
		if (!this.isSpaceFortified(space) || ((key != "protestant" && !this.isSpaceElectorate(space.key) && this.game.state.events.schmalkaldic_league != 1) && this.returnPlayerOfFaction(key) > 0 && !this.isSpaceControlled(i, key))) {
		  let res = this.returnNearestFriendlyFortifiedSpaces(key, space);

		  //
		  // 2P has to happen automatically
		  //
		  if (this.game.players.length == 2 && (key != "protestant" && key != "papacy")) {
		    if (res.length == 0) {
		      this.game.spaces[i].units[key] = [];
		      this.displaySpace(i);
		    } else {
		      if (res.length > 0) {
	                this.autoResolveWinterRetreat(key, space.key);
		      } else {
		        this.game.spaces[i].units[key] = [];
		        this.displaySpace(i);
		      }
		    }
		  } else {

	    	    let res = this.returnNearestFriendlyFortifiedSpaces(key, i);

		    let no_loc = false;
		    if (!res) { no_loc = true; }		  
		    if (res.length == 0) { no_loc = true; }		  

		    if (no_loc) {
		      // DELETE ALL UNITS INSTEAD OF ATTRITION IN 2P
		      if (this.game.players.length == 2) {
		        this.game.spaces[i].units[key] = [];
			this.displaySpace(i);
		      } else {
		        moves.push("winter_attrition\t"+key+"\t"+space.key);
		      }
		    } else {
		      if (res.length > 1) {
		        moves.push("retreat_to_winter_spaces_player_select\t"+key+"\t"+space.key);
		      } else {
	                this.autoResolveWinterRetreat(key, space.key);
		      }
		    }
		  }

		  //
		  // if the space is besieged undo that, and un-besiege defenders
		  //
		  if (space.besieged > 0) {
		    space.besieged = 0;
		    for (let key in this.game.spaces[i].units) {
		      for (let ii = 0; ii < this.game.spaces[i].units[key].length; ii++) {
			this.game.spaces[i].units[key][ii].besieged = 0;
		      }
		    }
		  }

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
          // fortified spaces - any units in excess of stacking limit returned to capital
          //
          for (let i in this.game.spaces) {
            if (this.isSpaceFortified(this.game.spaces[i])) {

              let space = this.game.spaces[i];
              let f = this.returnFactionControllingSpace(i);

              let num_friendly_units = this.returnFriendlyLandUnitsInSpace(f, space);
              let num_faction_units = this.returnFactionLandUnitsInSpace(f, space);
	      let capitals = this.returnCapitals(f);

              if (num_friendly_units > 4 && !capitals.includes(i)) {
		let units_preserved = 0;
		for (let q in space.units) {
		  for (let ii = 0; ii < space.units[q].length; ii++) {
		    let u = space.units[q][ii];
		    if (u.type === "cavalry" || u.type === "regular" || u.type === "mercenary") {
		      units_preserved++;
		      if (units_preserved > 4) {
		        space.units[q].splice(ii, 1);
		        ii--;
		      }
		    }
		  }
		}
		this.updateLog("OVERSTACKING " + this.returnName(i) + " (removed)");
		this.displaySpace(i);
              }

            }
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

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_ports_player_select") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let navalspace = mv[2];
	  let ports = JSON.parse(mv[3]);
	  let x = this.returnPlayerOfFaction(faction);

	  if (this.game.player === x) {
	    this.playerResolveNavalWinterRetreat(faction, navalspace);
	  } else {
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

	  this.addArmyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}

	if (mv[0] === "add_navy_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  this.addNavyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "colonize") {
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  if (this.game.state.players_info[player-1].colonized[faction] < 1) {
	    this.game.state.players_info[player-1].colonized[faction] = 1;
	  }
    	  this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "explore") {
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  if (this.game.state.players_info[player-1].explored[faction] < 1) {
	    this.game.state.players_info[player-1].explored[faction] = 1;
	  }
	  return 1;
	}

	if (mv[0] === "conquer") {
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  if (this.game.state.players_info[player-1].conquered[faction] < 1) {
	    this.game.state.players_info[player-1].conquered[faction] = 1;
	  }
    	  this.game.queue.splice(qe, 1);
	  return 1;
	}


	if (mv[0] === "is_testing") {

	  // moar debaters
          this.addDebater("protestant", "bullinger-debater");
          this.addDebater("protestant", "oekolampadius-debater");
          this.addDebater("protestant", "zwingli-debater");
          this.addDebater("papacy", "caraffa-debater");
          this.addDebater("papacy", "gardiner-debater");
          this.addDebater("papacy", "loyola-debater");
          this.addDebater("papacy", "pole-debater");
          this.addDebater("papacy", "canisius-debater");
          this.addDebater("papacy", "contarini-debater");
          this.addDebater("papacy", "faber-debater");
    	  this.addDebater("papacy", "bucer-debater");
    	  this.addDebater("protestant", "aleander-debater");
    	  this.addDebater("protestant", "campeggio-debater");  

	  //this.commitDebater("protestant", "bucer-debater", 0);
	  //this.commitDebater("protestant", "carlstadt-debater", 0);
	  //this.commitDebater("protestant", "melanchthon-debater", 0);

          this.addMercenary("papacy", "siena", 4);
          this.addArmyLeader("papacy", "ravenna", "renegade");
          this.addRegular("papacy", "linz", 4);
          this.addRegular("papacy", "ravenna", 2);
          this.addRegular("papacy", "ravenna", 2);
          this.addRegular("papacy", "rome", 2);
          this.addUnrest("graz");

    	  this.activateMinorPower("papacy", "venice");

    	  this.convertSpace("protestant", "nuremberg");
    	  this.convertSpace("protestant", "graz");
    	  this.controlSpace("protestant", "graz");
    	  this.addRegular("protestant", "worms", 3);
    	  this.convertSpace("protestant", "worms", 3);
    	  this.addRegular("protestant", "graz", 3);
    	  this.addRegular("venice", "trieste", 4);
    	  this.addRegular("venice", "agram", 4);

    	  this.addRegular("venice", "venice", 1);
    	  this.addNavalSquadron("venice", "venice", 1);
    	  this.addNavalSquadron("papacy", "rome", 1);

	  this.addRegular("hapsburg", "naples", 4);
	  this.addNavalSquadron("hapsburg", "naples", 2);
	

	  this.controlSpace("france", "ragusa");
	  this.addRegular("france", "ragusa", 1);
	  this.addNavalSquadron("france", "ragusa", 4); 

    	  this.convertSpace("protestant", "mainz");
    	  this.convertSpace("protestant", "worms");
    	  this.convertSpace("protestant", "kassel");
    	  this.convertSpace("protestant", "regensberg");
    	  this.convertSpace("protestant", "munster");



	  this.controlSpace("papacy", "siena");
	  this.addMercenary("papacy", "siena", 1);
	  this.addMercenary("papacy", "siena", 1);
	  this.addMercenary("papacy", "siena", 1);
	  this.addRegular("papacy", "siena", 1);


	  this.setAllies("protestant", "france");
	  this.setAllies("protestant", "ottoman");
	  this.setAllies("papacy", "hapsburg");
	  this.setAllies("papacy", "genoa");
	  this.setAllies("papacy", "venice");

	  this.addRegular("venice", "ravenna", 1);
	  this.addRegular("papacy", "turin", 4);
	  this.setEnemies("papacy", "france");
	  this.setEnemies("papacy", "hapsburg");
	  this.setActivatedPower("protestant", "france");
	  this.addRegular("france","milan", 1);
	  this.controlSpace("france", "trent");
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addArmyLeader("france", "trent", "montmorency");

	  this.addNavyLeader("papacy", "rome", "dragut");

	  this.addRegular("france","graz", 1);

    	  this.game.spaces['graz'].type = 'key';
    	  this.game.spaces['graz'].occupier = 'protestant';

	  this.setEnemies("papacy","hapsburg");
	  this.setActivatedPower("protestant", "hapsburg");

    	  this.controlSpace("france", "genoa");
    	  this.addRegular("france", "genoa", 3);
    	  this.addNavalSquadron("france", "genoa", 4);


	  this.addCard("papacy", "109");

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}


        
        if (mv[0] === "reshuffle_diplomacy_deck") {
          
          this.game.queue.splice(qe, 1);
          
          //
          // DECKRESTORE copies backed-up back into deck
          //
          this.game.queue.push("SHUFFLE\t2");
          this.game.queue.push("DECKRESTORE\t");
          
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
console.log("DIPLO DECK RESHUFFLE: " + JSON.stringify(reshuffle_cards));

          this.game.queue.push("DECK\t2\t"+JSON.stringify(reshuffle_cards));

          // backup any existing DECK #2
          this.game.queue.push("DECKBACKUP\t2");

        }



        if (mv[0] === "diplomacy_card_event") {

	  let faction = mv[1];
	  let card = mv[2];

          this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card));

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

        if (mv[0] === "lock") {

	  let faction = mv[1];
	  let source = mv[2];

	  this.game.queue.splice(qe, 1);

	  for (let i = 0; i < this.game.spaces[source].units[faction].length; i++) {
	    this.game.spaces[source].units[faction][i].locked = true;
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


	  if (this.game.player == this.returnPlayerCommandingFaction(faction) && this.game.player == this.game.state.active_player) {
	    this.game.state.attacker_comes_from_this_spacekey = mv[3];
	  }


	  // winter retreat into port
	  if (movetype === "port") {
	    let units = this.game.navalspaces[source].units[faction];
	    this.game.navalspaces[source].units[faction] = [];
	    for (let z = 0; z < units.length; z++) {
	      this.game.spaces[destination].units[faction].push(units[z]);
	    }
	  }


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

console.log("lqe: " + lqe);

              let lmv = this.game.queue[lqe].split("\t");
              if (lmv[0] == "naval_interception_check") {

		current_faction = lmv[1];
		current_destination = lmv[2];
		current_source = lmv[3];

console.log("current faction: " + lmv[1]);
console.log("current fdestination: " + lmv[2]);
console.log("current source: " + lmv[3]);
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
                  if (f !== faction && cdest.units[f].length > 0 && !this.areAllies(f, faction)) {
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

	    let lqe = qe-1;
	    if (lqe >= 0) {
console.log("LQE: " + lqe);
console.log("QUEUE: " + JSON.stringify(this.game.queue));
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
	              this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+faction);
	            }
	          }
	        }

		if (anyone_else_here == 0 && (space.type == "electorate" || space.type == "key" || space.type == "fortress")) {
		  let f = this.returnFactionControllingSpace(space.key);
		  if (!this.areAllies(f, faction) && f !== faction) {
	 	    space.besieged = 2;
		    this.displaySpace(space.key);
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

	  if (space.type !== "key" && space.type !== "fortress") {
	    return 1;
	  }

	  //
	  // whoever is being attacked can retreat into the fortification if they
	  // have 4 or less land units
	  //
	  for (f in this.factions) {
	    if (f !== attacker && this.isSpaceControlled(spacekey, f)) {

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
		    // major or independent power - some player decides
		    //
		    let cp = this.returnPlayerOfFaction(f);
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
	  if (this.game.state.field_battle.defender_land_units_remaining <= 0) {
	    //
	    // immediately besiege if a key
	    //
	    if (space.type === "fortress" || space.type === "electorate" || space.type === "key") {
              space.besieged = 2; // 2 = cannot attack this round
              space.besieged_factions.push(faction);
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
	  // otherwise, we have to evaluate fortifying
	  //
	  if (this.game.player == player) {
	    this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	    this.playerEvaluateFortification(attacker, faction, spacekey);
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

        if (mv[0] === "player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
	  let space = this.game.spaces[spacekey];

	  if (this.game.player == player) {
	    this.playerEvaluateFortification(attacker, faction, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
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



	if (mv[0] === "fortify_unit") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let units = JSON.parse(mv[3]);
	  let space = this.game.spaces[spacekey];

          space.besieged = 2; // 2 = cannot attack this round
          space.besieged_factions.push(faction);
	  for (let i = 0; i < space.units[faction].length; i++) {
	    space.units[faction][i].besieged = 1;
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
	  let player = this.returnPlayerCommandingFaction(faction);

	  if (this.game.player === player) {
	    this.playerFortifySpace(faction, attacker, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.updateStatus(this.returnFactionName(faction) + " handling retreat into fortification");
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
		// go into field battle
		//
	      }
	      return 1;
	    }
	  }

          return 0;

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


        if (mv[0] === "retreat_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  this.game.state.attacker_comes_from_this_spacekey = mv[3];
	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighboursAsArrayOfKeys(spacekey, 0); // 0 cannot intercept across passes
	  let attacking_player = this.returnPlayerOfFaction(attacker);

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_faction_retreat = 0;
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction > 0) {
  	      if (io[i] !== attacker) {
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
	      if (ap !== attacker && !io.includes(ap) && io[i] != attacker) {
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
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
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
	      if (ap != attacker) {
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

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender) || this.returnPlayerCommandingFaction(defender) == this.game.player) {
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
	    if (source.units[faction][i].land_or_sea == "sea" || source.units[faction][i].land_or_sea == "both") {
	      destination.units[faction].push(source.units[faction][i]);
	      source.units[faction].splice(i, 0);
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

	  let source = this.game.spaces[from];
	  let destination = this.game.spaces[to];

	  for (let i = 0; i < source.units[faction].length; i++) {
	    source.units[faction][i].locked = true;
	    source.units[faction][i].already_moved = true;
	    destination.units[faction].push(source.units[faction][i]);
	  }

	  source.units[faction] = [];
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

	    let player_of_faction = this.returnPlayerCommandingFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction != 0) {
  	      if (io[i] !== faction) {

		let player_needs_adding = 0;

	        for (let zz = 0; zz < neighbours.length; zz++) {
	          let fluis = this.returnFactionLandUnitsInSpace(io[i], neighbours[zz]);
	          if (fluis > 0) {
		    if (!already_asked.includes(his_self.returnPlayerCommandingFaction(io[i])) && !already_asked.includes(neighbours[zz])) {
	              this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+includes_cavalry+"\t"+io[i]+"\t"+neighbours[zz]);
	  	      already_asked.push(neighbours[zz]);
		      player_needs_adding = 1;
		    }
	          }
	        }
		if (player_needs_adding) {
	  	  already_asked.push(his_self.returnPlayerCommandingFaction(io[i]));
	        }
	      }
	    }

	    for (let zzz = 0; zzz < this.game.state.activated_powers[io[i]].length; zzz++) {
	      let ap = this.game.state.activated_powers[io[i]][zzz];
	      if (ap != faction && !already_asked.includes(ap)) {
	        for (let zz = 0; zz < neighbours.length; zz++) {
	          let fluis = this.returnFactionLandUnitsInSpace(ap, neighbours[zz]);
	          if (fluis > 0) {
		    if (!already_asked.includes(his_self.returnPlayerCommandingFaction(ap)) && !already_asked.includes(neighbours[zz])) {
	              this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"0"+"\t"+ap+"\t"+neighbours[zz]);
	  	      already_asked.push(neighbours[zz]);
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
	      let player_of_faction = this.returnPlayerCommandingFaction(io[i]);
	      if (player_of_faction != attacking_player && player_of_faction != 0) {
  	        if (io[i] !== faction) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
console.log("CHECKING: " + io[i] + " / " + neighbours[zz]);
	            let fluis = this.returnFactionSeaUnitsInSpace(io[i], neighbours[zz]);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+io[i]+"\t"+neighbours[zz]);
	            }
	          }
	        }
	      }

	      for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	        let ap = this.game.state.activated_powers[io[i]][z];
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

console.log("UNITS TO MOVE IDX: " + JSON.stringify(units_to_move_idx));

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
// IS_TESTING
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
	      let m = "move\t"+units_to_move_idx[i].faction+"\tland\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i].idx+"\t1"; // 1 = skip avoid battle
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


        if (mv[0] === "diet_of_worms") {

	  let game_self = this;

	  // first time it happens, lets update menu
	  this.displayCardsLeft();

          game_self.game.queue.push("resolve_diet_of_worms");

	  //
	  // flip hapsburg card from deck if 2-player game
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
	  for (let i = 0; i < this.game.deck[0].fhand[0].length; i++) {
	    if (this.game.deck[0].cards[this.game.deck[0].fhand[0][i]].type === "mandatory") {} else { x.push(this.game.deck[0].fhand[0][i]); }
	  }

          this.updateStatusAndListCards("Pick your Card for the Diet of Worms", x);
          this.attachCardboxEvents(async function(card) {

  	    //
	    // hide triangular help if game start -- papacy and other factions
	    //
	    this.game_help.hide();

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
	  let hapsburg_card = this.game.pool[0].hand[0];

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
	    for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfCatholicSpacesInLanguageZone(); i++) {
	      this.game.queue.push("select_for_protestant_conversion\tprotestant\tgerman");
	    }
  	    this.game.queue.push("STATUS\tProtestants selecting towns to convert...\t"+JSON.stringify(all_players_but_protestant));
  	    this.game.queue.push("show_overlay\ttheses");
  	    this.game.queue.push("ACKNOWLEDGE\tProtestants win Diet of Worms");
  	    //this.game.queue.push("counter_or_acknowledge\tProtestants win Diet of Worms");
  	    //this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  } else {
	    if (protestant_hits < papacy_hits) {
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "papacy" , difference : (papacy_hits - protestant_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("hide_overlay\ttheses");
	      let total_conversion_attempts = papacy_hits - protestant_hits;
	      for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfProtestantSpacesInLanguageZone(); i++) {
	        this.game.queue.push("select_for_catholic_conversion\tpapacy\tgerman");
	      }
  	      this.game.queue.push("STATUS\tPapacy selecting towns to convert...\t"+JSON.stringify(all_players_but_papacy));
  	      this.game.queue.push("show_overlay\ttheses");
  	      this.game.queue.push("ACKNOWLEDGE\tPapacy wins Diet of Worms");
  	      //this.game.queue.push("counter_or_acknowledge\tPapacy wins Diet of Worms");
  	      //this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    } else {
  	      //
              // report results
              //
	      this.updateLog("Diet of Worms ends in tie.");
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "none" , difference : 0 , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("ACKNOWLEDGE\tDiet of Worms ends in a Stalemate");
  	      //this.game.queue.push("counter_or_acknowledge\tDiet of Worms ends in a Stalemate");
  	      //this.game.queue.push("RESETCONFIRMSNEEDED\tall");
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
	// this bit of code is complicated, because it stops and starts game-flow but selecively.
	//
	// exists to be removed by counter_or_acknowledge
	if (mv[0] === "halted") {
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
 	    // and continue to the 
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
	  // i need to....
	  //

	  let msg = mv[1];
	  let stage = mv[2];
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

console.log("about to run into counter acknowledge");

    	  html += '<li class="option" id="ok">acknowledge</li>';

          let z = this.returnEventObjects();
	  for (let i = 0; i < z.length; i++) {
            if (z[i].menuOptionTriggers(this, stage, this.game.player, extra) == 1) {
              let x = z[i].menuOption(this, stage, this.game.player, extra);
              html += x.html;
	      z[i].faction = x.faction; // add faction
	      menu_index.push(i);
	      menu_triggers.push(x.event);
	      attach_menu_events = 1;
	    }
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
	      his_self.game.confirms_needed[his_self.game.player-1] = 1;
              his_self.addMove("RESOLVE\t"+his_self.publicKey);
              his_self.endTurn();
	      his_self.updateStatus("skipping acknowledge...");
	      return 0;
	    }
	  }

	  this.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.show(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.show(action2);
	    }
          });
	  $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
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
	        //his_self.game.confirms_needed[his_self.game.player-1] = 2;
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
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
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
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
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
	  his_self.game.queue.push("counter_or_acknowledge\tNaval Battle commences in "+space.name + "\tpre_naval_battle_hits_assignment");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");

          his_self.naval_battle_overlay.renderPreNavalBattle(his_self.game.state.naval_battle);
          his_self.naval_battle_overlay.pullHudOverOverlay();

console.log("!");
console.log("!");
console.log("!");
console.log("NAVAL BATTLE");
console.log(JSON.stringify(his_self.game.state.naval_battle));

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
	      if (space.units[faction][i].personage == false) {
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
	  // this is run when a field battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a fortress if available. as
	  // such, the rest of this function moves to to handle the on-the-
	  // ground conflict.
	  //
	  let his_self = this;
	  let space = this.game.spaces[mv[1]];
	  let attacker = mv[2];
	  let stage = "field_battle";

console.log("is space besieged: " + space.besieged);

	  //
	  // the first thing we check is whether the land units that control the space have
	  // withdrawn into fortifications, as if that is the case then land battle is avoided
	  //
	  if (space.besieged == 2) {
	    this.updateLog("Field Battle avoided by defenders withdrawing into fortifications");
	    this.game.queue.push("counter_or_acknowledge\tField Battle avoided by defenders retreating into fortification\tsiege");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    // besieged will become 1 and start of next impulse

	    //
	    // and redraw
	    //
	    this.displaySpace(space.key);

	    return 1;
	  }

console.log("otherwise we have to determine who is here...");

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
	  // if the defender has no units in the space and this is a fortified space
	  // we don't want to go into hits assignment because we cannot actually have
	  // a field battle, so we just nope out and put the space immediately under 
	  // siege.
	  //
	  if (defender_units.length <= 1 && (space.type == "electorate" || space.type == "key" || space.type == "fortress")) {
	    space.besieged = 2;
	    this.displaySpace(space.key);
	    this.updateLog(space.name + " put under siege.");
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

console.log("ATTACKER HIGHEST BATTLE RANKING: " + attacker_highest_battle_rating);
console.log("DEFENDER HIGHEST BATTLE RANKING: " + defender_highest_battle_rating);


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

	  //
	  // save battle state
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
	  his_self.game.queue.push("field_battle_assign_hits_render");
	  his_self.game.queue.push("counter_or_acknowledge\tField Battle is about to begin in "+space.name + "\tpre_field_battle_hits_assignment");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");


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

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in his_self.game.state.faction_map) {
	      if (faction_map[f] === faction) {
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
                      if (space.units[selected_faction][ii].type === cannon_fodder) {

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
	  for (let f in this.game.state.field_battle.faction_map) {
	    if (this.game.state.field_battle.faction_map[f] === this.game.state.field_battle.defender_faction) {
	      if (this.isMajorPower(f)) {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
	    }
	  }

	  //
	  // every gets shared hits
	  //
	  while (hits_to_assign > defending_factions_hits.length) {
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
	      unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    }
	    defending_factions_hits[unlucky_faction]++;
	    already_punished.push(unlucky_faction);
	  }


	  //
	  // defending major powers
	  //
	  if (defending_major_powers > 0 && this.game.state.field_battle.faction_map[faction] === this.game.state.field_battle.defender_faction) {
	    for (let i = 0; i < defending_factions_hits.length; i++) {
  	      this.game.queue.push(`field_battle_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
	    }
	    return 1;
	  }

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
	      if (space.units[faction][z].type === "squadron") {
		space.units[faction].splice(z, 1);
		assign_hits-=2;
	      }
	    }
	  }

	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {
	    if (faction === this.game.state.naval_battle.attacker_faction) {
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
	    if (his_self.game.player === this.returnPlayerCommandingFaction(faction)) {
	      if (faction === this.game.state.naval_battle.attacker_faction) {
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
	      if (faction === this.game.state.naval_battle.attacker_faction) {
	        if (this.game.state.naval_battle.defender_hits > 0) {
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " Assigning Hits");
	        } else {
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " unscathed - click to continue");
		}
	      } else {
	        if (this.game.state.naval_battle.attacker_hits > 0) {
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " Assigning Hits");
	        } else {
                  his_self.naval_battle_overlay.updateInstructions(his_self.returnFactionName(faction) + " unscathed - click to continue");
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
	      if (faction_map[f] === faction) {
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

			    //
			    // and remove from field battle unit
			    //
		            if (faction === his_self.game.state.assault_attacker_faction) {
			      for (let z = 0; z < his_self.game.state.assault.attacker_units.length; z++) {
			        let u = his_self.game.state.assault.attacker_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.assault.attacker_units_destroyed.includes(z)) {
			            his_self.game.state.assault.attacker_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }
		            if (faction === his_self.game.state.assault_defender_faction) {
			      for (let z = 0; z < his_self.game.state.assault.defender_units.length; z++) {
			        let u = his_self.game.state.assault.defender_units[z];
			        if (u.type === cannon_fodder) {
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
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

console.log("HOW MANY HITS TO ASSIGN: " + hits_to_assign);

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
	  } // end of assign_hits() <-- auto-assignment function

console.log("WHO IS IN CHARGE OF DEFENDER: " + player);

	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {

	    if (faction === this.game.state.assault.attacker_faction) {
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
	  if (faction === this.game.state.assault.attacker_faction) {
	    if (this.game.state.assault.defender_hits == 0) { return 1; }
	  } else {
	    if (this.game.state.assault.attacker_hits == 0) { return 1; }
	  }

console.log("we have made it this far!");

	  //
	  // if we hit this point we need manual intervention to assign the hits.
	  // the attacker can assign hits however they prefer if others join them
	  // in the attack, but if two major powers share defense then the hits
	  // are divided evenly among them.
	  //
          let hits_to_assign = this.game.state.assault.attacker_hits;
	  if (faction === this.game.state.assault.attacker_faction) {
            hits_to_assign = this.game.state.assault.defender_hits;
	  }

          let defending_factions = [];
          let defending_factions_count = 0;
          let defending_major_powers = 0;
          let defending_factions_hits = [];
	  let major_power = false;
	  for (let f in this.game.state.assault.faction_map) {
	    if (this.game.state.assault.faction_map[f] === faction) {
	      if (this.isMajorPower(f)) {
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
	  // every gets shared hits
	  //
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
	  for (let i = 0; i < hits_to_assign; i++) {
	    let unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    while (already_punished.includes(unlucky_faction)) {
	      unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    }
	    defending_factions_hits[unlucky_faction]++;
	    already_punished.push(unlucky_faction);
	  }

	  //
	  // defending major powers
	  //
//	  for (let i = 0; i < defending_factions_hits.length; i++) {
//  	    this.game.queue.push(`assault_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
//	  }
//	  return 1;

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
          this.assault_overlay.pushHudUnderOverlay();
          this.assault_overlay.render(his_self.game.state.assault);
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
	    if (space.units[faction][i].type === unit_type) {
	      if (this.game.state.assault.faction_map[faction] === this.game.state.assault.attacker_faction) {
		for (let z = 0; z < this.game.state.assault.attacker_units_units.length; z++) {
		  if (this.game.state.assault.attacker_units_units[z].type === space.units[faction][i].type) {
		    if (!this.game.state.assault.attacker_units_destroyed.includes(z)) {
		      this.game.state.assault.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.assault.defender_units_units.length; z++) {
		  if (this.game.state.assault.defender_units_units[z].type === space.units[faction][i].type) {
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
	    if (space.units[faction][i].type === unit_type) {
	      if (this.game.state.field_battle.faction_map[faction] === this.game.state.field_battle.attacker_faction) {
		for (let z = 0; z < this.game.state.field_battle.attacker_units.length; z++) {
		  if (this.game.state.field_battle.attacker_units[z] === space.units[faction][i].type) {
		    if (!this.game.state.field_battle.attacker_units_destroyed.includes(z)) {
		      this.game.state.field_battle.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.field_battle.defender_units.length; z++) {
		  if (this.game.state.field_battle.defender_units[z].type === space.units[faction][i].type) {
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
	    if (space.units[faction][i].type === unit_type) {
	      if (this.game.state.naval_battle.faction_map[faction] === this.game.state.naval_battle.attacker_faction) {
		for (let z = 0; z < this.game.state.naval_battle.attacker_units.length; z++) {
		  if (this.game.state.naval_battle.attacker_units[z] === space.units[faction][i].type) {
		    if (!this.game.state.naval_battle.attacker_units_destroyed.includes(z)) {
		      this.game.state.naval_battle.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.naval_battle.defender_units.length; z++) {
		  if (this.game.state.naval_battle.defender_units[z].type === space.units[faction][i].type) {
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


	if (mv[0] === "field_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[1]];


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
	      if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.attacker_faction) {
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
	      if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.attacker_faction, his_self.game.state.field_battle.defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

//	  this.updateLog("Winner: "+this.returnFactionName(winner));
//	  this.updateLog("Attacker Units Remaining: "+his_self.game.state.field_battle.attacker_land_units_remaining);
//	  this.updateLog("Defender Units Remaining: "+his_self.game.state.field_battle.efender_land_units_remaining);

          //
          // conduct retreats
          //
          if (winner === his_self.game.state.field_battle.defender_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_defenders_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.attacker_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], "");
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
		  if (his_self.game.state.field_battle.attacker_land_units_remaining > 0) {
                    this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                  }
                }
	        if (can_faction_retreat == 0) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	        }
              }
            }
          }
          if (winner === his_self.game.state.field_battle.attacker_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_attackers_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], his_self.game.state.attacker_comes_from_this_spacekey);
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




	    let defender_player = this.returnPlayerCommandingFaction(his_self.game.state.field_battle.defender_faction);
	    let attacker_player = this.returnPlayerCommandingFaction(his_self.game.state.field_battle.attacker_faction);

	    // if the defender is the active player AND controls the space, they can fortify
	    if (defender_player == this.game.state.active_player && this.isSpaceControlled(his_self.game.state.field_battle.spacekey, his_self.game.state.field_battle.defender_faction)) {
              this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.attacker_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.defender_faction)+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	    // otherwise they need to retreat
	    } else {
              for (let f in his_self.game.state.field_battle.faction_map) {
                let can_faction_retreat = 0;
                if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
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

          return 1;

        }


 	if (mv[0] === "destroy_unit_by_type") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

	  if (this.game.spaces[spacekey]) {
	    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
	      if (this.game.spaces[spacekey].units[faction][i].type === unit_type) {
	        this.game.spaces[spacekey].units[faction].splice(i, 1);
		i = this.game.spaces[spacekey].units[faction].length + 10;
		break;
	      }
	    }
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

          this.game.queue.splice(qe, 1);
	  return 1;

        }
 	if (mv[0] === "destroy_unit_by_index") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_idx = parseInt(mv[3]);

console.log("spacekey: " + spacekey);

	  if (this.game.spaces[spacekey]) {
	    this.game.spaces[spacekey].units[faction].splice(unit_idx, 1);
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

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

	  return 1;

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
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign--;
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

	  let faction_map      = his_self.game.state.naval_battle.faction_map;
	  let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
	  let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
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
	  let attacker_sea_units_remaining = 0;
	  let defender_sea_units_remaining = 0;
	  for (let z = 0; z < this.game.navalspaces[space.key].units[attacker_faction].length; z++) {
	    let u = this.game.navalspaces[space.key].units[attacker_faction][z];
   	    if (u.type == "squadron" || u.type == "corsair") {
	      attacker_sea_units_remaining++;
	    }
	  }
	  for (let z = 0; z < this.game.navalspaces[space.key].units[defender_faction].length; z++) {
	    let u = this.game.navalspaces[space.key].units[defender_faction][z];
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

	  this.displaySpace(space.key);
	  this.displayNavalSpace(space.key);

	  this.updateLog("Winner: "+this.returnFactionName(winner));

	  this.updateLog("Attacker Units Remaining: "+attacker_sea_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_sea_units_remaining);

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
	      if (attacker_sea_units_remaining > 0) {
                this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);
	      }
	    } else {
	      if (defender_sea_units_remaining > 0) {
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
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) {
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	        }
	      }
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
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
	    if (faction_map[f] === attacker_faction) {
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
	    if (faction_map[f] === defender_faction) {
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
	  // calculate how many rolls attacker and defener get in this situation
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
	  //this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  //for (let i = 0; i < attacker_results.length; i++) {
	  //  this.updateLog(" ... rolls: " + attacker_results[i]);
          //}
	  //this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  //for (let i = 0; i < defender_results.length; i++) {
	  //  this.updateLog(" ... rolls: " + defender_results[i]);
          //}

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
          his_self.game.queue.push("assault_assign_hits_render");
          his_self.game.queue.push("counter_or_acknowledge\tAssault results in "+space.name + "\tpre_assault_hits_assignment");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          his_self.game.queue.push("assault_show_hits_render");
          his_self.game.queue.push("counter_or_acknowledge\tAssault is about to begin in "+space.name + "\tpre_assault_hits_roll");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");

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

//	  his_self.updateLog("Attacker UnModified: " + JSON.stringify(attacker_results));
//	  his_self.updateLog("Defender UnModified: " + JSON.stringify(defender_results));
//	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.assault.attacker_modified_rolls));
//	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.assault.defender_modified_rolls));
//	  his_self.updateLog("Attacker Units: " + attacker_units);
//	  his_self.updateLog("Defender Units: " + defender_units);
//	  his_self.updateLog("Attacker Hits: " + attacker_hits);
//	  his_self.updateLog("Defender Hits: " + defender_hits);

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
	    space.besieged = false;
	    space.unrest = false;
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
	  // attacker does better than defender
	  //
	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining <= 0) {

	    //
	    // no-one survived, so just end siege
	    //
	    space.besieged = false;
	    space.unrest = false;

	    this.updateLog("Siege in " + this.returnSpaceName(space.key) + " ends");

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

          //
          // conduct retreats
          //
          if (defender_land_units_remaining < attacker_land_units_remaining) {

	    //
	    // no land units remain
	    //
	    if (defender_land_units_remaining <= 0 && attacker_land_units_remaining > 0) {
	      space.besieged = 0;
	      space.unrest = 0;
	      this.controlSpace(attacker_faction, space.key);
	      this.updateLog(this.returnFactionName(attacker_faction) + " wins seige, controls " + this.returnSpaceName(space.key));

	      for (let key in space.units) {
	        for (let i = 0; i < space.units[key].length; i++) {
	          space.units[key][i].besieged = 0;
	        }
	      }
	    }

          } else {

            if (attacker_land_units_remaining == 0) {
	      space.besieged = 0;
	      space.unrest = 0;
	      this.updateLog(this.returnFactionName(defender_faction) + " breaks seige, controls " + this.returnSpaceName(space.key));
	    } else {
              his_self.game.queue.push("break_siege");
              his_self.game.queue.push("hide_overlay\tassault");
	    }
	  }

          //
          // redisplay
          //
	  his_self.refreshBoardUnits();
          his_self.displaySpace(space.key);

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

console.log("in key: " + space.key);
console.log("naval space units: " + JSON.stringify(space.units));

	  this.displaySpace(space.key);
	  this.displayNavalSpace(space.key);

	  return 1;

	}


        if (mv[0] === "player_evaluate_post_naval_battle_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

          let faction_map = his_self.game.state.naval_battle.faction_map;
          let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
          let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];

          if (this.game.player == this.returnPlayerOfFaction(loser)) {
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
	  // auto-skip if loser cannot retreat because they have no land units
	  //
	  let loser_can_retreat = false;
	  for (let i = 0; i < this.game.spaces[spacekey].units[loser].length; i++) {
	    if (["regular", "mercentary", "calvary"].includes(this.game.spaces[spacekey].units[loser][i].type)) { loser_can_retreat = true; }
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
	      this.playerEvaluatePostBattleRetreatOpportunity(loser, winning_faction, attacker_faction, spacekey, this.game.state.attacker_comes_from_this_spacekey);
            } else {
              this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat");
            }
          } else {
	    let winning_faction = attacker_faction;
	    if (this.game.player == this.returnPlayerCommandingFaction(loser)) {
	      this.playerEvaluatePostBattleRetreatOpportunity(loser, winning_faction, attacker_faction, spacekey, this.game.state.attacker_comes_from_this_spacekey);
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

	  return 1;

	}



	if (mv[0] === "pick_second_round_debaters") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let committed = this.game.state.theological_debate.committed;
	  let language_zone = this.game.state.theological_debate.language_zone;
	  this.game.state.theological_debate.round++;
	  let prohibited_protestant_debater = this.game.state.theological_debate.prohibited_protestant_debater;

          this.game.state.theological_debate.attacker_debater = ""; // resetting
          this.game.state.theological_debate.defender_debater = "";

	  let x = 0;

	  //
	  // attacker chosen randomly from uncommitted
	  //
          let ad = 0;
          let cd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker) {
	      if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	        if (this.game.state.debaters[i].committed == 0) {
	          ad++;
	        } else {
	          cd++;
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
	      if (this.game.state.debaters[i].type != prohibited_protestant_debater) {
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

console.log("defender: " + defender);
console.log("lz: " + this.game.state.theological_debate.language_zone);
console.log("prohibited: " + prohibited_protestant_debater);

	  x = this.rollDice(dd) - 1;
	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	      if (this.game.state.debaters[i].type != prohibited_protestant_debater) {
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
	            if (x === dd) {
		      this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		      this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
		      this.game.state.theological_debate.defender_debater_bonus++;
	              this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
		    }
	            dd++;
	          }
	        }
	      }
	    }
	  }

	  //
	  // attacker chosen from uncommitted
	  //
	  let tad = 0;
	  if (ad != 0) {
	    x = this.rollDice(ad) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	        if (this.game.state.debaters[i].type != prohibited_protestant_debater) {
	          if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	            if (x === tad) {
		      this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		      this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	              this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
		    }
	            tad++;
	          }
	        }
	      } else {
	        x = this.rollDice(cd) - 1;
	        for (let i = 0; i < this.game.state.debaters.length; i++) {
	          if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 1) {
	            if (x === tad) {
		      this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		      this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	              this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
		    }
	            tad++;
	          }
	        }
	      }
	    }
	  }

          this.game.state.theological_debate.round2_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round2_defender_debater = this.game.state.theological_debate.defender_debater;


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
		    this.game.state.theological_debate.round2_defender_debater = this.game.state.debaters[i].type;
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
                  this.game.state.theological_debate.round2_dttacker_debater = this.game.state.debaters[i].type;
                }
                j++;
              }
            }
          }


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
console.log("attacker options: " + this.game.state.debaters[i].type);
	            ad++;
	          }
	        }
	      }
	    }

console.log("number of attacker debaters: " + ad);

	    x = this.rollDice(ad) - 1;
	    ad = 0;
console.log("x: " + x);
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
		if (attacker == "papacy" || (attacker == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
console.log("considering: " + this.game.state.debaters[i].type);
	          if (x == ad) {
console.log("MATCH!");
	  	    this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		    this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	            this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
	          }
	          ad++;
	        }
	      }
	    }
	  }

console.log("defender: " + defender);
console.log("lz: " + this.game.state.theological_debate.language_zone);
console.log("prohibited: " + prohibited_protestant_debater);

	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	      if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	        if (this.game.state.theological_debate.committed == "committed") {
	          if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
console.log("adding: " + this.game.state.debaters[i].type);
	            dd++;
	          }
	        } else {
	          if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed != 1) {
console.log("adding 2: " + this.game.state.debaters[i].type);
	            dd++;
	          }
	        }
	      }
	    }
	  }

console.log("dd: " + dd);

	  x = this.rollDice(dd) - 1;

console.log("x: " + x);

console.log("prohibited protestant debater: " + prohibited_protestant_debater);

	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (defender == "papacy" || (defender == "protestant" && this.game.state.theological_debate.language_zone == this.game.state.debaters[i].language_zone)) {
	      if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	        if (this.game.state.theological_debate.committed == "committed") {
	          if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
console.log("considering 1: " + this.game.state.debaters[i].type + " with " + x + "/" + dd);
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
console.log("considering 2: " + this.game.state.debaters[i].type + " with " + x + "/" + dd);
	              if (x === dd) {
console.log("MATCH!");
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
/*****
	  //
	  // NOTE -- this bug may be fixed, but we are leaving the code in for now in order to avoid
	  // potential issues while bugfixing. It can probably be safely removed though. TODO
	  //
	  // if Papal Bull removes the only uncommitted debater, then we can have a situation where
	  // no debater is found for the defense and the game halts. We check against this edge case
	  // by re-checking and picking a random committed debater in this case...
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
******/

console.log("SELECTED DEBATER AT: " + this.game.state.theological_debate.attacker_debater);
console.log("SELECTED DEBATER DE: " + this.game.state.theological_debate.defender_debater);

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
	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerCallTheologicalDebate(this, player, faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " calling theological debater");
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
	  if (attacker === "papacy" && this.game.state.events.augsburg_confession == true) {
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
	      this.game.queue.push("counter_or_acknowledge\tTheological Debate: 2nd Round\tdebate");
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
attacker_hits - defender_hits;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone();
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone);
	      if (defender === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone); }

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
	      if (this.game.state.theological_debate.attacker_faction == "papacy" && this.returnNumberOfProtestantSpacesInLanguageZone() < flip_this_number) {
	        this.updateLog("Protestants only have " + this.returnNumberOfProtestantSpacesInLanguageZone() + " spaces to flip");
	        flip_this_number = this.returnNumberOfProtestantSpacesInLanguageZone();
	      }


	      //
	      // attacker has more hits, is defender burned?
	      //
	      if (unaltered_total_spaces_to_convert > this.game.state.theological_debate.defender_debater_power) {
		if (this.game.state.theological_debate.defender_faction === "protestant") {
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
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone();
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone);
	      if (attacker === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone); }

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

	      if (this.game.state.theological_debate.defender_faction == "papacy" && this.returnNumberOfProtestantSpacesInLanguageZone() < flip_this_number) {
	        this.updateLog("Protestants only have " + this.returnNumberOfProtestantSpacesInLanguageZone() + " spaces to flip");
	        flip_this_number = this.returnNumberOfProtestantSpacesInLanguageZone();
	      }

	      //
	      // defender has more hits, is attacker burned?
	      //
	      if (unaltered_total_spaces_to_convert > this.game.state.theological_debate.attacker_debater_power) {
	        if (this.game.state.theological_debate.attacker_faction === "papacy") {
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
		}
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
		}
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
		}
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

	  return 1;

	}

        if (mv[0] === "victory_determination_phase") {


	  this.game.queue.splice(qe, 1);

	  let f = this.calculateVictoryPoints();

if (this.game.state.round == 1) {
  if (this.game.player === this.returnPlayerCommandingFaction("protestant")) {
  this.game_help.render(TutorialTemplate, {
    help : `End-of-Round Scoring` ,
    content : `
        The Protestants mainly score VP by converting spaces to the protestant religion, and through the control of the 
	six key electorates. See Info > Religion for details on how many VP you get from Protestant spaces, and your faction sheet
	for information on VP from Electorates.
	<p></p>
	There are three ways to win: (1) being the first faction to 25 VP, (2) taking an 8 VP lead in any round 
	after Round 4, or (3) being in the lead at the end of Round 9 if the game has not ended by then. See your 
	faction sheet for more details on how the Protestants can earn additional VP.
    `,
    line1 : "curious",
    line2 : "who's winning?",
    fontsize : "2.1rem",      
    img : `/his/img/backgrounds/new_world.jpg`,
  });
  }
  if (this.game.player === this.returnPlayerCommandingFaction("papacy")) {
  this.game_help.render(TutorialTemplate, {
    help : `End-of-Round Scoring` ,
    content : `
        The Papacy gains VP for keeping spaces faithful to the Catholic religion, and for the direct control of keys on the board.
	See Info > Religion for details on how many VP you get from Protestant spaces, and your faction sheet
	for information on how many VP you get from controlling new keys.
	<p></p>
	There are three ways to win: (1) being the first faction to 25 VP, (2) taking an 8 VP lead in any round 
	after Round 4, or (3) being in the lead at the end of Round 9 if the game has not ended by then.
	<p></p>
	See your faction sheet for more details on how the Papacy can earn additional VP.
    `,
    line1 : "curious",
    line2 : "who's winning?",
    fontsize : "2.1rem",      
    img : `/his/img/backgrounds/new_world.jpg`,
  });
  }
}

/****
//          faction : this.game.state.players_info[i].factions[ii] ,
//          vp : 0 ,
//          keys : 0 ,
//          religious : 0 ,
//          victory : 0,
//          details : "",
****/

	  for (let faction in f) {
	    if (f.victory == 1) {
	      let player = this.returnPlayerOfFaction(faction);
	      this.sendGameOverTransaction([this.game.players[player-1]], f.details);
	      return 0;
	    }
	  }

          return 1;
        }
        if (mv[0] === "new_world_phase") {

	  //
	  // no new world phase in 2P games
	  //
	  if (this.game.players.length > 2) {

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

	  // show the winter overlay to let people know WTF is happening
	  this.winter_overlay.render();

	  // unset any sieges
	  this.removeSieges();

	  // Remove loaned naval squadron markers
	  this.returnLoanedUnits();

	  // Flip all debaters to their uncommitted (white) side, and
	  this.restoreDebaters();

	  // Remove the Renegade Leader if in play
	  let rl_idx = "";
	  rl_s = his_self.returnSpaceOfPersonage("hapsburg", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\thapsburg\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("papacy", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tpapacy\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("england", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tengland\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("france", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tfrance\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("ottoman", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tottoman\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("protestant", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tprotestant\trenegade-leader\t"+rl_s+"\t0"); }

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
	  // TESTING form Schmalkaldic League triggers end of round 1
	  //
	  //if (this.game.state.round == 2 && this.game.state.events.schmalkaldic_league != 1) {
	  //  this.game.queue.push("counter_or_acknowledge\tSchmalkaldic League Forms");
	  //  this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  //  this.game.queue.push("event\tprotestant\t013");
	  //}
	  //
	  //
	  // form Schmalkaldic League if unformed by end of round 4
	  //
	  if (this.game.state.round == 4 && this.game.state.events.schmalkaldic_league != 1) {
	    this.game.queue.push("counter_or_acknowledge\tSchmalkaldic League Forms");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    this.game.queue.push("event\tprotestant\t013");
	  }

	  // Return naval units to the nearest port
	  this.game.queue.push("retreat_to_winter_ports");

	  // TODO - ATTRITION

	  // Return leaders and units to fortified spaces (suffering attrition if there is no clear path to such a space)
	  this.game.queue.push("retreat_to_winter_spaces");

	  this.game.queue.splice(qe, 1);
          return 1;
        }


        if (mv[0] === "action_phase") {


//
// Papacy
//
if (this.game.state.round == 1) {
if (this.game.player == this.returnPlayerCommandingFaction("papacy")) {
  this.game_help.render(TutorialTemplate, {
    help : `Action Phase` ,
    content : `
        In the Action Phase, players take turns playing cards for their event or operation points (OPS). The Papacy 
	usually attempts to contain the Protestant expansion in Europe while seeking additional points by expanding
	its control of Italian keys. Bonus VP can be earned by building St. Peter's Basilica in Rome.
	<p></p>
	Burning Books and Convening Theological Debates are the Papacy's primary tools for slowing the Protestant spread
	early in the game. When holding a debate, try to arrange it so that your more powerful debaters are paired up 
	against their weaker debaters for a better change at flipping spaces and earning VP.
	<p></p>
	Beyond religious conflict, the Papacy can also earn VP by expanding its control of keys, earning 2 VP and some 
	additional cards for each extra key it controls. To do this build Mercenaries and Regulars in Papal home spaces
	and march them up the map. Be sure to control all of the spaces between your target and an existing Papal-
	controlled key like Rome or Ravenna so that you have a "Line of Control" to your target. Florence is a common
	early-war target for the Papacy.
	<p></p>
	If you have any OPs that cannot otherwise be spent, you can earn VP by contributing them to the construction of
	St. Peter's Basilica in Rome.
    `,
    line1 : "learn",
    line2 : "to play",
    fontsize : "2.1rem",      
    img : `/his/img/backgrounds/tutorials/action_phase.jpeg`,
  });
}
//
// Protestant
//
if (this.game.player == this.returnPlayerCommandingFaction("protestant")) {
  this.game_help.render(TutorialTemplate, {
    help : `Action Phase` ,
    content : `
        In the Action Phase, players take turns playing cards for their event or operation points (OPS). The Protestants
	should focus on events that help them convert spaces to the Protestant religion. You can spend OPS to do this by 
	Publishing Treatises (which give reformation attempts) and Convening Theological Debates (less predictable, but 
	ignores adjacency).
	<p></p>
	If you do not have enough OPs to do either of those actions, spend your resources on translating . Once you have
	finished translating the New and Old Testament you will get bonus conversion attempts in the language zone of your
	transaction.
	<p></p>
        In the early game, the Protestants should focus on converting spaces in Germany to Protestantism, and particularly aim
	to flip the six German Electorates (hexagonal spaces of Wittenberg, Brandenburg, Mainz, Cologne, Trier and Augsburg) as
	the Protestants will get an extra card each turn for controlling any five, and these keys will give VP once the 
	Schmalkaldic (German Defense) League forms at the end of the early-war period.
    `,        
    line1 : "learn",
    line2 : "to play",
    fontsize : "2.1rem",      
    img : `/his/img/backgrounds/tutorials/action_phase.jpeg`,
  });
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
console.log("ACTION PHASE: CHECK FACTIONS!");
console.log(JSON.stringify(this.game.state.players_info[i].factions));
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
// hide any other help (scoring!);
//
this.game_help.hide();
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
        if (mv[0] === "diplomacy_phase") {

//
// Papacy 
//          
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



	  // multiplayer has diplomacy phase
	  // this.playerOffer();
	  // return 0;

	  //
	  // no diplomacy phase round 1
	  //
	  if (this.game.state.round == 1) {

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
          }

	  this.game.queue.splice(qe, 1);
          return 1;

        }


	if (mv[0] === "player_play_papacy_regain_spaces_for_vp") {

	  this.game.queue.splice(qe, 1);

          let enemies = [];
	  let factions = ["genoa","venice","scotland","ottoman","france","england","hungary","hapsburg"];
	  for (let i = 0; i < factions.length; i++) { if (this.areEnemies(factions[i], "papacy")) { enemies.push(factions[i]); } }

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
//
// HACK
//
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
	  let factions = ["genoa","venice","scotland","ottoman","france","england","hungary","hapsburg"];
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

	if (mv[0] === "declare_war" || mv[0] === "set_enemies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setEnemies(f1, f2);
	  this.game.queue.splice(qe, 1);

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


        if (mv[0] === "card_draw_phase") {

console.log("###");
console.log("###");
console.log("###");
console.log("Cards in Hand: " + JSON.stringify(this.game.deck[0].fhand));

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
if (this.game.state.scenario == "is_testing") { cardnum = 1; }

	        //
	        // fuggers card -1
	        //
                if (this.game.state.events.fuggers === this.game.state.players_info[i].factions[z]) {
		  cardnum--;
	  	  this.game.state.events.fuggers = "";
	        }

    	        this.game.queue.push("hand_to_fhand\t1\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("add_home_card\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("DEAL\t1\t"+(i+1)+"\t"+(cardnum));

	        // try to update cards_left
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

	  let deck_to_deal = new_cards;
	  for (let key in deck_to_deal) { 
	    if (key !== "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
	      reshuffle_cards[key] = deck_to_deal[key]; 
	    }
	  }

console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");
console.log("RESHUFFLE: " + JSON.stringify(reshuffle_cards));

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

            if (home_card_permitted == 0 && is_this_home_card == 1) {
              while (roll > 0 && is_this_home_card == 1) {
                is_this_home_card = 0;
                roll--;
                if (roll == -1) {
                  this.addMove("NOTIFY\t"+this.returnFactionName(faction)+ " has no non-home cards to pull");
                  this.endTurn();
                  return 0;
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
	    this.updateLog("Cards Revealed: ");
	    for (let i = 0; i < cards.length; i++) {
	      this.updateLog(this.game.deck[0].cards[i].name);
	    }
	  }

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

	  if (player == this.game.player) {

            let msg = "Select Card to Discard:";
            let html = '<ul>';
	    let cards = this.game.deck[0].fhand[fhand_idx];;
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


	if (mv[0] === "excommunicate_faction") {

	  let faction = mv[1];
	  this.excommunicateFaction(faction);

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
	      if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
		is_this_home_card = 1;
	      }

	      if (home_card_permitted == 0 && is_this_home_card == 1) {
	        while (roll >= 0 && is_this_home_card == 1) {
		  is_this_home_card = 0;
		  roll--;
		  if (roll == -1) {
		    this.addMove("NOTIFY\t"+this.returnFactionName(faction)+ " has no non-home cards to discard");
		    this.endTurn();
		    return 0;
		  }
	      	  let pulled = this.game.deck[0].fhand[fhand_idx][roll];
	      	  if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
		    is_this_home_card = 1;
		  }
		}
	      }


	      discards.push(roll);
	      discards.sort();
	      for (let zz = 0; zz < discards.length; zz++) {
	        this.addMove("discard\t"+faction+"\t"+this.game.deck[0].fhand[fhand_idx][discards[zz]]);
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
	    this.updateStatusAndListCards("Opponent Turn:", this.game.deck[0].fhand[0], () => {});
	  }

	  this.game.queue.splice(qe, 1);
          return 0;
        }
	if (mv[0] === "continue") {

	  let player = mv[1];
	  let faction = mv[2];
	  let card = mv[3];
	  let ops = mv[4];
	  let limit = "";
	  if (mv[5]) { limit = mv[5]; }

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
	    this.playerAcknowledgeNotice(`You have ${ops} OPS remaining...`, () => {
	      this.playerPlayOps(card, faction, ops, limit);
	    });
	  } else {
	    this.hideOverlays();
	    this.updateStatusAndListCards("Opponent Turn", his_self.game.deck[0].fhand[0], () => {});
	  }

          return 0;
        }

	if (mv[0] === "faction_acknowledge") {

	  let faction = mv[1];
	  let msg = mv[2];
	  let player = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == player) {
	    // active player halts, then continues once acknowledgement happens
	    this.playerAcknowledgeNotice(msg, () => {
	      this.handleGameLoop();
	    });
	  } else {
	    // everyone else continues processing
	    return 1;
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
	  if (mv[2]) { zone = mv[2]; }

	  this.game.queue.splice(qe, 1);

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
                  his_self.isSpaceAdjacentToReligion(space, "catholic")
                ) {
		  if (space.language == zone || zone == "") {
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
	    this.updateStatus("Counter-Reformation");
	  }
	  this.displayVictoryTrack();
	  return 0;

        }

	if (mv[0] === "select_for_protestant_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  let force_in_zone = 0;
	  if (mv[2]) { zone = mv[2]; }
	  if (mv[3]) { force_in_zone = true; }

	  this.game.queue.splice(qe, 1);

	  //
	  //
	  //
	  let available_spaces = this.returnNumberOfProtestantSpacesInLanguageZone(zone);
	  if (available_spaces == 0) {
	    if (force_in_zone) { 
	      return 1; 
	    } else { 
	      zone = ""; 
	    }
	  }
	  if (1 > this.returnNumberOfProtestantSpacesInLanguageZone(zone)) {
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
                  his_self.isSpaceAdjacentToReligion(space, "protestant")
                ) {
		  if (space.language == zone || zone == "") {
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
	    this.updateStatus("Protestant Reformation");
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
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

 	if (mv[0] === "remove_unrest") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  this.game.spaces[spacekey].unrest = 0;
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

	  //
	  // move the units here
	  //
	  let units = this.game.spaces[source_spacekey].units[faction];
	  this.game.spaces[source_spacekey].units[faction] = [];

	  //
	  // find nearest fortified unit
	  //
	  let not_these_spaces = [];
	  let all_units_repositioned = false;

	  //
	  // loop moving these units around
	  //
	  while (all_units_repositioned == false) {

            let found_space = his_self.returnNearestSpaceWithFilter(
	      source_spacekey ,

              function(spacekey) {
                if ( !not_these_spaces.includes(spacekey) && his_self.game.spaces[spacekey].home == faction && (his_self.game.spaces[spacekey].type == "key" || his_self.game.spaces[spacekey].type == "electorate" || his_self.game.spaces[spacekey].type == "fortress")) {
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

	    let loop_limit = units.length;
	    for (let i = 0; i < loop_limit; i++) {
	      if (his_self.returnFactionLandUnitsInSpace(faction, found_space)) {
		his_self.units[faction].push(units[i]);
		units.splice(i, 1);
		i--;
	        loop_limit = units.length;
	      }
	    }
	  }

	}

	if (mv[0] === "pacify" || mv[0] === "control") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let space = mv[2];

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

	  this.game.spaces[space].political = faction;

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
	  } else {
	    this.updateLog(this.returnSpaceName(space) + " converts Catholic");
	  }

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
	        this.game.deck[0].hand.push(key);
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


	if (mv[0] === "hand_to_fhand") {

	  this.game.queue.splice(qe, 1);

	  let deckidx = parseInt(mv[1])-1;
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let fhand_idx = this.returnFactionHandIdx(player, faction);

	  if (this.game.player == player) {

console.log("$$$");
console.log("$$$");
console.log("$$$");
console.log("fhand: " + JSON.stringify(this.game.deck[deckidx].fhand));

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
	  if (this.game.state.english_bible_translation_bonus == 1 || this.game.state.french_bible_translation_bonus == 1 || this.game.state.german_bible_translation_bonus == 1) {
	    p_rolls++;
	    p_roll_desc.push({ name : "Bonus" , desc : "translation completed"});
	  }
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
	    if (this.game.state.events.calvins_institutes && this.game.spaces[space].language === "french") { x++; }
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
	  if (this.game.spaces[space].language !== target_language_zone) {
	    //
	    // catholics win ties if Paul III or Julius III are Pope
	    //
	    if (this.game.state.leaders.paul_iii == 1 || this.game.state.leaders.julius_iii == 1) {
	      ties_resolve = "catholic";
	    }
 	  }

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
	    if (his_self.game.state.events.augsburg_confession == true) { x--; }
	    pdice.push(x);
	    if (x > p_high) { p_high = x; }
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
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



