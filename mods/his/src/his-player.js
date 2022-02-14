


  returnPlayers(num = 0) {

    var players = [];
    let factions = JSON.parse(JSON.stringify(this.factions));

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
      players[i].faction = rf;

    }

    return players;

  }

  resetPlayerTurn(player_num) {
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
  }

  returnPlayerFaction(player) {
    let key = this.game.players_info[player-1].faction;
    return this.factions[key];
  }

  returnActionMenuOptions(player=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Move formation in clear",
      fnct : this.playerMoveFormationInClear,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [2,2,2,2,2,2],
      name : "Move formation over pass",
      fnct : this.playerMoveFormationOverPass,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy'],
      cost : [1,1,1,1,1],
      name : "Naval move",
      fnct : this.playerNavalMove,
    });
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Buy mercenary",
      fnct : this.playerBuyMercenary,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [2,2,2,2,2,2],
      name : "Raise regular",
      fnct : this.playerRaiseRegular,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy'],
      cost : [2,2,2,2,2],
      name : "Build naval squadron",
      fnct : this.playerBuildNavalSquadron,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Assault",
      fnct : this.playerAssault,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Control unfortified space",
      fnct : this.playerControlUnfortifiedSpace,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,2,2],
      name : "Explore",
      fnct : this.playerExplore,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,3,3],
      name : "Colonize",
      fnct : this.playerColonize,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [4,4,4],
      name : "Conquer",
      fnct : this.playerConquer,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [2],
      name : "Initiate piracy in a sea",
      fnct : this.playerInitiatePiracyInASea,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Raise Cavalry",
      fnct : this.playerRaiseCavalry,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Build corsair",
      fnct : this.playerBuildCorsair,
    });
    menu.push({
      factions : ['protestant'],
      cost : [1],
      name : "Translate scripture",
      fnct : this.playerTranslateScripture,
    });
    menu.push({
      factions : ['england','protestant'],
      cost : [1,1,1,1,1,1],
      name : "Publish treatise",
      fnct : this.playerPublishTreatise,
    });
    menu.push({
      factions : ['papacy','protestant'],
      cost : [3,3],
      name : "Call theological debate",
      fnct : this.playerCallTheologicalDebate,
    });
    menu.push({
      factions : ['papacy'],
      cost : [1],
      name : "Build Saint Peters",
      fnct : this.playerBuildSaintPeters,
    });
    menu.push({
      factions : ['papacy'],
      cost : [2],
      name : "Burn books",
      fnct : this.playerBurnBooks,
    });
    menu.push({
      factions : ['papacy'],
      cost : [3],
      name : "Found Jesuit University",
      fnct : this.playerFoundJesuitUniversity,
    });

    if (player == null) { return menu; }

    let pfaction = this.returnPlayerFaction(player);
    let fmenu = [];


    for (let i = 0; i < menu.length; i++) {
      if (menu[i].factions.includes(pfaction.key)) {
        fmenu.push(menu[i]);
      }
    }

    return fmenu;

  }


  playerMoveUnits(msg, cancel_func = null) {

    let his_self = this;

    this.playerSelectSpaceWithFilter(
      "Select Town from Which to Move Units:",

      function(space) {
	if (space.units[his_self.game.player-1].length > 0) {
	  return 1;
        }
	return 0;
      },

      function(spacekey) {

        let space = his_self.spaces[spacekey];
	let units_to_move = [];


	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      if (space.neighbours.includes(spacekey)) {
	  	return 1;
              }
	      return 0;
            },

      	    function(destination_spacekey) {
console.log("Move " + JSON.stringify(units_to_move) + " from " + spacekey + " to " + destination_spacekey);
	    },

	    cancel_func,

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let html = "<ul>";
	  for (let i = 0; i < space.units[this.game.player-1].length; i++) {
	    if (units_to_move.contains(i)) {
	      html += `<li class="textchoice" style="font-weight:bold" id="${i}">${space.units[this.game.player-1][i].name}</li>`;
	    } else {
	      html += `<li class="textchoice" id="${i}">${space.units[this.game.player-1][i].name}</li>`;
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
	      if (index > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      units_to_move.push(id);
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface);

	  });
	}
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface);




	
      },

      cancel_func,

    );

  }




/*********************
  playerSelectUnitsInSpace(spacekey) {

    this.playerSelectUnitsWithFilter(

      "Select Town from Which to Move Units:",

      function(unit) {
	if (space.units[this.game.player-1].length > 0) {
	  return 1;
        }
	return 0;
      },

      function(spacekey) {
	let space = this.spaces[spacekey];
	let units = this.playerSelectUnitsWithFilter(


        );
	console.log("Space key: " + spacekey);
      },

      null,

  }


  playerSelectUnitsWithFilter(msg, filter_func, mycallback = null, cancel_func = null) {

    let his_self = this;

    let html = '<div class="message">' + msg + '</div>';

    html += '<ul>';
    for (let key in this.spaces) {
      for (let i = 0; i < this.spaces[key].units.length; i++) {
        for (let z = 0; z < this.spaces[key].units[i].length; z++) {
          if (filter_func(this.spaces[key].units[i][z]) == 1) {
            html += '<li class="textchoice" id="' + key + '">' + key + '</li>';
          }
        }
      }
    }
    html += '<li class="textchoice" id="done">done selecting</li>';
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


  playerSelectUnitsInSpaceWithFilter(msg, space, filter_func, mycallback = null, cancel_func = null) {

    let his_self = this;

    let html = '<div class="message">' + msg + '</div>';

    html += '<ul>';
    for (let i = 0; i < space.units.length; i++) {
      for (let z = 0; z < space.units[i].length; z++) {
        if (filter_func(space.units[i][z]) == 1) {
          html += '<li class="textchoice" id="' + key + '">' + key + '</li>';
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
*********************/




  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null) {

    let his_self = this;

    let html = '<div class="message">' + msg + '</div>';

    html += '<ul>';
    for (let key in this.spaces) {
      if (filter_func(this.spaces[key]) == 1) {
        html += '<li class="textchoice" id="' + key + '">' + key + '</li>';
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




  playerTurn(selected_card=null) {

    this.startClock();

    let his_self = this;

    this.resetPlayerTurn(this.game.player);

    this.updateStatusAndListCards(user_message, this.game.deck[0].hand);
    his_self.attachCardboxEvents(function(card) {
      his_self.playerPlayCard(card, this.game.player);
    });


  }

  playerPlayCard(card) {

    let html = `<ul>`;
    html    += `<li class="card" id="ops">play for ops</li>`;
    html    += `<li class="card" id="event">play for event</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions('Playing card:', html, true);
    this.bindBackButtonFunction(() => {
      this.playerTurnCardSelected(card, player);
    });
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "ops") {
        this.playerPlayOps();
        return;
      }
      if (user_choice === "event") {
        this.playerPlayEvent();
        return;
      }
      return;
    });

  }

  async playerPlayOps(card, ops=null) {

    let menu = this.returnActionMenuOptions(this.game.player);
    let faction = this.returnPlayerFaction(this.game.player);
    let faction_key = faction.key;
    if (ops == null) { ops = 2; }

    let html = `<ul>`;
    for (let i = 0; i < menu.length; i++) {
      for (let z = 0; z < menu[i].factions.length; z++) {
        if (menu[i].factions[z] === faction_key) {
	  if (menu[i].cost[z] <= ops) {
            html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
          }
        }
      }
    }
    html    += `<li class="card" id="end_turn">end turn</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`You have ${ops} ops remaining:`, html, false);
    this.attachCardboxEvents(async (user_choice) => {      

      if (user_choice === "end_turn") {
        this.endTurn();
        return;
      }

      for (let z = 0; z < menu[user_choice].factions.length; z++) {
        if (menu[user_choice].factions[z] === faction_key) {
          ops -= menu[user_choice].cost[z];
        }
      }

      await menu[user_choice].fnct(this.game.player);
      if (ops > 0) {
	this.playerPlayOps(card, ops);
      } else {
	this.endTurn();
      }
      return;

    });
  }
  playerPlayEvent(card) {

console.log("playing ops");

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
  async playerMoveFormationInClear(player) {
console.log("2");
return;
  }
  async playerMoveFormationOverPass(player) {
console.log("3");
return;
  }
  async playerNavalMove(player) {
console.log("4");
return;
  }
  async playerBuyMercenary(player) {
console.log("5");
return;
  }
  async playerRaiseRegular(player) {
console.log("6");
return;
  }
  async playerBuildNavalSquadron(player) {
console.log("7");
return;
  }
  async playerAssault(player) {
console.log("8");
return;
  }
  async playerControlUnfortifiedSpace(player) {
console.log("9");
return;
  }
  async playerExplore(player) {
console.log("10");
return;
  }
  async playerColonize(player) {
console.log("11");
return;
  }
  async playerConquer(player) {
console.log("12");
return;
  }
  async playerInitiatePiracyInASea(player) {
console.log("13");
return;
  }
  async playerRaiseCavalry(player) {
console.log("14");
return;
  }
  async playerBuildCorsair(player) {
console.log("15");
return;
  }
  async playerTranslateScripture(player) {
console.log("16");
return;
  }
  async playerPublishTreatise(player) {
console.log("17");
return;
  }
  async playerCallTheologicalDebate(player) {
console.log("");
return;
  }
  async playerBuildSaintPeters(player) {
console.log("");
return;
  }
  async playerBurnBooks(player) {
console.log("");
return;
  }
  async playerFoundJesuitUniversity(player) {
console.log("jesuit");
return;
  }
  async playerPublishTreatise(player) {
console.log("treatise");
return;
  }


