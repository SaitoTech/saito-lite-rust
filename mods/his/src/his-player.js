

  returnPlayers(num = 0) {

    var players = [];
    let factions  = JSON.parse(JSON.stringify(this.factions));
    let factions2 = JSON.parse(JSON.stringify(this.factions));

    // < 6 player games
    if (num == 2) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 3) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 3) {
      for (let key in factions) {
	if (key !== "protestant" && key != "france" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 4) {
      for (let key in factions) {
	if (key !== "protestant" && key != "france" && key != "ottoman" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    for (let i = 0; i < num; i++) {

      if (i == 0) { col = "color1"; }
      if (i == 1) { col = "color2"; }
      if (i == 2) { col = "color3"; }
      if (i == 3) { col = "color4"; }
      if (i == 4) { col = "color5"; }
      if (i == 5) { col = "color6"; }

      var keys = Object.keys(factions);
      let rf = keys[this.rollDice(keys.length) - 1];

      if (i == 0) {
        if (this.game.options.player1 != undefined) {
          if (this.game.options.player1 != "random") {
            rf = this.game.options.player1;
          }
        }
      }
      if (i == 1) {
        if (this.game.options.player2 != undefined) {
          if (this.game.options.player2 != "random") {
            rf = this.game.options.player2;
          }
        }
      }
      if (i == 2) {
        if (this.game.options.player3 != undefined) {
          if (this.game.options.player3 != "random") {
            rf = this.game.options.player3;
          }
        }
      }
      if (i == 3) {
        if (this.game.options.player4 != undefined) {
          if (this.game.options.player4 != "random") {
            rf = this.game.options.player4;
          }
        }
      }
      if (i == 4) {
        if (this.game.options.player5 != undefined) {
          if (this.game.options.player5 != "random") {
            rf = this.game.options.player5;
          }
        }
      }
      if (i == 5) {
        if (this.game.options.player6 != undefined) {
          if (this.game.options.player6 != "random") {
            rf = this.game.options.player6;
          }
        }
      }

      delete factions[rf];


      players[i] = {};
      players[i].tmp_roll_bonus = 0;
      players[i].tmp_roll_first = 0;
      players[i].tmp_roll_modifiers = [];
      players[i].factions = [];
      players[i].factions.push(rf);
      players[i].num = i;

    }


    if (num == 3) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	}
	if (players[i].factions[0] === "france") {
	  players[i].factions.push("ottoman");
	}
      }
    }

    if (num == 4) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	}
      }
    }

    if (num == 5) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	}
      }
    }

    return players;

  }

  resetPlayerTurn(player_num) {

    this.game.state.tmp_reformations_this_turn = [];
    this.game.state.tmp_counter_reformations_this_turn = [];
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;

    for (let i = 0; i < this.game.players_info.length; i++) {
      let p = this.game.players_info[i];
      p.tmp_roll_bonus = 0;
      p.tmp_roll_first = 0;
      p.tmp_roll_modifiers = [];
    }

    this.game.state.active_player = player_num;

  }

  isFactionInPlay(faction) {
    for (let i = 0; i < this.game.players.length; i++) {
      for (let z = 0; z < this.game.players_info[i].factions.length; z++) {
	if (this.game.players_info[i].factions[z] === faction) { return 1; }
      }
    }
    return 0;
  }

  returnPlayerOfFaction(faction) {
    for (let i = 0; i < this.game.players.length; i++) {
      for (let z = 0; z < this.game.players_info[i].factions.length; z++) {
	if (this.game.players_info[i].factions[z] === faction) { return (i+1); }
      }
    }
    return 0;
  }


  returnPlayerFactions(player) {
    return this.game.players_info[player-1].factions;
  }

  returnActionMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Move formation in clear",
      check : this.canPlayerMoveFormationInClear,
      fnct : this.playerMoveFormationInClear,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Move formation over pass",
      check : this.canPlayerMoveFormationOverPass,
      fnct : this.playerMoveFormationOverPass,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1],
      name : "Naval move",
      check : this.canPlayerNavalMove,
      fnct : this.playerNavalMove,
    });
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Buy mercenary",
      check : this.canPlayerBuyMercenary,
      fnct : this.playerBuyMercenary,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Raise regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Build naval squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Assault",
      check : this.canPlayerAssault,
      fnct : this.playerAssault,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Control unfortified space",
      check : this.canPlayerControlUnfortifiedSpace,
      fnct : this.playerControlUnfortifiedSpace,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,2,2],
      name : "Explore",
      check : this.canPlayerExplore,
      fnct : this.playerExplore,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,3,3],
      name : "Colonize",
      check : this.canPlayerColonize,
      fnct : this.playerColonize,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [4,4,4],
      name : "Conquer",
      check : this.canPlayerConquer,
      fnct : this.playerConquer,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [2],
      name : "Initiate piracy in a sea",
      check : this.canPlayerInitiatePiracyInASea,
      fnct : this.playerInitiatePiracyInASea,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Raise Cavalry",
      check : this.canPlayerRaiseCavalry,
      fnct : this.playerRaiseCavalry,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Build corsair",
      check : this.canPlayerBuildCorsair,
      fnct : this.playerBuildCorsair,
    });
    menu.push({
      factions : ['protestant'],
      cost : [1],
      name : "Translate scripture",
      check : this.canPlayerTranslateScripture,
      fnct : this.playerTranslateScripture,
    });
    menu.push({
      factions : ['england','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Publish treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
    });
    menu.push({
      factions : ['papacy','protestant'],
      cost : [3,3],
      name : "Call theological debate",
      check : this.canPlayerCallTheologicalDebate,
      fnct : this.playerCallTheologicalDebate,
    });
    menu.push({
      factions : ['papacy'],
      cost : [1],
      name : "Build Saint Peters",
      check : this.canPlayerBuildSaintPeters,
      fnct : this.playerBuildSaintPeters,
    });
    menu.push({
      factions : ['papacy'],
      cost : [2],
      name : "Burn books",
      check : this.canPlayerBurnBooks,
      fnct : this.playerBurnBooks,
    });
    menu.push({
      factions : ['papacy'],
      cost : [3],
      name : "Found Jesuit University",
      check : this.canPlayerFoundJesuitUniversity,
      fnct : this.playerFoundJesuitUniversity,
    });

    if (player == null) { return menu; }

    let pfactions = this.returnPlayerFactions(player);
    let fmenu = [];

    for (let i = 0; i < menu.length; i++) {
      for (let z = 0; z < pfactions.length; z++) {
        if (menu[i].factions.includes(pfactions[z])) {
          fmenu.push(menu[i]);
	  z = pfactions.length+1;
        }
      }
    }

    return fmenu;

  }





  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;

    let html = '<div class="message">' + msg + '</div>';

    html += '<ul>';
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.option').off();
	    mycallback(key);
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatus(html);

    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      mycallback(action);

    });

  }

  playerSelectNavalSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;

    let html = '<div class="message">' + msg + '</div>';

    html += '<ul>';
    for (let key in this.game.navalspaces) {
      if (filter_func(this.game.navalspaces[key]) == 1) {
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.option').off();
	    mycallback(key);
	  }
	}
      }
    }
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.option').off();
	    mycallback(key);
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatus(html);

    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      mycallback(action);

    });

  }




  playerTurn(faction, selected_card=null) {

    this.startClock();

    let his_self = this;

    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);


    this.updateStatusAndListCards("Select a Card: ", this.game.deck[0].fhand[faction_hand_idx]);
    this.attachCardboxEvents(function(card) {
      this.playerPlayCard(card, this.game.player, faction);
    });  

  }


  playerPlayCard(card, player, faction) {

    //
    // mandatory event cards effect first, then 2 OPS
    //
    if (this.deck[card].type === "mandatory") {
      // event before ops
      this.addMove("ops\t"+faction+"\t"+card+"\t"+2);
      this.playerPlayEvent(card, faction);
    } else {

      let html = `<ul>`;
      html    += `<li class="card" id="ops">play for ops</li>`;
      html    += `<li class="card" id="event">play for event</li>`;
      html    += `</ul>`;

      this.updateStatusWithOptions('Playing card:', html, true);
      this.bindBackButtonFunction(() => {
        this.playerTurn(faction);
      });
      this.attachCardboxEvents(function(user_choice) {
        if (user_choice === "ops") {
          let ops = this.game.deck[0].cards[card].ops;
          this.playerPlayOps(card, faction, ops);
          return;
        }
        if (user_choice === "event") {
          this.playerPlayEvent(card, faction);
          return;
        }
        return;
      });
    }
  }

  async playerPlayOps(card, faction, ops=null) {

    let his_self = this;
    let menu = this.returnActionMenuOptions(this.game.player);
    let pfactions = this.returnPlayerFactions(this.game.player);

    if (ops == null) { ops = 2; }
    if (ops == 0) {
console.log("OPS ARE ZERO!");
    }

    if (this.game.state.activated_powers[faction].length > 0) {

      let html = `<ul>`;
      html    += `<li class="card" id="${faction}">${faction}</li>`;
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
         html    += `<li class="card" id="${this.game.state.activated_powers[faction][i]}">${this.game.state.activated_powers[faction][i]}</li>`;
      }
      html    += `</ul>`;

      this.updateStatusWithOptions('Spend as which Power:', html);
      this.attachCardboxEvents(function(selected_faction) {

alert("selected faction = " + selected_faction);

	//
	// duplicates code below
	//
        let html = `<ul>`;
        for (let i = 0; i < menu.length; i++) {
          if (menu[i].check(this, this.game.player, selected_faction)) {
            for (let z = 0; z < menu[i].factions.length; z++) {
              if (menu[i].factions[z] === selected_faction) {
  	        if (menu[i].cost[z] <= ops) {
                  html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
                }
	        z = menu[i].factions.length+1;
              }
            }
          }
        }

        html    += `<li class="card" id="end_turn">end turn</li>`;
        html    += `</ul>`;

        his_self.updateStatusWithOptions(`You have ${ops} ops remaining: ${faction}`, html, false);
        this.attachCardboxEvents(async (user_choice) => {      

          if (user_choice === "end_turn") {
            this.endTurn();
            return;
          }

          for (let z = 0; z < menu[user_choice].factions.length; z++) {
            if (pfactions.includes(menu[user_choice].factions[z])) {
              ops -= menu[user_choice].cost[z];
	        z = menu[user_choice].factions.length+1;
            }
          }

          if (ops > 0) {
	    this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops);
          }
          menu[user_choice].fnct(this, this.game.player, selected_faction);
          return;

        });
      });
    } else {

      //
      // duplicates code above
      //
      let html = `<ul>`;
      for (let i = 0; i < menu.length; i++) {
        if (menu[i].check(this, this.game.player, faction)) {
          for (let z = 0; z < menu[i].factions.length; z++) {
            if (menu[i].factions[z] === faction) {
  	      if (menu[i].cost[z] <= ops) {
                html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
              }
	      z = menu[i].factions.length+1;
            }
          }
        }
      }

      html    += `<li class="card" id="end_turn">end turn</li>`;
      html    += `</ul>`;

      this.updateStatusWithOptions(`You have ${ops} ops remaining: ${faction}`, html, false);
      this.attachCardboxEvents(async (user_choice) => {      

        if (user_choice === "end_turn") {
          this.endTurn();
          return;
        }

        for (let z = 0; z < menu[user_choice].factions.length; z++) {
          if (pfactions.includes(menu[user_choice].factions[z])) {
            ops -= menu[user_choice].cost[z];
  	    z = menu[user_choice].factions.length+1;
          }
        }

        if (ops > 0) {
  	  this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops);
        }
        menu[user_choice].fnct(this, this.game.player, faction);
        return;
      });

    }
  }
  playerPlayEvent(card, faction, ops=null) {
    this.addMove("event\t"+faction+"\t"+card);
    this.addMove("counter_or_acknowledge\t" + this.returnFactionName(faction) + " plays " + card + " for the event\tevent\tcard");
    this.addMove("RESETCONFIRMSNEEDED\tall");
    this.endTurn();
  }


  playerActionMenu(player) {
    let menu_options = this.returnActionMenuOptions();
  }

  async playerReformationAttempt(player) {
    this.updateStatus("Attempting Reformation Attempt");
    return;
  }
  async playerCounterReformationAttempt(player) {
console.log("1");
return;
  }


  playerPlayPapacyDiplomacyPhaseSpecialTurn() {
this.updateLog("Papacy Diplomacy Phase Special Turn");
    this.endTurn();
    return;
  }


  playerPlaySpringDeployment(faction, player) {

    let his_self = this;
    let capitals = this.factions[faction].capitals;
    let viable_capitals = [];
    let can_deploy = 0;
    let units_to_move = [];
    let cancel_func = null;
    let source_spacekey;

    for (let i = 0; i < capitals.length; i++) {
      let c = capitals[i];
      if (this.game.spaces[c].units[faction].length > 0) {
        can_deploy = 1;
        viable_capitals.push(capitals[i]);
      }
    }

    if (can_deploy == 0) {
      this.updateStatus("Spring Deployment not possible");
      this.endTurn();
    } else {

      let msg = "Do you wish to Spring Deploy from: ";
     
      let opt = "";
      for (let i = 0; i < viable_capitals.length; i++) {
	opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
      }
      opt += `<li class="option" id="pass">skip</li>`;

      this.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function() {

        let id = $(this).attr('id');
        $(".option").off();

	source_spacekey = id;

	if (id === "pass") {
	  his_self.updateStatus("passing...");
	  his_self.endTurn();
	  return;
        }

       his_self.playerSelectSpaceWithFilter(

          "Select Destination for Units from Capital: ",

          function(space) {
            if (his_self.isSpaceFriendly(space, faction)) {
              if (his_self.isSpaceConnectedToCapital(space, faction)) {
                if (!his_self.isSpaceFactionCapital(space, faction)) {
                  return 1;
		}
              }
            }
            return 0;
          },

          function(destination_spacekey) {

            let space = his_self.spaces[id];

            let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface) { 

	      let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	      let msg = "Max Formation Size: " + max_formation_size + " units";

              let html = "<ul>";
              for (let i = 0; i < space.units[faction].length; i++) {
                if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
                  if (units_to_move.includes(parseInt(i))) {
                    html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
                  } else {
                    html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
                  }
                }
              }
              html += `<li class="option" id="end">finish</li>`;
              html += "</ul>";

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                let id = $(this).attr("id");

                if (id === "end") {
		  // MOVE THE UNITS
                  units_to_move.sort();
                  //units_to_move.reverse();

                  for (let i = 0; i < units_to_move.length; i++) {
                    his_self.addMove("move\t"+faction+"\tland\t"+source_spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
                  }
                  his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" spring deploys to "+his_self.game.spaces[destination_spacekey].name);
                  //his_self.addMove("RESETCONFIRMSNEEDED\tall");
                  his_self.endTurn();
                  return;

                }

                if (units_to_move.includes(id)) {
                  let idx = units_to_move.indexOf(id);
                  if (idx > -1) {
                    units_to_move.splice(idx, 1);
                  }
                } else {
                  units_to_move.push(parseInt(id));
                  selectUnitsInterface(his_self, units_to_move, selectUnitsInterface);
                }

              });
            }
            selectUnitsInterface(his_self, units_to_move, selectUnitsInterface);
          }
        );
	his_self.updateLog("IMPLEMENTED -- MOVEMENT IN SPRING DEPLOYMENT");
      });
    }
  }

  returnMaxFormationSize(units_to_move) {

    let command_value_one = 0;
    let command_value_two = 0;
    let max_command_value = 0;

    for (let i = 0; i < units_to_move.length; i++) {
      if (units_to_move[i].command_value > 0) {
        // we can have up to two army leaders combine command values
	if (command_value_one == 0) {
	  command_value_one = units_to_move[i].command_value; 
	} else {
	  if (command_value_two == 0) {
	    command_value_one = units_to_move[i].command_value;
	  } else {
	    if (command_value_one > command_value_two && units_to_move[i].command_value > command_value_one) {
	      command_value_one = units_to_move[i].command_value;
	    } else {
	      if (command_value_one < command_value_two && units_to_move[i].command_value > command_value_two) {
	        command_value_two = units_to_move[i].command_value;
	      }
	    }
	  }
	}

	max_command_value = command_value_one + command_value_two;
      }
    }

    if (max_command_value > 4) { return max_command_value; }
    return 4;

  }

  async playerMoveFormationInClear(his_self, player, faction) {

    let units_to_move = [];
    let cancel_func = null;

    his_self.playerSelectSpaceWithFilter(

      "Select Town from Which to Move Units:",

      function(space) {
	for (let z in space.units) {
	  if (space.units[z].length > 0 && faction === z) {
	    return 1;
          }
	}
	return 0;
      },

      function(spacekey) {

        let space = his_self.spaces[spacekey];

	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      if (space.neighbours.includes(spacekey)) {
	        if (!space.pass) { 
		  return 1; 
		} else {
 		  if (!space.pass.includes(spacekey)) {
		    return 1;
		  }
		}
	  	return 1;
              }
	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort();

	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
              his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination_spacekey].name + "\tmove");
	      his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.endTurn();

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (units_to_move.includes(parseInt(i))) {
	        html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      units_to_move.push(parseInt(id));
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	
      },

      cancel_func,

      true,

    );

  }



  playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_space, defender) {

    let his_self = this;
    let retreat_destination = "";

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("retreat"+"\t"+defender+"\t"+spacekey+"\t"+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      let html = "<ul>";
      for (let i = 0; i < space.neighbours.length; i++) {
        if (this.canFactionRetreatToSpace(defender, space.neighbours[i], attacker_comes_from_this_spacekey)) {
          html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Desetination for Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });

      selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);

    };


    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">do not retreat</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat from ${spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }





  playerEvaluateFortification(attacker, faction, spacekey) {

    let his_self = this;

    let html = `<ul>`;
    html    += `<li class="card" id="fortify">withdraw into fortification</li>`;
    html    += `<li class="card" id="battle">engage in land battle</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Withdraw Units into Fortification?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "fortify") {
	his_self.addMove("fortification\t"+attacker+"\t"+faction+"\t"+spacekey);
	his_self.endTurn();
        return;
      }
      if (user_choice === "battle") {
	his_self.endTurn();
        return;
      }
    });

  }





  playerEvaluateInterceptionOpportunity(attacker, spacekey, attacker_includes_cavalry, defender, defender_spacekey) {

    let his_self = this;

    let units_to_move = [];

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("intercept"+"\t"+attacker+"\t"+spacekey+"\t"+attacker_includes_cavalry+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, onFinishSelect) {

console.log("selecting intercept units");

      let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
      let msg = "Max Formation Size: " + max_formation_size + " units";
      let space = his_self.game.spaces[defender_spacekey];

      let html = "<ul>";

console.log("units length: " + space.units[defender].length);

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].land_or_sea === "land" || space.units[defender][i].land_or_sea === "both") {
          if (units_to_move.includes(parseInt(i))) {
            html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[defender][i].name}</li>`;
          } else {
            html += `<li class="option" id="${i}">${space.units[defender][i].name}</li>`;
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          onFinishSelect(his_self, units_to_move);
          return;
        }

        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          units_to_move.push(parseInt(id));
        }

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Intercept from ${defender_spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "intercept") {
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }



  canPlayerMoveFormationOverPass(his_self, player, faction) {
    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_units.length; i++) {
      if (this.game.spaces[spaces_with_units[i]].pass.length > 0) { return 1; }
    }
    return 0;
  }
  async playerMoveFormationOverPass(his_self, player, faction) {

    let units_to_move = [];

    his_self.playerSelectSpaceWithFilter(

      "Select Town from Which to Move Units:",

      // TODO - select only cities where I can move units
      function(space) {
	for (let z in space.units) {
	  if (space.units[z].length > 0 && z === faction) {
	    if (space.pass) { if (space.pass.length > 0) { return 1; } }
          }
	}
	return 0;
      },

      function(spacekey) {

        let space = his_self.spaces[spacekey];

	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      if (space.neighbours.includes(spacekey)) {
		if (space.pass) {
		  if (space.pass.includes(spacekey)) { return 1; }
		}
              }
	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort();
	      ////units_to_move.reverse();

	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
	      this.endTurn();

	    },

	    cancel_func,

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	  let msg = "Max Formation Size: " + max_formation_size + " units";

	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (units_to_move.includes(parseInt(i))) {
	        html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      selectDestinationInterface(his_self, units_to_move);    
	      return;
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      units_to_move.push(parseInt(id));
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	
      },

      cancel_func,

    );

  }


  canPlayerNavalMove(his_self, player, faction) {
    if (his_self.doesFactionHaveNavalUnitsOnBoard(faction)) { return 1; }
    return 0;
  }
  async playerNavalMove(his_self, player, faction) {

    let units_to_move = [];
    let cancel_func = null;

    his_self.playerSelectNavalSpaceWithFilter(

      "Select Naval Space from Which to Move Units:",

      function(space) {
	for (let z in space.units) {
	  if (space.units[z].length && faction === z) {
	    for (let i = 0; i < space.units[z].length; i++) {
	      if (space.units[z][i].land_or_sea == "sea" || space.units[z][i].land_or_sea == "both") {
	        return 1;
              }
            }
          }
	}
	return 0;
      },

      function(spacekey) {

        let space = his_self.spaces[spacekey];

	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectNavalSpaceWithFilter(

            "Select Naval Destination for these Units",

      	    function(space) {
	      //
	      // trying to find out if space is destination for spacekey
	      //
	      if (his_self.game.spaces[spacekey]) {
	        if (space.ports) {
		  if (space.ports.includes(spacekey)) {
	  	    return 1; 
	          } 
		}
		return 0;
	      }

	      if (his_self.game.navalspaces[spacekey]) {
	        if (space.neighbours.includes(spacekey)) {
		  return 1;
		}
	        if (space.ports.includes(spacekey)) {
		  return 1;
		}
		return 0;
	      }		

	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort();
	      ////units_to_move.reverse();

	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tsea\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
	      his_self.endTurn();

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "sea" || space.units[faction][i].land_or_sea === "both") {
	      if (units_to_move.includes(parseInt(i))) {
	        html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatus(html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      units_to_move.push(parseInt(id));
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	
      },

      cancel_func,

      true,

    );

  }
  canPlayerMoveFormationOverPass(his_self, player, faction) {
    return 1;
  }

  canPlayerMoveFormationInClear(his_self, player, faction) {
    return 1;
  }

  canPlayerBuyMercenary(his_self, player, faction) {
    return 1;
  }
  playerBuyMercenary(his_self, player, faction) {

console.log("faction: " + faction);

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Mercenary",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }


  canPlayerRaiseRegular(his_self, player, faction) {
    return 1;
  }
  async playerRaiseRegular(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Regular",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerBuildNavalSquadron(his_self, player, faction) {
    return 1;
  }
  async playerBuildNavalSquadron(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tsea\t"+faction+"\t"+"squadron"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerAssault(his_self, player, faction) {
console.log("can player assault: " + faction);
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlledByFaction(conquerable_spaces[i]), faction) {
        if (his_self.game.spaces[conquerable_spaces[i]].type === "fortress") {
	  return 1;
	}
      }
    }
    return 0;
  }
  async playerAssault(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Space for Siege/Assault: ",

      function(space) {
        if (!his_self.isSpaceControlledByFaction(space, faction)) {
          if (his_self.game.spaces[space.key].type === "fortress") {
  	    return 1;
	  }
        }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("assault\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerControlUnfortifiedSpace(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (his_self.isSpaceControlledByFaction(spaces_in_unrest[i]), faction) { return 1; }
    }
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlledByFaction(conquerable_spaces[i]), faction) { return 1; }
    }
    return 0;
  }
  async playerControlUnfortifiedSpace(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);

    his_self.playerSelectSpaceWithFilter(

      "Select Space to Pacify:",

      function(space) {
        if (spaces_in_unrest.includes(space.key)) { return 1; }
        if (conquerable_spaces.includes(space.key)) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("pacify\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
    return 0;
  }
  canPlayerExplore(his_self, player, faction) {
    return 0;
  }
  async playerExplore(his_self, player, faction) {
console.log("10");
return;
  }
  canPlayerColonize(his_self, player, faction) {
    return 0;
  }
  async playerColonize(his_self, player, faction) {
console.log("11");
return;
  }
  canPlayerConquer(his_self, player, faction) {
    return 0;
  }
  async playerConquer(his_self, player, faction) {
console.log("12");
return;
  }
  canPlayerInitiatePiracyInASea(his_self, player, faction) {
    if (faction === "ottoman" && his_self.game.events.ottoman_piracy_enabled == 1) { return 1; }
    return 0;
  }
  async playerInitiatePiracyInASea(his_self, player, faction) {
console.log("13");
return;
  }
  canPlayerRaiseCavalry(his_self, player, faction) {
    return 1;
  }
  async playerRaiseCavalry(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerBuildCorsair(his_self, player, faction) {
    if (faction === "ottoman" && his_self.game.events.ottoman_corsairs_enabled == 1) { return 1; }
    return 0;
  }
  async playerBuildCorsair(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Corsair",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tsea\t"+faction+"\t"+"corsair"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerTranslateScripture(his_self, player, faction) {
    return 0;
  }
  async playerTranslateScripture(his_self, player, faction) {
console.log("16");
return;
  }
  canPlayerPublishTreatise(his_self, player, faction) {
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {
console.log("17");
return;
  }
  canPlayerCallTheologicalDebate(his_self, player, faction) {
    return 0;
  }
  async playerCallTheologicalDebate(his_self, player, faction) {
console.log("18");
return;
  }
  canPlayerBuildSaintPeters(his_self, player, faction) {
    return 0;
  }
  async playerBuildSaintPeters(his_self, player, faction) {
console.log("19");
return;
  }
  canPlayerBurnBooks(his_self, player, faction) {
    return 0;
  }
  async playerBurnBooks(his_self, player, faction) {
console.log("20");
return;
  }
  canPlayerFoundJesuitUniversity(his_self, player, faction) {
    if (faction === "papacy" && his_self.game.state.events.papacy_may_found_jesuit_universities == 1) { return 1; }
    return 0;
  }
  async playerFoundJesuitUniversity(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Catholic-Controlled Space for Jesuit University",

      function(space) {
        if (space.religion === "catholic") { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	alert("JESUIT UNIVERSITY FOUNDED: " + destination_spacekey);
      },

    );
  }
  canPlayerTranslateScripture(his_self, player, faction) {
    return 0;
  }
  canPlayerPublishTreatise(his_self, player, faction) {
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {
console.log("22 treatise");
return;
  }

  playerPlaceUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;
    let unit = new Unit();

    his_self.playerSelectSpaceWithFilter(

      `Place ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {
        
	his_self.addUnit(faction, spacekey, unittype);
        his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+this.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerPlaceUnitsInSpaceWithFilter(msg, unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}
      },

      cancel_func 

    );
  }


  playerRemoveUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;
    let unit = new Unit();

    his_self.playerSelectSpaceWithFilter(

      `Remove ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {

	his_self.removeUnit(faction, spacekey, unittype);
        his_self.addMove("remove\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+this.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerRemoveUnitsInSpaceWithFilter(msg, unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}

      },

      cancel_func 

    );
  }



