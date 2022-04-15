


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
      players[i].factions = [];
      players[i].factions.push(rf);

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
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
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
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Move formation in clear",
      check : this.canPlayerMoveFormationInClear,
      fnct : this.playerMoveFormationInClear,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [2,2,2,2,2,2],
      name : "Move formation over pass",
      check : this.canPlayerMoveFormationOverPass,
      fnct : this.playerMoveFormationOverPass,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy'],
      cost : [1,1,1,1,1],
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
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [2,2,2,2,2,2],
      name : "Raise regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy'],
      cost : [2,2,2,2,2],
      name : "Build naval squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Assault",
      check : this.canPlayerAssault,
      fnct : this.playerAssault,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1,1],
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
    for (let key in this.spaces) {
      if (filter_func(this.spaces[key]) == 1) {
        html += '<li class="textchoice" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.textchoice').off();
	    mycallback(key);
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="textchoice" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatus(html);

    $('.textchoice').off();
    $('.textchoice').on('click', function () {
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
        html += '<li class="textchoice" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.textchoice').off();
	    mycallback(key);
	  }
	}
      }
    }
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        html += '<li class="textchoice" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.textchoice').off();
	    mycallback(key);
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="textchoice" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatus(html);

    $('.textchoice').off();
    $('.textchoice').on('click', function () {
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

    this.resetPlayerTurn(this.game.player, faction);

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
          this.playerPlayOps(card, faction);
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

    let menu = this.returnActionMenuOptions(this.game.player);
    let pfactions = this.returnPlayerFactions(this.game.player);

    if (ops == null) { ops = 2; }

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
  playerPlayEvent(card, faction, ops=null) {
console.log("playing event");
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


  playerPlaySpringDeployment(faction, player) {

    let capitals = this.factions[faction].capitals;
    let viable_capitals = [];
    let can_deploy = 0;

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
      for (let i = 0; i < viable_capitals.lengths; i++) {
	opt += `<li class="textchoice" id="${c}">${c}</li>`;
      }
      opt += `<li class="textchoice" id="pass">skip</li>`;

      this.updateStatusWithOptions(msg, opt);
      $(".textchoice").off();
      $(".textchoice").onclick = (e) => {

        let id = $(this).attr('id');
        $(".textchoice").off();

	if (id === "pass") {
	  this.updateStatus("passing...");
	  this.endTurn();
	  return;
        }

	//
	//
	//
	this.updateLog("UNIMPLEMENTED -- MOVEMENT IN SPRING DEPLOYMENT");
	this.endTurn();

      };
    }

  }




  canPlayerMoveFormationInClear(his_self, player, faction) {
    return 1;
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
	      ////units_to_move.reverse();

	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
	      his_self.addMove("counter_or_acknowledge\tPLAYER moving to DESTINATION\tmove");
	      his_self.addMove("RESETCONFIRMSNEEDED\t" + his_self.game.players.length);
	      his_self.endTurn();

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (units_to_move.includes(parseInt(i))) {
	        html += `<li class="textchoice" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="textchoice" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="textchoice" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatus(html);

          $('.textchoice').off();
          $('.textchoice').on('click', function () {

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

	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
	      this.endTurn();

	    },

	    cancel_func,

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (units_to_move.includes(parseInt(i))) {
	        html += `<li class="textchoice" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="textchoice" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="textchoice" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatus(html);

          $('.textchoice').off();
          $('.textchoice').on('click', function () {

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
	        html += `<li class="textchoice" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="textchoice" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="textchoice" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatus(html);

          $('.textchoice').off();
          $('.textchoice').on('click', function () {

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

  canPlayerBuyMercenary(his_self, player, faction) {
    return 1;
  }
  playerBuyMercenary(his_self, player, faction) {

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
	return 1;
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
console.log("7");
return;
  }

  canPlayerAssault(his_self, player, faction) {
    return 0;
  }
  async playerAssault(his_self, player, faction) {
console.log("8");
return;
  }
  canPlayerControlUnfortifiedSpace(his_self, player, faction) {
    return 0;
  }
  async playerControlUnfortifiedSpace(his_self, player, faction) {
console.log("9");
return;
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
    return 1;
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
    return 0;
  }
  async playerFoundJesuitUniversity(his_self, player, faction) {
console.log("21 jesuit");
return;
  }
  canPlayerPublishTreatise(his_self, player, faction) {
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {
console.log("22 treatise");
return;
  }


