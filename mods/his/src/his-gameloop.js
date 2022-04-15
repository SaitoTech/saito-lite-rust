

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

console.log("MOVE: " + mv[0]);

        //
        // round
        // init
	//
        if (mv[0] == "init") {
	  this.updateLog("init game");
          this.game.queue.splice(qe, 1);
        }

        if (mv[0] === "round") {

	  this.game.state.round++;

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("action_phase");
//	  this.game.queue.push("spring_deployment_phase");
//	  this.game.queue.push("diplomacy_phase");
//
// The Papacy may end a war they are fighting by playing Papal Bull or by suing for peace. -- start of diplomacy phase, so should go here
//
	  this.game.queue.push("card_draw_phase");


	  //
	  // start the game with the Protestant Reformation
	  //
//	  if (this.game.state.round == 1) {
//  	    this.game.queue.push("diet_of_worms");
//	    this.updateLog("Luther's 95 Theses!");
//	    this.game.queue.push("event\t1\t008");
//	  }

	  this.game.queue.push("ACKNOWLEDGE\tFACTION: "+JSON.stringify(this.returnPlayerFactions(this.game.player)));


	  if (this.game.state.round > 1) {
	    this.updateStatus("Game Over");
	    return 0;
	  }
          return 1;
        }


	if (mv[0] === "build") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];

	  if (land_or_sea === "land") {
	    this.game.spaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	  }
	  if (land_or_sea === "sea") {
	    this.game.navalspaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

        if (mv[0] === "event") {

	  let player = mv[1];
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

        if (mv[0] === "move") {

	  let faction = mv[1];
	  let movetype = mv[2];
	  let source = mv[3];
	  let destination = mv[4];
	  let unitidx = parseInt(mv[5]);

console.log("dest: " + destination);
console.log("fact: " + faction);
console.log("unitidx: " + unitidx);

	  if (source === "sea") {

	    //
	    // source = land, destination = sea
	    //
	    if (this.game.spaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.spaces[source].units[faction][unitidx];
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.spaces[source].units[faction].splice(unitidx, 1);
	      this.updateLog("Player "+faction+" moves unit from " + source + " to " + destination);
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
	      this.updateLog("Player "+faction+" moves unit from " + source + " to " + destination);
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
	      this.updateLog("Player "+faction+" moves unit from " + source + " to " + destination);
	      this.displayNavalSpace(source);
	      this.displaySpace(destination);
	    }

	  }

	  if (source === "land") {

	    let unit_to_move = this.game.spaces[source].units[faction][unitidx];
            this.game.spaces[destination].units[faction].push(unit_to_move);
            this.game.spaces[source].units[faction].splice(unitidx, 1);
	    this.updateLog("Player "+faction+" moves unit from " + source + " to " + destination);

	    this.displaySpace(source);
	    this.displaySpace(destination);

	  }
console.log("source: " + JSON.stringify(this.game.spaces[source]));
console.log("dest: " + JSON.stringify(this.game.spaces[destination]));


	  this.game.queue.splice(qe, 1);
          return 1;
	}

        if (mv[0] === "diet_of_worms") {

	  let game_self = this;

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

            game_self.addMove("resolve_diet_of_worms");
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

	  let protestant_card = this.game.deck[this.game.state.sp[protestant-1]];
	  let papacy_card = this.game.deck[this.game.state.sp[papacy-1]];

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
	  // do the hapsburgs get rolls in the 2P game?
	  //
	  //for (let i = 0; i < papacy_rolls; i++) {
	  //  let x = this.rollDice(6);
	  //  this.updateLog("Hapsburg rolls: " + x);
	  //  if (x >= 5) { papacy_hits++; }
	  //}


	  if (protestant_hits > papacy_hits) {
	    for (let i = papacy_hits; i < protestant_hits; i++) {
	      this.game.queue.push("select_for_protestant_conversion\tprotestant\tgerman");
	    }
	  } else {
	    if (protestant_hits < papacy_hits) {
	      for (let i = protestant_hits; i < papacy_hits; i++) {
	        this.game.queue.push("select_for_catholic_conversion\tcatholic\tgerman");
	      }
	    } else {
	      this.updateLog("Diet of Worms ends in tie.");
	    }
	  }

          return 1;

	}

	if (mv[0] === "counter_or_acknowledge") {

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
          if (z[i].menuOptionTriggers(this, stage, this.game.player) == 1) {
            let x = z[i].menuOption(this, stage, this.game.player);
            html += x.html;
	    menu_index.push(i);
	    menu_triggers.push(x.event);
	    attach_menu_events = 1;
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
                  z[menu_index[i]].menuOptionActivated(his_self, stage, his_self.game.player);
                  return;
                }
              }
            }

            if (action2 == "ok") {
              his_self.endTurn();
              his_self.endTurn();
              return;
            }

          });

	  this.game.queue.splice(qe, 1);
	  return 0;

	}


        if (mv[0] === "victory_determination_phase") {
	  this.game.queue.splice(qe, 1);
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

	  if (this.game.players == 2) {
	    // reverse order as last added goes first
	    this.game.queue.push("play\tprotestant");
	    this.game.queue.push("play\tpapacy");
	    return 1;
	  }

	  let io = this.returnImpulseOrder();
	  // reverse order as last added goes first
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

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

console.log("faction: " + faction + " player " + player);

	  if (this.game.player == player) {
	    this.playerPlaySpringDeployment(faction, player);
	  } else {
	    this.updateStatus(faction.charAt(0).toUpperCase() + faction.slice(1) + " Spring Deployment");
	  }

	  return 0;

	  this.game.queue.splice(qe, 1);
	  return 1;

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
    	        this.game.queue.push("DEAL\t1\t"+(i+1)+"\t1");
	      }
	    }
            this.game.queue.push("SHUFFLE\t1");
            this.game.queue.push("DECKRESTORE\t1");
	    for (let i = this.game.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t1\t"+(i));
	    }
	    for (let i = this.game.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t1\t"+(i));
	    }
	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t1\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t1");
	  }

	  this.game.queue.splice(qe, 1);
          return 1;

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

	  // skip factions not-in-play
	  if (player == -1) { 
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

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

	  if (this.game.player == player) {
            this.playerPlayOps(card, ops);
	  }

	  this.game.queue.splice(qe, 1);
	  let player_turn = -1;

	  for (let i = 0; i < this.game.players_info.length; i++) {
	    if (this.game.players_info[i].factions.includes(faction)) {
	      player_turn = i+1;
	    }
	  }

          this.displayBoard();

	  // no-one controls this faction, so skip
	  if (player_turn === -1) { return 1; }

	  // let the player who controls play turn
	  if (this.game.player === player_turn) {
            this.playerTurn(faction);
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
              "Select Town to Convert Protestant",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "protestant" &&
                  game_mod.isSpaceAdjacentToReligion(space, "catholic")
                ) {
                  return 1;
                }
                return 0;
              },

              function(spacekey) {
                game_mod.addMove("convert\t"+spacekey+"\tcatholic");
                game_mod.endTurn();
              },

              null

            );
          }

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
                  game_mod.isSpaceAdjacentToReligion(space, "protestant")
                ) {
                  return 1;
                }
                return 0;
              },

              function(spacekey) {
                game_mod.addMove("convert\t"+spacekey+"\tprotestant");
                game_mod.endTurn();
              },

              null

            );
          }

	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	if (mv[0] === "convert") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let religion = mv[2];

	  this.updateLog(this.game.spaces[space].name + " converts to the " + religion + " religion");

	  this.game.spaces[space].religion = religion;
	  this.displaySpace(space);

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

console.log("!!!!!!!!!!!!!!!!!!!!!");
console.log("!!! HAND TO FHAND !!!");
console.log("!!!!!!!!!!!!!!!!!!!!!");
console.log("deckidx: " + deckidx);
console.log(player + " -- " + faction + " -- " + fhand_idx);

	    if (!this.game.deck[deckidx].fhand) { this.game.deck[deckidx].fhand = []; }
	    while (this.game.deck[deckidx].fhand.length < (fhand_idx+1)) { this.game.deck[deckidx].fhand.push([]); }

	    for (let i = 0; i < this.game.deck[deckidx].hand.length; i++) {
	      this.game.deck[deckidx].fhand[fhand_idx].push(this.game.deck[deckidx].hand[i]);
	    }

	    // and clear the hand we have dealt
	    this.game.deck[deckidx].hand = [];
	    this.updateLog("hand entries copied over to fhand");
	  }



console.log(this.game.deck[deckidx]);

	  return 1;

	}

	if (mv[0] === "reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let p_player = mv[2];
	  let c_player = mv[3];

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
console.log("i: " + i);
	    let x = this.rollDice(6);
console.log("x is: " + x);
	    this.updateLog("Protestants roll: " + x, 1);
	    if (x > p_high) { p_high = x; }
	  }

this.updateLog("Catholics: " + c_rolls);

	  for (let i = 0; i < c_rolls; i++) {
console.log("i: " + i);
	    let x = this.rollDice(6);
console.log("x is: " + x);
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


