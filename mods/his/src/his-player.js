

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
      players[i].tmp_debaters_committed_reformation = 0;
      players[i].tmp_debaters_committed_translation = 0;
      players[i].tmp_debaters_committed_counter_reformation = 0;
      players[i].tmp_roll_bonus = 0;
      players[i].tmp_roll_first = 0;
      players[i].tmp_roll_modifiers = [];
      players[i].factions = [];
      players[i].factions.push(rf);
      players[i].factions_passed = [];
      players[i].factions_passed.push(false); // faction not passed
      players[i].captured = [];
      players[i].num = i;

      //
      // Each power's VP total is derived from base, special, and bonus VP. 
      // The base VP total is shown in the lower-left of the power card.
      //
      players[i].vp_base = 0;
      players[i].vp_special = 0;
      players[i].vp_bonus = 0;

    }


    if (num == 3) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "france") {
	  players[i].factions.push("ottoman");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 4) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 5) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
      }
    }

    return players;

  }

  //
  // runs each new round
  //
  resetPlayerRound(player_num) {

    this.game.state.tmp_bonus_protestant_translation_german_zone = 0;
    this.game.state.tmp_bonus_protestant_translation_french_zone = 0;
    this.game.state.tmp_bonus_protestant_translation_english_zone = 0;
    this.game.state.tmp_bonus_papacy_burn_books = 0;

    for (let i = 0; i < this.game.state.players_info[player_num-1].factions.length; i++) {
      this.game.state.players_info[player_num-1].factions_passed[i] = false;
    }
  }

  returnPlayerInfoFaction(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	if (this.game.state.players_info[i].factions[z].key == faction) {
	  return this.game.state.players_info[i].factions[z];
	}
      }
    }

    return null;
  }

  //
  // runs each new turn
  //
  resetPlayerTurn(player_num) {

    this.game.state.tmp_reformations_this_turn = [];
    this.game.state.tmp_counter_reformations_this_turn = [];
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
    this.game.state.tmp_papacy_may_specify_debater = 0;
    this.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    this.deactivateDebaters();

    for (let s in this.game.spaces) {
      if (this.game.spaces[s].besieged == 2) {
	this.game.spaces[s].besieged = 1;
      }
      for (let f in this.game.spaces[s].units) {
	for (let z = 0; z < this.game.spaces[s].units[f].length; z++) {
	  this.game.spaces[s].units[f][z].already_moved = 0;
	}
      }
    }

    let p = this.game.state.players_info[(player_num-1)];
    p.tmp_debaters_committed_reformation = 0;
    p.tmp_debaters_committed_translation = 0;
    p.tmp_debaters_committed_counter_reformation = 0;
    p.tmp_roll_bonus = 0;
    p.tmp_roll_first = 0;
    p.tmp_roll_modifiers = [];
    p.has_colonized = 0;
    p.has_explored = 0;
    p.has_conquered = 0;

    this.game.state.field_battle = {};

    this.game.state.active_player = player_num;

  }

  isFactionInPlay(faction) {
    for (let i = 0; i < this.game.players.length; i++) {
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	if (this.game.state.players_info[i].factions[z] === faction) { return 1; }
      }
    }
    return 0;
  }

  returnPlayerOfFaction(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.game.state.players_info[i].factions.includes(faction)) {
	return i+1;
      }
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	let f = this.game.state.players_info[i].factions[z];
        if (this.game.state.activated_powers) {
console.log("faction: " + f);
	  if (this.game.state.activated_powers[f]) {
            if (this.game.state.activated_powers[f].includes(faction)) {
	      return (i+1);
            }
          }
        }
      }
    }
    return 0;
  }


  //
  // 1 hits to destroy everything, opt-in for naval units
  //
  playerAssignHits(faction, spacekey, hits_to_assign, naval_hits_acceptable=0) {

    let his_self = this;
    let space = spacekey;
    try { if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; } } catch (err) {}

    let selectUnitsInterface = function(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface) {

      let msg = "Hits Remaining: " + hits_to_assign;
      let html = "<ul>";
      let targets = 0;

      for (let i = 0; i < space.units[faction].length; i++) {
        if (!units_to_destroy.includes(parseInt(i))) {

	  let is_fodder = true;
          if (space.units[faction][i].land_or_sea === "sea" && naval_hits_acceptable == 0) { is_fodder = false; }
          if (space.units[faction][i].personage == true) { is_fodder = false; }

	  if (is_fodder == true) {
	    targets++;
            html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
          }
	}
      }
      html += "</ul>";

      if (targets <= 0 || hits_to_assign <= 0) {
	this.addMove("destroy_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	this.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        $('.option').off();
        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (units_available[id].type == "regular") { hits_to_assign -= 1; }
	if (units_available[id].type == "mercenary") { hits_to_assign -= 1; }
	if (units_available[id].type == "squadron") { hits_to_assign -= 1; }
	if (units_available[id].type == "corsair") { hits_to_assign -= 1; }
	if (units_available[id].type == "cavalry") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }

  //
  // 2 hits to destroy a squadron, 1 for a corsair
  //
  playerAssignNavalHits(faction, hits_to_assign, spacekey) {

    let his_self = this;
    let space;

    if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
    if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

    let units_available = space.units[faction];
    let units_to_destroy = [];

    let selectUnitsInterface = function(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface) {

      let msg = "Hits Remaining: " + hits_to_assign;
      let html = "<ul>";
      let targets = 0;
      for (let i = 0; i < space.units[faction].length; i++) {
        if (space.units[faction][i].land_or_sea === "sea" || space.units[faction][i].land_or_sea === "both") {
          if (!units_to_destroy.includes(parseInt(i))) {
	    targets++;
            html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
          }
          html += "</ul>";
        }
      }

      if (targets <= 0 || hits_to_assign <= 0) {
	this.addMove("destroy_naval_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	this.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (units_available[id].type == "squadron") { hits_to_assign -= 2; }
	if (units_available[id].type == "corsair") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }


  playerResolveNavalWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFactionControlledPort(faction, spacekey);

    let msg = "Select Winter Port for Naval Units in "+space.name;
    let opt = "";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.addMove("retreat_to_winter_port_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }

  //
  // 2P variant needs automatic determination of where to retreat
  //
  autoResolveWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpaces(faction, spacekey);
    let space = this.game.spaces[spacekey];

    let roll = this.rollDie(res.length);

    // retrea
    let retreat_destination = res[roll-1].key;
    his_self.game.queue.push("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+retreat_destination);

  }


  

  playerResolveWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpaces(faction, spacekey);
    let space = this.game.spaces[spacekey];

    let msg = "Select Winter Location for Units in "+space.name;
    let opt = "";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.addMove("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }


  playerRetainUnitsWithFilter(faction, filter_func, num_to_retain) {

    let units_available = [];
    let units_to_retain = [];

    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
	for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (filter_func(key, i)) {
	    units_available.push({spacekey : key, idx : i});
	  }
	}
      }
    }

    let selectUnitsInterface = function(his_self, units_to_retain, units_available, selectUnitsInterface) {

      let msg = "Select Units to Retain: ";
      let html = "<ul>";
      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = his_self.game.spaces[spacekey].units[faction][units_available[i].idx];
        if (units_to_retain.includes(parseInt(i))) {
          html += `<li class="option" style="font-weight:bold" id="${i}">${units_available[i].name} - (${units_available[i].spacekey})</li>`;
        } else {
          html += `<li class="option" id="${i}">${units_available[i].name} - (${units_available[i].spacekey})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {

console.log("UNITS AVAILABLE: " + JSON.stringify(units_available));
console.log("UNITS TO RETAIN: " + JSON.stringify(units_to_retain));

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit_by_index\t"+faction+"\t"+spacekey+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;

	}


	//
	// add unit to units available
	//
        if (units_to_retain.includes(id)) {
          let idx = units_to_retain.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
	  units_to_retain.push(id);
	}

	//
	// if this is max to retain, we end as well
	//
	if (units_to_retain.length === num_to_retain) {

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit_by_index\t"+faction+"\t"+spacekey+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;
	}
      });
    }

    selectUnitsInterface(his_self, units_to_retain, units_available, selectUnitsInterface);

    return 0;

  }




  returnPlayerFactions(player) {
    return this.game.state.players_info[player-1].factions;
  }


  returnActionMenuOptions(player=null, faction=null, limit="") {

    let menu = [];

if (limit === "build") {

    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Mercenary",
      check : this.canPlayerBuyMercenary,
      fnct : this.playerBuyMercenary,
      category : "build" ,
      img : '/his/img/backgrounds/move/mercenary.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Cavalry",
      check : this.canPlayerRaiseCavalry,
      fnct : this.playerRaiseCavalry,
      category : "build" ,
      img : '/his/img/backgrounds/move/cavalry.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Corsair",
      check : this.canPlayerBuildCorsair,
      fnct : this.playerBuildCorsair,
      category : "build" ,
      img : '/his/img/backgrounds/move/corsair.jpg',
    });

} else {

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Move",
      check : this.canPlayerMoveFormationInClear,
      fnct : this.playerMoveFormationInClear,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_in_clear.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Move over Pass",
      check : this.canPlayerMoveFormationOverPass,
      fnct : this.playerMoveFormationOverPass,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_over_pass.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Move across Sea",
      check : this.canPlayerNavalTransport,
      fnct : this.playerNavalTransport,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_transport.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1],
      name : "Move Ships",
      check : this.canPlayerNavalMove,
      fnct : this.playerNavalMove,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_fleet.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Mercenary",
      check : this.canPlayerBuyMercenary,
      fnct : this.playerBuyMercenary,
      category : "build" ,
      img : '/his/img/backgrounds/move/mercenary.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Cavalry",
      check : this.canPlayerRaiseCavalry,
      fnct : this.playerRaiseCavalry,
      category : "build" ,
      img : '/his/img/backgrounds/move/cavalry.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Corsair",
      check : this.canPlayerBuildCorsair,
      fnct : this.playerBuildCorsair,
      category : "build" ,
      img : '/his/img/backgrounds/move/corsair.jpg',
    });
    if (this.game.players.length == 2) {
      menu.push({
        factions : ['papacy','protestant'] ,
        cost : [1,1,1,1,1,1,1,1,1,1],
        name : "Remove Unrest",
        check : this.canPlayerRemoveUnrest,
        fnct : this.playerRemoveUnrest,
        category : "attack" ,
        img : '/his/img/backgrounds/move/control.jpg',
      });
    }
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Control",
      check : this.canPlayerControlUnfortifiedSpace,
      fnct : this.playerControlUnfortifiedSpace,
      category : "attack" ,
      img : '/his/img/backgrounds/move/control.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Assault",
      check : this.canPlayerAssault,
      fnct : this.playerAssault,
      category : "attack" ,
      img : '/his/img/backgrounds/move/assault.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,2,2],
      name : "Explore",
      check : this.canPlayerExplore,
      fnct : this.playerExplore,
      category : "special" ,
      img : '/his/img/backgrounds/move/explore.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,3,3],
      name : "Colonize",

      fnct : this.playerColonize,
      category : "special" ,
      img : '/his/img/backgrounds/move/colonize.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [4,4,4],
      name : "Conquer",
      check : this.canPlayerConquer,
      fnct : this.playerConquer,
      category : "special" ,
      img : '/his/img/backgrounds/move/conquer.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [2],
      name : "Piracy",
      check : this.canPlayerInitiatePiracyInASea,
      fnct : this.playerInitiatePiracyInASea,
      category : "attack" ,
      img : '/his/img/backgrounds/move/piracy.jpg',
    });
    menu.push({
      factions : ['protestant'],
      cost : [1],
      name : "Translate Scripture",
      check : this.canPlayerTranslateScripture,
      fnct : this.playerTranslateScripture,
      category : "special" ,
      img : '/his/img/backgrounds/move/translate.jpg',
    });
    menu.push({
      factions : ['england','protestant'],
      cost : [3,2],
      name : "Publish Treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
      category : "special" ,
      img : '/his/img/backgrounds/move/printing_press.jpg',
    });
    menu.push({
      factions : ['papacy','protestant'],
      cost : [3,3],
      name : "Convene Debate",
      check : this.canPlayerCallTheologicalDebate,
      fnct : this.playerCallTheologicalDebate,
      category : "special" ,
      img : '/his/img/backgrounds/move/theological_debate.jpg',
    });
    menu.push({
      factions : ['papacy'],
      cost : [1],
      name : "Build Saint Peters",
      check : this.canPlayerBuildSaintPeters,
      fnct : this.playerBuildSaintPeters,
      category : "special" ,
      img : '/his/img/backgrounds/move/saint_peters.png',
    });
    menu.push({
      factions : ['papacy'],
      cost : [2],
      name : "Burn Books",
      check : this.canPlayerBurnBooks,
      fnct : this.playerBurnBooks,
      category : "special" ,
      img : '/his/img/backgrounds/move/burn_books.jpg',
    });
    // Loyola reduces Jesuit University Cost
    let university_founding_cost = 3;
    if (this.canPlayerCommitDebater("papacy", "loyola-debater")) {
      let university_founding_cost = 2;
    }
    menu.push({
      factions : ['papacy'],
      cost : [university_founding_cost],
      name : "Found University",
      check : this.canPlayerFoundJesuitUniversity,
      fnct : this.playerFoundJesuitUniversity,
      category : "special" ,
      img : '/his/img/backgrounds/move/university.png',
    });
}

    //
    // hapsburg options limited in 2P version
    //
    if (this.game.players.length == 2 && faction === "hapsburg") {
      for (let i = menu.length-1; i >= 0; i--) {
	if (menu[i].category == "build") { menu.splice(i, 1); }
	if (menu[i].category == "special") { menu.splice(i, 1); }
	if (menu[i].name === "Move across Sea") { menu.splice(i, 1); }
      }
    } 


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


  playerSelectFactionWithFilter(msg, filter_func, mycallback = null, cancel_func = null) {

    let his_self = this;
    let factions = this.returnImpulseOrder();
    let f = [];

    for (let i = 0; i < factions.length; i++) {
      if (filter_func(factions[i])) { f.push(factions[i]); }
    }

    let html = "<ul>";
    for (let i = 0; i < f.length; i++) {
      html += `<li class="option" id="${f[i]}">${f[i]}</li>`;
    }
    html += "</ul>";

    his_self.updateStatusWithOptions(msg, html);
     
    $('.option').off();
    $('.option').on('click', function () {

      let id = $(this).attr("id");
      $('.option').off();
      mycallback(id);
    });

    return 0;
  }


  playerFactionSelectCardWithFilter(faction, msg, filter_func, mycallback = null, cancel_func = null) {

    let cards = [];
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
      if (filter_func(this.game.deck[0].fhand[faction_hand_idx])) {
	cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
      }
    }

    this.updateStatusAndListCards(msg, cards);
    this.attachCardboxEvents(function(card) {
      mycallback(card, faction);
    });

  }


  countSpacesWithFilter(filter_func) {
    let count = 0;
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) { count++; }
    }
    return count;
  }

  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;

    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    this.theses_overlay.space_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        at_least_one_option = true;
        html += '<li class="option .'+key+'" id="' + key + '">' + key + '</li>';

	//
	// the spaces that are selectable are clickable on the main board (whatever board shows)
	//
	if (board_clickable) {
	  let t = "."+key;
	  document.querySelectorAll(t).forEach((el) => {
	    his_self.addSelectable(el);
	    el.onclick = (e) => {
	      e.stopPropagation();
	      e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	      el.onclick = () => {};
	      $('.option').off();
	      $('.space').off();
	      $('.hextile').off();
              his_self.theses_overlay.space_onclick_callback = null;
	      his_self.removeSelectable();
	      mycallback(key);
	    }
	  });
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      //
      // and remove on-board clickability
      //
      if (board_clickable) {
        for (let key in his_self.game.spaces) {
          if (filter_func(his_self.game.spaces[key]) == 1) {
	    let t = "."+key;
	    document.querySelectorAll(t).forEach((el) => {
	      el.onclick = (e) => {};
	    });
	  }
	}
      }

      his_self.removeSelectable();

      $('.option').off();
      $('.space').off();
      $('.hextile').off();

      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      his_self.theses_overlay.space_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }

  playerSelectSpaceOrNavalSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {
    return this.playerSelectNavalSpaceWithFilter(msg, filter_func, mycallback, cancel_func, board_clickable);
  }

  playerSelectNavalSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let at_least_one_option = false;

    this.theses_overlay.space_onclick_callback = mycallback;

    let html = '';
    html += '<ul class="hide-scrollbar">';
    for (let key in this.game.navalspaces) {
      if (filter_func(this.game.navalspaces[key]) == 1) {
	at_least_one_option = true;
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.querySelectorAll(`.${key}`).forEach((el) => { his_self.addSelectable(el); });
	  document.getElementById(key).onclick = (e) => {
	    $('.option').off();
	    e.stopPropagation();
	    e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	    his_self.removeSelectable();
            his_self.theses_overlay.space_onclick_callback = null;
	    mycallback(key);
	  }
	}
      }
    }
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        at_least_one_option = true;
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.querySelectorAll(`.${key}`).forEach((el) => { his_self.addSelectable(el); });
	  document.getElementById(key).onclick = (e) => { 
	    $('.option').off();
	    e.stopPropagation();
	    e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	    his_self.removeSelectable();
            his_self.theses_overlay.space_onclick_callback = null;
	    mycallback(key);
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      his_self.theses_overlay.space_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }




  playerTurn(faction, selected_card=null) {

    this.startClock();

    let his_self = this;

    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    let can_pass = true;

    let cards = [];
    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length;i++) {
      let c = this.game.deck[0].fhand[faction_hand_idx][i];
      if (c === "001") { can_pass = false; }
      if (c === "002") { can_pass = false; }
      if (c === "003") { can_pass = false; }
      if (c === "004") { can_pass = false; }
      if (c === "005") { can_pass = false; }
      if (c === "006") { can_pass = false; }
      if (c === "007") { can_pass = false; }
      if (c === "008") { can_pass = false; }
      if (c === "009") { can_pass = false; }
      if (c === "010") { can_pass = false; }
      cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
    } // no home card? can pass

    if (this.factions[faction].returnAdminRating() < this.game.deck[0].fhand[faction_hand_idx].length) {
      can_pass = false;
    }
    if (this.game.deck[0].fhand[faction_hand_idx].length == 0) {
      can_pass = true;
    }
    if (can_pass) {
      cards.push("pass");
    }

    this.updateStatusAndListCards("Select a Card: ", cards);
    
    this.attachCardboxEvents((card) => {
      try {
        $('.card').off();
        $('.card img').off();
      } catch (err) {}
      this.playerPlayCard(card, this.game.player, faction);
    });  

  }


  playerFortifySpace(faction, attacker, spacekey) {

    let space = this.game.spaces[spacekey];
    let faction_map = this.returnFactionMap(space, attacker, faction);
    let player = this.returnPlayerOfFaction(faction);

    let his_self = this;
    let units_to_move = [];
    let available_units = [];

    for (f in faction_map) { 
      if (faction_map[f] !== attacker) {
        for (let i = 0; i < space.units[f].length; i++) {
          available_units.push({ faction : f , unit_idx : i });
        }
      }
    }

    let selectUnitsInterface = function(his_self, units_to_move, available_units, selectUnitsInterface) {

      let msg = "Fortification Holds 4 Units: ";
      let html = "<ul>";

      for (let i = 0; i < available_units.length; i++) {
	let tf = available_units[i].faction;
	let tu = space.units[tf][available_units[i].unit_idx];
	if (units_to_move.includes(i)) {
          html += `<li class="option" style="font-weight:bold" id="${i}">* ${tu.name} - ${his_self.returnFactionName(tf)} *</li>`;
	} else {
          html += `<li class="option" style="" id="${i}">${tu.name} - ${his_self.returnFactionName(tf)}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);
     
      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {

	  // faction associative array
	  let fa = {};
	  for (let f in faction_map) { fa[f] = []; };

	  // move in the units
	  for (let i = 0; i < units_to_move.length; i++) {
	    let ui = units_to_move[i];
	    let tf = available_units[ui].faction;
	    let tu = available_units[ui].unit_idx;
	    fa[tf].push(tu);
	  }

	  for (let f in fa) {
	    his_self.addMove("fortify_unit\t"+spacekey+"\t"+f+"\t"+JSON.stringify(fa[f]));
	  }
	  his_self.endTurn();

          return;
	}
        
	units_to_move.push(id);

        selectUnitsInterface(his_self, units_to_move, available_units, selectUnitsInterface);

      });
    };

    selectUnitsInterface(his_self, units_to_move, available_units, selectUnitsInterface);

    return 0;

  }

  playerPlayDiplomacyCard(faction) {

    let p = this.returnPlayerOfFaction(faction);
    let his_self = this;

    this.updateStatusAndListCards("Select Diplomacy Card to Play", this.game.deck[1].hand);
    this.attachCardboxEvents(function(card) {

      this.updateStatus(`Playing ${this.popup(card)}`, this.game.deck[1].hand);
      his_self.addMove("diplomacy_card_event\t"+faction+"\t"+card);
      his_self.addMove("discard_diplomacy_card\t"+faction+"\t"+card);
      his_self.endTurn();
    });

  }

  playerPlayCard(card, player, faction) {
    
    this.cardbox.hide();

    //
    if (card === "pass") {
      let faction_hand_idx = this.returnFactionHandIdx(player, faction);
      // auto updates cards_left (last entry)
      this.addMove("pass\t"+faction+"\t"+this.game.deck[0].fhand[faction_hand_idx].length);
      this.endTurn();
      return;
    }


    //
    // mandatory event cards effect first, then 2 OPS
    //
    if (this.deck[card].type === "mandatory" && this.deck[card].canEvent(this, faction)) {
      this.addMove("remove\t"+faction+"\t"+card);
      this.addMove("ops\t"+faction+"\t"+card+"\t"+2);
      this.addMove("faction_acknowledge\t"+faction+"\t"+this.returnFactionName(faction) + " now plays 2 OPs");
      this.playerPlayEvent(card, faction);
    } else {

      let html = `<ul>`;
      html    += `<li class="card" id="ops">play for ops</li>`;
      if (this.deck[card].canEvent(this, faction)) {
        html    += `<li class="card" id="event">play for event</li>`;
      }
      html    += `</ul>`;

      this.updateStatusWithOptions(`Playing ${this.popup(card)}`, html, true);
      this.bindBackButtonFunction(() => {
        this.playerTurn(faction);
      });
      this.attachCardboxEvents((user_choice) => {
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

  async playerPlayOps(card="", faction, ops=null, limit="") {

    //
    // cards left
    //
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    this.addMove("cards_left\t"+faction+"\t"+this.game.deck[0].fhand[faction_hand_idx].length);


    //
    // discard the card
    //
    if (card != "") {
      this.addMove("discard\t"+faction+"\t"+card);
      if (this.game.deck[0]) {
        if (this.game.deck[0].cards[card]) {
          if (this.game.deck[0].cards[card].ops == ops) {
            this.addEndMove("NOTIFY\t" + this.returnFactionName(faction) + " plays " + this.popup(card) + " for ops");
          }
        }
      }
    }

    let his_self = this;
    let menu = this.returnActionMenuOptions(this.game.player, faction, limit);
    let pfactions = this.returnPlayerFactions(this.game.player);

    if (ops == null) { ops = 2; }
    if (ops == 0) { console.log("OPS ARE ZERO!"); }

    if (this.game.state.activated_powers[faction].length > 0) {

      let html = `<ul>`;
      html    += `<li class="card" id="${faction}">${faction}</li>`;
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
         html    += `<li class="card" id="${this.game.state.activated_powers[faction][i]}">${this.game.state.activated_powers[faction][i]}</li>`;
      }
      html    += `</ul>`;

      let ops_text = `${ops} op`;
      if (ops > 0) { ops_text += 's'; }

      this.updateStatusWithOptions(`Which Faction: ${ops_text}`, html);
      this.attachCardboxEvents(function(selected_faction) {

	//
	// duplicates code below
	//
        let html = `<ul>`;
        for (let i = 0; i < menu.length; i++) {
	  // added ops to check() for naval transport
          if (menu[i].check(this, this.game.player, selected_faction, ops)) {
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

	his_self.menu_overlay.render(menu, this.game.player, selected_faction, ops);

        his_self.updateStatusWithOptions(`${his_self.returnFactionName(faction)}: ${ops} ops remaining`, html, false);
        this.attachCardboxEvents(async (user_choice) => {      

          if (user_choice === "end_turn") {
            this.endTurn();
            return;
          }

	  //
	  // cost of founding depends on Loyola
	  //
	  if (menu[user_choice].name.indexOf("University") != -1) {

	    let default_cost = 3;
    	    if (this.canPlayerCommitDebater("papacy", "loyola-debater")) {

	      let msg = "Commit Loyola to reduce cost to 2 OPs?";
      	      let html = `<ul>`;
              html += `<li class="option" id="commit">commit Loyola (2 OPs)</li>`;
              html += `<li class="option" id="donot">do not commit (3 OPs)</li>`;
	      html += '</ul>';

	      his_self.updateStatusWithOptions(msg, html);
      	      his_self.attachCardboxEvents(async (moar_user_choice) => {      

	        if (moar_user_choice === "commit") {
                  ops -= 2;
                  if (ops > 0) {
 		    his_self.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
		  }
                  his_self.addMove("commit\tpapacy\tloyola-debater");
                  his_self.playerFoundJesuitUniversity(his_self, player, "papacy");
                  return;
		}

		if (moar_user_choice === "donot") {
                  ops -= 3;
		  if (ops > 0) {
 		    his_self.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
                  }
                  his_self.playerFoundJesuitUniversity(his_self, player, "papacy");
                  return;
		}

	      });

	    } else {
              ops -= 3;
	      if (ops > 0) {
 	        his_self.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
              }
              menu[user_choice].fnct(this, this.game.player, selected_faction);
              return;
	    }

	  } else {

	    //
	    // sub-menu to simplify translations / st peters
	    //
	    if (menu[user_choice].name.indexOf("Peters") != -1 || menu[user_choice].name.indexOf("Translate") != -1) {

	      let msg = "How many OPs to Spend: ";
              let html = `<ul>`;
	      let desc = ['one', 'two', 'three', 'four', 'five', 'six'];
              for (let i = 1; i <= ops; i++) {
                html += `<li class="card" id="${i}">${desc[i-1]}>`;
              }
              html += '</ul>';

              this.updateStatusWithOptions(msg, html, false);
              this.attachCardboxEvents(async (uc) => {      

	        let ops_to_spend = parseInt(uc);
	        let ops_remaining = ops - ops_to_spend;

                if (ops_remaining > 0) {
  	          this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops_remaining);
                }
                menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend);
                return;
	      });

	    } else {

              for (let z = 0; z < menu[user_choice].factions.length; z++) {
                if (pfactions.includes(menu[user_choice].factions[z])) {
                  ops -= menu[user_choice].cost[z];
	          z = menu[user_choice].factions.length+1;
                }
              }

              if (ops > 0) {
	        this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit);
              }
              menu[user_choice].fnct(this, this.game.player, selected_faction);
              return;

	    }
	  }
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
                html += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
              }
	      z = menu[i].factions.length+1;
            }
          }
        }
      }

      html    += `<li class="card" id="end_turn">end turn</li>`;
      html    += `</ul>`;

      this.menu_overlay.render(menu, this.game.player, faction, ops);

      this.updateStatusWithOptions(`${this.returnFactionName(faction)}: ${ops} ops remaining`, html, false);
      this.attachCardboxEvents(async (user_choice) => {      

        if (user_choice === "end_turn") {
          this.endTurn();
          return;
        }

	//
	// sub-menu to simplify translations / st peters
	//
	if (menu[user_choice].name.indexOf("Peters") != -1 || menu[user_choice].name.indexOf("Translate") != -1) {

	  let msg = "How many OPs to Spend: ";
          let html = `<ul>`;
	  let desc = ['one', 'two', 'three', 'four', 'five', 'six'];
          for (let i = 1; i <= ops; i++) {
            html += `<li class="card" id="${i}">${desc[i-1]}</li>`;
          }
          html += '</ul>';

          this.updateStatusWithOptions(msg, html, false);
          this.attachCardboxEvents(async (uc) => {      

	    let ops_to_spend = parseInt(uc);
	    let ops_remaining = ops - ops_to_spend;

            if (ops_remaining > 0) {
  	      this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops_remaining);
            }
            menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend);
            return;
	  });

	} else {

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

	}
      });

    }
  }
  playerPlayEvent(card, faction, ops=null) {
    this.addMove("event\t"+faction+"\t"+card);
    this.addMove("discard\t"+faction+"\t"+card);
    this.addMove("counter_or_acknowledge\t" + this.returnFactionName(faction) + " triggers " + this.popup(card) + "\tevent\t"+card);
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

  playerPlayPapacyDiplomacyPhaseSpecialTurn(enemies=[]) {

    let his_self = this;
    let player = this.returnPlayerOfFaction("papacy");
    if (this.game.player != player) { this.updateStatus("ERROR: you are not the papacy"); return; }

    let msg = `End a War? [${JSON.stringify(enemies)}]`;
    let opt = "<ul>";
    opt += `<li class="option" id="yes">yes</li>`;
    opt += `<li class="option" id="no">no</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      $(".option").off();
      let id = $(this).attr('id');

      if (id === "no") {
	his_self.endTurn();
	return 0;
      }

      //
      // otherwise YES
      //
      let msg = `Which Faction?`;
      let opt = "<ul>";
      for (let i = 0; i < enemies.length; i++) {
        opt += `<li class="option" id="${enemies[i]}">${enemies[i]}</li>`;
      }
      opt += '</ul>';

      his_self.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function () {

	let enemy = $(this).attr('id');

        //
        // otherwise YES
        //
        let msg = `How would you like to End the War?`;
        let opt = "<ul>";
	if ((enemy == "hapsburg" && his_self.game.state.excommunicated_faction["hapsburg"] != 1) || (enemy == "france" && his_self.game.state.excommunicated_faction["france"] != 1)) {
          opt += `<li class="option" id="005">Papal Bull</li>`;
	}
        opt += `<li class="option" id="sue">sue for peace</li>`;
        opt += '</ul>';

        his_self.updateStatusWithOptions(msg, opt);

        $(".option").off();
        $(".option").on('click', function () {

	  let method = $(this).attr('id');

	  if (method === "005") {

	    //
	    // excommunicate faction 
	    //
	    his_self.addMove("excommunicate_faction\t"+enemy);

	    //
	    // factions no longer At War
	    //
	    his_self.addMove("unset_enemies\tpapacy\t"+enemy);

	    //
	    // regain control of home space, or draw card
	    //
    	    let msg = `Regain Home Space or Draw Card?`;
    	    let opt = "<ul>";
    	    opt += `<li class="option" id="regain">regain home space</li>`;
    	    opt += `<li class="option" id="draw">draw card</li>`;
    	    opt += '</ul>';

	    his_self.updateStatusWithOptions(msg, opt);

	    $(".option").off();
	    $(".option").on('click', function () {

	      let action2 = $(this).attr('id');

	      if (action2 === "draw") {
                his_self.addMove("hand_to_fhand\t1\t"+his_self.game.player+"\t"+"papacy");
                his_self.addMove(`DEAL\t1\t${his_self.game.player}\t1`);
		his_self.endTurn();
	      }

	      if (action2 === "regain") {

    	        his_self.playerSelectSpaceWithFilter(

                  "Select Home Space to Recapture" ,

        	  function(space) {
	            if (space.home === "papacy" && space.political !== "papacy") {
		      return 1;
		    }
		  },

      		  function(spacekey) {
                    his_self.addMove(`control\tpapacy\t${spacekey}`);
                    his_self.addMove(`withdraw_to_nearest_fortified_space\t${enemy}\t${spacekey}`);
	            his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t{his_self.game.state.protestant_war_winner_wp+1)}`);
		    his_self.endTurn();
		  },

	    	  cancel_func,

	    	  true 

	  	);

	      }

	    });

	  }

	  if (method === "sue") {

	    //
	    // protestants get War Winner 1 VP
	    //
	    his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t{his_self.game.state.protestant_war_winner_wp+1)}`);

	    //
	    // papacy removes 2 units
	    //
            his_self.playerSelectSpaceOrNavalSpaceWithFilter(
              `Select Space to Remove 1st Unit` ,
              function(space) {
	        if (space.units["papacy"].length > 0) { return 1; }
		return 0;
              },
              function(spacekey) {
	        let land_or_sea = "land";
	        let space = null;
	        if (his_self.game.navalspaces[spacekey]) {
	  	  land_or_sea = "sea";
		  space = his_self.game.navalspaces[spacekey];
	        } else {
		  space = his_self.game.spaces[spacekey];
	        }
	        if (space == null) {
		  alert("ERROR: not sure where you clicked - reload to continue");
		  return 1;
	        }
	        let faction_to_destroy = "papacy";
   	        let msg = "Destroy Which Unit: ";
                let unittypes = [];
                let html = '<ul>';
                for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                  if (space.units[faction_to_destroy][i].admin_rating == 0) {
                    if (!unittypes.includes(space.units[faction_to_destroy][i].unittype)) {
                      html += `<li class="option" id="${space.units[faction_to_destroy][i].unittype}">${space.units[faction_to_destroy][i].unittype}</li>`;
                      unittypes.push(space.units[faction_to_destroy][i].unittype);
                    }
                  }
                }
                html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
                $('.option').off();
                $('.option').on('click', function () {
                  let unittype = $(this).attr("id");
                  his_self.removeUnit(faction_to_destroy, spacekey, unittype);
                  his_self.displaySpace(spacekey);
                  his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
	    	  //
	          // papacy removes 2 units
	          //
                  his_self.playerSelectSpaceOrNavalSpaceWithFilter(
                    `Select Space to Remove 1st Unit` ,
                    function(space) {
	              if (space.units["papacy"].length > 0) { return 1; }
		      return 0;
                    },
                    function(spacekey) {
	              let land_or_sea = "land";
	              let space = null;
	              if (his_self.game.navalspaces[spacekey]) {
	  	        land_or_sea = "sea";
		        space = his_self.game.navalspaces[spacekey];
	              } else {
		        space = his_self.game.spaces[spacekey];
	              }
	              if (space == null) {
		        alert("ERROR: not sure where you clicked - reload to continue");
		        return 1;
	              }
	              let faction_to_destroy = "papacy";
   	              let msg = "Destroy Which Unit: ";
                      let unittypes = [];
                      let html = '<ul>';
                      for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                        if (space.units[faction_to_destroy][i].admin_rating == 0) {
                          if (!unittypes.includes(space.units[faction_to_destroy][i].unittype)) {
                            html += `<li class="option" id="${space.units[faction_to_destroy][i].unittype}">${space.units[faction_to_destroy][i].unittype}</li>`;
                            unittypes.push(space.units[faction_to_destroy][i].unittype);
                          }
                        }
                      }
                      html += '</ul>';
                      his_self.updateStatusWithOptions(msg, html);
                      $('.option').off();
                      $('.option').on('click', function () {
                        let unittype = $(this).attr("id");
                        his_self.removeUnit(faction_to_destroy, spacekey, unittype);
                        his_self.displaySpace(spacekey);
                        his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
			let z = false;
                        his_self.addMove("player_play_papacy_regain_spaces_for_vp");
		        his_self.endTurn();
		      });
	            },
	            0 ,
	            1
	          );
		});
	      },
	      0 ,
	      1
	    );
	  }	
	});
      });
    });

    return 0;

  }

  playerPlayPapacyRegainSpacesForVP(faction) {
 
    let spaces = his_self.returnSpacesWithFilter(
      function(spacekey) {
	if (his_self.game.spaces[spacekey].home == "papacy" && his_self.game.spaces[spacekey].political == faction) { return true; }
        return false;
      }
    ); 

    if (spaces.length == 0) {
      his_self.endTurn();
      return;
    }

    let msg = "Do you wish to Regain Home Space for 1 VP: ";
    let opt = "<ul>";
    opt += `<li class="option" id="regain">regain and give VP</li>`;
    opt += `<li class="option" id="skip">skip</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      $(".option").off();
      let id = $(this).attr('id');

      if (id === "skip") {
	his_self.endTurn();
	return;
      }

      if (id === "regain") {
        his_self.playerSelectSpaceWithFilter(

          "Select Home Space to Recapture" ,

          function(space) {
	    if (space.home === "papacy" && space.political !== "papacy") {
	      return 1;
	    }
	  },

      	  function(spacekey) {
            his_self.addMove(`control\tpapacy\t${spacekey}`);
            his_self.addMove(`withdraw_to_nearest_fortified_space\t${faction}\t${spacekey}`);
	    his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t{his_self.game.state.protestant_war_winner_wp+1)}`);
            his_self.addMove("player_play_papacy_regain_spaces_for_vp");
	    his_self.endTurn();
	  },

	  null,

	  true 

        );

      }

    });

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

      let msg = "Spring Deploy from: ";
     
      let opt = "<ul>";
      for (let i = 0; i < viable_capitals.length; i++) {
	opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
      }
      opt += `<li class="option" id="pass">skip</li>`;
      opt += '</ul>';

      this.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function () {

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
              if (his_self.isSpaceConnectedToCapitalSpringDeployment(space, faction)) {
                if (!his_self.isSpaceFactionCapital(space, faction)) {
                  return 1;
		}
              }
            }
            return 0;
          },


          function(destination_spacekey) {

            let space = his_self.spaces[source_spacekey];

	    //
	    // spring deployment doesn't have this, so we wrap the sending/end-move
	    // action in this dummy function so that the same UI can be used for 
	    // multiple movement options, with the normal one including intervention
	    // checks etc.
	    //
	    let selectDestinationInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	      // MOVE THE UNITS
              units_to_move.sort();

              for (let i = 0; i < units_to_move.length; i++) {
                his_self.addMove("move\t"+faction+"\tland\t"+source_spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
              }
              his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" spring deploys to "+his_self.game.spaces[destination_spacekey].name);
              his_self.endTurn();
              return;

	    };

            let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) { 

	      let mobj = {
		space : space ,
		faction : faction ,
		source : source_spacekey ,
		destination : destination_spacekey ,
 	      }
   	      his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

	      let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	      if (faction != his_self.game.state.events.spring_preparations) { if (max_formation_size > 5) { max_formation_size = 5; } }

	      let msg = "Max Formation Size: " + max_formation_size + " units";

              let html = "<ul>";
              for (let i = 0; i < space.units[faction].length; i++) {
                if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
                  if (units_to_move.includes(parseInt(i))) {
                    html += `<li class="option" style="font-weight:bold" id="${i}">* ${space.units[faction][i].name} *</li>`;
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
		  his_self.movement_overlay.hide();
		  selectDestinationInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
                  return;
                }

		//
		// check for max formation size
		//
		let unitno = 0;
		for (let i = 0; i < units_to_move.length; i++) {
		  if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
		  if (unitno >= max_formation_size) { 
		    alert("Maximum Formation Size: " + max_formation_size);
		    return;
		  }
		}

	        if (units_to_move.includes(id)) {
	          let idx = units_to_move.indexOf(id);
	          if (idx > -1) {
  		    units_to_move.splice(idx, 1);
	          }
	        } else {
	          if (!units_to_move.includes(parseInt(id))) {
	            units_to_move.push(parseInt(id));
	          } else {
		    for (let i = 0; i < units_to_move.length; i++) {
		      if (units_to_move[i] === parseInt(id)) {
		        units_to_move.splice(i, 1);
		        break;
		      }
		    }
	          }
	        }

                selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);

              });
            }
            selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
          },

	  null ,

	  true

        );
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
    let spacekey = "";
    let space = null;

	//
	// first define the functions that will be used internally
	//
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

          space = his_self.game.spaces[spacekey];

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
	    destination : "" ,
 	  }
   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (space.units[faction][i].locked == false && (his_self.game.state.events.foul_weather != 1 && space.units[faction][i].already_moved != 1)) {
	        if (units_to_move.includes(parseInt(i))) {
	          html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[faction][i].name}*</li>`;
	        } else {
	          html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	        }
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
	      his_self.movement_overlay.hide();
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    //
	    // check for max formation size
	    //
	    let unitno = 0;
	    for (let i = 0; i < units_to_move.length; i++) {
	      if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
	      if (unitno >= max_formation_size) { 
	        alert("Maximum Formation Size: " + max_formation_size);
	        return;
	      }
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      if (!units_to_move.includes(parseInt(id))) {
	        units_to_move.push(parseInt(id));
	      } else {
		for (let i = 0; i < units_to_move.length; i++) {
		  if (units_to_move[i] === parseInt(id)) {
		    units_to_move.splice(i, 1);
		    break;
		  }
		}
	      }
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	//
	// end select units
	//


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

      function(skey) {

	spacekey = skey;

        let space = his_self.spaces[spacekey];

	//
	// is this a rapid move ?
	//
	let max_formation_size = his_self.returnMaxFormationSize(space.units[faction]);
	let units_in_space = his_self.returnFactionLandUnitsInSpace(faction, space);
	let can_we_quick_move = false;
	if (max_formation_size >= units_in_space) { can_we_quick_move = true; }

	if (can_we_quick_move == true) {

	  let msg = "Choose Movement Option: ";
	  let html = "<ul>";
	  html += `<li class="option" id="auto">move everything (auto)</li>`;
	  html += `<li class="option" id="manual">select units (manual)</li>`;
	  html += "</ul>";
	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

	    $('.option').off();
            let id = $(this).attr("id");

	    if (id === "auto") {

	      for (let i = 0; i < space.units[faction].length; i++) {
		let u = space.units[faction][i];
		if (u.type === "cavalry" || u.type === "regular" || u.type === "mercenary" || u.command_value > 0) {
		  if (u.locked == false && (his_self.game.state.events.foul_weather != 1 || u.already_moved != 1)) { 
		    units_to_move.push(i);
		  } else {
		    his_self.updateLog("Some units unable to auto-move because of Foul Weather");
		  }
		}
	      }
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    if (id === "manual") {
	      //
	      // we have to move manually
	      //
	      selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	      return;
	    }

	  });

	} else {

	  //
	  // we have to move manually
	  //
	  selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  return;

	}
      },

      cancel_func,

      true,

    );

  }

  playerSelectUnitsWithFilterFromSpacesWithFilter(faction, space_filter_func, unit_filter_func, num=1, must_select_max=true, mycallback=null) {

    let his_self = this;
    let selected = [];

    let selectSpacesInterface = function(his_self, selected, selectSpacesInterface) {

      his_self.playerSelectSpaceWithFilter(

        ("Select Space of Unit" + (selected.length+1)),

	space_filter_func,

        function(spacekey) {

	  let options = [];
	  let space = his_self.game.spaces[spacekey];
	  let units = space.units[faction];
	  let num_remaining = num - selected.length;

          for (let i = 0; i < units; i++) {
	    if (unit_filter_func(units[i])) {
	      let add_this_unit = true;
	      for (let z = 0; z < selected.length; z++) {
		if (z.spacekey == spacekey && i === unit_idx) { add_this_unit = false; }
	      }
	      if (add_this_unit == true) {
	        options.push({ spacekey : spacekey, unit : units[i] , unit_idx : i });
	      }
	    }
	  }

  	  his_self.playerSelectOptions(options, num_remaining, false, function(array_of_unit_idxs) {

	    //
	    // selected options copied to selected
	    //
	    for (let i = 0; i < array_of_unit_idxs.length; i++) {
	      let add_this_unit = true;
	      for (let z = 0; z < selected.length; z++) {
		if (selected[z].spacekey == options[array_of_unit_idxs[i]].spacekey && selected[z].unit_idx === array_of_unit_idxs[i]) { add_this_unit = false; }
	      }
	      if (add_this_unit == true) {
		selected.push(options[array_of_unit_idxs[i]]);
	      }
	    }

	    //    
	    // still more needed?    
	    //    
	    let num_remaining = num - selected.length;
	    if (num_remaining > 0) {
	      selectSpacesInterface(his_self, selected, selectSpacesInterface);
	    } else {
	      mycallback(selected);
	    }

	  });
	},

	null,

	true 
      );
    }

    selectSpacesInterface(his_self, selected, selectSpacesInterface);

  }

  playerSelectOptions(options, num=1, must_select_max=true, mycallback=null) {

    let his_self = this;
    let options_selected = [];
    let cancel_func = null;

    let selectOptionsInterface = function(his_self, options_selected, selectOptionsInterface) {

      let remaining = num - options_selected.length;

      let msg = `Select From Options: (${remaining} remaining)`;
      let html = "<ul>";
      for (let i = 0; i < options.length; i++) {
        if (options_selected.includes(parseInt(i))) {
	  html += `<li class="option" style="font-weight:bold" id="${i}">${options[i]}</li>`;
	} else {
          html += `<li class="option" id="${i}">${options[i]}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

          let id = $(this).attr("id");

	  if (id === "end") {
	    if (mycallback != null) {
	      mycallback(options_selected);
	      return;
	    } else {
	      return options_selected;
	    }
	  }

          if (options_selected.includes(id)) {
	    let idx = options_selected.indexOf(id);
	    if (idx > -1) {
  	      options_selected.splice(idx, 1);
	    }
	  } else {
	    if (!options_selected.includes(id)) {
	      options_selected.push(id);
	    } else {
	      for (let i = 0; i < options_selected.length; i++) {
	        if (options_selected[i] === id) {
		  options_selected.splice(i, 1);
		  break;
		}
	      }
	    }
	  }

	  if (options_selected.length == num) {
	    if (mycallback != null) {
	      mycallback(options_selected);
	      return;
	    } else {
	      return options_selected;
	    }
	  }


	  selectOptionsInterface(his_self, options_selected, selectOptionsInterface);
      });

    }

    selectOptionsInterface(his_self, options_selected, selectOptionsInterface);
	
  }


  playerEvaluateNavalRetreatOpportunity(faction, spacekey) {

    let his_self = this;
    let retreat_destination = "";

    let space;
    if (his_self.game.spaces[spacekey]) { space = his_self.game.spaces[spacekey]; }
    if (his_self.game.navalspaces[spacekey]) { space = his_self.game.navalspaces[spacekey]; }

    let neighbours = this.returnNavalAndPortNeighbours(spacekey);
    let retreat_options = 0;
    for (let i = 0; i < neighbours.length; i++) {
      if (this.canFactionRetreatToNavalSpace(faction, neighbours[i])) {
	retreat_options++;
      }
    }

    if (retreat_options == 0) {
      his_self.updateLog("Naval retreat not possible...");
      his_self.endTurn();
      return 0;
    }

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("naval_retreat"+"\t"+faction+"\t"+spacekey+"\t"+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {
      let html = "<ul>";
      for (let i = 0; i < neighbours.length; i++) {
        if (this.canFactionNavalRetreatToSpace(defender, neighbours[i])) {
          html += `<li class="option" id="${neighbours[i]}">${neighbours[i]}</li>`;
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Naval Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });
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



  playerEvaluateBreakSiegeRetreatOpportunity(attacker, spacekey) {

    let his_self = this;
    let retreat_destination = "";
    let space_name = this.game.spaces[spacekey].name;

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("retreat"+"\t"+attacker+"\t"+spacekey+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      let html = "<ul>";
      for (let i = 0; i < space.neighbours.length; i++) {
        if (his_self.canFactionRetreatToSpace(attacker, space.neighbours[i])) {
          html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
        }
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });

    };

    
    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">sacrifice forces</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Break Siege and Retreat: ${space_name}?`, html);
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




  playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey="", defender, is_attacker_loser=false) {

    let his_self = this;
    let retreat_destination = "";
    let space_name = this.game.spaces[spacekey].name;

    let onFinishSelect = function(his_self, destination_spacekey) {
      if (is_attacker_loser) {
        his_self.addMove("retreat"+"\t"+attacker+"\t"+spacekey+"\t"+destination_spacekey);
      } else {
        his_self.addMove("retreat"+"\t"+defender+"\t"+spacekey+"\t"+destination_spacekey);
      }
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      let html = "<ul>";
      for (let i = 0; i < space.neighbours.length; i++) {
	if (is_attacker_loser) {
          if (his_self.canFactionRetreatToSpace(attacker, space.neighbours[i], attacker_comes_from_this_spacekey)) {
            html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	  }
	} else {
          if (his_self.canFactionRetreatToSpace(defender, space.neighbours[i], attacker_comes_from_this_spacekey)) {
            html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	  }
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });

    };

    
    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    if (is_attacker_loser) { 
      html    += `<li class="card" id="skip">sacrifice forces</li>`;
    } else {
      html    += `<li class="card" id="skip">do not retreat</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat from ${space_name}?`, html);
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
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Withdraw Units into Fortification?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "fortify") {
	his_self.addMove("fortification\t"+attacker+"\t"+faction+"\t"+spacekey);
	his_self.endTurn();
        return;
      }
      if (user_choice === "skip") {
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
	  if (space.units[defender][i].locked == false) {
            if (units_to_move.includes(parseInt(i))) {
              html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[defender][i].name}</li>`;
            } else {
              html += `<li class="option" id="${i}">${space.units[defender][i].name}</li>`;
            }
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      let mobj = {
	space : space ,
	faction : defender ,
	source : defender_spacekey ,
	destination : spacekey ,
      }

      his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, onFinishSelect); // no destination interface

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






  playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey) {

    let his_self = this;

    let units_to_move = [];

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("naval_intercept"+"\t"+attacker+"\t"+spacekey+"\t"+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, onFinishSelect) {

      let msg = "Select Units to Intercept: ";
      let space;
      if (his_self.game.spaces[defender_spacekey]) {
        space = his_self.game.spaces[defender_spacekey];
      }
      if (his_self.game.navalspaces[defender_spacekey]) {
        space = his_self.game.navalspaces[defender_spacekey];
      }

      let html = "<ul>";

console.log("units length: " + space.units[defender].length);

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].land_or_sea === "sea" || space.units[defender][i].land_or_sea === "both") {
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




  canPlayerNavalTransport(his_self, player, faction, ops) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (ops < 2) { return 0; }
    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (his_self.game.spaces[spaces_with_infantry[i]].ports.length == 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      }
    }
    
    if (spaces_with_infantry.length == 0) { return 0; }

    for (let i = 0; i < spaces_with_infantry.length; i++) {
      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[i], ops);
      if (dest.length > 0) { return 1; }
    }

    return 0;

  }
  async playerNavalTransport(his_self, player, faction) {

    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (!his_self.game.spaces[spaces_with_infantry[i]].ports.length > 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      }
    }

    let html = `<ul>`;
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      html    += `<li class="option" id="${i}">${spaces_with_infantry[i]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Transport from Which Port?`, html);
    this.attachCardboxEvents(function(user_choice) {

      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[user_choice], ops);
       
      let html = `<ul>`;
      for (let i = 0; i < dest.length; i++) {
        html    += `<li class="option" id="${i}">${dest[i].key} (${desk[i].cost} CP)</li>`;
      }
      html    += `</ul>`;

      his_self.updateStatusWithOptions(`Select Destination:`, html);
      his_self.attachCardboxEvents(function(destination) {
        his_self.endTurn();
      });
    });

  }


  async playerNavalTransport(his_self, player, faction) {
    his_self.endTurn();
    return;
  }

  // 1 = yes, 0 = no / maybe
  canPlayerPlayCard(faction, card) {
    let player = this.returnPlayerOfFaction(faction);
    if (this.game.player == player) { 
      let faction_hand_idx = this.returnFactionHandIdx(player, faction);
      for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
        let c = this.game.deck[0].fhand[faction_hand_idx][i];
  	if (c === card) { return 1; }
      }
    }
    return 0;
  }

  canPlayerCommitDebater(faction, debater) {
  
    if (faction !== "protestant" && faction !== "papacy") { return false; }
   
    if (this.game.state.debater_committed_this_impulse[faction] == 1) { return false; }   

    let already_committed = false;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {

        if (this.game.state.debaters[i].active == 1 && this.game.state.debaters[i].faction === "papacy" && faction === "papacy") {}
        if (this.game.state.debaters[i].active == 1 && this.game.state.debaters[i].faction === "protestant" && faction !== "papacy") { return false; }
        if (this.game.state.debaters[i].committed == 1) { return false; }

        let is_mine = false;

        if (this.game.state.debaters[i].faction === "papacy" && faction === "papacy") {
          is_mine = true;               
        }
        if (this.game.state.debaters[i].faction !== "papacy" && faction === "protestant") {
          is_mine = true;
        }
    
        if (is_mine == true) {
          if (this.game.state.debaters[i].active == 1) { already_comitted = true; }
        }
      }
    }
    return !already_committed;
  } 
    

  canPlayerMoveFormationOverPass(his_self, player, faction) {
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_units.length; i++) {
      if (his_self.game.spaces[spaces_with_units[i]].pass.length > 0) {
        for (let z = 0; z < his_self.game.spaces[spaces_with_units[i]].units[faction].length; z++) {
  	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked == false) {
	    return 1;
	  }
        }
      }
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
	    let any_unlocked_units = false;
	    for (let i = 0; i < spaces.units[z].length; i++) {
	      if (space.units[z][i].locked == false) { any_unlocked_units = true; }
	    }
	    if (any_unlocked_units) { return 1; }
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
              if (space.units[faction][i].locked == false && (his_self.game.state.events.foul_weather != 1 && space.units[faction][i].already_moved != 1)) {
	        if (units_to_move.includes(parseInt(i))) {
	          html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	        } else {
	          html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	        }
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

      true

    );

  }


  canPlayerNavalMove(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    // 2P game, papacy+protestant can move minor + allied naval units during their own turn
    if (his_self.game.players.length == 2) {
      let allies = his_self.returnAllies(faction);
      for (let i = 0; i < allies.length; i++) {
        if (his_self.doesFactionHaveNavalUnitsOnBoard(allies[i])) { return 1; }
      }
    }

    if (his_self.doesFactionHaveNavalUnitsOnBoard(faction)) { return 1; }
    return 0;
  }
  async playerNavalMove(his_self, player, faction) {

    let units_to_move = [];
    let units_available = his_self.returnFactionNavalUnitsToMove(faction);

    let selectUnitsInterface = function(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      let msg = "Select Unit to Move";
      let html = "<ul>";
      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = units_available[i];
        if (units_to_move.includes(parseInt(i))) {
          html += `<li class="option" style="font-weight:bold" id="${i}">${units_available[i].name} (${units_available[i].spacekey} -> ${units_available[i].destination})</li>`;
        } else {
          html += `<li class="option" id="${i}">${units_available[i].name} (${units_available[i].spacekey})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
	  let destinations = {};

console.log("UNITS AVAILABLE: " + JSON.stringify(units_available));
console.log("UNITS TO MOVE: " + JSON.stringify(units_to_move));

	  for (let i = 0; i < units_to_move.length; i++) {
	    let unit = units_available[units_to_move[i]];
	    if (!destinations[unit.destination]) {
	      his_self.addMove("naval_interception_check\t"+faction+"\t"+unit.destination);
	      destinations[unit.destination] = 1;
	    }
	  }


	  let revised_units_to_move = [];
	  let entries_to_loop = units_to_move.length;	
	  for (let z = 0; z < entries_to_loop; z++) {

console.log("z: " + z);

	    let highest_idx = 0;
	    let highest_num = 0;

	    for (let y = 0; y < units_to_move.length; y++) {
console.log("y: " + y);
   	      let unit = units_available[units_to_move[y]];
	      let max_num = unit.idx;
	      let max_idx = y;
	      if (max_num > highest_num) {
		highest_idx = max_idx;
		highest_num = max_num;
	      }
	    }

console.log("highest_idx: " + highest_idx);
console.log("highest_num: " + highest_num);

	    revised_units_to_move.unshift(JSON.parse(JSON.stringify(units_available[units_to_move[highest_idx]])));
	    units_to_move.splice(highest_idx, 1);
	  }

console.log("revised: " + JSON.stringify(revised_units_to_move));

	  //
	  // revised units to move is
	  //
	  for (let i = 0; i < revised_units_to_move.length; i++) {
	    let unit = revised_units_to_move[i];
            his_self.addMove("move\t"+faction+"\tsea\t"+unit.spacekey+"\t"+unit.destination+"\t"+revised_units_to_move[i].idx);
	  }
          his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" shifting naval forces\tnavalmove");
	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.endTurn();
	  return;

	}

console.log("done 2");

	//
	// add unit to units available
	//
        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          if (!units_to_move.includes(parseInt(id))) {
            units_to_move.push(parseInt(id));
            selectDestinationInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
          } else {
            for (let i = 0; i < units_to_move.length; i++) {
              if (units_to_move[i] === parseInt(id)) {
                units_to_move.splice(i, 1);
      	        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
                break;
              }
            }
          }
        }
      });
    }
console.log("done 3");

    let selectDestinationInterface = function(his_self, unit_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      //
      // unit selected will always be last in array
      //
      let unit = units_available[unit_to_move[unit_to_move.length-1]];

console.log("UNIT WE ARE MOVING: " + JSON.stringify(unit));

      let destinations = his_self.returnNavalMoveOptions(unit.spacekey);

      console.log("SELECT DESTINATION INTERFACE: " + JSON.stringify(destinations));

      let msg = "Select Destination";
      let html = "<ul>";
      for (let i = 0; i < destinations.length; i++) {
	let spacekey = destinations[i];
        html += `<li class="option" style="font-weight:bold" id="${spacekey}">${spacekey}</li>`;
      }
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

	unit.destination = id;
        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

      });

    }

    selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

  }

  canPlayerMoveFormationInClear(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    if (spaces_with_units.length > 0) { 
      let any_unlocked_units = false;
      for (let i = 0; i < spaces_with_units.length; i++) {
       for (let z = 0; z < his_self.game.spaces[spaces_with_units[i]].units[faction].length; z++) {
	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked == false) {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  canPlayerBuyMercenary(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  playerBuyMercenary(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Mercenary",

      function(space) {
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
  }

  canPlayerRaiseRegular(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerRaiseRegular(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Regular",

      function(space) {
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerBuildNavalSquadron(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerBuildNavalSquadron(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.ports.length === 0) { return 0; }
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"squadron"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerAssault(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
        if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1) {
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
        if (!his_self.isSpaceControlled(space, faction) && his_self.returnFactionLandUnitsInSpace(faction, space) > 0 && space.besieged == 1) {
          if (his_self.game.spaces[space.key].type === "fortress") {
  	    return 1;
	  }
          if (his_self.game.spaces[space.key].type === "electorate") {
  	    return 1;
	  }
          if (his_self.game.spaces[space.key].type === "key") {
  	    return 1;
	  }
        }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("assault\t"+faction+"\t"+destination_spacekey);
        his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" announces siege of "+his_self.game.spaces[destination_spacekey].name + "\tassault");
        his_self.addMove("RESETCONFIRMSNEEDED\tall");
	his_self.endTurn();
      },

    );
  }

  // 2P requires only that it is in protestant or catholic religious influence
  canPlayerRemoveUnrest(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
console.log("SPACES IN UNREST: " + JSON.stringify(spaces_in_unrest));
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (his_self.game.spaces[spaces_in_unrest[i]].religion == "protestant" && faction == "protestant") { return 1; }
      if (his_self.game.spaces[spaces_in_unrest[i]].religion == "catholic" && faction == "papacy") { return 1; }
    }
console.log("return no");
    return 0;
  }
  canPlayerControlUnfortifiedSpace(his_self, player, faction) {
 
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (!his_self.isSpaceControlled(spaces_in_unrest[i]), faction) { 
	let neighbours = his_self.game.spaces[spaces_in_unrest[i]];
	for (let z = 0; z < neighbours.length; z++) {
	  if (his_self.returnFactionLandUnitsInSpace(faction, neighbours[z]) > 0) {
	    return 1;
	  } 
	}
	if (his_self.returnFactionLandUnitsInSpace(faction, spaces_in_unrest[i]) > 0) {
	  return 1;
	} 
      }
    }
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) { 
	if (his_self.game.spaces[conquerable_spaces[i]].besieged != 1) {
	  return 1;
	}
      } 
    }
    return 0;
  }
  async playerRemoveUnrest(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let spaces_to_fix = [];
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (faction == "protestant" && his_self.game.spaces[spaces_in_unrest[i]].religion == "protestant"){spaces_to_fix.push(spaces_in_unrest[i]);}
      if (faction == "papacy" && his_self.game.spaces[spaces_in_unrest[i]].religion == "catholic"){spaces_to_fix.push(spaces_in_unrest[i]);}
    }

    his_self.playerSelectSpaceWithFilter(

      "Select Space to Remove Unrest:",

      function(space) {
        if (spaces_to_fix.includes(space.key)) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("remove_unrest\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
    return 0;
  }
  canPlayerExplore(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_explored == 0) { return 1; }
    return 0;
  }
  async playerControlUnfortifiedSpace(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let pacifiable_spaces_in_unrest = [];
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (!his_self.isSpaceControlled(spaces_in_unrest[i], faction)) { 
	let neighbours = his_self.game.spaces[spaces_in_unrest[i]];
	for (let z = 0; z < neighbours.length; z++) {
	  if (his_self.returnFactionLandUnitsInSpace(faction, neighbours[z]) > 0) { pacifiable_spaces_in_unrest.push(spaces_in_unrest[i]); } 
	}
	if (his_self.returnFactionLandUnitsInSpace(faction, spaces_in_unrest[i]) > 0) { pacifiable_spaces_in_unrest.push(spaces_in_unrest[i]); } 
      }
    }
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
	conquerable_spaces.splice(i, 1);
	i--;
      }
    }

    his_self.playerSelectSpaceWithFilter(

      "Select Space to Pacify:",

      function(space) {
        if (pacifiable_spaces_in_unrest.includes(space.key)) { return 1; }
        if (conquerable_spaces.includes(space.key) && !his_self.isSpaceControlled(space.key, faction) && !his_self.isSpaceFriendly(space.key, faction)) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("pacify\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
    return 0;
  }
  canPlayerExplore(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_explored == 0) { return 1; }
    return 0;
  }
  async playerExplore(his_self, player, faction) {
    his_self.game.state.players_info[player-1].has_explored = 1;
console.log("10");
return;
  }
  canPlayerColonize(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_conquered == 0) { return 1; }
    return 0;
  }
  async playerColonize(his_self, player, faction) {
    his_self.game.state.players_info[player-1].has_colonized = 1;
console.log("11");
return;
  }
  canPlayerConquer(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_conquered == 0) { return 1; }
    return 0;
  }
  async playerConquer(his_self, player, faction) {
    his_self.game.state.players_info[player-1].has_conquered = 1;
console.log("12");
return;
  }
  canPlayerInitiatePiracyInASea(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (faction === "ottoman" && his_self.game.events.ottoman_piracy_enabled == 1) { return 1; }
    return 0;
  }
  async playerInitiatePiracyInASea(his_self, player, faction) {
console.log("13");
return;
  }
  canPlayerRaiseCavalry(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

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
    if (faction === "protestant") { return 1; }
    return 0;
  }
  async playerTranslateScripture(his_self, player, faction, ops=1) {

    let msg = "Select Work to Translate:";
    let html = '<ul>';

    if (his_self.game.state.translations['new']['german'] < 6) {
      html += '<li class="option german" style="" id="1">German (new testament)</li>';
    }
    if (his_self.game.state.translations['new']['french'] < 6) {
      html += '<li class="option french" style="" id="2">French (new testament)</li>';
    }
    if (his_self.game.state.translations['new']['english'] < 6) {
      html += '<li class="option english" style="" id="3">English (new testament)</li>';
    }
    if (his_self.game.state.translations['full']['german'] < 10 && his_self.game.state.translations['new']['german'] >= 6) {
      html += '<li class="option german" style="" id="4">German (full bible)</li>';
    }
    if (his_self.game.state.translations['full']['french'] < 10 && his_self.game.state.translations['new']['french'] >= 6) {
      html += '<li class="option french" style="" id="5">French (full bible)</li>';
    }
    if (his_self.game.state.translations['full']['english'] < 10 && his_self.game.state.translations['new']['english'] >= 6) {
      html += '<li class="option english" style="" id="6">English (full bible)</li>';
    }
    html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let id = parseInt($(this).attr("id"));
      his_self.language_zone_overlay.hide();

      if (id == 1 || id == 4) {
	his_self.addMove("translation\tgerman\t"+ops);
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in German Language Zone\ttranslation_german_language_zone\tgerman\t"+faction);
      }
      if (id == 2 || id == 5) { 
	his_self.addMove("translation\tfrench\t"+ops); 
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in French Language Zone\ttranslation_french_language_zone\tfrench\t"+faction);
      }
      if (id == 3 || id == 6) { 
	his_self.addMove("translation\tenglish\t"+ops);
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in English Language Zone\ttranslation_english_language_zone\tenglish\t"+faction);
      }
      // we only ask for our own CONFIRMS
      his_self.addMove("RESETCONFIRMSNEEDED\t"+his_self.game.player);
      his_self.endTurn();

    });

  }
  canPlayerPublishTreatise(his_self, player, faction) {
    if (faction === "protestant") { return 1; }
    if (faction === "england") {
      if (his_self.isPersonageOnMap("england", "cranmer") != null) {
	return 1;
      }
    }
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {

    if (faction === "protestant") {

      let msg = "Select Language Zone for Reformation Attempts:";
      let html = '<ul>';
          html += '<li class="option german" style="" id="german">German</li>';
          html += '<li class="option english" style="" id="english">English</li>';
          html += '<li class="option french" style="" id="french">French</li>';
          html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
          html += '<li class="option italian" style="" id="italian">Italian</li>';
          html += '</ul>';

      //
      // show visual language zone selector
      //
      his_self.language_zone_overlay.render();

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        $('.option').off();
        his_self.language_zone_overlay.hide();

        let id = $(this).attr("id");

	if (id === "french" && his_self.canPlayerCommitDebater("protestant", "calvin-debater") && his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {

          let msg = "Use Calvin Debater Bonus +1 Attempt:";
          let html = '<ul>';
          html += '<li class="option" style="" id="calvin-debater">Yes, Commit Calvin</li>';
          html += '<li class="option" style="" id="no">No</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('mouseover', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.show(action2);
            }
          });
          $('.option').on('mouseout', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.hide(action2);
            }
          });
          $('.option').on('click', function () {
            let id = $(this).attr("id");

	    his_self.updateStatus("submitting...");
	    his_self.addMove("hide_overlay\tpublish_treatise\tfrench");
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	    if (id === "calvin-debater") {
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    }
	    his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    his_self.addMove("show_overlay\tpublish_treatise\tfrench");
	    if (id === "calvin-debater") {
	      his_self.addMove("commit\tprotestant\tcalvin_debater\t1");
	    }
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	    his_self.endTurn();

	    return 0;
	  });

	  return 0;
        }


	if (id === "german" && his_self.canPlayerCommitDebater("protestant", "carlstadt-debater") && his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {

          let msg = "Use Carlstadt Debater Bonus +1 Attempt:";
          let html = '<ul>';
          html += '<li class="option" style="" id="carlstadt-debater">Yes, Commit Carlstadt</li>';
          html += '<li class="option" style="" id="no">No</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('mouseover', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.show(action2);
            }
          });
          $('.option').on('mouseout', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.hide(action2);
            }
          });
          $('.option').on('click', function () {
            let id = $(this).attr("id");

	    his_self.updateStatus("submitting...");
	    his_self.cardbox.hide();

	    his_self.addMove("hide_overlay\tpublish_treatise\tgerman");
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	    if (id === "carlstadt-debater") {
	      his_self.addMove("SETVAR\tstate\tevents\tcarlstadt-debater\t0");
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    }
	    his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    his_self.addMove("show_overlay\tpublish_treatise\tgerman");
	    if (id === "carlstadt-debater") {
	      his_self.addMove("commit\tprotestant\tcarlstadt-debater\t1");
	      his_self.addMove("SETVAR\tstate\tevents\tcarlstadt_debater\t1");
	    }
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	    his_self.endTurn();

	    return 0;
	  });

	  return 0;
        }

	his_self.addMove("hide_overlay\tpublish_treatise\t"+id);
	his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.addMove("protestant_reformation\t"+player+"\t"+id);
	his_self.addMove("protestant_reformation\t"+player+"\t"+id);
	his_self.addMove("show_overlay\tpublish_treatise\t"+id);
	his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.endTurn();
      });

    }


    if (faction === "england") {
      let id = "england";
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.endTurn();
    }

    return 0;
  }
  canPlayerCallTheologicalDebate(his_self, player, faction) {
//
// TODO
//
// If all Protestant debaters in a language zone are committed, the Protestant player may not initiate debates in that language zone. Similarly, if all Papal debaters are committed, the Papal player may not initiate debates in any language zone. If none of the Protestant debaters for a language zone have entered the game (or all of them have been burnt at the stake, excommuni- cated, or removed from play), neither player may call a debate in that zone. 
//
    if (his_self.returnNumberOfUncommittedDebaters(faction) <= 0) { return 0; }
    if (his_self.game.state.events.wartburg == 1) { if (faction === "protestant") { return 0; } }
    if (faction === "protestant") { return 1; }
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerCallTheologicalDebate(his_self, player, faction) {

    let msg = "Select Language Zone for Theological Debate:";
    let html = '<ul>';

    if (his_self.returnDebatersInLanguageZone("german", "protestant")) { 
        html += '<li class="option german" style="" id="german">German</li>';
    }
    if (his_self.returnDebatersInLanguageZone("french", "france")) { 
        html += '<li class="option french" style="" id="french">French</li>';
    }
    if (his_self.returnDebatersInLanguageZone("english", "france")) { 
        html += '<li class="option english" style="" id="english">English</li>';
    }
        html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', (e) => {

      $('.option').off();
      let language_zone = e.currentTarget.id;
      let opponent_faction = "protestant";
      if (faction != "papacy") { opponent_faction = "papacy"; }

      let msg = "Against Commited or Uncommited Debater?";
      let html = '<ul>';
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 1)) {
          html += '<li class="option" id="committed">Committed</li>';
      }
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 0)) {
          html += '<li class="option" id="uncommitted">Uncommitted</li>';
      }
      html += '</ul>';

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('mouseover', function () {
        let action2 = $(this).attr("id");
        his_self.cardbox.show(action2);
      });
      $('.option').on('mouseout', function () {
        let action2 = $(this).attr("id");
        his_self.cardbox.hide(action2);
      });
      $('.option').on('click', function () {

        let committed = $(this).attr("id");

        his_self.language_zone_overlay.hide();

        if (committed === "committed") { committed = 1; } else { committed = 0; }

        if (faction === "papacy") {
	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+committed);
        } else {
    	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tProtestants call a theological debate\tdebate");
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
    	  his_self.addMove("pick_first_round_debaters\tprotestant\tpapacy\t"+language_zone+"\t"+committed);
        }
        his_self.endTurn();

      });
    });

    return 0;

  }
  canPlayerBuildSaintPeters(his_self, player, faction) {
    if (faction === "papacy") {
      if (his_self.game.state.saint_peters_cathedral['vp'] < 5) { return 1; }
    }
    return 0;
  }
  async playerBuildSaintPeters(his_self, player, faction, ops=1) {
    for (let z = 0; z < ops; z++) {
      his_self.addMove("build_saint_peters\t"+player+"\t"+faction);
    }
    his_self.endTurn();
    return 0;
  }
  canPlayerBurnBooks(his_self, player, faction) {
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerBurnBooks(his_self, player, faction) {

    let msg = "Select Language Zone for Counter Reformations";
    let html = '<ul>';
        html += '<li class="option german" style="" id="german">German</li>';
        html += '<li class="option english" style="" id="english">English</li>';
        html += '<li class="option french" style="" id="french">French</li>';
        html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
        html += '<li class="option italian" style="" id="italian">Italian</li>';
        html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      $('.option').off();
      his_self.language_zone_overlay.hide();
      let id = $(this).attr("id");

      if ((his_self.canPlayerCommitDebater("papacy", "cajetan-debater") || his_self.canPlayerCommitDebater("papacy", "tetzel-debater") || his_self.canPlayerCommitDebater("papacy", "caraffa")) && his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {

        let msg = "Commit Debater for Burn Books Bonus:";
        let html = '<ul>';
        html += '<li class="option" style="" id="no">No</li>';
	if (his_self.canPlayerCommitDebater("papacy", "tetzel-debater")) {
          html += '<li class="option" style="" id="tetzel-debater">Tetzel +1 to St Peters</li>';
	}
	if (his_self.canPlayerCommitDebater("papacy", "cajetan-debater")) {
          html += '<li class="option" style="" id="cajetan-debater">Cajetan +1 Attempt</li>';
	}
	if (his_self.canPlayerCommitDebater("papacy", "caraffa-debater")) {
          html += '<li class="option" style="" id="caraffa-debater">Caraffa +1 Attempt</li>';
        }
	html += '</ul>';

        his_self.updateStatusWithOptions(msg, html);

        $('.option').off();
        $('.option').on('mouseover', function () {
          let action2 = $(this).attr("id");
          if (his_self.debaters[action2]) {
            his_self.cardbox.show(action2);
          }
        });
        $('.option').on('mouseout', function () {
          let action2 = $(this).attr("id");
          if (his_self.debaters[action2]) {
            his_self.cardbox.hide(action2);
          }
        });
        $('.option').on('click', function () {
          let id2 = $(this).attr("id");

	  his_self.cardbox.hide();

	  if (id2 === "tetzel-debater") {
            his_self.addMove("build_saint_peters");
            his_self.addMove("commit\tpapacy\ttetzel-debater");
	  }

	  his_self.addMove("hide_overlay\tburn_books\t"+id);
	  his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	  if (id2 === "cajetan-debater" || id2 === "caraffa-debater") {
	    if (id2 === "cajetan-debater") { his_self.addMove("commit\tpapacy\tcajetan-debater"); }
	    if (id2 === "caraffa-debater") { his_self.addMove("commit\tpapacy\tcaraffa-debater"); }
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	  }
          his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
          his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	  his_self.addMove("show_overlay\tburn_books\t"+id);
	  his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	  his_self.endTurn();

	  return 0;
	});

	return 0;
      }

      his_self.addMove("hide_overlay\tburn_books\t"+id);
      his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
      his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
      his_self.addMove("show_overlay\tburn_books\t"+id);
      his_self.endTurn();
    });

    return 0;
  }
  canPlayerFoundJesuitUniversity(his_self, player, faction) {
    if (faction === "papacy" && his_self.game.state.events.papacy_may_found_jesuit_universities == 1) { return 1; }
    return 0;
  }
  async playerFoundJesuitUniversity(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Catholic-Controlled Space for Jesuit University",

      function(space) {
        if (space.religion === "catholic" &&
            space.university != 1) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.addMove("found_jesuit_university\t"+destination_spacekey);
	his_self.endTurn();
      },

    );

    return 0;
  }

  playerPlaceUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;

    his_self.playerSelectSpaceWithFilter(

      `Place ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {
        
	his_self.addUnit(faction, spacekey, unittype);
	his_self.displaySpace(spacekey);
        his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerPlaceUnitsInSpaceWithFilter(unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}
      },

      cancel_func ,

      board_clickable 
    );
  }


  playerRemoveUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;

    his_self.playerSelectSpaceWithFilter(

      `Remove ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {

	his_self.removeUnit(faction, spacekey, unittype);
        his_self.addMove("remove_unit\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+this.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerRemoveUnitsInSpaceWithFilter(msg, unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}

      },

      cancel_func 

    );
  }

  playerAddUnrest(his_self, faction="", zone="", religion="") {

    his_self.playerSelectSpaceWithFilter(
      "Select Space to add Unrest" ,
      function(space) {
        if (space.language === zone && space.religion === religion) { return 1; }
      },
      function(spacekey) {
        his_self.addMove(`unrest\t${spacekey}`);
        his_self.endTurn();
      },
      null,
      true 
    );

  }


