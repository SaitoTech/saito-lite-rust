
  cancelBackButtonFunction() {
    this.hud.back_button = false;
    this.hud.back_button_callback = null;
  }       
  unbindBackButtonFunction() {
    this.cancelBackButtonFunction();
  } 
  bindBackButtonFunction(mycallback) {
    // we bind before we update UI, so this should remove any outstanding options
    this.removeSelectable();
    this.hud.back_button = true;
    this.hud.back_button_callback = mycallback;
  }   

  returnArrayOfPlayersInFieldBattle() {
    if (this.game.state.field_battle.spacekey) {
      return this.returnArrayOfPlayersInSpacekey(this.game.state.field_battle.spacekey);
    }
    return this.game.players;
  }

  returnArrayOfPlayersInAssault() {
    if (this.game.state.assault.spacekey) {
      return this.returnArrayOfPlayersInSpacekey(this.game.state.assault.spacekey);
    }
    return this.game.players;
  }

  returnUsername(publickey) {
    let f = this.returnFactionOfPublickey(publickey);
    if (f != "") { return this.returnFactionName(f); }
    return this.app.keychain.returnUsername(publickey);
  }

  returnFactionOfPublickey(publickey) {
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] == publickey) {
	if (!this.game.state) { return ""; }
	if (!this.game.state.players_info) { return ""; }
	if (!this.game.state.players_info[i]) { return ""; }
	if (!this.game.state.players_info[i].factions) { return ""; }
 	return this.game.state.players_info[i].factions[0];
      }
    }
    return "";
  }

  returnPublicKeyOfFaction(faction="") {
    let p = this.returnPlayerCommandingFaction(faction);
    if (p <= 0) { return ""; }
    return this.game.players[p-1];
  }


  returnArrayOfPlayersInSpacekey(spacekey="") {
    let res = [];
    let s = this.game.spaces[spacekey];
    if (s) {
      for (let key in s.units) {
        if (s.units[key].length > 0) {
          let p = this.returnPlayerCommandingFaction(key);
          if (p > 0 && !res.includes(this.game.players[p-1])) {
            res.push(this.game.players[p-1]);
          }
        }
      }
    }
    if (res.length > 0) { return res; }
    return this.game.players;
  }

  returnArrayOfPlayersInNavalSpacekey(spacekey="") {
    let res = [];
    let s = this.game.navalspaces[spacekey];
    if (s) {
      for (let key in s.units) {
        if (s.units[key].length > 0) {
          let p = this.returnPlayerCommandingFaction(key);
          if (p > 0 && !res.includes(this.game.players[p-1])) {
            res.push(this.game.players[p-1]);
          }
        }
      }
    }
    if (res.length > 0) { return res; }
    return this.game.players;
  }

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
	if (key !== "protestant" && key !== "france" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 4) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "france" && key !== "ottoman" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }


    let f = [];
    if (factions["protestant"]) { f.push("protestant"); }
    if (factions["papacy"]) { f.push("papacy"); }
    if (factions["hapsburg"]) { f.push("hapsburg"); }
    if (factions["ottoman"]) { f.push("ottoman"); }
    if (factions["france"]) { f.push("france"); }
    if (factions["england"]) { f.push("england"); }

    for (let i = 0; i < num; i++) {

      let rf = "";
      
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

      if (rf === "" || rf === "undefined") {
        let dr = this.rollDice(f.length) - 1;
	rf = f[dr];
      }

      for (let z = 0; z < f.length; z++) {
	if (f[z] === rf) {
	  f.splice(z, 1);
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

      players[i].active_faction = players[i].factions[0];
      players[i].active_faction_idx = 0;

    }


    if (num == 3) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] == "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] == "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] == "france") {
	  players[i].factions.push("ottoman");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 4) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] == "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] == "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 5) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] == "protestant") {
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
	  if (this.game.state.activated_powers[f]) {
            if (this.game.state.activated_powers[f].includes(faction)) {
	      return (i+1);
            }
          }
        }
      }
    }
    let z = this.returnPlayerCommandingFaction(faction);
    if (z) { return this.game.state.players_info[z-1]; }
    return 0;
  }


  //
  // 1 hits to destroy everything, opt-in for naval units
  //
  playerAssignHits(faction, spacekey, hits_to_assign, naval_hits_acceptable=0) {

    let his_self = this;
    let space = spacekey;
    try { if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; } } catch (err) {}

    units_to_destroy = [];
    units_available = [];

    for (let f in space.units) {
      if (f == faction || this.isAlliedMinorPower(f, faction)) {
        for (let i = 0; i < space.units[f].length; i++) {
          if (space.units[f][i].type === "regular")   { units_available.push(space.units[f][i]); }
          if (space.units[f][i].type === "mercenary") { units_available.push(space.units[f][i]); }
          if (space.units[f][i].type === "cavalry")   { units_available.push(space.units[f][i]); }
        }
      }
    } 

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
	his_self.addMove("destroy_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	his_self.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        $('.option').off();
        let id = $(this).attr("id");

	his_self.updateStatus("assign hit...");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (space.units[faction][id].type == "regular") { hits_to_assign -= 1; }
	if (space.units[faction][id].type == "mercenary") { hits_to_assign -= 1; }
	if (space.units[faction][id].type == "squadron") { hits_to_assign -= 1; }
	if (space.units[faction][id].type == "corsair") { hits_to_assign -= 1; }
	if (space.units[faction][id].type == "cavalry") { hits_to_assign -= 1; }

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
      let one_hit_targets = false;
      for (let i = 0; i < space.units[faction].length; i++) {
        if (space.units[faction][i].land_or_sea === "sea" || space.units[faction][i].land_or_sea === "both") {
	  if (space.units[faction][i].personage == false) {
            if (!units_to_destroy.includes(parseInt(i))) {
  	      targets++;
	      if (space.units[faction][i].type === "squadron") {
                html += `<li class="option" id="${i}">${space.units[faction][i].name} (2 hits)</li>`;
              } else {
                html += `<li class="option" id="${i}">${space.units[faction][i].name} (1 hit)</li>`;
		one_hit_targets = true;
	      }
            }
            html += "</ul>";
          }
        }
      }

      if (targets <= 0 || hits_to_assign <= 0 || (hits_to_assign == 1 && one_hit_targets == false)) {
	his_self.addMove("destroy_naval_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	his_self.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

	his_self.updateStatus("assigning hits");

        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

        if (space.units[faction][id].type == "squadron") { hits_to_assign -= 2; }
        if (space.units[faction][id].type == "corsair") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    his_self.naval_battle_overlay.assignHits(his_self.game.state.naval_battle, faction);
    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }


  playerResolveNavalWinterRetreat(faction, spacekey) {

    let his_self = this;
    let space = null;
    if (his_self.game.spaces[spacekey]) { space = his_self.game.spaces[spacekey]; }
    if (his_self.game.navalspaces[spacekey]) { space = his_self.game.navalspaces[spacekey]; }

    let res = this.returnNearestFactionControlledPorts(faction, spacekey);

    let msg = this.returnFactionName(faction) + " - Select Winter Port for Naval Units in "+space.name;
    let opt = "<ul>";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }
    opt += "</ul>";

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let id = $(this).attr('id');
      $(".option").off();
      his_self.updateStatus("wintering ships");

      his_self.addMove("retreat_to_winter_ports_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }

  //
  // 2P variant needs automatic determination of where to retreat
  //
  autoResolveWinterRetreat(faction, spacekey) {
    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpacesTransitPasses(faction, spacekey);
    if (res.length > 0) {
      let space = this.game.spaces[spacekey];
      let roll = this.rollDice(res.length);
      if (res[roll-1].hops > 0) {
        let retreat_destination = res[roll-1].key;
        his_self.game.queue.push("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+retreat_destination);
      }
    }
  }

  playerResolveWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpaces(faction, spacekey);
    let space = this.game.spaces[spacekey];

    let msg = this.returnFactionName(faction) + " - Select Winter Location for Units in "+space.name;
    let opt = "<ul>";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }
    opt += "</ul>";

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.updateStatus("handling retreat...");
      his_self.addMove("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }

  playerRetainUnitsWithFilter(faction, filter_func, num_to_retain) {

    let his_self = this;
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
          html += `<li class="option" style="font-weight:bold" id="${i}">* ${unit.type} - ${units_available[i].spacekey} *</li>`;
        } else {
          html += `<li class="option" id="${i}">${unit.type} - ${units_available[i].spacekey}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");

        if (id === "end") {

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length-1; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit_by_index\t"+faction+"\t"+units_available[i].spacekey+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;

	}

	id = parseInt(id);

	//
	// add unit to units available
	//
        if (units_to_retain.includes(id)) {
          let idx = units_to_retain.indexOf(id);
          if (idx > -1) {
            units_to_retain.splice(idx, 1);
          }
        } else {
	  units_to_retain.push(id);
	}

	//
	// if this is max to retain, we end as well
	//
	if (units_to_retain.length === num_to_retain) {

	  his_self.updateStatus("submitting...");

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length-1; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit_by_index\t"+faction+"\t"+units_available[i].spacekey+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;
	}

        selectUnitsInterface(his_self, units_to_retain, units_available, selectUnitsInterface);

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

if (faction === "france" && this.game.state.events.scots_raid == 1) {
    menu.push({
      factions : ['scotland'],
      cost : [2],
      name : "Regular",
      check : this.canPlayerBuyRegular,
      fnct : this.playerBuyRegular,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['scotland'],
      cost : [2],
      name : "Squadron",
      check : this.canPlayerBuyNavalSquadron,
      fnct : this.playerBuyNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['france','scotland'],
      cost : [1,1],
      name : "Move",
      check : this.canPlayerMoveFormationInClear,
      fnct : this.playerMoveFormationInClear,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_in_clear.jpg',
    });
    menu.push({
      factions : ['france','scotland'],
      cost : [1,1],
      name : "Control",
      check : this.canPlayerControlUnfortifiedSpace,
      fnct : this.playerControlUnfortifiedSpace,
      category : "attack" ,
      img : '/his/img/backgrounds/move/control.jpg',
    });
    menu.push({
      factions : ['france', 'scotland'],
      cost : [0,0],
      name : "Assault",
      check : this.canPlayerAssaultTutorial,
      fnct : this.playerAssaultTutorial,
      category : "attack" ,
      img : '/his/img/backgrounds/move/assault.jpg',
    });
    menu.push({
      factions : ['france', 'scotland'],
      cost : [1,1],
      name : "Assault",
      check : this.canPlayerAssault,
      fnct : this.playerAssault,
      category : "attack" ,
      img : '/his/img/backgrounds/move/assault.jpg',
    });
} else {
if (limit === "build") {
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Mercenary",
      check : this.canPlayerBuyMercenaryOverLimit,
      fnct : this.playerBuyMercenaryOverLimit,
      category : "build" ,
      img : '/his/img/backgrounds/move/mercenary.jpg',
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
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerBuyRegularOverLimit,
      fnct : this.playerBuyRegularOverLimit,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerBuyRegular,
      fnct : this.playerBuyRegular,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Squadron",
      check : this.canPlayerBuyNavalSquadron,
      fnct : this.playerBuyNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Cavalry",
      check : this.canPlayerBuyCavalry,
      fnct : this.playerBuyCavalry,
      category : "build" ,
      img : '/his/img/backgrounds/move/cavalry.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Corsair",
      check : this.canPlayerBuyCorsair,
      fnct : this.playerBuyCorsair,
      category : "build" ,
      img : '/his/img/backgrounds/move/corsair.jpg',
    });

} else {

    //
    // only burning books and theological debates
    //
    if (limit === "mary_i") {
      menu.push({
        factions : ['papacy','protestant'],
        cost : [3,3],
        name : "Convene Debate",
        check : this.canPlayerCallTheologicalDebateMaryI,
        fnct : this.playerCallTheologicalDebateMaryI,
        category : "special" ,
        img : '/his/img/backgrounds/move/theological_debate.jpg',
      });
      menu.push({
        factions : ['papacy'],
        cost : [2],
        name : "Burn Books",
        check : this.canPlayerBurnBooksMaryI,
        fnct : this.playerBurnBooksMaryI,
        category : "special" ,
        img : '/his/img/backgrounds/move/burn_books.jpg',
      });
    } else {

    menu.push({
      factions : ['hapsburg','england','france','papacy','ottoman','protestant'],
      cost : [0,0,0,0,0,0],
      name : "First Game / Need Help?",
      check : this.canPlayerShowTutorial,
      fnct : this.playerShowTutorial,
      category : "move" ,
      img : '/his/img/backgrounds/move/help.jpeg',
    });
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
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Move Across Sea",
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
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Mercenary",
      check : this.canPlayerBuyMercenaryOverLimit,
      fnct : this.playerBuyMercenaryOverLimit,
      category : "build" ,
      img : '/his/img/backgrounds/move/mercenary.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Regular",
      check : this.canPlayerBuyRegularOverLimit,
      fnct : this.playerBuyRegularOverLimit,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerBuyRegular,
      fnct : this.playerBuyRegular,
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
      check : this.canPlayerBuyCavalry,
      fnct : this.playerBuyCavalry,
      category : "build" ,
      img : '/his/img/backgrounds/move/cavalry.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Squadron",
      check : this.canPlayerBuyNavalSquadron,
      fnct : this.playerBuyNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Corsair",
      check : this.canPlayerBuyCorsair,
      fnct : this.playerBuyCorsair,
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
    } else {
      menu.push({
        factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
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
      factions : ['ottoman','england'],
      cost : [1,1],
      name : "Foreign War",
      check : this.canPlayerFightForeignWar,
      fnct : this.playerFightForeignWar,
      category : "attack" ,
      img : '/his/img/backgrounds/move/foreign-war2.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [0,0,0,0,0,0,0,0,0,0],
      name : "Assault",
      check : this.canPlayerAssaultTutorial,
      fnct : this.playerAssaultTutorial,
      category : "attack" ,
      img : '/his/img/backgrounds/move/assault.jpg',
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
      check : this.canPlayerColonize,
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
if (this.game.state.events.cranmer_active == 1) {
  if (this.game.state.events.cromwell != 0) {
    menu.push({
      factions : ['england','protestant'],
      cost : [2,2],
      name : "Publish Treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
      category : "special" ,
      img : '/his/img/backgrounds/move/printing_press.jpg',
    });
  } else {
    menu.push({
      factions : ['england','protestant'],
      cost : [3,2],
      name : "Publish Treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
      category : "special" ,
      img : '/his/img/backgrounds/move/printing_press.jpg',
    });
  }
} else {
    menu.push({
      factions : ['protestant'],
      cost : [2],
      name : "Publish Treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
      category : "special" ,
      img : '/his/img/backgrounds/move/printing_press.jpg',
    });
}
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
if (this.game.state.events.society_of_jesus == 1) {
    // Loyola reduces Jesuit University Cost
    let university_founding_cost = 3;
    if (this.canPlayerCommitDebater("papacy", "loyola-debater") || parseInt(this.game.state.loyola_bonus_active) == 1) {
      university_founding_cost = 2;
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
    } // mary_i limit check
}
} // scots raid

    //
    // major powers have limited options in 2P version
    //
    if (this.game.players.length == 2 && (faction === "hapsburg" || faction === "england" || faction === "france" || faction == "ottoman")) {
      for (let i = menu.length-1; i >= 0; i--) {
	if (menu[i].category == "build") {
	  if (faction != this.game.state.events.foreign_recruits && this.game.player_last_card != "076") { menu.splice(i, 1); }
	} else {
	    if (menu[i].category == "special") { menu.splice(i, 1); } else {
  	    if (menu[i].name === "Move across Sea") { menu.splice(i, 1); }
          }
        }
      }
    } 

    if (player == null) { return menu; }

    let fmenu = [];

    for (let i = 0; i < menu.length; i++) {
      if (menu[i].factions.includes(faction)) {
        fmenu.push(menu[i]);
      }
    }

    return fmenu;

  }

  playerSelectFactionWithFilter(msg, filter_func, mycallback = null, cancel_func = null, permit_no_selection = false) {

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
    if (permit_no_selection){ html += `<li class="option" id="none">none</li>`; }
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

  playerSelectCardFromArrayWithFilter(msg, cardarray=[], filter_func, mycallback = null, cancel_func = null, permit_no_selection = false) {

    let cards = [];

    for (let i = 0; i < cardarray.length; i++) {
      if (filter_func(cardarray[i])) {
	cards.push(cardarray[i]);
      }
    }

    if (permit_no_selection) {
      cards.push("pass");
    }

    this.updateStatusAndListCards(msg, cards);
    this.attachCardboxEvents(function(card) {
      mycallback(card);
    });

  }

  countSpacesWithFilter(filter_func) {
    let count = 0;
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) { count++; }
    }
    return count;
  }

  playerFactionSelectCardWithFilter(faction, msg, filter_func, mycallback = null, cancel_func = null, permit_no_selection = false) {

    let cards = [];
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
      if (filter_func(this.game.deck[0].fhand[faction_hand_idx][i])) {
	cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
      }
    }

    if (permit_no_selection) {
      cards.push("pass");
    }

    this.updateStatusAndListCards(msg, cards);
    this.attachCardboxEvents(function(card) {
      if (card == "pass") {
	this.cardbox.hide();
      }
      mycallback(card, faction);
    });

  }

  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.option').off();
    $('.hextile').off();
    $('.space').off();

    this.theses_overlay.space_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {

        at_least_one_option = true;
        html += '<li class="option '+key+'" id="' + key + '">' + his_self.returnSpaceName(key) + '</li>';

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
    	      if (callback_run == false) {
	        callback_run = true;
	        mycallback(key);
	      }
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

      let action = $(this).attr("id");

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

      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      his_self.theses_overlay.space_onclick_callback = null;
      his_self.theses_overlay.remove();
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
    let callback_run = false;

    this.theses_overlay.space_onclick_callback = mycallback;

    // remove any previous events
    $('.option').off();
    $('.hextile').off();
    $('.space').off();

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
     	    $('.hextile').off();
    	    $('.space').off();
	    if (callback_run == true) { return; }
	    callback_run = true;
	    e.stopPropagation();
	    e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	    his_self.removeSelectable();
            his_self.theses_overlay.space_onclick_callback = null;
    	    if (callback_run == false) {
	      callback_run = true;
    	      his_self.updateStatus("selected...");
	      mycallback(key);
	    }
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
	    document.getElementById(key).onclick = (e) => {};
	    $('.option').off();
     	    $('.hextile').off();
    	    $('.space').off();
	    if (callback_run == true) { return; }
	    callback_run = true;
	    e.stopPropagation();
	    e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	    his_self.removeSelectable();
            his_self.theses_overlay.space_onclick_callback = null;
    	    his_self.updateStatus("selected...");
	    mycallback(key);
	    return;
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

      // remove events to prevent re-firing
      $('.option').off();
      $('.hextile').off();
      $('.space').off();

      his_self.removeSelectable();

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

    //   
    // back button should return us here, so unbind if here
    //
    this.unbindBackButtonFunction();

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
      try {
        if (this.game.deck[0].cards[c].type == "mandatory") { can_pass = false; }
      } catch (err) {
	// cards removed by other cards -- force play to remove from deck
	can_pass = false;
      }

    } // no home card? can pass

    if (this.factions[faction].returnAdminRating(this) < this.game.deck[0].fhand[faction_hand_idx].length) {
      can_pass = false;
    }

    if (this.game.deck[0].fhand[faction_hand_idx].length == 0) {

      can_pass = true;
      if (!cards.includes("pass")) {
        cards.push("pass");
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
      if (this.faster_play == 1) {
          
        //
        // we don't need to HALT the game because the game will not progress
        // until all players have hit RESOLVE anyway.
        //
        let my_specific_game_id = his_self.game.id;
        his_self.halted = 1;
        his_self.game.queue[his_self.game.queue.length-1] = "HALTED\tWaiting for Game to Continue\t"+his_self.publicKey;
        his_self.hud.back_button = false;
              
        his_self.updateStatusAndListCards(his_self.returnFactionName(faction) + " - You Must Pass", cards);
        his_self.attachCardboxEvents((card) => {
          try {
            $('.card').off();
            $('.card img').off();
          } catch (err) {}

          his_self.game = his_self.loadGame(my_specific_game_id);
            
          // tell game engine we can move
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

        //
        // halt my game (copies from ACKNOWLEDGE)
        //
        his_self.addMove("pass\t"+faction+"\t0"); // 0 => no cards in hand
        his_self.endTurn();
        return 0;

      }
    }
    if (can_pass) {
      if (!cards.includes("pass")) {
        cards.push("pass");
      }
    }

    this.updateStatusAndListCards(this.returnFactionName(faction) + " - Select Your Card: ", cards);
    this.attachCardboxEvents((card) => {
      try {
        $('.card').off();
        $('.card img').off();
      } catch (err) {}
      this.game_help.hide();

      //
      //
      //
      if (card == "pass") {
        this.playerPlayCard(card, this.game.player, faction);
	return 1;
      }


      //
      // sanity check mandatory cards if we need confirm
      //
      if (this.confirm_moves && this.game.deck[0].cards[card].type == "mandatory") {

	let c = confirm("Play Mandatory Card?");
	if (c) {
          //
          // if faction is England and Mary I is ruler, we have 50% 
          //
          if (this.game.players.length > 2 && faction == "england" && this.game.state.leaders.mary_i == 1 && this.game.deck[0].cards[card].ops >= 2) {
  	    this.addMove("decide_if_mary_i_subverts_protestantism_in_6P\t"+card);
          }

          if (this.game.players.length == 2 && faction == "protestant" && this.game.state.leaders.mary_i) {
	    this.addMove("decide_if_mary_i_subverts_protestantism_in_2P");
          }

          //
          // set back button to move us back here
          //
          let his_self = this;
          his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.playerTurn(faction, selected_card); });
          this.playerPlayCard(card, this.game.player, faction);
	} else {
          his_self.displayBoard(); 
          his_self.moves = [];
          his_self.playerTurn(faction, selected_card);
	}

      } else {

        //
        // if faction is England and Mary I is ruler, we have 50% 
        //
        if (this.game.players.length > 2 && faction == "england" && this.game.state.leaders.mary_i == 1 && this.game.deck[0].cards[card].ops >= 2) {
  	  this.addMove("decide_if_mary_i_subverts_protestantism_in_6P\t"+card);
        }

        if (this.game.players.length == 2 && faction == "protestant" && this.game.state.leaders.mary_i) {
	  this.addMove("decide_if_mary_i_subverts_protestantism_in_2P");
        }

        //
        // set back button to move us back here
        //
        let his_self = this;
        his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.playerTurn(faction, selected_card); });
        this.playerPlayCard(card, this.game.player, faction);
      }  
    });  
  }


  playerReliefForcesJoinBattle(faction, spacekey) {
    
    let space = this.game.spaces[spacekey];
    let player = this.returnPlayerCommandingFaction(faction);

    let his_self = this;
    let units_to_move = [];
    let available_units = [];

    for (let f in space.units) {
      for (let i = 0; i < space.units[f].length; i++) {
	if (space.units[f][i].besieged != 0) {
          available_units.push({ faction : f , unit_idx : i , type : space.units[f][i].type });
	}
      }
    }

    //
    // unfortify the units
    //
    let finishAndFortify = function(his_self, units_to_move, selectUnitsInterface, finishAndFortify) {

      let fa = {};
      for (let f in space.units) { fa[f] = []; };

      for (let i = 0; i < units_to_move.length; i++) {
        let tf = units_to_move[i].faction;
        let tu = units_to_move[i].idx;
        fa[tf].push(tu);
      }

      for (let f in fa) {
	for (let z = 0; z < fa[f].length; z++) {
          his_self.addMove("unfortify_unit_by_index\t"+spacekey+"\t"+f+"\t"+fa[f][z]);
	}
      }
      his_self.endTurn();
      return;
    }
 
    //
    // select the units to unfortify
    //
    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, finishAndFortify) {

      let unmoved_units = [];
      let moved_units = [];

      let msg = "Which Fortified Units Join the Field Battle: ";
      let html = "<ul>";

      for (let i = 0; i < available_units.length; i++) {
	let is_this_unit_moving = false;
	for (let z = 0; z < units_to_move.length; z++) {
	  if (
	    units_to_move[z].faction == available_units[i].faction &&
	    units_to_move[z].idx == available_units[i].unit_idx
	  ) { 
	    is_this_unit_moving = true;
          }
        }
        let tf = available_units[i].faction;
        let tu = space.units[available_units[i].faction][available_units[i].unit_idx];
	if (is_this_unit_moving) {
          html += `<li class="option" style="font-weight:bold" id="${i}">* ${tu.name} - ${his_self.returnFactionName(tf)} *</li>`;
	  moved_units.push({ faction : available_units[i].faction , idx : available_units[i].unit_idx , type : available_units[i].type });
	} else {
          html += `<li class="option" style="" id="${i}">${tu.name} - ${his_self.returnFactionName(tf)}</li>`;
	  unmoved_units.push({ faction : available_units[i].faction , idx : available_units[i].unit_idx , type : available_units[i].type });
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      let mobj = {
        spacekey : spacekey ,
        moved_units : moved_units ,
        unmoved_units : unmoved_units ,
      }

      his_self.fortification_overlay.render(mobj, [], selectUnitsInterface, finishAndFortify, 1); // 1 => "unfortifying"
      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          his_self.fortification_overlay.hide();
          finishAndFortify(his_self, units_to_move, selectUnitsInterface, finishAndFortify);
          return;
        }

	let x = id.split("-");
	let f = x[0];
	let idx = x[1];

	let does_units_to_move_have_unit = false;
	for (let z = 0; z < units_to_move.length; z++) {
	  if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { does_units_to_move_have_unit = true; break; }
	}
	if (does_units_to_move_have_unit) {
	  for (let z = 0; z < units_to_move.length; z++) {
	    if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { units_to_move.splice(z, 1); break; }
	  }
	} else {

	  let unitno = 0;
	  for (let i = 0; i < units_to_move.length; i++) {
	    if (space.units[units_to_move[i].faction][units_to_move[i].idx].army_leader == false) { unitno++; }
	    if (unitno >= 4) {
	      alert("Max 4 Units Permitted in Fortification");
	      return;
	    }
	  }
	  units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	}

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, finishAndFortify);

      });
    }
 
    //
    // PLAYER STARTS HERE
    //
    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, finishAndFortify);
    return 0;

  }



  playerFortifySpace(faction, attacker, spacekey, post_battle=false, relief_siege=0) {

    let space = this.game.spaces[spacekey];
    let faction_map = this.returnFactionMap(space, attacker, faction);
    let cp = this.returnControllingPower(attacker);
    let attacker_player = this.returnPlayerCommandingFaction(cp);
    let player = this.returnPlayerCommandingFaction(faction);

    let his_self = this;
    let units_to_move = [];
    let available_units = [];
    let anyone_in_relief_force = false;

    for (let f in faction_map) { 
      if (this.returnPlayerCommandingFaction(f) != attacker_player) {
        for (let i = 0; i < space.units[f].length; i++) {
          if (space.units[f][i].relief_force == 1) { anyone_in_relief_force = true; }
	}
      }
    }
    if (this.game.state.field_battle_relief_battle) { anyone_in_relief_force = true; }

    for (let f in faction_map) { 
      if (this.returnPlayerCommandingFaction(f) != attacker_player) {
        for (let i = 0; i < space.units[f].length; i++) {
	  if (space.units[f][i].type == "regular" || space.units[f][i].type == "mercenary" || space.units[f][i].type == "cavalry" || space.units[f][i].army_leader) {
	    if (anyone_in_relief_force == false) {
              available_units.push({ faction : f , unit_idx : i , type : space.units[f][i].type });
	      if (space.units[f][i].besieged == 1) { units_to_move.push( { faction : f , idx : i } ); }
	    } else {
if (relief_siege == 1) {
	      if (space.units[f][i].relief_force != 1) {
                available_units.push({ faction : f , unit_idx : i , type : space.units[f][i].type });
	        if (space.units[f][i].besieged == 1) { units_to_move.push( { faction : f , idx : i } ); }
	      } 
} else {
                available_units.push({ faction : f , unit_idx : i , type : space.units[f][i].type });
	        if (space.units[f][i].besieged == 1) { units_to_move.push( { faction : f , idx : i } ); }
}
	    } 
          }
        }
      }
    }

    //
    // fortify the units_to_move
    //
    let finishAndFortify = function(his_self, units_to_move, selectUnitsInterface, finishAndFortify) {

      let fa = {};
      for (let f in faction_map) { fa[f] = []; };

      for (let i = 0; i < units_to_move.length; i++) {
        let tf = units_to_move[i].faction;
        let tu = units_to_move[i].idx;
        fa[tf].push(tu);
      }

      for (let f in fa) {
	for (let z = 0; z < fa[f].length; z++) {
          his_self.addMove("fortify_unit_by_index\t"+spacekey+"\t"+f+"\t"+fa[f][z]);
	}
      }
      his_self.endTurn();
      return;
    }

    //
    // select the units to fortify
    //
    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, finishAndFortify) {

      let unmoved_units = [];
      let moved_units = [];

      let msg = "Fortification Holds 4 Units: ";
      let html = "<ul>";

      for (let i = 0; i < available_units.length; i++) {
	let is_this_unit_moving = false;
	for (let z = 0; z < units_to_move.length; z++) {
	  if (
	    units_to_move[z].faction == available_units[i].faction &&
	    units_to_move[z].idx == available_units[i].unit_idx
	  ) { 
	    is_this_unit_moving = true;
          }
        }
        let tf = available_units[i].faction;
        let tu = space.units[available_units[i].faction][available_units[i].unit_idx];
	if (is_this_unit_moving) {
          html += `<li class="option" style="font-weight:bold" id="${i}">* ${tu.name} - ${his_self.returnFactionName(tf)} *</li>`;
	  moved_units.push({ faction : available_units[i].faction , idx : available_units[i].unit_idx , type : available_units[i].type });
	} else {
          html += `<li class="option" style="" id="${i}">${tu.name} - ${his_self.returnFactionName(tf)}</li>`;
	  unmoved_units.push({ faction : available_units[i].faction , idx : available_units[i].unit_idx , type : available_units[i].type });
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      let mobj = {
        spacekey : spacekey ,
        moved_units : moved_units ,
        unmoved_units : unmoved_units ,
      }

      his_self.fortification_overlay.render(mobj, [], selectUnitsInterface, finishAndFortify); // no destination interface
      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          his_self.fortification_overlay.hide();
          finishAndFortify(his_self, units_to_move, selectUnitsInterface, finishAndFortify);
          return;
        }

	let x = id.split("-");
	let f = x[0];
	let idx = x[1];

	let does_units_to_move_have_unit = false;
	for (let z = 0; z < units_to_move.length; z++) {
	  if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { does_units_to_move_have_unit = true; break; }
	}
	if (does_units_to_move_have_unit) {
	  for (let z = 0; z < units_to_move.length; z++) {
	    if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { units_to_move.splice(z, 1); break; }
	  }
	} else {

	  let unitno = 0;
	  for (let i = 0; i < units_to_move.length; i++) {
	    if (space.units[units_to_move[i].faction][units_to_move[i].idx].army_leader == false) { unitno++; }
	    if (unitno >= 4) {
	      alert("Max 4 Units Permitted in Fortification");
	      return;
	    }
	  }
	  units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	}

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, finishAndFortify);

      });
    }


    //
    // PLAYER STARTS HERE
    //
    let can_we_quick_fortify = true;
    if (available_units.length > 4) {
      let overunits = 0;
      for (let i = 0; i < available_units.length; i++) {
	let u = space.units[available_units[i].faction][available_units[i].unit_idx];
	if (u.type == "regular" || u.type == "cavalry" || u.type == "mercenary") { overunits++; }
	if (u.relief_force == 1) { can_we_quick_fortify = false; }
      }
      if (overunits > 4) {
        can_we_quick_fortify = false; 
      }
    }

    if (can_we_quick_fortify == true) {

      //
      // prevents UI flickering to have AUTO copied here
      //
      if (post_battle == 0) {
        for (let i = 0; i < available_units.length; i++) {
          units_to_move.push({ faction : available_units[i].faction , idx : available_units[i].unit_idx , type : available_units[i].type });
        }
        finishAndFortify(his_self, units_to_move);
	return 0;
      }

      let msg = "Choose Fortification Option: ";
      let html = "<ul>";
      html += `<li class="option" id="auto">fortify everything (auto)</li>`;
      if (post_battle == 1) {
        html += `<li class="option" id="manual">select units (manual)</li>`;
      }
      html += "</ul>";
      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "auto") {
          for (let i = 0; i < available_units.length; i++) {
            units_to_move.push({ faction : available_units[i].faction , idx : available_units[i].unit_idx , type : available_units[i].type });
          }
          finishAndFortify(his_self, units_to_move);
          return 0;
        }

        if (id === "manual") {
	  try { his_self.field_battle_overlay.hide(); } catch (err) {}
          selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, finishAndFortify);
          return 0;
        }

      });

      return 0;

    } else {

      //
      // we have to move manually, this implies post_battle
      //
      selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, finishAndFortify);
      return;

    }

    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, finishAndFortify);
    return 0;

  }


  playerPlayWinterRetreatToFortresses(f, player) {

    let his_self = this;

    //
    // this lets independent fill their own capitals before major powers...
    //
    let ofs = ["venice","hungary","genoa","scotland","independent","ottoman","hapsburg","england","france","papacy","protestant"];
    let fs = [];
    for (let z = 0; z < ofs.length; z++) {
      if (this.returnControllingPower(ofs[z]) == f) {
	fs.push(ofs[z]);
      }
    }

    let sources = [];
    let any_need_to_intervene = false;
    let confirm_leaders_move_with_troops = false;
    let confirm_leaders_move_with_troops_spacekey = false;
    let leaders_to_remove_moves = [];
    let units_to_remove_moves = [];

    //
    // handle non-naval units
    //
    for (let spacekey in this.game.spaces) {
      for (let mm = 0; mm < fs.length; mm++) {

        let faction = fs[mm];
        let space = this.game.spaces[spacekey];

        if (space.units[faction].length > 0 ) {

          //
          // we need to retreat from these spaces
          //
          if (
             ((this.isSpaceFortified(spacekey) && !this.isSpaceControlled(spacekey, faction)) || (!this.isSpaceFortified(spacekey)))
             &&
             (!(faction == "protestant" && this.isSpaceElectorate(space.key) && this.game.state.events.schmalkaldic_league != 1))
             &&
             (spacekey != "ireland" && spacekey != "persia" && spacekey != "egypt")
          ) {
             this.removeSiege(space.key);
	     if (this.returnFactionLandUnitsInSpace(faction, spacekey, 0) > 0) { 

               //
               // find the nearest friendly fortified space w/ less than 4 units
               //
               let res = this.returnNearestFriendlyFortifiedSpacesTransitPasses(faction, spacekey, 4);
	       sources.push({ spacekey : spacekey , res : res });
	       any_need_to_intervene = true;
	     }
	  }
        }
      }
    }

    if (any_need_to_intervene == false) {
      his_self.updateStatus("processing...");
      his_self.theses_overlay.hide();
      his_self.endTurn();
      return 1;
    }


    let next_unit_fnct = async (sources, sources_idx, unit_idx, next_unit_fnct) => {

      if (sources.length < (sources_idx+1)) {
        his_self.updateStatus("processing...");
        his_self.theses_overlay.hide();
	for (let z = leaders_to_remove_moves.length-1; z >= 0; z--) {
	  his_self.addMove(leaders_to_remove_moves[z]);
	}
	for (let z = units_to_remove_moves.length-1; z >= 0; z--) {
	  his_self.addMove(units_to_remove_moves[z]);
	}
	his_self.endTurn();
	return 1;
      }

      this.theses_overlay.renderAtSpacekey(sources[sources_idx].spacekey);
      let status = document.querySelector('.theses-overlay .status');
      status.style.display = 'block';
      let controls = document.querySelector('.theses-overlay .controls');
      controls.style.display = 'block';

      let res = this.returnNearestFriendlyFortifiedSpacesTransitPasses(f, sources[sources_idx].spacekey, 4);
      let destinations = []; 
      for (let z = 0; z < res.length; z++) { destinations.push(res[z].key); }

      let space = his_self.game.spaces[sources[sources_idx].spacekey];

      if (unit_idx >= 0) {

	let unit_type = space.units[f][unit_idx].type;
	let unit_name = "";
	if (unit_type == "mercenary") { unit_name = "Mercenary"; }
	if (unit_type == "regular") { unit_name = "Regular"; }
	if (unit_type == "cavalry") { unit_name = "Cavalry"; }
	if (space.units[f][unit_idx].army_leader == true) { unit_type = space.units[f][unit_idx].name; }

        if (unit_name == "" || res.length == 0) {
	   next_unit_fnct(sources, sources_idx, unit_idx-1, next_unit_fnct);
	} else {

          his_self.playerSelectSpaceWithFilter(
            "Winter "+unit_name+" ("+(parseInt(unit_idx)+1)+") from "+his_self.returnSpaceName(space.key) ,
            function(space) {
              if (destinations.includes(space.key)) { return 1; }
	      return 0;
            },
            function(spacekey) {

	      let move_leader_with_troops = false;
	      let moved_this_unit = false;
              let leader_idx = [];

	      for (let i = space.units[f].length-1; i >= 0; i--) {
		let u = space.units[f][i];
		if (i != unit_idx && (u.army_leader || u.navy_leader)) {
		  leader_idx.push(i);
		}
	      }

	      if (leader_idx.length > 0) {
		let c = confirm("Move Leader with Troops?");
	        if (c) { move_leader_with_troops = true; }
	      }

	      //
	      // auto-move with last unit
	      //
	      if (leader_idx.length == space.units[f].length-1) {
		move_leader_with_troops = true;
	      }


	      if (move_leader_with_troops) {
		for (let z = space.units[f].length-1; z >= 0; z--) {
		  if (space.units[f][z].army_leader || space.units[f][z].navy_leader) {
		    let u = space.units[f][z];
	            his_self.removeUnit(f, space.key, u.type);
	            his_self.addArmyLeader(f, spacekey, u.type);
	            leaders_to_remove_moves.push("move\t"+f+"\tland\t"+space.key+"\t"+spacekey+"\t"+z+"\t"+his_self.game.player);
		    if (z < unit_idx) { unit_idx--; }
		  }
		}
	      }

              his_self.addUnit(f, spacekey, unit_type);
	      his_self.removeUnit(f, space.key, unit_type);
	      units_to_remove_moves.push("move\t"+f+"\tland\t"+space.key+"\t"+spacekey+"\t"+unit_idx+"\t"+his_self.game.player);

	      //
	      // reorganize MOVES
	      //
	      for (let y = 0; y < his_self.moves.length-1; y++) {
  	        let tmpx = his_self.moves[y].split("\t");
  	        let tmpy = his_self.moves[y+1].split("\t");
	        if (tmpx[0] == "move") {
	          if (parseInt(tmpx[5]) > parseInt(tmpy[5])) {
		    let x = his_self.moves[y];
		    let y = his_self.moves[y+1];
		    his_self.moves[y] = y;
		    his_self.moves[y+1] = x;
		    y = -1; // we found problem, so loop again
	          }
	        }
	      }

	      his_self.displaySpace(space.key);
	      his_self.displaySpace(spacekey);
	      next_unit_fnct(sources, sources_idx, unit_idx-1, next_unit_fnct);
            },
            null ,
            true
          );

	}
      } else {
        let next_unit_idx = 100;
	if (sources.length > sources_idx+1) { next_unit_idx = his_self.game.spaces[sources[sources_idx+1].spacekey].units[f].length-1; }
        next_unit_fnct(sources, sources_idx+1, next_unit_idx, next_unit_fnct);
      }

    }

    if (sources.length > 0) {
      let next_unit_idx = 100;
      next_unit_idx = his_self.game.spaces[sources[0].spacekey].units[f].length-1;
      next_unit_fnct(sources, 0, next_unit_idx, next_unit_fnct);
    } else {
      his_self.updateStatus("processing...");
      his_self.theses_overlay.hide();
      his_self.endTurn();
    }
         
    return 0;

  }

  playerPlayDiplomacyCard(faction) {

    let p = this.returnPlayerOfFaction(faction);
    let his_self = this;

    this.updateStatusAndListCards(his_self.returnFactionName(faction) + " - Select Diplomacy Card", this.game.deck[1].hand);
    this.attachCardboxEvents(function(card) {

      this.updateStatus(`Playing ${this.popup(card)}`, this.game.deck[1].hand);
      his_self.addMove("diplomacy_card_event\t"+faction+"\t"+card);
      his_self.addMove("discard_diplomacy_card\t"+faction+"\t"+card);

      let faction_hand_idx = his_self.returnFactionHandIdx(his_self.game.player, faction);
      his_self.addMove("cards_left\t"+faction+"\t"+his_self.game.deck[0].fhand[faction_hand_idx].length); // no -1 because we r just updating other hand

      his_self.endTurn();
    });

  }

  playerPlayCard(card, player, faction) {
  
    //
    // remove selectable elemets on board
    //
    this.removeSelectable();

    //
    // cards left
    //
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    let cards_in_hand = this.game.deck[0].fhand[faction_hand_idx].length;

    this.cardbox.hide();
    this.game.state.active_card = card;

    if (card === "pass") {
      this.cardbox.hide();
      this.updateStatus("Passing this Round...");
      this.addMove("pass\t"+faction+"\t"+cards_in_hand);
      this.endTurn();
      return;
    } else {
      this.addMove("cards_left\t"+faction+"\t"+(cards_in_hand-1)); // -1 because we playing this card
    }


    //
    // check if the eventing of this card makes interventions impossible
    //
    if (this.game.state.events.intervention_on_movement_possible == 1) {}
    if (this.game.state.events.intervention_on_events_possible == 1) {
      if (card === "037") { this.game.state.events.intervention_on_events_possible = 0; }
    }
    if (this.game.state.events.intervention_on_assault_possible == 1) {}
    if (this.game.state.events.intervention_post_assault_possible == 1) {}
    if (this.game.state.events.intervention_post_naval_assault_possible == 1) {
      if (card === "034") { this.game.state.events.intervention_naval_avoid_battle_possible = 0; }
    }
    if (this.game.state.events.intervention_naval_avoid_battle_possible == 1) {
      if (card === "034") { this.game.state.events.intervention_naval_avoid_battle_possible = 0; }
    }
    if (this.game.state.events.intervention_naval_intercept_possible == 1) {
      if (card === "034") { this.game.state.events.intervention_naval_intercept_possible = 0; }
    }


    //
    // mandatory event cards effect first, then 2 OPS
    //
    let deck = this.returnDeck(true); // removed don't get evented
    let event_this = false;
    let can_event_this = false;

    try {
      if (deck[card].type === "mandatory" && deck[card].canEvent(this, faction)) {
        event_this = true;
      }
    } catch (err) {}

    if (event_this) {
      this.unbindBackButtonFunction();
      this.addMove("remove\t"+faction+"\t"+card);
      this.addMove("ops\t"+faction+"\t"+card+"\t"+2);
      this.playerPlayEvent(card, faction);
    } else {

      let html = `<ul>`;
      html    += `<li class="card" id="ops">play for ops</li>`;
      try {
        if (deck[card].canEvent(this, faction) && !this.game.state.cards_evented.includes(card)) {
  	  can_event_this = true;
	  if (card === "102") { can_event_this = false; }
        }
      } catch (err) {}

      //
      // Mary I cannot event combat/response cards if England
      //
      if (faction == "england" && this.game.state.leaders.mary_i != 0) {
	if (deck[card].type == "response" || deck[card].type == "combat") { can_event_this = false; }
      }

      if (can_event_this) {
        html    += `<li class="card" id="event">play for event</li>`;
      }
      html    += `</ul>`;

      let pick_card_function = () => {

        this.updateStatusWithOptions(`Playing ${this.popup(card)}`, html);
        this.attachCardboxEvents((user_choice) => {      

	  this.updateStatus("submitting...");

          if (user_choice === "ops") {
            let ops = this.game.deck[0].cards[card].ops;
            this.playerPlayOps(card, faction, ops);
            return;
          }
          if (user_choice === "event") {
            this.unbindBackButtonFunction();
            if (this.game.deck[0].cards[card].warn.includes(faction)) {
              let c = confirm("Unorthodox! Are you sure you want to event this card?");
              if (!c) {
                pick_card_function();
               return;
              }
              this.playerPlayEvent(card, faction);
              return;
            } else {
              this.playerPlayEvent(card, faction);
              return;
	    }
            return;
          }
        });
      }

      pick_card_function();
    }

  }


  //
  // when Mary I is in play, 50% chance English cards can be
  // used to burn books and convene theological debates
  //
  async playerPlayMaryI(card="", faction, limit="") {

    let his_self = this;
    let menu = this.returnActionMenuOptions(this.game.player, faction, "mary_i");
    let deck = this.returnDeck(true);
    let ops = deck[card].ops;
    let pfactions = this.returnPlayerFactions(this.game.player);

    let attachEventsToMenuOptions = () => {

      this.updateStatusWithOptions(`${this.returnFactionName(faction)}: ${ops} ops remaining`, html);
      this.attachCardboxEvents(async (user_choice) => {      

	his_self.menu_overlay.hide();

        if (user_choice === "end_turn") {
          this.endTurn();
          return;
        }

	let ops_to_spend = 0;

        for (let z = 0; z < menu[user_choice].factions.length; z++) {
          if (pfactions.includes(menu[user_choice].factions[z])) {
            ops -= menu[user_choice].cost[z];
	    ops_to_spend = menu[user_choice].cost[z];
  	    z = menu[user_choice].factions.length+1;
          }
        }

	//
	// we end if there is only 1 OP left
	//
        if (ops > 1) {
  	  this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit);
        }
        menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend, ops);
        return;

      });

    } // attach events to menu options

    this.menu_overlay.render(menu, this.game.player, faction, ops, attachEventsToMenuOptions);
    attachEventsToMenuOptions();

  }

  async playerPlayOps(card="", faction, ops=null, limit="") {

    //
    // remove selectable elemets on board
    //
    this.removeSelectable();

    //
    // make sure this is whoever is in control
    //
    faction = this.returnControllingPower(faction);

    //
    // back button loses track of which card was played, but foreign
    // recruits submits with card="". we need to know the last card
    // played for a few reasons, including untriggering events
    //
    this.game.player_last_card = "";
    if (card != "") { this.game.player_last_card = card; }


    //
    // unbind in all cases except where OPS are max from card
    //
    if (card == "") {
      this.unbindBackButtonFunction();
    } else {
      try {
        let expected_ops = this.game.deck[0].cards[card].ops;
        if (expected_ops != ops || ops == null || card == "") {
          this.unbindBackButtonFunction();
        }
      } catch (err) {
        // probably mandatory card already removed from deck
        this.unbindBackButtonFunction();
      }
    }

    //
    // cards left
    //
    // you can play for minor allies that do not have cards in your hand, so in that case do not report...
    //
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    if (-1 < faction_hand_idx) {
      if (this.game.deck[0].fhand[faction_hand_idx]) {
        this.addMove("cards_left\t"+faction+"\t"+this.game.deck[0].fhand[faction_hand_idx].length-1); // -1 because we playing this card
      }
    }

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
    if (ops == 0) { 
    
      if (this.game.player_last_card == "034") {
        this.addMove("SETVAR\tstate\tevents\tintervention_naval_avoid_battle_possible\t0");
        this.addMove("SETVAR\tstate\tevents\tintervention_naval_intercept_possible\t0");
        this.addMove("SETVAR\tstate\tevents\tintervention_post_naval_battle_possible\t0");
      }       
      if (this.game.player_last_card == "037") {
        this.addMove("SETVAR\tstate\tevents\tintervention_on_events_possible\t0");
      }   
      
      this.endTurn();
      return;
    }

    //
    // Roxelana offers free Assault
    //
    if (this.game.state.events.roxelana == 1 && faction == "ottoman") {
      for (let m in menu) {
	if (menu[m].name === "Assault") {
	  menu[m].cost = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}
      }
    }

    //
    // "ACTIVATED POWERS" are those for whom players have the choice of moving.
    // this can be triggered through alliance with a minor power, or through a 
    // diplomacy card in the 2P game.
    //
    if (this.game.state.activated_powers[faction].length > 0) {

      let html = `<ul>`;
      html    += `<li class="card" id="${faction}">${faction}</li>`;
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
	 let can_select = true;
	 let ap = this.game.state.activated_powers[faction][i];
	 if (faction === "france" && this.game.state.events.scots_raid == 1) {
	   if (ap != "scotland") { can_select = false; }
	 }
	 if (can_select == true) {
           html    += `<li class="card" id="${this.game.state.activated_powers[faction][i]}">${this.game.state.activated_powers[faction][i]}</li>`;
	 }
         for (let z = 0; z < this.game.state.activated_powers[this.game.state.activated_powers[faction][i]].length; z++) {
	   let mp = this.game.state.activated_powers[this.game.state.activated_powers[faction][i]][z];
	   let can_select = true;
	   if (faction === "france" && this.game.state.events.scots_raid == 1) {
	     if (!(mp == "france" || mp == "scotland")) { can_select = false; }
	   }
	   if (can_select) { html += `<li class="card" id="${this.game.state.activated_powers[this.game.state.activated_powers[faction][i]][z]}">${this.game.state.activated_powers[this.game.state.activated_powers[faction][i]][z]}</li>`; }
	 }
      }
      html    += `</ul>`;

      let ops_text = `${ops} op`;
      if (ops > 0) { ops_text += 's'; }

      this.updateStatusWithOptions(`Which Faction: ${ops_text}`, html);
      this.attachCardboxEvents(function(selected_faction) {



        menu = this.returnActionMenuOptions(this.game.player, selected_faction, limit);

        //
        // Roxelana offers free Assault
        //
        if (this.game.state.events.roxelana == 1 && faction == "ottoman") {
          for (let m in menu) {
	    if (menu[m].name === "Assault") {
	      menu[m].cost = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	    }
          }
        }

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
		  if (menu[i].cost[z] > 0) {
                    html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
                  }
                }
	        z = menu[i].factions.length+1;
              }
            }
          }
        }

        html    += `<li class="card" id="end_turn">end turn</li>`;
        html    += `</ul>`;

	let attachEventsToMenuOptions = () => {

        his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.playerPlayOps(card, faction, ops, limit); });
        his_self.updateStatusWithOptions(`${his_self.returnFactionName(selected_faction)}: ${ops} ops remaining`, html);
        this.attachCardboxEvents(async (user_choice) => {      

	  his_self.unbindBackButtonFunction();
	  his_self.updateStatus("acknowledge");
	  his_self.menu_overlay.hide();

          if (user_choice === "end_turn") {
            if (his_self.game.player_last_card == "034") {
              his_self.addMove("SETVAR\tstate\tevents\tintervention_naval_avoid_battle_possible\t0");
              his_self.addMove("SETVAR\tstate\tevents\tintervention_naval_intercept_possible\t0");
              his_self.addMove("SETVAR\tstate\tevents\tintervention_post_naval_battle_possible\t0");
            }       
            if (this.game.player_last_card == "037") {
              his_self.addMove("SETVAR\tstate\tevents\tintervention_on_events_possible\t0");
            }   
            his_self.endTurn();
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
              if (ops > 2) { html += `<li class="option" id="donot">do not commit (3 OPs)</li>`; }
	      html += '</ul>';

	      his_self.updateStatusWithOptions(msg, html);
      	      his_self.attachCardboxEvents(async (moar_user_choice) => {      

	        if (moar_user_choice === "commit") {
                  ops -= 2;
                  if (ops > 0) {
 		    his_self.addMove("continue\t"+his_self.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
		  }
                  his_self.addMove("commit\tpapacy\tloyola-debater\t1");
                  his_self.playerFoundJesuitUniversity(his_self, his_self.game.player, "papacy");
                  return;
		}

		if (moar_user_choice === "donot") {
                  ops -= 3;
		  if (ops > 0) {
 		    his_self.addMove("continue\t"+his_self.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
                  }
                  his_self.playerFoundJesuitUniversity(his_self, his_self.game.player, "papacy");
                  return;
		}

	      });

	    } else {
              ops -= 3;
	      if (ops > 0) {
 	        his_self.addMove("continue\t"+his_self.game.player+"\t"+selected_faction+"\t"+card+"\t"+ops+"\t"+limit); 
              }
              menu[user_choice].fnct(his_self, his_self.game.player, selected_faction, 3, ops);
              return;
	    }

	  } else {

	    //
	    // sub-menu to simplify translations / st peters
	    //
	    if (menu[user_choice].name.indexOf("Peters") != -1 || menu[user_choice].name.indexOf("Translate") != -1) {

	      //
	      // skip if only 1 ops
	      //
	      if (ops == 1) {

                  menu[user_choice].fnct(his_self, his_self.game.player, selected_faction, 1, 0);
                  return;

	      } else {

	        let msg = "How many OPs to Spend: ";
                let html = `<ul>`;
	        let desc = ['one', 'two', 'three', 'four', 'five', 'six'];
                for (let i = 1; i <= ops; i++) {
                  html += `<li class="card" id="${i}">${desc[i-1]}</li>`;
                }
                html += '</ul>';

                this.updateStatusWithOptions(msg, html);
                this.attachCardboxEvents(async (uc) => {      

	          let ops_to_spend = parseInt(uc);
	          let ops_remaining = ops - ops_to_spend;
 
                  if (ops_remaining > 0) {
    	            this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops_remaining+"\t"+limit);
                  }
                  menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend, ops_remaining);
                  return;
	        });

	      }

	    } else {

	      let ops_to_spend = 0;
	      let cost = 0;

              for (let z = 0; z < menu[user_choice].factions.length; z++) {
                if (menu[user_choice].factions[z] === selected_faction) {
		  cost = menu[user_choice].cost[z];
                  ops -= menu[user_choice].cost[z];
		  ops_to_spend = menu[user_choice].cost[z];
	          z = menu[user_choice].factions.length+1;
                }
              }
	      if (cost == 0) {
                menu[user_choice].fnct(this, this.game.player, selected_faction, ops_to_spend, ops);
		this.playerPlayOps(card, faction, ops, limit);
                return;
	      }
              if (ops > 0) {
	        this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit);
              }
              menu[user_choice].fnct(this, this.game.player, selected_faction, ops_to_spend, ops);
              return;

	    }
	  }
        });

	} // function

	his_self.menu_overlay.render(menu, this.game.player, selected_faction, ops, attachEventsToMenuOptions);

	attachEventsToMenuOptions();

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
		if (menu[i].cost[z] > 0) {
                  html += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
                }
              }
	      z = menu[i].factions.length+1;
            }
          }
        }
      }

      html    += `<li class="card" id="end_turn">end turn</li>`;
      html    += `</ul>`;

      let attachEventsToMenuOptions = () => {

      this.updateStatusWithOptions(`${this.returnFactionName(faction)}: ${ops} ops remaining`, html);
      this.attachCardboxEvents(async (user_choice) => {      

        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge");
	his_self.menu_overlay.hide();

        if (user_choice === "end_turn") {
          if (his_self.game.player_last_card == "034") {
            his_self.addMove("SETVAR\tstate\tevents\tintervention_naval_avoid_battle_possible\t0");
            his_self.addMove("SETVAR\tstate\tevents\tintervention_naval_intercept_possible\t0");
            his_self.addMove("SETVAR\tstate\tevents\tintervention_post_naval_battle_possible\t0");
          }       
          if (this.game.player_last_card == "037") {
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_events_possible\t0");
          }   
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
            if (ops > 2) { html += `<li class="option" id="donot">do not commit (3 OPs)</li>`; }
	    html += '</ul>';

	    his_self.updateStatusWithOptions(msg, html);
      	    his_self.attachCardboxEvents(async (moar_user_choice) => {      

	      if (moar_user_choice === "commit") {
                ops -= 2;
                if (ops > 0) {
 		  his_self.addMove("continue\t"+his_self.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
		}
                his_self.addMove("commit\tpapacy\tloyola-debater\t1");
                his_self.playerFoundJesuitUniversity(his_self, his_self.game.player, "papacy");
                return;
	      }

	      if (moar_user_choice === "donot") {
                ops -= 3;
	        if (ops > 0) {
 	          his_self.addMove("continue\t"+his_self.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
                }
                his_self.playerFoundJesuitUniversity(his_self, his_self.game.player, "papacy");
                return;
	      }

	    });

	  } else {
            ops -= 3;
	    if (ops > 0) {
 	      his_self.addMove("continue\t"+his_self.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
            }
            menu[user_choice].fnct(his_self, his_self.game.player, faction, 3, ops);
	  }

	  return;
	}

	//
	// sub-menu to simplify translations / st peters
	//
	if (menu[user_choice].name.indexOf("Peters") != -1 || menu[user_choice].name.indexOf("Translate") != -1) {

	  //
	  // skip if only 1 ops
	  //
	  if (ops == 1) {
            menu[user_choice].fnct(this, this.game.player, faction, 1, 0);
            return;
	  }

	  let msg = "How many OPs to Spend: ";
          let html = `<ul>`;
	  let desc = ['one', 'two', 'three', 'four', 'five', 'six'];
          for (let i = 1; i <= ops; i++) {
            html += `<li class="card" id="${i}">${desc[i-1]}</li>`;
          }
          html += '</ul>';

          this.updateStatusWithOptions(msg, html);
          this.attachCardboxEvents(async (uc) => {      

	    let ops_to_spend = parseInt(uc);
	    let ops_remaining = ops - ops_to_spend;

            if (ops_remaining > 0) {
  	      this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops_remaining+"\t"+limit);
            }
            menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend, ops_remaining);
            return;
	  });

	} else {

	  let ops_to_spend = 0;
	  let cost = 0;

          for (let z = 0; z < menu[user_choice].factions.length; z++) {
            if (faction == menu[user_choice].factions[z]) {
	      cost = menu[user_choice].cost[z];
              ops -= menu[user_choice].cost[z];
	      ops_to_spend = menu[user_choice].cost[z];
  	      z = menu[user_choice].factions.length+1;
            }
          }

	  if (cost == 0) {
            menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend, ops);
	    this.playerPlayOps(card, faction, ops, limit);
            return;
	  }
          if (ops > 0) {
  	    this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit);
          }
          menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend, ops);
          return;

	}
      });

      } // attach events to menu options

      this.menu_overlay.render(menu, this.game.player, faction, ops, attachEventsToMenuOptions);
      attachEventsToMenuOptions();

    }
  }
  playerPlayEvent(card, faction, ops=null) {

    //
    // cards left
    //
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    this.addMove("cards_left\t"+faction+"\t"+this.game.deck[0].fhand[faction_hand_idx].length-1); // -1 because we playing this card
    
    let deck = this.returnDeck(true);
    if (deck[card].removeFromDeckAfterPlay(this, faction)) {
      this.addMove("remove\t"+faction+"\t"+card);
    }

    //
    // sanity check in case a mandatory card is dealt mid-game
    // and not removed from the deck.
    //
    if (this.game.state.removed.includes(card)) {
      if (this.game.player_last_card == "034") {
        this.addMove("SETVAR\tstate\tevents\tintervention_naval_avoid_battle_possible\t0");
        this.addMove("SETVAR\tstate\tevents\tintervention_naval_intercept_possible\t0");
        this.addMove("SETVAR\tstate\tevents\tintervention_post_naval_battle_possible\t0");
      }       
      if (this.game.player_last_card == "037") {
        this.addMove("SETVAR\tstate\tevents\tintervention_on_events_possible\t0");
      }   
      this.endTurn();
      return;
    }

    this.addMove("event\t"+faction+"\t"+card);
    this.addMove("discard\t"+faction+"\t"+card);


    // counter_or_acknowledge if the player is the Protestants and Wartburg is not in the discard pile as
    // the Protestants might have it. Otherwise ACKNOWLEDGE to ensure players know what is happening but
    // don't halt the game for the player moving.

    //
    // Gout can cancel Holy Roman Emperor
    //
    if (card === "002") {
      if (this.game.state.events.intervention_on_movement_possible == 1) {
        this.addMove("counter_or_acknowledge\t" + this.returnFactionName(faction) + " triggers " + this.popup(card) + "\tevent\t"+card);
        this.addMove("RESETCONFIRMSNEEDED\tall");
        this.endTurn();
        return 0;
      }
    }


    //
    // wartburg is 037 -- mandatory events cannot be cancelled so we use ACKNOWLEDGE
    // this prevents things like DEFENDER OF THE FAITH or CLEMENT VII from halting 
    // gameplay mid-turn and slowing everything down.
    //
    // some cards skip this acknowledge -- such as Patron of the Arts 004
    //
    if (card !== "004") {
      if (deck[card].type == "mandatory" || !deck[card].canEvent(this, faction)) {
        this.addMove("ACKNOWLEDGE\t" + this.returnFactionName(faction) + " triggers " + this.popup(card));
      } else {

        //
        // otherwise, skip if Protestants cannot interfere
        //
        if ((faction == "england" && this.returnPlayerCommandingFaction("protestant") == this.returnPlayerCommandingFaction("england")) || faction == "protestant" || this.game.deck[0].discards["037"] || this.game.state.events.intervention_on_events_possible == false) {
          this.addMove("ACKNOWLEDGE\t" + this.returnFactionName(faction) + " triggers " + this.popup(card));
        } else {
          this.addMove("counter_or_acknowledge\t" + this.returnFactionName(faction) + " triggers " + this.popup(card) + "\tevent\t"+card);
          this.addMove("RESETCONFIRMSNEEDED\tall");
        }
      }
    }

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
return;
  }

  playerPlayPapacyDiplomacyPhaseSpecialTurn(enemies=[]) {

    let his_self = this;
    let player = this.returnPlayerOfFaction("papacy");
    if (this.game.player != player) { this.updateStatus("ERROR: you are not the papacy"); return; }

 
    let msg = `End a War? [`;
    for (let i = 0; i < enemies.length; i++) { if (i > 0) { msg += ", "; } msg += this.returnFactionName(enemies[i]); };
    msg += ']';
    let opt = "<ul>";
    opt += `<li class="option" id="yes">yes</li>`;
    opt += `<li class="option" id="no">no</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      his_self.unbindBackButtonFunction();
      his_self.updateStatus("acknowledge...");

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
	let allow_bull = 0;

	if (enemy == "hapsburg" && his_self.game.state.excommunicated_factions["hapsburg"] != 1) { allow_bull = 1; }
	if (enemy == "france" && his_self.game.state.excommunicated_factions["france"] != 1) { allow_bull = 1; }

	if (allow_bull) {
          opt += `<li class="option" id="005">papal bull</li>`;
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

	    let do_any_foreign_occupied_spaces_exist = false;
	    for (let key in his_self.game.spaces) {
	      if (his_self.game.spaces[key].home == "papacy") {
		if (his_self.game.spaces[key].political != "" && his_self.game.spaces[key].political != "papacy") {
		  do_any_foreign_occupied_spaces_exist = true;
		}
	      }
	    }

	    //
	    // regain control of home space, or draw card
	    //
    	    let msg = `Regain Home Space or Draw Card?`;
    	    let opt = "<ul>";
	    if (do_any_foreign_occupied_spaces_exist == true) {
    	      opt += `<li class="option" id="regain">regain home space</li>`;
	    } 
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
	            if (space.home === "papacy" && (space.political !== "" && space.political !== "papacy")) {
		      return 1;
		    }
		  },

      		  function(spacekey) {
                    his_self.addMove(`control\tpapacy\t${spacekey}`);
                    his_self.addMove(`withdraw_to_nearest_fortified_space\t${enemy}\t${spacekey}`);
	            his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t${parseInt(his_self.game.state.protestant_war_winner_vp)+1}`);
	            his_self.addMove(`NOTIFY\tProtestants +1 War Winner VP`);
		    his_self.endTurn();
		  },

	    	  () => { his_self.playerPlayPapacyDiplomacyPhaseSpecialTurn(); } , 

	    	  true 

	  	);

	      }

	    });

	  }

	  if (method === "sue") {

	    //
	    // factions no longer At War
	    //
	    his_self.addMove("unset_enemies\tpapacy\t"+enemy);
	    // unset activated power for protestants in 2P
	    if (his_self.isActivatedPower("protestant", enemy) && (enemy === "hapsburg" || enemy === "france")) {
	      his_self.addMove("unset_activated_power\tprotestant\t"+enemy);
	    }

	    //
	    // protestants get War Winner 1 VP
	    //
	    his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t${parseInt(his_self.game.state.protestant_war_winner_vp)+1}`);
            his_self.addMove(`NOTIFY\tProtestants +1 War Winner VP`);

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
                  if (space.units[faction_to_destroy][i].command_value == 0 && space.units[faction_to_destroy][i].personage != true) {
                    if (!unittypes.includes(space.units[faction_to_destroy][i].key)) {
                      html += `<li class="option" id="${space.units[faction_to_destroy][i].key}">${space.units[faction_to_destroy][i].key}</li>`;
                      unittypes.push(space.units[faction_to_destroy][i].key);
                    }
                  }
                }
                html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
                $('.option').off();
                $('.option').on('click', function () {
                  let unittype = $(this).attr("id");
		  his_self.updateStatus("removing unit...");
                  his_self.removeUnit(faction_to_destroy, spacekey, unittype);
                  his_self.displaySpace(spacekey);
                  his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
	    	  //
	          // papacy removes 2 units
	          //
                  his_self.playerSelectSpaceOrNavalSpaceWithFilter(
                    `Select Space to Remove 2nd Unit` ,
                    function(space) {
	              if (space.units["papacy"].length > 0) { return 1; }
		      return 0;
                    },
                    function(spacekey) {

		      his_self.updateStatus("removing unit...");

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
                        if (space.units[faction_to_destroy][i].personage != true && space.units[faction_to_destroy][i].battle_rating != 1) {
                         if (!unittypes.includes(space.units[faction_to_destroy][i].key)) {
                            html += `<li class="option" id="${space.units[faction_to_destroy][i].key}">${space.units[faction_to_destroy][i].key}</li>`;
                            unittypes.push(space.units[faction_to_destroy][i].key);
                          }
                        }
                      }
                      html += '</ul>';
                      his_self.updateStatusWithOptions(msg, html);
                      $('.option').off();
                      $('.option').on('click', function () {
                        let unittype = $(this).attr("id");
		        his_self.updateStatus("removing unit...");
                        his_self.removeUnit(faction_to_destroy, spacekey, unittype);
                        his_self.displaySpace(spacekey);
                        his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
			let z = false;
                        his_self.addMove("player_play_papacy_regain_spaces_for_vp\t"+enemy);
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



  playerRegainLeadersForVPOrCards(loser, winner) {
 
    let his_self = this;
    let target_leaders = [];

    if (!f.includes(io[i])) {
      for (let z = 0; z < his_self.game.state.players_info[p2-1].captured.length; z++) {
        if (his_self.game.state.players_info[p2-1].captured[z].faction == loser) {
          target_leaders.push(his_self.game.state.players_info[p2-1].captured[z]);
        }
      }
    } 
   
    let msg = "Regain Leader for 1 VP or 1 CARD DRAW: ";
    let opt = "<ul>";
    for (let z = 0; z < target_leaders.length; z++) {
      opt += `<li class="option" id="${z}">${target_leaders[z].type}</li>`;
    }
    opt += `<li class="option" id="skip">skip</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let leader = $(this).attr('id');
      
      if (prize == "skip") {
	his_self.endTurn();
	return;
      }

      his_self.addMove("display_vp_track");
      if (target_leaders.length > 1) {
        his_self.addMove(`war_loser_regain_leaders_for_vp_or_cards\t${loser}\t${winner}`);
      }
      his_self.addMove("ransom\t"+leader);
      his_self.endTurn();
    });

  }




  playerRegainSpacesForVPOrCards(loser, winner) {
 
    let his_self = this;
    let target_spaces = his_self.countSpacesWithFilter(function(space) { if (space.home == loser && space.political == winner) { return 1; } return 0; });
    let target_faction = winner;

    let msg = "Do you wish to Regain TWO Non-Key Home Spaces for 1 VP or 1 CARD DRAW: ";
    let opt = "<ul>";
    opt += `<li class="option" id="vp">regain and give VP</li>`;
    opt += `<li class="option" id="card">regain and give card</li>`;
    opt += `<li class="option" id="skip">skip</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let prize = $(this).attr('id');
      
      if (prize == "skip") {
	his_self.endTurn();
	return;
      }

      his_self.playerSelectSpaceWithFilter(
        "Select First Home Space to Recapture" ,
        function(space) {
          if (space.type != "key" && space.home === loser && space.political == winner) {
	    return 1;
	  }
	},
      	function(spacekey1) {

          his_self.playerSelectSpaceWithFilter(
            "Select First Home Space to Recapture" ,
            function(space) {
	      if (space.key != spacekey1 && space.type != "key" && space.home === loser && space.political == winner) {
	        return 1;
	      }
	    },
      	    function(spacekey2) {
	      if (target_spaces >= 4) {
                his_self.addMove(`war_loser_regain_spaces_for_vp_or_cards\t${loser}\t${winner}`);
	      }

              his_self.addMove("display_vp_track");
              his_self.addMove(`control\t${loser}\t${spacekey2}`);
              his_self.addMove(`withdraw_to_nearest_fortified_space\t${winner}\t${spacekey2}`);
              his_self.addMove(`control\t${loser}\t${spacekey1}`);
              his_self.addMove(`withdraw_to_nearest_fortified_space\t${winner}\t${spacekey1}`);

	      if (prize == "vp") {
	        let target_faction = winner;
                if (target_faction == "protestant") { his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t${parseInt(his_self.game.state.protestant_war_winner_vp)+1}`); }
                if (target_faction == "ottoman")    { his_self.addMove(`SETVAR\tstate\tottoman_war_winner_vp\t${parseInt(his_self.game.state.ottoman_war_winner_vp)+1}`); }
                if (target_faction == "papacy")     { his_self.addMove(`SETVAR\tstate\tpapacy_war_winner_vp\t${parseInt(his_self.game.state.papacy_war_winner_vp)+1}`); }
                if (target_faction == "france")     { his_self.addMove(`SETVAR\tstate\tfrance_war_winner_vp\t${parseInt(his_self.game.state.france_war_winner_vp)+1}`); }
                if (target_faction == "england")    { his_self.addMove(`SETVAR\tstate\tengland_war_winner_vp\t${parseInt(his_self.game.state.england_war_winner_vp)+1}`); }
                if (target_faction == "hapsburg")   { his_self.addMove(`SETVAR\tstate\thapsburg_war_winner_vp\t${parseInt(his_self.game.state.hapsburg_war_winner_vp)+1}`); }
	      } else {
                his_self.addMove("pull_card\t"+winner+"\t"+loser);
	      }
	      his_self.endTurn();
	    },
	    null,
	    true,
	  );
	},
	null,
	true
      );
    });
  }




   playerRegainKeysForVP(loser, winner) {

    let his_self = this; 
    let captured_keys = 0;

    let spaces = his_self.returnSpacesWithFilter(
      function(spacekey) {
	if (his_self.game.spaces[spacekey].type == "key" && his_self.game.spaces[spacekey].home == loser && his_self.game.spaces[spacekey].political == winner) { return true; }
        return false;
      }
    ); 

    captured_keys = spaces.length;

    if (spaces.length == 0) {
      his_self.endTurn();
      return;
    }

    let msg = "Do you wish to Regain Home Keys for 1 VP Each: ";
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

          "Select Home Key to Recapture" ,

          function(space) {
	    if (space.type == "key" && space.home === loser && space.political == winner) {
	      return 1;
	    }
	  },

      	  function(spacekey) {

            his_self.addMove("display_vp_track");

	    if (captured_keys > 1) {
              his_self.addMove(`control\t${loser}\t${spacekey}`);
	    }

            his_self.addMove(`control\t${loser}\t${spacekey}`);
            his_self.addMove(`withdraw_to_nearest_fortified_space\t${winner}\t${spacekey}`);

	    let target_faction = winner;
            if (target_faction == "protestant") { his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t${parseInt(his_self.game.state.protestant_war_winner_vp)+1}`); }
            if (target_faction == "ottoman")    { his_self.addMove(`SETVAR\tstate\tottoman_war_winner_vp\t${parseInt(his_self.game.state.ottoman_war_winner_vp)+1}`); }
            if (target_faction == "papacy")     { his_self.addMove(`SETVAR\tstate\tpapacy_war_winner_vp\t${parseInt(his_self.game.state.papacy_war_winner_vp)+1}`); }
            if (target_faction == "france")     { his_self.addMove(`SETVAR\tstate\tfrance_war_winner_vp\t${parseInt(his_self.game.state.france_war_winner_vp)+1}`); }
            if (target_faction == "england")    { his_self.addMove(`SETVAR\tstate\tengland_war_winner_vp\t${parseInt(his_self.game.state.england_war_winner_vp)+1}`); }
            if (target_faction == "hapsburg")   { his_self.addMove(`SETVAR\tstate\thapsburg_war_winner_vp\t${parseInt(his_self.game.state.hapsburg_war_winner_vp)+1}`); }

	    his_self.endTurn();
	  },

	  null,

	  true 

        );

      }

    });


   }

   playerPlayPapacyRegainSpacesForVP(faction) {

    let his_self = this; 

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
            his_self.addMove("display_vp_track");
            his_self.addMove(`control\tpapacy\t${spacekey}`);
            his_self.addMove(`withdraw_to_nearest_fortified_space\t${faction}\t${spacekey}`);
	    his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t${parseInt(his_self.game.state.protestant_war_winner_vp)+1}`);
	    his_self.addMove(`NOTIFY\tProtestants +1 War Winner VP`);
	    his_self.endTurn();
	  },

	  null,

	  true 

        );

      }

    });

  }

  //
  // if we move into this function, we HAVE to endTurn() as we have a RESOLVE
  //
  playerReturnWinterUnits(faction) {

    let his_self = this;

    his_self.game.state.returning_winter_units = true;

    let capitals = this.returnCapitals(faction);
    let viable_capitals = [];
    let units_to_move = [];
    let cancel_func = null;

    let processed_spacekeys = [];
    let selected_destination = "";
    let source_spacekey = "";

    for (let i = 0; i < capitals.length; i++) {
      let c = capitals[i];
      if (this.isSpaceControlled(c, faction)) {
        if (!this.isSpaceInUnrest(c)) {
          viable_capitals.push(capitals[i]);
        }
      }
    }

    var finish_selecting_from_space_function = function() {};
    var select_units_function = function() {};
    var pick_capital_function = function() {};
    var select_spacekey_function = function() {};

    finish_selecting_from_space_function = function(his_self, units_to_move) {

      his_self.updateStatus("processing...");

      processed_spacekeys.push(source_spacekey);

      for (let i = 0; i < units_to_move.length; i++) {
        his_self.removeUnit(units_to_move[i].faction, units_to_move[i].spacekey, units_to_move[i].type);
        his_self.addMove("remove_unit\tland\t"+units_to_move[i].faction+"\t"+units_to_move[i].type+"\t"+units_to_move[i].spacekey+"\t"+his_self.game.player);
        if (!capitals.includes(units_to_move[i].spacekey)) {
          his_self.addMove("build\tland\t"+units_to_move[i].faction+"\t"+units_to_move[i].type+"\t"+selected_destination+"\t"+0);
	} else {
          his_self.addMove("build\tland\t"+units_to_move[i].faction+"\t"+units_to_move[i].type+"\t"+units_to_move[i].spacekey+"\t"+0);
	}
      }

      //
      // reset !
      //
      units_to_move = [];

      his_self.displayBoard();

      let count = his_self.countSpacesWithFilter((space) => {
        if (
          his_self.returnFactionLandUnitsAndLeadersInSpace(faction, space.key) > 0 &&
	  !capitals.includes(space.key) && 
	  !processed_spacekeys.includes(space.key)
	) { return 1; }
        return 0;
      });

      //
      // no viable spaces, so we exit
      //
      if (count == 0) {
        his_self.updateStatus(his_self.returnFactionName(faction) + " no more spaces with units to withdraw");
        his_self.endTurn(); 
        return;
      }

      let msg = his_self.returnFactionName(faction) + " - Winter Return to Capital?";
      if (viable_capitals.length == 1) { msg = his_self.returnFactionName(faction) + " - Winter Recall to " + his_self.returnSpaceName(viable_capitals[0]) + "?"; }
      let opt = "<ul>";
      for (let i = 0; i < viable_capitals.length; i++) {
	if (viable_capitals.length == 1) {
          opt += `<li class="option" id="${viable_capitals[i]}">yes</li>`;
	} else {
          opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
        }
      }
      opt += `<li class="option" id="finish">skip / finish</li>`;
      opt += '</ul>';

      his_self.updateStatusWithOptions(msg, opt);
      his_self.theses_overlay.pushHudUnderOverlay();

      $(".option").off();
      $(".option").on('click', function () {

        let id = $(this).attr('id');

        if (id == "finish") {
          his_self.updateStatus("processing winter relocation...");
          his_self.theses_overlay.hide();
          his_self.endTurn();
          return;
        }

        selected_destination = id;
        select_spacekey_function(his_self, pick_capital_function, select_spacekey_function, select_units_function, finish_selecting_from_space_function);
      });

    }


    select_units_function = function(his_self, units_to_move, select_units_function, pick_capital_function, select_spacekey_function) {

      let unmoved_units = [];
      let moved_units = [];

      let space = his_self.game.spaces[source_spacekey];
      let max_formation_size = 100;
      let msg = his_self.returnFactionName(faction) + " - Select from " + his_self.returnSpaceName(source_spacekey);

      let html = "<ul>";

      for (let i = 0; i < space.units[faction].length; i++) {
        let u = space.units[faction][i];
        if (u.type != "corsair" && u.reformer != true && u.type != "squadron") {
	  let does_units_to_move_have_unit = false;
	  for (let z = 0; z < units_to_move.length; z++) {
	    if (units_to_move[z].faction == faction && units_to_move[z].idx == i && units_to_move[z].spacekey == source_spacekey) { does_units_to_move_have_unit = true; break; }
	  }
	  if (does_units_to_move_have_unit) {
	    html += `<li class="option" style="font-weight:bold" id="${faction}-${i}">*${u.name} (${faction})*</li>`;
	    moved_units.push({ spacekey : source_spacekey , faction : faction , idx : i , type : u.type });
	  } else {
	    html += `<li class="option" id="${faction}-${i}">${u.name} (${faction})</li>`;
	    unmoved_units.push({ spacekey : source_spacekey, faction : faction , idx : i , type : u.type });
	  }
	}
      }

      let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : source_spacekey ,
   	    unmoved_units : unmoved_units ,
   	    moved_units : moved_units ,
	    destination : selected_destination ,
	    units_to_move : units_to_move ,
	    max_formation_size : max_formation_size , 
	    selectUnitsInterface : select_units_function ,
	    selectDestinationInterface : finish_selecting_from_space_function ,
      }

      his_self.movement_overlay.renderForceOpen(mobj, units_to_move, select_units_function, finish_selecting_from_space_function); // no destination interface
      his_self.movement_overlay.pushHudUnderOverlay();

      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";


      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id == "end") {
	    his_self.movement_overlay.hide();
	    finish_selecting_from_space_function(his_self, units_to_move, select_units_function, pick_capital_function, select_spacekey_function, finish_selecting_from_space_function);
	    return;
	}

	let x = id.split("-");
	let f = x[0];
	let idx = parseInt(x[1]);

	let does_units_to_move_have_unit = false;
	for (let z = 0; z < units_to_move.length; z++) {
	    if (units_to_move[z].spacekey == source_spacekey && units_to_move[z].faction == f  && units_to_move[z].idx == idx) {
	      does_units_to_move_have_unit = true; 
	      break; 
	    }
	}

	if (does_units_to_move_have_unit) {
	  for (let z = 0; z < units_to_move.length; z++) {
	    if (units_to_move[z].spacekey == source_spacekey && units_to_move[z].faction === f && units_to_move[z].idx == idx) {
	      units_to_move.splice(z, 1);
	      his_self.available_units_overlay.fadeOut(true);
	      break;
	    }
	  }
	  if (units_to_move.length == 0) {
	    his_self.available_units_overlay.faded_out = false;
	  }
	} else {
          units_to_move.push( { spacekey : source_spacekey , faction : f , idx : idx , type : space.units[f][idx].type });
	}

	select_units_function(his_self, units_to_move, select_units_function, pick_capital_function, select_spacekey_function, finish_selecting_from_space_function);

      });
    }
  


    select_spacekey_function = function(his_self, pick_capital_function, select_spacekey_function, select_units_function, finish_selecting_from_space_function) {

      //
      // reset u2m
      //
      units_to_move = [];

      let count = his_self.countSpacesWithFilter((space) => {
        if (
          his_self.returnFactionLandUnitsInSpace(faction, space.key) > 0 &&
	  !capitals.includes(space.key) && 
	  !processed_spacekeys.includes(space.key)
	) { return 1; }
        return 0;
      });

      //
      // no viable spaces, so we exit
      //
      if (count == 0) {
        his_self.updateStatus(his_self.returnFactionName(faction) + " no more spaces with units to withdraw");
        his_self.endTurn(); 
        return;
      }

      if (faction == "protestant") { his_self.theses_overlay.render("german"); }
      if (faction == "papacy") { his_self.theses_overlay.render("italian"); }
      if (faction == "england") { his_self.theses_overlay.render("english"); }
      if (faction == "france") { his_self.theses_overlay.render("french"); }
      if (faction == "hapsburg") { his_self.theses_overlay.render("spanish"); }
      if (faction == "ottoman") { his_self.theses_overlay.render("ottoman"); }
      his_self.theses_overlay.pushHudUnderOverlay();

      his_self.playerSelectSpaceWithFilter(

        "Select Location to Move Units",

        //
        // any fortified non-capital space
        //
        function(space) {
          if (
            his_self.returnFactionLandUnitsAndLeadersInSpace(faction, space.key) > 0 &&
	    !capitals.includes(space.key) && 
	    !processed_spacekeys.includes(space.key)
	  ) { return 1; }
          return 0;
        },

        //
        // launch unit selection overlay
        //
        function(spacekey) {
	  source_spacekey = spacekey;
	  select_units_function(his_self, units_to_move, select_units_function, pick_capital_function, select_spacekey_function, finish_selecting_from_space_function);
        },
        null ,
        1 
      );
    }

    pick_capital_function = function(his_self, pick_capital_function, select_spacekey_function, select_units_function, finish_selecting_from_space_function) {

      let msg = his_self.returnFactionName(faction) + " - Winter Recall to Capital?";
      if (viable_capitals.length == 1) { msg = his_self.returnFactionName(faction) + " - Winter Recall to " + his_self.returnSpaceName(viable_capitals[0]) + "?"; }
      let opt = "<ul>";
      for (let i = 0; i < viable_capitals.length; i++) {
	if (viable_capitals.length == 1) {
          opt += `<li class="option" id="${viable_capitals[i]}">yes</li>`;
	} else {
          opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
        }
      }
      opt += `<li class="option" id="finish">finish</li>`;
      opt += '</ul>';

      if (viable_capitals.length == 0) {
        his_self.updateStatus(his_self.returnFactionName(faction) + " skipping wintering in capital");
        his_self.endTurn(); 
	return;
      }

      if (faction == "protestant") { his_self.theses_overlay.render("german"); }
      if (faction == "papacy") { his_self.theses_overlay.render("italian"); }
      if (faction == "england") { his_self.theses_overlay.render("english"); }
      if (faction == "france") { his_self.theses_overlay.render("french"); }
      if (faction == "hapsburg") { his_self.theses_overlay.render("spanish"); }
      if (faction == "ottoman") { his_self.theses_overlay.render("ottoman"); }
      his_self.theses_overlay.pushHudUnderOverlay();
      his_self.updateStatusWithOptions(msg, opt);
console.log("just attached options.... should be selectable..");

      $(".option").off();
      $(".option").on('click', function () {
        let id = $(this).attr('id');
	if (id == "finish") {
	  his_self.updateStatus("processing winter relocation...");
	  his_self.theses_overlay.hide();
	  his_self.endTurn();
	  return;
	}
        selected_destination = id;
        select_spacekey_function(his_self, pick_capital_function, select_spacekey_function, select_units_function, finish_selecting_from_space_function);
      });

    }

    //
    // start the magic
    //
    pick_capital_function(his_self, pick_capital_function, select_spacekey_function, select_units_function, finish_selecting_from_space_function);

  }

  playerPlaySpringDeployment(faction, player, removed_queue_instruction="") {

    let his_self = this;

    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("RESOLVE\t"+this.publicKey); his_self.playerPlaySpringDeployment(faction, player, removed_queue_instruction); });

    let capitals = this.returnCapitals(faction);
    let viable_capitals = [];
    let can_deploy = 0;
    let units_to_move = [];
    let cancel_func = null;
    let source_spacekey;
    let does_faction_have_spring_preparations = false;

    //
    // Spring Preparations 102
    //
    let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, faction);
    for (let z = 0; z < his_self.game.deck[0].fhand[fhand_idx].length; z++) {
      if (his_self.game.deck[0].fhand[fhand_idx][z] === "102") {
	does_faction_have_spring_preparations = true;
	let controls_capital = false;
        for (let i = 0; i < capitals.length; i++) {
          if (his_self.isSpaceControlled(capitals[i], faction)) {
	    controls_capital = true;
	  }
        }
	if (!controls_capital) { does_faction_have_spring_preparations = false; }
      }
    }

    for (let i = 0; i < capitals.length; i++) {
      let c = capitals[i];
      if (this.game.spaces[c].units[faction].length > 0) {
        if (this.game.spaces[c].unrest == 0) {
          can_deploy = 1;
          viable_capitals.push(capitals[i]);
        }
      }
    }

    if (can_deploy == 0) {
      this.updateStatus("Spring Deployment not possible");
      this.endTurn();
    } else {

      let msg = this.returnFactionName(faction) + " - Spring Deploy from:";     
      if (faction === "ottoman") { msg = "Ottomans - Spring Deploy from?"; }

      let opt = "<ul>";
      for (let i = 0; i < viable_capitals.length; i++) {
	opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
      }
      if (does_faction_have_spring_preparations == true) {
	opt += `<li class="option showcard" id="102">Spring Preparations</li>`;
      }
      opt += `<li class="option" id="pass">skip</li>`;
      opt += '</ul>';


      his_self.spring_deployment_overlay.render(faction);
      his_self.spring_deployment_overlay.pushHudUnderOverlay();

      this.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function () {

        let id = $(this).attr('id');

	his_self.cardbox.hide();

	if (id == "102") {
	  // remove RESOLVE, we want to play and re-trigger, including adding extra
	  his_self.moves = [];	  
	  if (removed_queue_instruction != "") { his_self.addMove(removed_queue_instruction); }
	  his_self.addMove("discard\t"+faction+"\t"+"102");
	  his_self.addMove("spring_preparations\t"+faction);
	  his_self.addMove("hide_overlay\tspring_deployment");
	  his_self.cardbox.hide();
	  his_self.endTurn();
	  return;
	}

	source_spacekey = id;
        $(".option").off();
        his_self.spring_deployment_overlay.hide();

	if (id === "pass") {
	  his_self.updateStatus("passing...");
	  his_self.endTurn();
	  return;
        }

        his_self.playerSelectSpaceWithFilter(

          "Select Destination for Units from Capital: ",

          function(space) {
            if (his_self.isSpaceFriendly(space, faction)) {
	      // 2 = transit seas
	      // source_spacekey => connect to this capital
	      if (space.unrest) { return 0; }
              if (his_self.isSpaceConnectedToCapitalSpringDeployment(space, faction, 2, source_spacekey)) { // 2 = no independent or enemy ships
                if (!his_self.isSpaceFactionCapital(space, faction)) {
		  if (his_self.game.state.events.schmalkaldic_league == 0) {
		    if (his_self.isSpaceElectorate(space.key)) {
		      return 0;
		    }
		  }
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
	      units_to_move.sort(function(a, b){return parseInt(a.idx)-parseInt(b.idx)});

              for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+units_to_move[i].faction+"\tland\t"+source_spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i].idx);
              }

	      his_self.unbindBackButtonFunction();

              //his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" spring deploys to "+his_self.game.spaces[destination_spacekey].name);
              his_self.endTurn();
	      his_self.available_units_overlay.faded_out = false;
              return;

	    };

            let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) { 
              let unmoved_units = [];
              let moved_units = [];
	      let space = his_self.game.spaces[source_spacekey];

	      let max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, source_spacekey);
	      if (faction != his_self.game.state.events.spring_preparations) { 
  		if (his_self.isSpaceConnectedToCapitalSpringDeployment(destination_spacekey, faction, 0) == 0) {
		  if (max_formation_size > 5) { max_formation_size = 5; } 
	        }
  	      }

	      let msg = "Max Formation Size: " + max_formation_size + " units";
	      let html = '<ul>';

	      for (let key in space.units) {
                if (his_self.returnPlayerCommandingFaction(key) == his_self.game.player) {
                  for (let i = 0; i < space.units[key].length; i++) {
	            if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
                    if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
                    if (space.units[key][i].type != "corsair" && space.units[key][i].type != "squadron") {
                      let does_units_to_move_have_unit = false;
                      for (let z = 0; z < units_to_move.length; z++) {
                        if (units_to_move[z].faction == key && units_to_move[z].idx == i) { 
does_units_to_move_have_unit = true; }
		      }
                      if (does_units_to_move_have_unit) {
                        html += `<li class="option" style="font-weight:bold" id="${key}-${i}">*${space.units[key][i].name} (${key})*</li>`;
                        moved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
                      } else {
                        html += `<li class="option" id="${key}-${i}">${space.units[key][i].name} (${key})</li>`;
                        unmoved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
                      }
                    }
                    }
                    }
                  }
                }
	      }

              let mobj = {
                space : space ,
                faction : faction ,
                source : source_spacekey ,
                unmoved_units : unmoved_units ,
                moved_units : moved_units ,
                destination : destination_spacekey ,
		units_to_move : units_to_move ,
		max_formation_size : max_formation_size ,
              }


	      //
	      // auto-move if only 1 unit
	      //
	      let can_we_quick_move = false;
	      if (mobj.moved_units.length == 0 && mobj.unmoved_units.length == 1) { can_we_quick_move = true; } 

	      if (can_we_quick_move == false) {
   	        his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface
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

	        let x = id.split("-");
	        let f = x[0];
	        let idx = parseInt(x[1]);

	        let uob = his_self.returnOnBoardUnits(f);

	        let does_units_to_move_have_unit = false;
	        for (let z = 0; z < units_to_move.length; z++) {
	          if (units_to_move[z].faction === f && units_to_move[z].idx == idx) {
		    does_units_to_move_have_unit = true;
		    break;
		  }
	        }

	        if (does_units_to_move_have_unit) {

	          if (uob.overcapacity == 1) {
	            alert("This faction is over-capacity (no more free 1-UNIT tokens). Please move by clicking on the circular tokens you wish to move instead of manually re-assigning by numbers");
		    his_self.spring_deployment_overlay.hide();
		    his_self.playerPlaySpringDeployment(faction, player, removed_queue_instruction);
	            return;
	          }

	          for (let z = 0; z < units_to_move.length; z++) {
	            if (units_to_move[z].faction === f && units_to_move[z].idx == idx) {
		      units_to_move.splice(z, 1);
	              his_self.available_units_overlay.fadeOut(true);
		      break;
		    }
	          }
	        } else {

	          if (uob.overcapacity == 1) {
	            alert("This faction is over-capacity (no more free 1-UNIT tokens). Please move by clicking on the circular tokens you wish to move instead of manually re-assigning by numbers");
		    his_self.spring_deployment_overlay.hide();
		    his_self.playerPlaySpringDeployment(faction, player, removed_queue_instruction);
	            return;
	          }


	          //
	          // check for max formation size
	          //
	          let unitno = 0;
	          for (let i = 0; i < units_to_move.length; i++) {
	            if (space.units[units_to_move[i].faction][units_to_move[i].idx].command_value == 0) { unitno++; }
	            if (unitno >= max_formation_size) { 
		      max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	              if (unitno >= max_formation_size) { 
	                alert("Maximum Formation Size: " + max_formation_size);
	                return;
		      }
	            }
	          }

	          units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	        }

                selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);

              });

	      if (can_we_quick_move) {
		units_to_move = JSON.parse(JSON.stringify(mobj.unmoved_units));
	        selectDestinationInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	        his_self.displaySpace(source_spacekey);
	        his_self.displaySpace(destination_spacekey);
		his_self.updateStatus("deploying...");
		return;
	      }
            }

            selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
          },

	  null ,

	  true

        );
      });
    }
  }

  returnMaxFormationSize(units_to_move, faction = "", spacekey = "") {

    let utm = [];
    if (units_to_move.length > 0) {
      if (typeof units_to_move[0] != "number") {
	for (let z = 0; z < units_to_move.length; z++) {
	  if (units_to_move[z].type && !units_to_move[z].owner) {
	    let added = 0;
	    for (let y = 0; added == 0 && y < this.game.spaces[spacekey].units[units_to_move[z].faction].length; y++) {
	      let u = this.game.spaces[spacekey].units[units_to_move[z].faction][y];
	      if (u.type !== "regular" && u.type !== "mercenary" && u.type !== "cavalry" && u.type !== "corsair" && u.type !== "squadron") {
		if (u.type === units_to_move[z].type) {
	    	  utm.push(this.game.spaces[spacekey].units[units_to_move[z].faction][y]);
		  added = 1;
		}
	      }
	    }
	    if (added == 0) {
	      utm.push(this.game.spaces[spacekey].units[units_to_move[z].faction][units_to_move[z].idx]);
	    }
	  } else {
	    utm.push(units_to_move[z]);
	  }
	}
      } else {
        for (let i = 0; i < units_to_move.length; i++) { utm.push(this.game.spaces[spacekey].units[faction][units_to_move[i]]); }
      }
    }

    let command_value_one = 0;
    let command_value_two = 0;
    let max_command_value = 0;

    for (let i = 0; i < utm.length; i++) {
      if (utm[i].command_value > 0) {
        // we can have up to two army leaders combine command values
	if (command_value_one == 0) {
	  command_value_one = utm[i].command_value; 
	} else {
	  if (command_value_two == 0) {
	    command_value_two = utm[i].command_value;
	  } else {
  	    if (command_value_one > command_value_two && utm[i].command_value > command_value_one) {
	      command_value_one = utm[i].command_value;
	    } else {
	      if (command_value_one < command_value_two && utm[i].command_value > command_value_two) {
	        command_value_two = utm[i].command_value;
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

  //
  // duplicates playerMoveFormationInClear -- this is the function we hit
  // if we use the shortcut "continue move". the reason we need to duplicate
  // is that the handling of the OPS is slightly different and there is a 
  // spacekey argument in the function call that doesn't exist otherwise.
  //
  async playerContinueToMoveFormationInClear(his_self, player, faction, spacekey, ops_to_spend, ops_remaining=0) {

    // BACK moves us to OPS menu
    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("discard\t"+his_self.returnControllingPower(faction)+"\t"+his_self.game.player_last_card); his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining, ""); });

    //
    // we add this before broadcasting, or the turn ends 
    //
    // blank is "card", which we don't care about anymore so don't include
    let continue_move = "continue\t"+this.game.player+"\t"+faction+"\t"+""+"\t"+(ops_remaining-ops_to_spend);

    let parent_faction = faction;
    let units_to_move = [];
    let cancel_func = null;
    let space = this.game.spaces[spacekey];
    let protestant_player = his_self.returnPlayerOfFaction("protestant");
    let parent_player = his_self.returnPlayerCommandingFaction(faction);

	//
	// first define the functions that will be used internally
	//
	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      // no-one can move into electorates before schmalkaldic league forms
              if (his_self.game.player != protestant_player && his_self.game.state.events.schmalkaldic_league == 0) {
		if (space.type == "electorate") { return 0; }
	      }
	      // you cannot move into spaces that are not allied or enemies
              if (!his_self.canFactionMoveIntoSpace(faction, space.key)) { return 0; }
	      if (space.neighbours.includes(spacekey)) {
	        if (!space.pass) { 
		  return 1; 
		} else {
 		  if (!space.pass.includes(spacekey)) {
		    return 1;
		  } else {
		    if (ops_remaining > 1) {
		      // we have to flag and say, "this costs an extra op"
		      return 1;
		    } else {
		      return 0;
		    }
		  }
		}
	  	return 1;
              }
	      return 0;
            },

      	    function(destination_spacekey) {

	      units_to_move.sort(function(a, b){return parseInt(a.idx)-parseInt(b.idx)});
	
	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      //
	      // modify "continue" instruction if this is a move over a pass
	      //
	      let space = his_self.game.spaces[spacekey];
	      if (space.pass) {
		if (space.pass.includes(destination_spacekey)) {
		  let y = continue_move.split("\t");
		  let new_ops_remaining = parseInt(y[4])-1;
	  	  continue_move = y[0] + "\t" + y[1] + "\t" + y[2] + "\t" + y[3] + "\t" + new_ops_remaining + "\t" + y[5];
	        }
	      }

	      //
	      // "skip" interception check if we already have units in this space
	      //
	      if (his_self.returnFactionLandUnitsInSpace(faction, destination_spacekey) > 0) {
	        his_self.addMove("interception_check\t"+"skip"+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      } else {
	        his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      } 

              units_to_move.sort(function(a, b){return parseInt(a.idx)-parseInt(b.idx)});

	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+units_to_move[i].faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i].idx);
	      }
    	      if (his_self.game.state.events.intervention_on_movement_possible == 0) {
      		his_self.addMove("ACKNOWLEDGE\t" + his_self.returnFactionName(faction) + " moves to " + his_self.game.spaces[destination_spacekey].name);
	      } else {
                his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination_spacekey].name + "\tmove\t" + destination_spacekey);
	        his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      }
	      his_self.prependMove(continue_move);
	      his_self.endTurn();
	      his_self.available_units_overlay.faded_out = false;

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let unmoved_units = [];
	  let moved_units = [];

          let space = his_self.game.spaces[spacekey];
	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let key in space.units) {
	    if (his_self.returnPlayerCommandingFaction(key) == parent_player && (key == faction || his_self.returnControllingPower(key) == faction)) {
	      for (let i = 0; i < space.units[key].length; i++) {
                if (space.units[key][i].type != "corsair" && space.units[key][i].type != "squadron") {
	        if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
	        if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
	          if (space.units[key][i].locked != 1 && (!(his_self.game.state.events.foul_weather == 1 && space.units[key][i].already_moved == 1))) {
	    	    let does_units_to_move_have_unit = false;
	    	    for (let z = 0; z < units_to_move.length; z++) {
	    	      if (units_to_move[z].faction == key && units_to_move[z].idx == i) { does_units_to_move_have_unit = true; break; }
	    	    }
	            if (does_units_to_move_have_unit) {
	              html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[key][i].name} (${key})*</li>`;
		      moved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            } else {
	              html += `<li class="option" id="${key}-${i}">${space.units[key][i].name} (${key})</li>`;
		      unmoved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            }
	          }
	        }
	        }
	        }
	      }
	    }
	  }

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
   	    unmoved_units : unmoved_units ,
   	    moved_units : moved_units ,
	    destination : "" ,
	    units_to_move : units_to_move ,
	    max_formation_size : max_formation_size , 
	  }

   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface
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

	    let x = id.split("-");
	    let f = x[0];
	    let idx = parseInt(x[1]);

	    let uob = his_self.returnOnBoardUnits(f);

	    let does_units_to_move_have_unit = false;
	    for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z].faction === f && units_to_move[z].idx == idx) {
	        does_units_to_move_have_unit = true; 
		break; 
	      }
	    }

	    if (does_units_to_move_have_unit) {

	      if (uob.overcapacity == 1) {
	        alert("This faction is over-capacity (no more free 1-UNIT tokens). Please move by clicking on the circular tokens you wish to move instead of manually re-assigning by numbers");
		his_self.movement_overlay.hide();
		his_self.playerContinueToMoveFormationInClear(his_self, player, faction, spacekey, ops_to_spend, ops_remaining);
	        return;
	      }

	      for (let z = 0; z < units_to_move.length; z++) {
	        if (units_to_move[z].faction === f && units_to_move[z].idx == idx) {
		  units_to_move.splice(z, 1);
	          his_self.available_units_overlay.fadeOut(true);
		  break;
		}
	      }

	      if (units_to_move.length == 0) {
		his_self.available_units_overlay.faded_out = false;
	      }

	    } else {

	      if (uob.overcapacity == 1) {
	        alert("This faction is over-capacity (no more free 1-UNIT tokens). Please move by clicking on the circular tokens you wish to move instead of shifting forces in 1-UNIT increments");
		his_self.movement_overlay.hide();
		his_self.playerContinueToMoveFormationInClear(his_self, player, faction, spacekey, ops_to_spend, ops_remaining);
	        return;
	      }

	      //
	      // check for max formation size
	      //
	      let unitno = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
	        if (space.units[units_to_move[i].faction][units_to_move[i].idx].command_value == 0) { unitno++; }
	        if (unitno >= max_formation_size) { 
		  max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	          if (unitno >= max_formation_size) { 
	            alert("Maximum Formation Size: " + max_formation_size);
	            return;
		  }
	        }
	      }

	      units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}

	//
	// is this a rapid move ?
	//
	let max_formation_size = his_self.returnMaxFormationSize(space.units[faction]);
	let units_in_space = his_self.returnFactionLandUnitsInSpace(faction, space, true); // true ==> include minor allies
	let can_we_quick_move = false;
	if (max_formation_size >= units_in_space) { can_we_quick_move = true; }
	for (let f in space.units) {
	  for (let z = 0; z < space.units[f].length; z++) {
	    if (space.units[f][z].locked == 1) { can_we_quick_move = false; }
	  }
	}

	if (can_we_quick_move == true) {

	  let msg = "Choose Movement Option: ";
	  let html = "<ul>";
	  html += `<li class="option" id="auto">move everything (auto)</li>`;
	  html += `<li class="option" id="manual">select units (manual)</li>`;
	  html += "</ul>";
	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    for (let key in space.units) {
	      if (his_self.returnPlayerCommandingFaction(key) == his_self.game.player) {
	        for (let i = 0; i < space.units[key].length; i++) {
	          if (space.units[key][i].already_moved == 1 && his_self.game.state.events.foul_weather == 1 && id === "auto") {
		    alert("Foul Weather: units in this space have already been moved, so movement from this space must happen manually using only unmoved forces");
		    return;
	          }
	        }
	      }
	    }

	    $('.option').off();

	    if (id === "auto") {
	      for (let key in space.units) {
	        if (his_self.returnPlayerCommandingFaction(key) == his_self.game.player) {
	          for (let i = 0; i < space.units[key].length; i++) {
	            if (space.units[key][i].type !== "squadron" && space.units[key][i].type !== "corsair") {
	            if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
	            if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
		      units_to_move.push({ faction : key , idx : i , type : space.units[key][i].type });
	            }
	            }
	            }
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

  }

  async playerMoveFormationInClear(his_self, player, faction, ops_to_spend=0, ops_remaining=0) {

    // BACK moves us to OPS menu
    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("discard\t"+his_self.returnControllingPower(faction)+"\t"+his_self.game.player_last_card); his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

    let parent_faction = faction;
    let units_to_move = [];
    let cancel_func = null;
    let spacekey = "";
    let space = null;
    let protestant_player = his_self.returnPlayerOfFaction("protestant");
    let parent_player = his_self.returnPlayerCommandingFaction(faction);

	//
	// first define the functions that will be used internally
	//
	let selectDestinationInterface = function(his_self, units_to_move) {  

    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      // no-one can move into electorates before schmalkaldic league forms
              if (his_self.game.player != protestant_player && his_self.game.state.events.schmalkaldic_league == 0) {
		if (space.type == "electorate") { return 0; }
	      }
	      // cannot move into the space you are leaving
	      if (space.key === spacekey) { return 0; }

	      // you cannot move into spaces that are not allied or enemies
              if (!his_self.canFactionMoveIntoSpace(faction, space.key)) { return 0; }
	      if (space.neighbours.includes(spacekey)) {
	        if (!space.pass) { 
		  return 1; 
		} else {
 		  if (!space.pass.includes(spacekey)) {
		    return 1;
		  } else {
		    if (ops_remaining >= 1) {
		      // we have to flag and say, "this costs an extra op"
		      return 1;
		    } else {
		      return 0;
		    }
		  }
		}
	  	return 1;
              }
	      return 0;
            },

      	    function(destination_spacekey) {

	      units_to_move.sort(function(a, b){return parseInt(a.idx)-parseInt(b.idx)});
	
	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      //
	      // modify "continue" instruction if this is a move over a pass
	      //
	      let space = his_self.game.spaces[spacekey];
	      if (space.pass) {
		if (space.pass.includes(destination_spacekey)) {
	          for (let i = 0; i < his_self.moves.length; i++) {
		    let x = his_self.moves[i];
		    let y = x.split("\t");
		    let new_ops_remaining = parseInt(y[4])-1;
		    if (y[0] === "continue") {
		      if (new_ops_remaining) {
	  	        his_self.moves[i] = y[0] + "\t" + y[1] + "\t" + y[2] + "\t" + y[3] + "\t" + new_ops_remaining + "\t" + y[5];
  	  	      } else {
		        his_self.moves.splice(i, 1);
		      }
		    }
	          }
	        }
	      }

	      //
	      // "skip" interception check if we already have units in this space
	      //
	      if (his_self.returnFactionLandUnitsInSpace(faction, destination_spacekey) > 0) {
	        his_self.addMove("interception_check\t"+"skip"+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      } else {
	        his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      } 

              units_to_move.sort(function(a, b){return parseInt(a.idx)-parseInt(b.idx)});

	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+units_to_move[i].faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i].idx);
	      }
    	      if (his_self.game.state.events.intervention_on_movement_possible == 0) {
      		his_self.addMove("ACKNOWLEDGE\t" + his_self.returnFactionName(faction) + " moves to " + his_self.game.spaces[destination_spacekey].name);
	      } else {
                his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination_spacekey].name + "\tmove\t" + destination_spacekey);
	        his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      }
	      his_self.endTurn();
	      his_self.available_units_overlay.faded_out = false;

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let unmoved_units = [];
	  let moved_units = [];

          let space = his_self.game.spaces[spacekey];
	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let key in space.units) {
	    if (his_self.returnPlayerCommandingFaction(key) == parent_player && (key == faction || his_self.returnControllingPower(key) == faction)) {
	      for (let i = 0; i < space.units[key].length; i++) {
                if (space.units[key][i].type != "corsair" && space.units[key][i].type != "squadron") {
	        if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
	        if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
	          if (space.units[key][i].locked != 1 && (!(his_self.game.state.events.foul_weather == 1 && space.units[key][i].already_moved == 1))) {
	    	    let does_units_to_move_have_unit = false;
	    	    for (let z = 0; z < units_to_move.length; z++) {
	    	      if (units_to_move[z].faction == key && units_to_move[z].idx == i) { does_units_to_move_have_unit = true; break; }
	    	    }
	            if (does_units_to_move_have_unit) {
	              html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[key][i].name} (${key})*</li>`;
		      moved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            } else {
	              html += `<li class="option" id="${key}-${i}">${space.units[key][i].name} (${key})</li>`;
		      unmoved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            }
	          }
	        }
	        }
	        }
	      }
	    }
	  }

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
   	    unmoved_units : unmoved_units ,
   	    moved_units : moved_units ,
	    destination : "" ,
	    units_to_move : units_to_move ,
	    max_formation_size : max_formation_size , 
	  }

   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface
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

	    let x = id.split("-");
	    let f = x[0];
	    let idx = parseInt(x[1]);

	    let uob = his_self.returnOnBoardUnits(f);

	    let does_units_to_move_have_unit = false;
	    for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z].faction === f && units_to_move[z].idx == idx) {
	        does_units_to_move_have_unit = true; 
		break; 
	      }
	    }

	    if (does_units_to_move_have_unit) {

	      if (uob.overcapacity == 1) {
	        alert("This faction is over-capacity (no more free 1-UNIT tokens). Please move by clicking on the circular tokens you wish to move instead of manually re-assigning by numbers");
		his_self.movement_overlay.hide();
		his_self.playerMoveFormationInClear(his_self, player, faction, ops_to_spend, ops_remaining);
	        return;
	      }

	      for (let z = 0; z < units_to_move.length; z++) {
	        if (units_to_move[z].faction === f && units_to_move[z].idx == idx) {
		  units_to_move.splice(z, 1);
	          his_self.available_units_overlay.fadeOut(true);
		  break;
		}
	      }

	      if (units_to_move.length == 0) {
		his_self.available_units_overlay.faded_out = false;
	      }

	    } else {

	      if (uob.overcapacity == 1) {
	        alert("This faction is over-capacity (no more free 1-UNIT tokens). Please move by clicking on the circular tokens you wish to move instead of shifting forces in 1-UNIT increments");
		his_self.movement_overlay.hide();
		his_self.playerMoveFormationInClear(his_self, player, faction, ops_to_spend, ops_remaining);
	        return;
	      }

	      //
	      // check for max formation size
	      //
	      let unitno = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
	        if (space.units[units_to_move[i].faction][units_to_move[i].idx].command_value == 0) { unitno++; }
	        if (unitno >= max_formation_size) { 
		  max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	          if (unitno >= max_formation_size) { 
	            alert("Maximum Formation Size: " + max_formation_size);
	            return;
		  }
	        }
	      }

	      units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	//
	// end select units
	//


    his_self.playerSelectSpaceWithFilter(

      "Select Town from which to Move Units:",

      function(space) {
	let num_moveable = 0;
	if (space.key == "persia" || space.key == "egypt" || space.key == "ireland") { return 0; }
	if (space.besieged == 2) { return 0; } // you cannot move from a town just placed under siege

        //
        // no moving if you are besieged
        //
	if (space.besieged == 1) { 
	  for (let z in space.units) {
	    if (his_self.returnPlayerCommandingFaction(z) == his_self.game.player) {
	      for (let i = 0; i < space.units[z].length; i++) {
	        let u = space.units[z][i];
	        if (u.besieged == 1) { return 0; }
	      }
	    }
	  }
	}

	for (let z in space.units) {
	  if (space.units[z].length > 0 && his_self.returnPlayerCommandingFaction(z) == his_self.game.player && (z == faction || his_self.returnControllingPower(z) == faction)) {
	    //
	    // Foul Weather prevents spaces with already moved units
	    //
	    let army_and_navy_leaders = 0;
            if (his_self.returnPlayerCommandingFaction(z) == his_self.game.player) {
              for (let i = 0; i < space.units[z].length; i++) {
	        if (space.units[z][i].locked != 1) {
		  if (space.units[z][i].type === "cavalry") { num_moveable++; }
		  if (space.units[z][i].type === "regular") { num_moveable++; }
		  if (space.units[z][i].type === "mercenary") { num_moveable++; }
		  if (space.units[z][i].battle_rating > 0) { army_and_navy_leaders++; num_moveable++; }
                  if (space.units[z][i].already_moved == 1 && his_self.game.state.events.foul_weather == 1) {
	            num_moveable--;
                  }
                }
              }
	      if (num_moveable <= 0) {
		return 0;
	      }
	      if (army_and_navy_leaders == num_moveable) {
		return 0;
	      }
            }

	    return 1;
	  }
	}
	return 0;
      },

      function(skey) {

	spacekey = skey;

        let space = his_self.game.spaces[spacekey];

	//
	// is this a rapid move ?
	//
	let max_formation_size = his_self.returnMaxFormationSize(space.units[faction]);
	let units_in_space = his_self.returnFactionLandUnitsInSpace(faction, space, true); // true ==> include minor allies
	let can_we_quick_move = false;
	if (max_formation_size >= units_in_space) { can_we_quick_move = true; }
	for (let f in space.units) {
	  for (let z = 0; z < space.units[f].length; z++) {
	    if (space.units[f][z].locked == 1) { can_we_quick_move = false; }
	  }
	}

	if (can_we_quick_move == true) {

	  let msg = "Choose Movement Option: ";
	  let html = "<ul>";
	  html += `<li class="option" id="auto">move everything (auto)</li>`;
	  html += `<li class="option" id="manual">select units (manual)</li>`;
	  html += "</ul>";
	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    for (let key in space.units) {
	      if (his_self.returnPlayerCommandingFaction(key) == his_self.game.player) {
	        for (let i = 0; i < space.units[key].length; i++) {
	          if (space.units[key][i].already_moved == 1 && his_self.game.state.events.foul_weather == 1 && id === "auto") {
		    alert("Foul Weather: units in this space have already been moved, so movement from this space must happen manually using only unmoved forces");
		    return;
	          }
	        }
	      }
	    }

	    $('.option').off();

	    if (id === "auto") {
	      for (let key in space.units) {
	        if (his_self.returnPlayerCommandingFaction(key) == his_self.game.player) {
	          for (let i = 0; i < space.units[key].length; i++) {
	            if (space.units[key][i].type !== "squadron" && space.units[key][i].type !== "corsair") {
	            if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
	            if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
		      units_to_move.push({ faction : key , idx : i , type : space.units[key][i].type });
	            }
	            }
	            }
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

  //
  // players select a card with at least [cost] ops. this respects the "cannot pay with mandatory cards"
  // limitation.
  //
  canPlayerSelectOps(faction, cost) {

    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    let cards = [];
    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
      let c = this.game.deck[0].fhand[faction_hand_idx][i];
      if (this.game.deck[0].cards[c].type != "mandatory" && this.game.deck[0].cards[c].ops >= cost) {
	return 1;
      }
    }

    return 0;
  }
  playerSelectOps(faction, cost, mycallback=null, optional_msg="", ignore_cards=[]) {

    let his_self = this;

    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    let cards = [];
    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
      let c = this.game.deck[0].fhand[faction_hand_idx][i];
      if (this.game.deck[0].cards[c].type != "mandatory" && this.game.deck[0].cards[c].ops >= cost) {
	if (!ignore_cards.includes(c)) {
          cards.push(c);
	}
      }
    }

    if (optional_msg == "") { optional_msg = "Select a Card: "; }
    this.updateStatusAndListCards(optional_msg, cards);
    this.attachCardboxEvents((card) => {
      try {
        $('.card').off();
        $('.card img').off();
      } catch (err) {}
      mycallback(card);
    });  

  }


// faction is the attacker in pre-naval battles, but it should be the defender
//            this.playerEvaluateNavalRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey, defender);
//
// post battle this is:
//
// this.playerEvaluateNavalRetreatOpportunity(loser, spacekey, "", loser, true); 
//
  playerEvaluateNavalRetreatOpportunity(faction, spacekey, player_comes_from_this_spacekey="", defender="", post_battle=false) {

    let his_self = this;
    let retreat_destination = "";

    let is_port_battle = false;
    let space;
    if (his_self.game.spaces[spacekey]) { is_port_battle = true; space = his_self.game.spaces[spacekey]; }
    if (his_self.game.navalspaces[spacekey]) { space = his_self.game.navalspaces[spacekey]; }

    let neighbours = this.returnNavalAndPortNeighbours(spacekey);
    let retreat_options = 0;
    for (let i = 0; i < neighbours.length; i++) {
      if (his_self.canFactionRetreatToNavalSpace(faction, neighbours[i])) {
	retreat_options++;
      }
    }

    let surviving_units = 0;
    for (let f in space.units) {
      let cf = this.returnControllingPower(f);
      if (cf == faction || f == faction || this.areAllies(f, faction)) {
        for (let i = 0; i < space.units[f].length; i++) {
	  let u = space.units[f][i];
	  if (u.type == "squadron" || u.type == "corsair") {
	    surviving_units++;
	  }
	}
      }
    }

    if (surviving_units == 0) {
      his_self.updateLog("No units survive to retreat...");
      his_self.endTurn();
      return 0;
    }


    if (retreat_options == 0) {
      his_self.updateLog("Naval retreat not possible...");
      his_self.endTurn();
      return 0;
    }

    let onFinishSelect = function(his_self, destination_spacekey) {
      for (let f in space.units) {
        let cf = his_self.returnControllingPower(f);
        if (cf == faction || f == faction) {
	  if (post_battle) { 
	    // 1 at the end = lock the retreating units
            his_self.addMove("naval_retreat"+"\t"+f+"\t"+spacekey+"\t"+destination_spacekey+"\t1");
	  } else {
            his_self.addMove("naval_retreat"+"\t"+f+"\t"+spacekey+"\t"+destination_spacekey);
	  }
	}
      }
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {
      let available_destinations = false;
      let html = "<ul>";
      for (let i = 0; i < neighbours.length; i++) {
        if (his_self.canFactionRetreatToNavalSpace(defender, neighbours[i])) {
          available_destinations = true;
          html += `<li class="option" id="${neighbours[i]}">${his_self.returnSpaceName(neighbours[i])}</li>`;
	}
      }
      if (available_destinations == false) {
        html += `<li class="option" id="skip">skip (no options)</li>`;
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Naval Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");

	his_self.updateStatus("retreating...");

	if (id === "skip") {
	  his_self.endTurn();
	  return;
	}
        onFinishSelect(his_self, id);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">do not retreat</li>`;
    html    += `</ul>`;

    if (post_battle) {
      if (this.game.state.events.unexpected_war == 1) {
        this.updateStatusWithOptions(`${this.returnFactionName(faction)} must retreat. Retreat?`, html);
      } else {
	if (is_port_battle) {
          this.updateStatusWithOptions(`${this.returnFactionName(faction)} must retreat from Port Assault. Retreat?`, html);
	} else {
          this.updateStatusWithOptions(`${this.returnFactionName(faction)} loses the battle. Retreat?`, html);
	}
      }
    } else {
      this.updateStatusWithOptions(`${this.returnFactionName(defender)} - ${this.returnFactionName(faction)} approaches ${this.returnSpaceName(spacekey)}. Retreat?`, html);
      //
      // pre-battle, this swap is NEEDED as faction is what retreats
      //
      faction = defender;
    }
    this.attachCardboxEvents(function(user_choice) {

      if (user_choice === "retreat") {
        his_self.updateStatus("retreating...");
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	if (post_battle) {
          his_self.updateStatus("fleet is sacrificed...");
          his_self.addMove("destroy_faction_units_in_spacekey\t"+faction+"\t"+spacekey);
	} else {
          his_self.updateStatus("processing...");
	}
	his_self.endTurn();
        return;
      }
    });

  }



  playerEvaluateBreakSiegeRetreatOpportunity(attacker, spacekey) {

    let his_self = this;
    let retreat_destination = "";

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
	his_self.updateStatus("retreating...");
        onFinishSelect(his_self, id);
      });
    };

    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">sacrifice forces</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`${this.returnFactionName(attacker)} - siege broken in ${this.returnSpaceName(spacekey)}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
        his_self.addMove("destroy_faction_units_in_spacekey\t"+attacker+"\t"+spacekey);
	his_self.endTurn();
        return;
      }
    });

  }


  playerEvaluatePostBattleRetreatOpportunity(loser, winner, attacker, spacekey, attacker_comes_from_this_spacekey="") {

    let his_self = this;
    let retreat_destination = "";
    let space_name = this.game.spaces[spacekey].name;

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("retreat"+"\t"+loser+"\t"+spacekey+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      his_self.field_battle_overlay.hide();

      his_self.playerSelectSpaceWithFilter(

                  "Choose Destination for Retreat:" ,

        	  function(space2) {

	            if (space.neighbours.includes(space2.key)) {
		      if (his_self.returnPlayerCommandingFaction(loser) === his_self.returnPlayerCommandingFaction(attacker)) {
	  		if (space2.key === attacker_comes_from_this_spacekey) {
          		  return 1;
	  		}
		      } else {
          		if (his_self.canFactionRetreatToSpace(loser, space2.key, "") && space2.key !== attacker_comes_from_this_spacekey) {
          		  return 1;
	  		}
		      }
		    }
	            return 0;
		  },

      		  function(spacekey) {
		    his_self.updateStatus("retreating...");

                    onFinishSelect(his_self, spacekey);
		  },

	    	  null, 

	    	  true 

      );
    };

    
    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">sacrifice forces</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`${this.returnFactionName(loser)} retreats, yes?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
        his_self.addMove("destroy_faction_units_in_spacekey\t"+loser+"\t"+spacekey);
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
	his_self.updateStatus("retreating...");
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

    this.updateStatusWithOptions(`${this.returnFactionName(defender)} -- ${this.returnFactionName(attacker)} approaches ${this.returnSpaceName(spacekey)}. Retreat?`, html);
    this.attachCardboxEvents(function(user_choice) {

      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	if (is_attacker_loser) {
          his_self.addMove("destroy_faction_units_in_spacekey\t"+attacker+"\t"+spacekey);
	}
	his_self.endTurn();
        return;
      }
    });
  }


  playerEvaluateFortification(attacker, faction, spacekey, post_battle=0, relief_siege=0) {

console.log("Relief Siege? " + relief_siege);

    let his_self = this;

    let html = `<ul>`;
    html    += `<li class="card" id="fortify">withdraw into fortification</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`${his_self.returnFactionName(faction)} - Withdraw Units into Fortification?`, html);
    this.attachCardboxEvents(function(user_choice) {
      this.unbindBackButtonFunction();
      this.updateStatus("acknowledge...");
      if (user_choice === "fortify") {
	his_self.addMove("fortification\t"+attacker+"\t"+faction+"\t"+spacekey+"\t"+post_battle+"\t"+relief_siege);
	his_self.endTurn();
        return;
      }
      if (user_choice === "skip") {
	his_self.game.state.rejected_pre_battle_fortification.push(faction);
	his_self.endTurn();
        return;
      }
    });

  }


  playerEvaluateReliefForce(faction, spacekey) {

    let his_self = this;

    let html = `<ul>`;
    html    += `<li class="card" id="break">participate in battle</li>`;
    html    += `<li class="card" id="skip">remain besieged</li>`;
    html    += `</ul>`;

    this.game.state.field_battle_relief_battle = true;

    this.updateStatusWithOptions(`Do Your Besieged Forces participate in this Field Battle?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "break") {
	his_self.addMove("relief_forces_join_battle\t"+faction+"\t"+spacekey);
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
    let parent_player = his_self.returnPlayerCommandingFaction(defender);

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("intercept"+"\t"+attacker+"\t"+spacekey+"\t"+attacker_includes_cavalry+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let unmoved_units = [];
	  let moved_units = [];
          let space = his_self.game.spaces[defender_spacekey];

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move, defender, defender_spacekey);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let key in space.units) {
	    if (his_self.returnPlayerCommandingFaction(key) == parent_player) {
	      for (let i = 0; i < space.units[key].length; i++) {
	        if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
                if (space.units[key][i].type != "corsair" && space.units[key][i].type != "squadron") {
	        if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
	          if (space.units[key][i].locked != 1 && (!(his_self.game.state.events.foul_weather == 1 && space.units[key][i].already_moved == 1))) {
	    	    let does_units_to_move_have_unit = false;
	    	    for (let z = 0; z < units_to_move.length; z++) {
	    	      if (units_to_move[z].faction == key && units_to_move[z].idx == i) { does_units_to_move_have_unit = true; break; }
	    	    }
	            if (does_units_to_move_have_unit) {
	              html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[key][i].name} (${key})*</li>`;
		      moved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            } else {
	              html += `<li class="option" id="${key}-${i}">${space.units[key][i].name} (${key})</li>`;
		      unmoved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            }
	          }
	        }
	        }
	        }
	      }
	    }
	  }

	  let mobj = {
	    space : space ,
	    faction : defender ,
   	    source : defender_spacekey ,
   	    unmoved_units : unmoved_units ,
   	    moved_units : moved_units ,
	    destination : spacekey ,
	    units_to_move : units_to_move ,
	    max_formation_size : max_formation_size ,
 	  }

          // 
          // auto-move if only 1 unit
          //
          let can_we_quick_move = false;
          if (mobj.moved_units.length == 0 && mobj.unmoved_units.length == 1) { can_we_quick_move = true; }

	  if (!can_we_quick_move) {
   	    his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface
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

	    let x = id.split("-");
	    let f = x[0];
	    let idx = x[1];

	    let does_units_to_move_have_unit = false;
	    for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { does_units_to_move_have_unit = true; break; }
	    }

	    if (does_units_to_move_have_unit) {
	      for (let z = 0; z < units_to_move.length; z++) {
	        if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { units_to_move.splice(z, 1); break; }
	      }
	    } else {


	      //
	      // check for max formation size
	      //
	      let unitno = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
	        if (space.units[units_to_move[i].faction][units_to_move[i].idx].command_value == 0) { unitno++; }
	        if (unitno >= max_formation_size) { 
		  max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	          if (unitno >= max_formation_size) { 
	            alert("Maximum Formation Size: " + max_formation_size);
	            return;
		  }
	        }
	      }

	      units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });


          if (can_we_quick_move) {
            units_to_move = JSON.parse(JSON.stringify(mobj.unmoved_units));
            selectDestinationInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
            his_self.displaySpace(source_spacekey);
            his_self.displaySpace(destination_spacekey);
            his_self.updateStatus("intercepting...");
            return;
          }

	}
	//
	// end select units
	//



    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`${this.returnFactionName(defender)} - Intercept from ${this.returnSpaceName(defender_spacekey)}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.updateStatus("acknowledge");
      his_self.unbindBackButtonFunction();
      if (user_choice === "intercept") {
	his_self.updateStatus("attempting intercept...");
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
    let units_to_move_idx = [];

    let onFinishSelect = function(his_self, units_to_move) {

      let includes_naval_leader = false;
      let includes_naval_ship = false;

      let space;
      if (his_self.game.spaces[defender_spacekey]) {
        space = his_self.game.spaces[defender_spacekey];
      }
      if (his_self.game.navalspaces[defender_spacekey]) {
        space = his_self.game.navalspaces[defender_spacekey];
      }

      for (let i = 0; i < units_to_move.length; i++) {
	let id = units_to_move[i].idx;
	let f = units_to_move[i].faction;
	let u = space.units[f][id];
	if (u.navy_leader == true) { includes_naval_leader = true; }
	if (u.type == "squadron" || u.type == "corsair") { includes_naval_ship = true; }
      }

      if (includes_naval_leader == true && includes_naval_ship == false) {
        his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(defender)+" aborts high seas interception");
	his_self.addMove("RESETCONFIRMSNEEDED\tall");
        his_self.endTurn();
	return;
      }

      his_self.addMove("naval_intercept"+"\t"+attacker+"\t"+spacekey+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));

      if (his_self.game.state.events.intervention_naval_intercept_possible == 1) {

	//
	// look ahead, then restore to avoid desync
	//
	let x = his_self.game.dice;
	let atr = his_self.rollDice(6) + his_self.rollDice(6);
	his_self.game.dice = x;

	//
	// professional rowers will trigger if it changes outcomes
	//
	if (atr >= 7 && atr < 9) {
          his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(defender)+" attempting high seas interception\tnaval_intercept\t" + spacekey);
	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	}
      }

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

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].locked != 1 && space.units[defender][i].army_leader != true) {
          if (space.units[defender][i].land_or_sea === "sea" || space.units[defender][i].land_or_sea === "both") {
            if (units_to_move_idx.includes(parseInt(i))) {
              html += `<li class="option" style="font-weight:bold" id="${defender}-${i}">* ${space.units[defender][i].name} *</li>`;
            } else {
              html += `<li class="option" id="${defender}-${i}">${space.units[defender][i].name}</li>`;
            }
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let tmpx = $(this).attr("id");

        if (tmpx === "end") {
          onFinishSelect(his_self, units_to_move);
          return;
        }


	let id = parseInt(tmpx.split("-")[1]);
	let f = tmpx.split("-")[0];

        if (units_to_move_idx.includes(id)) {
          let idx = units_to_move_idx.indexOf(id);
          if (idx > -1) {
            units_to_move_idx.splice(idx, 1);
            units_to_move.splice(idx, 1);
          }
        } else {
          units_to_move_idx.push(parseInt(id));
          units_to_move.push({ idx : parseInt(id) , faction : f });
	}

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Intercept ${this.returnSpaceName(spacekey)} from ${this.returnSpaceName(defender_spacekey)}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "intercept") {
        his_self.updateStatus("acknowledge");
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
        his_self.updateStatus("acknowledge");
	his_self.endTurn();
        return;
      }
    });

  }




  canPlayerNavalTransport(his_self, player, faction, ops_to_spend, ops_remaining) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    // no if no ships at sea
    let have_ships_at_sea = false;
    for (let key in his_self.game.navalspaces) {
      if (his_self.game.navalspaces[key].units[faction].length > 0) {
	have_ships_at_sea = true;
      }
    }
    if (!have_ships_at_sea) { return false; }

    if (ops_remaining < 2) { return 0; }
    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (his_self.game.spaces[spaces_with_infantry[i]].ports.length == 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      } else {
	let s = his_self.game.spaces[spaces_with_infantry[i]];
	let any_valid_moves = false;
        for (let z = 0; z < s.ports.length; z++) {
          if (his_self.doesFactionHaveNavalUnitsInSpace(faction, s.ports[z]) == 1) {
	    any_valid_moves = true;
	  }
	}
	if (!any_valid_moves) {
	  spaces_with_infantry.splice(i, 1);
	  i--;
	}
      }
    }

    if (spaces_with_infantry.length == 0) { return 0; }

    for (let i = 0; i < spaces_with_infantry.length; i++) {
      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[i], ops_remaining);
      if (dest.length > 0) { return 1; }
    }

    return 0;

  }
  async playerNavalTransport(his_self, player, faction, ops_to_spend=0, ops_remaining=0) {

    // BACK moves us to OPS menu
    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("discard\t"+his_self.returnControllingPower(faction)+"\t"+his_self.game.player_last_card); his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

    let spacekey = "";
    let units_to_move = [];
    let cancel_func = null;
    let space = null;
    let destination = "";
    let cost_of_transport = 2;

    //
    // destination already set, so just fire the info out
    //
    let selectDestinationInterface = function(his_self, units_to_move) {

	      if (cost_of_transport > 2) {
	        for (let z = 0; z < his_self.moves.length; z++) {
		  let pma = his_self.moves[z].split("\t");
		  if (pma[0] === "continue") {
		    if ((parseInt(pma[4]) - (cost_of_transport-2)) > 0) {
                      his_self.moves[z] = "continue\t"+pma[1]+"\t"+pma[2]+"\t"+pma[3]+"\t"+(parseInt(pma[4])-(cost_of_transport-2))+"\t"+pma[5];
		    } else {
		      his_self.moves.splice(z, 1);
		      z--;
		    }
		  }
	        }
	      }

              units_to_move.sort(function(a, b){return parseInt(a.idx)-parseInt(b.idx)});

              let does_movement_include_cavalry = 0;
              for (let i = 0; i < units_to_move.length; i++) {
                if (units_to_move[i].type === "cavalry") {
                  does_movement_include_cavalry = 1;
                }
              }

	      //
	      // "skip" interception check if we already have units in this space
	      //
	      if (his_self.returnFactionLandUnitsInSpace(faction, destination) > 0) {
	        his_self.addMove("interception_check\t"+"skip"+"\t"+destination+"\t"+does_movement_include_cavalry);
	      } else {
	        his_self.addMove("interception_check\t"+faction+"\t"+destination+"\t"+does_movement_include_cavalry);
	      }
 
              for (let i = 0; i < units_to_move.length; i++) {
                his_self.addMove("move\t"+units_to_move[i].faction+"\tland\t"+spacekey+"\t"+destination+"\t"+units_to_move[i].idx);
              }
    	      if (his_self.game.state.events.intervention_on_movement_possible == 0) {
      		his_self.addMove("ACKNOWLEDGE\t" + his_self.returnFactionName(faction) + " moves to " + his_self.game.spaces[destination].name);
	      } else {
                his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination].name + "\tmove\t" + destination);
	        his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      }
              his_self.endTurn();

    }

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, cost=2) {

	  let unmoved_units = [];
	  let moved_units = [];
          let space = his_self.game.spaces[spacekey];
	  let max_formation_size = 5; // cannot naval transport more than 5 units
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let key in space.units) {
	    if (his_self.returnPlayerCommandingFaction(key) == player) {
	      for (let i = 0; i < space.units[key].length; i++) {
	        if (space.units[key][i].reformer != true && space.units[key][i].navy_leader != true) {
	        if (space.units[key][i].land_or_sea === "land" || space.units[key][i].land_or_sea === "both") {
	          if (space.units[key][i].locked != 1 && (!(his_self.game.state.events.foul_weather == 1 && space.units[key][i].already_moved == 1))) {
	    	    let does_units_to_move_have_unit = false;
	    	    for (let z = 0; z < units_to_move.length; z++) {
	    	      if (units_to_move[z].faction == key && units_to_move[z].idx == i) { does_units_to_move_have_unit = true; break; }
	    	    }
	            if (does_units_to_move_have_unit) {
	              html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[key][i].name} (${key})*</li>`;
		      moved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            } else {
	              html += `<li class="option" id="${key}-${i}">${space.units[key][i].name} (${key})</li>`;
		      unmoved_units.push({ faction : key , idx : i , type : space.units[key][i].type });
	            }
	          }
	        }
	        }
	      }
	    }
	  }

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
   	    unmoved_units : unmoved_units ,
   	    moved_units : moved_units ,
	    destination : destination ,
            units_to_move : units_to_move ,
            max_formation_size : max_formation_size ,  
 	  }

   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface
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

	    let x = id.split("-");
	    let f = x[0];
	    let idx = x[1];

	    let does_units_to_move_have_unit = false;
	    for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { does_units_to_move_have_unit = true; break; }
	    }

	    if (does_units_to_move_have_unit) {
	      for (let z = 0; z < units_to_move.length; z++) {
	        if (units_to_move[z].faction === f && units_to_move[z].idx == idx) { units_to_move.splice(z, 1); break; }
	      }
	    } else {


	      //
	      // check for max formation size
	      //
	      let unitno = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
	        if (space.units[units_to_move[i].faction][units_to_move[i].idx].command_value == 0) { unitno++; }
	        if (unitno >= max_formation_size) { 
		  max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	          if (unitno >= max_formation_size) { 
	            alert("Maximum Formation Size: " + max_formation_size);
	            return;
		  }
	        }
	      }

	      units_to_move.push( { faction : f , idx : idx , type : space.units[f][idx].type });
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
    }
    //
    // end select units
    //
    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (his_self.game.spaces[spaces_with_infantry[i]].ports.length == 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      } else {
	let s = his_self.game.spaces[spaces_with_infantry[i]];
	let cf = his_self.returnFactionControllingSpace(spaces_with_infantry[i]);
	if (s.besieged > 0 && his_self.areAllies(faction, cf)) {
	  spaces_with_infantry.splice(i, 1);
	  i--;
	  z = s.ports.length + 2;
        } else {
	  let w = 0;
	  for (let z = 0; z < s.ports.length; z++) {
            if (his_self.doesFactionHaveNavalUnitsInSpace(faction, s.ports[z]) >= 0) {
	      w = 1;
	    }
	  }
	  if (w == 0) {
  	    spaces_with_infantry.splice(i, 1);
	    i--;
	    z = s.ports.length + 2;
	  }
	}
      }
    }

    let html = `<ul>`;
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      html    += `<li class="option" id="${i}">${spaces_with_infantry[i]}</li>`;
    }
    html    += `</ul>`;

    his_self.updateStatusWithOptions(`Transport from Which Port?`, html);
    his_self.attachCardboxEvents(function(user_choice) {

      spacekey = spaces_with_infantry[user_choice];
      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[user_choice], (ops_remaining+ops_to_spend));

      let html = `<ul>`;
      for (let i = 0; i < dest.length; i++) {
	let c = ops_remaining + ops_to_spend - dest[i].cost;
        html    += `<li class="option" id="${i}">${dest[i].key} (${c} CP)</li>`;
      }
      html    += `</ul>`;

      his_self.updateStatusWithOptions(`Select Destination:`, html);
      his_self.attachCardboxEvents(function(d) {
	destination = dest[d].key;
	cost_of_transport = ops_remaining + ops_to_spend - dest[d].cost;
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
      });
    });

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
    if (this.isDisgraced(debater)) { return false; }
    if (this.isBurned(debater)) { return false; }

    let already_committed = false;
    let found_debater = false;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key === debater) {

        found_debater = true;

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

    if (found_debater != true) { return false; }

    return !already_committed;
  } 
    

  canPlayerNavalMove(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    // 2P game, papacy+protestant can move minor + allied naval units during their own turn
    if (his_self.game.players.length == 2) {
      if (his_self.doesFactionHaveUnlockedNavalUnitsOnBoard(faction)) {
	if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {
	  return 1;
	}
      }
    }

    if (his_self.doesFactionHaveUnlockedNavalUnitsOnBoard(faction)) { return 1; }
    return 0;

  }
  async playerNavalMove(his_self, player, faction, ops_to_spend=0, ops_remaining=0) {

    his_self.naval_movement_overlay.render();

    // BACK moves us to OPS menu
    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("discard\t"+his_self.returnControllingPower(faction)+"\t"+his_self.game.player_last_card); his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

    let units_to_move = [];
    let units_available = his_self.returnFactionNavalUnitsToMove(faction);

    for (let z = 0; z < units_available.length; z++) {
      if (units_available[z].locked == 1) { units_available.splice(z, 1); z--; }
    }

    let backup_units_to_move = units_to_move;

    let selectUnitsInterface = function(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      let msg = "Select Unit to Move";
      let html = "<ul>";

      for (let i = 0; i < units_available.length; i++) {
        if (units_to_move.includes(parseInt(i))) {
	  if (units_available[i].destination === "") {
            for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z] === parseInt(i)) {
                units_to_move.splice(z, 1);
		z--;
	      }
	    }
	  }
	  if (units_available[i].spacekey === units_available[i].destination) {
	    units_available[i].destination = "";
            for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z] === parseInt(i)) {
                units_to_move.splice(z, 1);
	      }
	    }
	  }	
	  if (units_available[i].destination === "end") {
	    units_available[i].destination = "";
            for (let z = 0; z < units_to_move.length; z++) {
	      if (units_to_move[z] === parseInt(i)) {
                units_to_move.splice(z, 1);
	      }
	    }
	  }	
	}
      }

      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = units_available[i];
        if (units_to_move.includes(parseInt(i))) {
          html += `<li class="option source" style="font-weight:bold" id="${i}">${units_available[i].name} (${units_available[i].spacekey} -> ${units_available[i].destination})</li>`;
        } else {
          html += `<li class="option source" id="${i}">${units_available[i].name} (${his_self.returnSpaceName(units_available[i].spacekey)})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);
      his_self.naval_movement_overlay.selectUnits(msg, html);


      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");
	let is_source = $(this).hasClass('source');
	let is_destination = $(this).hasClass('destination');

	if (is_source) {
	  if (document.querySelector(".dcontrols ul .destination")) { 

	    his_self.hideDestination();

            for (let i = 0; i < units_available.length; i++) {
              if (units_to_move.includes(parseInt(i))) {
	  	if (units_available[i].destination === "") {
          	  for (let z = 0; z < units_to_move.length; z++) {
	  	    if (units_to_move[z] === parseInt(i)) {
          	      units_to_move.splice(z, 1);
		      z--;
		    }
		  }
		}
	        if (units_available[i].spacekey === units_available[i].destination) {
	          units_available[i].destination = "";
                  for (let z = 0; z < units_to_move.length; z++) {
	            if (units_to_move[z] === parseInt(i)) {
                      units_to_move.splice(z, 1);
	            }
	          }
	        }	
	      }
            }

            selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
	    return;
	  }
	}
	if (is_destination) {
	  his_self.hideDestination();
          selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
	  return;
	}

	his_self.updateStatus("moving...");

        if (id === "end") {

          his_self.naval_movement_overlay.hide();

	  let destinations = {};

	  //
	  // if there are no units to move...
	  //
	  if (units_to_move.length == 0) {
	    // "end" without anything selected is like clicking on the back button...
	    if (his_self.hud.back_button_callback != null) { his_self.hud.back_button_callback(); return; }
	  }


	  for (let i = 0; i < units_to_move.length; i++) {
	    let unit = units_available[units_to_move[i]];
	    if (!destinations[unit.destination]) {
	      his_self.addMove("naval_interception_check\t"+faction+"\t"+unit.destination+"\t"+unit.spacekey);
	      destinations[unit.destination] = 1;
	    }
	  }

	  let revised_units_to_move = [];
	  let entries_to_loop = units_to_move.length;	
	  for (let z = 0; z < entries_to_loop; z++) {

	    let highest_idx = 0;
	    let highest_num = 0;

	    for (let y = 0; y < units_to_move.length; y++) {
   	      let unit = units_available[units_to_move[y]];
	      let max_num = unit.idx;
	      let max_idx = y;
	      if (max_num > highest_num) {
		highest_idx = max_idx;
		highest_num = max_num;
	      }
	    }

	    revised_units_to_move.unshift(JSON.parse(JSON.stringify(units_available[units_to_move[highest_idx]])));
	    units_to_move.splice(highest_idx, 1);
	  }

	  //
	  // revised units to move is
	  //
	  for (let i = 0; i < revised_units_to_move.length; i++) {
	    let unit = revised_units_to_move[i];
            his_self.addMove("move\t"+revised_units_to_move[i].faction+"\tsea\t"+unit.spacekey+"\t"+unit.destination+"\t"+revised_units_to_move[i].idx);
	  }
    	  if (his_self.game.state.events.intervention_on_movement_possible == 0) {
	    his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" shifting naval forces\tnavalmove");
          } else {
	    his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" shifting naval forces\tnavalmove");
	    his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  }
	  his_self.endTurn();
	  return;

	}

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

    let selectDestinationInterface = function(his_self, unit_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      //
      // unit selected will always be last in array
      //
      let unit = units_available[unit_to_move[unit_to_move.length-1]];

      let destinations = his_self.returnNavalMoveOptions(unit.spacekey);

      let msg = "Select Destination";
      let html = "<ul>";
      let any_options = false;
      let num_options = 0;
      for (let i = 0; i < destinations.length; i++) {
	let spacekey = destinations[i];
	if (his_self.game.spaces[spacekey]) {
	  if (his_self.isSpaceHostileOrIndependent(spacekey, faction)) {
	    if (his_self.doesSpaceHaveNonFactionNavalUnits(spacekey, faction)) {
              any_options = true;
  	      num_options++;
              html += `<li class="option destination" style="font-weight:bold" id="${spacekey}">${his_self.returnSpaceName(spacekey)}</li>`;
	    }
	  } else {
	    if (his_self.isSpaceFriendly(spacekey, faction)) {
              any_options = true;
  	      num_options++;
              html += `<li class="option destination" style="font-weight:bold" id="${spacekey}">${his_self.returnSpaceName(spacekey)}</li>`;
            }
          }
        } else {
          any_options = true;
	  num_options++;
          html += `<li class="option destination" style="font-weight:bold" id="${spacekey}">${his_self.returnSpaceName(spacekey)}</li>`;
	}
      }
      if (any_options == false) {
        html += `<li class="option destination" style="font-weight:bold" id="none">no valid options</li>`;
      }
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);
      if (num_options > 1) { his_self.naval_movement_overlay.selectDestination(msg, html); }

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

	//
	// this isn't possible except on naval overlay
	//
	if (id === "end") {
	  his_self.naval_movement_overlay.hideDestination();
          selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
	}

	let is_source = $(this).hasClass('source');
	let is_destination = $(this).hasClass('destination');

	if (is_source) {

	  his_self.naval_movement_overlay.hideDestination();

          for (let i = 0; i < units_available.length; i++) {

            if (units_to_move.includes(parseInt(i))) {
	      if (units_available[i].destination === "" || !(units_available[i].destination)) {
          	for (let z = 0; z < units_to_move.length; z++) {
	  	  if (units_to_move[z] === parseInt(i)) {
          	    units_to_move.splice(z, 1);
		    z--;
		  }
		}
	      }
	      if (units_available[i].spacekey === units_available[i].destination) {
	        units_available[i].destination = "";
                for (let z = 0; z < units_to_move.length; z++) {
	          if (units_to_move[z] === parseInt(i)) {
                    units_to_move.splice(z, 1);
	          }
	        }
	      }	
	    }
          }

          selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
	  return;
	}

	if (id === "none") {
          unit_to_move.splice(unit_to_move.length-1, 1);
          selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
	  return;
	}

	unit.destination = id;
	his_self.naval_movement_overlay.hideDestination();
        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

      });

      if (num_options == 1) {
	document.querySelector(".option").click();
	return;
      }

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
	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked != 1) {
	    // if no neighbours, no move
	    if (his_self.game.spaces[spaces_with_units[i]].neighbours.length > 0) {
	      return 1;
	    }
	  }
	}
      }
    }
    return 0;
  }

  canPlayerBuyMercenaryOverLimit(his_self, player, faction) {
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "regular") == 0 && his_self.game.state.board[faction].overcapacity == 1) { return true; }
    return false;
  }
  async playerBuyMercenaryOverLimit(his_self, player, faction, ops_to_spend, ops_remaining) {
    his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, "");
    his_self.displayCustomOverlay("overcapacity", `${his_self.returnFactionName(faction)} is Overcapacity`);
    return 1;
  }
  canPlayerBuyMercenary(his_self, player, faction) {
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "mercenary") == 0) { return false; }

    return 1;
  }
  playerBuyMercenary(his_self, player, faction, ops_to_spend, ops_remaining) {

    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

    //
    // ui for building multiple units
    //
    his_self.build_overlay.render(faction, "mercenary", (parseInt(ops_remaining)+parseInt(ops_to_spend)), parseInt(ops_to_spend), (num, costs) => {

      //
      // modify "continue" instruction if this is a move over a pass
      //
      for (let i = 0; i < his_self.moves.length; i++) {
        let x = his_self.moves[i];
        let y = x.split("\t");
        let new_ops_remaining = (parseInt(ops_remaining)+parseInt(ops_to_spend)) - (num*costs);
        if (y[0] === "continue") {
          if (new_ops_remaining) {
            his_self.moves[i] = y[0] + "\t" + y[1] + "\t" + y[2] + "\t" + y[3] + "\t" + new_ops_remaining + "\t" + y[5];
          } else {
            his_self.moves.splice(i, 1);
          }
        }
      }

      //
      // and place
      //
      his_self.playerSelectSpaceWithFilter(

        `Select Destination for ${num} Mercenaries`,

        function(space) {
	  if (faction === "england" && his_self.game.state.events.revolt_in_ireland == 1) {
	    if (his_self.returnFactionLandUnitsInSpace("england", "ireland") < 4) {
	      if (space.key == "ireland") { return 1; }
	      else { return 0; }
	    } else {
	      if (space.key == "ireland") { return 1; }
	    }
	  }
	  if (faction != "protestant" && space.type == "electorate" && his_self.game.state.events.schmalkaldic_league == 0) {
	    return 0;
	  }
          if (space.besieged != 0) { return 0; }
          if (his_self.doesSpaceHaveEnemyUnits(space, faction)) { return 0; }
	  if (his_self.game.state.events.foreign_recruits == faction && space.political == faction) { return 1; }
          if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
          if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	  return 0;
        },

        function(destination_spacekey) {
          his_self.unbindBackButtonFunction();
  	  his_self.updateStatus("acknowledge...");
          for (let i = 0; i < num; i++) {
	    his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+destination_spacekey);
	  }
	  his_self.endTurn();
        },

        null,

        true

      );

    });

  
    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Mercenary",

      function(space) {
	if (faction === "england" && his_self.game.state.events.revolt_in_ireland == 1) {
	  if (his_self.returnFactionLandUnitsInSpace("england", "ireland") < 5) {
	    if (space.key == "ireland") { return 1; }
	    else { return 0; }
	  } else {
	    if (space.key == "ireland") { return 1; }
	  }
	}
        if (faction == "hapsburg" && space.type == "electorate" && his_self.game.state.events.schmalkaldic_league == 0) {
          return 0;
        }
        if (space.besieged != 0) { return 0; }
        if (his_self.doesSpaceHaveEnemyUnits(space, faction)) { return 0; }
        if (his_self.isSpaceFriendly(space, faction) && space.home == faction) { return 1; }
        if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");
	his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
  }

  canPlayerBuyRegularOverLimit(his_self, player, faction) {
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "regular") == 0 && his_self.game.state.board[faction].overcapacity == 1) { return true; }
    return false;
  }
  async playerBuyRegularOverLimit(his_self, player, faction, ops_to_spend, ops_remaining) {
    his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, "");
    his_self.displayCustomOverlay("overcapacity", `${his_self.returnFactionName(faction)} is Overcapacity`);
    return 1;
  }
  canPlayerBuyRegular(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "regular") == 0) { return false; }

    return 1;
  }
  async playerBuyRegular(his_self, player, faction, ops_to_spend, ops_remaining) {

    //
    // UI for multiple-unit builds
    //
    his_self.build_overlay.render(faction, "regular", (parseInt(ops_remaining)+parseInt(ops_to_spend)), parseInt(ops_to_spend), (num, costs) => {

      //
      // modify "continue" instruction if this is a move over a pass
      //
      for (let i = 0; i < his_self.moves.length; i++) {
        let x = his_self.moves[i];
        let y = x.split("\t");
        let new_ops_remaining = (parseInt(ops_remaining)+parseInt(ops_to_spend)) - (num*costs);
        if (y[0] === "continue") {
          if (new_ops_remaining) {
            his_self.moves[i] = y[0] + "\t" + y[1] + "\t" + y[2] + "\t" + y[3] + "\t" + new_ops_remaining + "\t" + y[5];
          } else {
            his_self.moves.splice(i, 1);
          }
        }
      }

      //
      // and select destination for these units
      //
      his_self.playerSelectSpaceWithFilter(

        `Select Destination for ${num} Regular(s)`,

        function(space) {
  	  if (faction === "ottoman" && his_self.game.state.events.war_in_persia == 1) {
	    if (his_self.returnFactionLandUnitsInSpace("ottoman", "persia") < 5) {
	      if (space.key == "persia") { return 1; }
	      else { return 0; }
	    } else {
	      if (space.key == "persia") {
		return 1;
	      }
	    }
	  }
	  if (faction === "ottoman" && his_self.game.state.events.revolt_in_egypt == 1) {
	    if (his_self.returnFactionLandUnitsInSpace("ottoman", "egypt") < 5) {
	      if (space.key == "egypt") { return 1; }
	      else { return 0; }
	    } else {
	      if (space.key == "egypt") { return 1; }
	    }
	  }
	  if (faction === "ottoman" && his_self.game.state.events.barbary_pirates == 1) {
	    // can only build corsairs in a pirate haven
	    if (space.key == "algiers" || space.pirate_haven == 1) { 
	      if (his_self.game.state.events.foreign_recruits != "ottoman") { return 0; }
	    }
	  }
	  if (faction === "england" && his_self.game.state.events.revolt_in_ireland == 1) {
	    if (his_self.returnFactionLandUnitsInSpace("england", "ireland") < 5) {
	      if (space.key == "ireland") { return 1; }
	      else { return 0; }
	    } else {
	      if (space.key == "ireland") { return 1; }
	    }
	  }
	  if (faction != "protestant" && space.type == "electorate" && his_self.game.state.events.schmalkaldic_league == 0) {
	    return 0;
	  }
          if (space.besieged != 0) { return 0; }
          if (his_self.doesSpaceHaveEnemyUnits(space, faction)) { return 0; }
	  if (his_self.game.state.events.foreign_recruits == faction && space.political == faction) { return 1; }
          if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
          if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	  return 0;
        },

        function(destination_spacekey) {
          his_self.unbindBackButtonFunction();
	  his_self.updateStatus("acknowledge...");
	  for (let z = 0; z < num; z++) {
	    his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+destination_spacekey);
	  }
	  his_self.endTurn();
        },

        null,

        true

      );

      return 0;

    });
            

    //
    // fall through is to build a single regular
    //
    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Regular",

      function(space) {
	if (faction === "ottoman" && his_self.game.state.events.barbary_pirates == 1) {
	  // can not build regulars in Algiers
	  if (space.key == "algiers" || space.pirate_haven == 1) { return 0; }
	}
	if (faction === "ottoman" && his_self.game.state.events.war_in_persia == 1) {
	  if (his_self.returnFactionLandUnitsInSpace("ottoman", "persia") < 5) {
	    if (space.key == "persia") { return 1; }
	    else { return 0; }
	  } else {
	    if (space.key == "persia") { return 1; }
	  }
	}
	if (faction === "ottoman" && his_self.game.state.events.revolt_in_egypt == 1) {
	  if (his_self.returnFactionLandUnitsInSpace("ottoman", "egypt") < 5) {
	    if (space.key == "egypt") { return 1; }
	    else { return 0; }
	  } else {
	    if (space.key == "egypt") { return 1; }
	  }
	}
	if (faction === "england" && his_self.game.state.events.revolt_in_ireland == 1) {
	  if (his_self.returnFactionLandUnitsInSpace("england", "ireland") < 5) {
	    if (space.key == "ireland") { return 1; }
	    else { return 0; }
	  } else {
	    if (space.key == "ireland") { return 1; }
	  }
	}
        if (space.besieged != 0) { return 0; }
        if (his_self.doesSpaceHaveEnemyUnits(space, faction)) { return 0; }
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
        if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");
	his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
  }

  canPlayerBuyNavalSquadron(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "squadron") == 0) { return false; }

    return 1;
  }
  async playerBuyNavalSquadron(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
	if (faction === "ottoman" && his_self.game.state.events.barbary_pirates == 1) {
	  if (space.key == "algiers" || space.pirate_haven == 1) { 
	    if (his_self.game.state.events.foreign_recruits != "ottoman") { return 0; }
	  }
	}
        if (space.ports.length === 0) { return 0; }
        if (space.besieged != 0) { return 0; }
	if (his_self.game.state.events.foreign_recruits == faction && space.political == faction) { return 1; }
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
        if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");
	his_self.addMove("build\tland\t"+faction+"\t"+"squadron"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,
      true,
    );
  }

  async playerBuildChateaux(his_self, player, faction) {
    his_self.game.chateaux_overlay.render();
  }

  canPlayerFightForeignWar(his_self, player, faction) {
    if (faction === "ottoman" && his_self.game.state.events.war_in_persia == 1) { if (!his_self.game.state.foreign_wars_fought_this_impulse.includes("persia")) { return 1; } }
    if (faction === "ottoman" && his_self.game.state.events.revolt_in_egypt == 1) { if (!his_self.game.state.foreign_wars_fought_this_impulse.includes("egypt")) { return 1; } }
    if (faction === "england" && his_self.game.state.events.revolt_in_ireland == 1) { if (!his_self.game.state.foreign_wars_fought_this_impulse.includes("ireland")) { return 1; } }
    return 0;
  }
  playerFightForeignWar(his_self, player, faction) {

    let msg = "Attack in Foreign War: ";
    let html = '<ul>';
    if (faction === "ottoman" && his_self.game.state.events.war_in_persia == 1 && !his_self.game.state.foreign_wars_fought_this_impulse.includes("persia")) {
      html += '<li class="option" id="persia">War in Persia</li>';	
    }
    if (faction === "ottoman" && his_self.game.state.events.revolt_in_egypt == 1 && !his_self.game.state.foreign_wars_fought_this_impulse.includes("egypt")) {
      html += '<li class="option" id="egypt">Revolt in Egypt</li>';	
    }
    if (faction === "england" && his_self.game.state.events.revolt_in_ireland == 1 && !his_self.game.state.foreign_wars_fought_this_impulse.includes("ireland")) {
      html += '<li class="option" id="ireland">Revolt in Ireland</li>';	
    }
    html += '</ul>';

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
      his_self.unbindBackButtonFunction();
      his_self.updateStatus("acknowledge");
      let key = $(this).attr("id");
      if (key == "persia") {
        his_self.addMove("field_battle\tpersia\tottoman");
      }
      if (key == "egypt") {
        his_self.addMove("field_battle\tegypt\tottoman");
      }
      if (key == "ireland") {
        his_self.addMove("field_battle\tireland\tengland");
      }
      his_self.endTurn();
    });

    return 0;
  }
  canPlayerAssaultTutorial(his_self, player, faction) {
    let assaultable_spaces = 0;
    let nonassaultable_spaces = 0;
    if (his_self.game.state.assaulted_this_impulse == 1) { return 0; }
    if (!his_self.canPlayerAssault(his_self, player, faction)) {
      let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
      for (let i = 0; i < conquerable_spaces.length; i++) {
        if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1) {
          if (conquerable_spaces[i] !== "egypt" && conquerable_spaces[i] !== "persia" && conquerable_spaces[i] !== "ireland") {
	    assaultable_spaces++;
            if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
              if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1) {
	  	nonassaultable_spaces++;
              }
            }
          }
        }
      }
    }
    if (nonassaultable_spaces > 0 && nonassaultable_spaces >= assaultable_spaces) { return 1; }
    return 0;
  }
  playerAssaultTutorial(his_self, player, faction) {

    let player_warned = 0;
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);

    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (conquerable_spaces[i] !== "egypt" && conquerable_spaces[i] !== "persia" && conquerable_spaces[i] !== "ireland") {
        if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1) {
          if (!his_self.isSpaceControlled(conquerable_spaces[i], faction) && !his_self.isSpaceInLineOfControl(conquerable_spaces[i], faction) && player_warned == 0) {
	    salert("You have a space under siege, but to assault it you need to have a Line of Control connecting it to another fortified key you control.");
	    player_warned = 1;
          }
	  if (player_warned == 0) {

	    //
	    // now check if there are squadrons in the port or sea protecting the town
	    //
	    let space = his_self.game.spaces[conquerable_spaces[i]];

	    let squadrons_protecting_space = his_self.returnNumberOfSquadronsProtectingSpace(conquerable_spaces[i]);
      	    let attacker_squadrons_adjacent = 0;
	    for (let y = 0; y < his_self.game.spaces[conquerable_spaces[i]].ports.length; y++) {
	      let p = his_self.game.spaces[conquerable_spaces[i]].ports[y];
	      for (let f in his_self.game.navalspaces[p].units) {
		if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction)) {
	          for (let z = 0; z < his_self.game.navalspaces[p].units[f].length; z++) {
		    let u = his_self.game.navalspaces[p].units[faction][z];
		    if (u.type == "squadron") { attacker_squadrons_adjacent++; }
	          }
		}
	      }
	    }

	    if (attacker_squadrons_adjacent <= squadrons_protecting_space) {
	      if (999 < squadrons_protecting_space) {
	        alert("Space cannot be assaulted if protected by fleet in adjacent sea");
	        player_warned = 1;
	      } else {
	        alert("You have a space under siege, but it is protected by a fleet. To assault such a space, you need more naval forces adjacent to this space than the defender has protecting it.");
	        player_warned = 1;
	      }
	    }
	  }
	}
      }
    }

    return 1;

  }
  canPlayerAssault(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

console.log("$");
console.log("$");
console.log("$");
console.log("$");

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);

console.log(JSON.stringify(conquerable_spaces));

    let assaultable_spaces = 0;
    let nonassaultable_spaces = 0;

    for (let i = 0; i < conquerable_spaces.length; i++) {
console.log("cs: " + conquerable_spaces[i]);
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
        if (conquerable_spaces[i] !== "egypt" && conquerable_spaces[i] !== "persia" && conquerable_spaces[i] !== "ireland") {
console.log("not controlled by me");
	  if (his_self.isSpaceInLineOfControl(conquerable_spaces[i], faction)) {
console.log("in line of control!");
            if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1 || (faction == "ottoman" && his_self.game.state.events.roxelana == 1) || (faction == his_self.returnControllingPower("scotland") && his_self.game.state.events.scots_raid == 1)) {
console.log("assaulted this turn: " + JSON.stringify(his_self.game.state.spaces_assaulted_this_turn));
	      if (!his_self.game.state.spaces_assaulted_this_turn.includes(conquerable_spaces[i])) {

	        //
	        // now check if there are squadrons in the port or sea protecting the town
	        //
	        let space = his_self.game.spaces[conquerable_spaces[i]];

	        let squadrons_protecting_space = his_self.returnNumberOfSquadronsProtectingSpace(conquerable_spaces[i]);
	        if (squadrons_protecting_space == 0) { assaultable_spaces++ } else {

console.log("checking if squadrons are protecting!");
		      let attacker_squadrons_adjacent = 0;

		      for (let y = 0; y < his_self.game.spaces[conquerable_spaces[i]].ports.length; y++) {
		        let sea = his_self.game.spaces[conquerable_spaces[i]].ports[y];
			for (let f in his_self.game.navalspaces[sea].units) {
			  if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction)) {
		            for (let z = 0; z < his_self.game.navalspaces[sea].units[f].length; z++) {
			      let u = his_self.game.navalspaces[sea].units[faction][z];
			      if (u.type == "squadron") { attacker_squadrons_adjacent++; }
		            }
		          }
		        }
	      	      }

	      	      if (attacker_squadrons_adjacent <= squadrons_protecting_space) { nonassaultable_spaces++; } else { assaultable_spaces++; }
	        }
	      }
	    }
	  }
        }
      }
    }

console.log("are there assaultable_spaces: " + assaultable_spaces);

    if (assaultable_spaces > 0 ) { return 1; }
    return 0;
  }
  async playerAssault(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      `${his_self.returnFactionName(faction)} - Select Space for Siege/Assault: `,

      function(space) {
	if (his_self.game.state.spaces_assaulted_this_turn.includes(space.key)) { return 0; }
	if (faction == "ottoman" && space.key == "persia" && his_self.game.state.events.war_in_persia == 1) { return 0; }
	if (faction == "ottoman" && space.key == "egypt" && his_self.game.state.events.revolt_in_egypt == 1) { return 0; }
	if (faction == "england" && space.key == "ireland" && his_self.game.state.events.revolt_in_ireland == 1) { return 0; }
        if (his_self.game.spaces[space.key].type !== "fortress" && his_self.game.spaces[space.key].type !== "electorate" && his_self.game.spaces[space.key].type !== "key") { return 0; }
        if (his_self.isSpaceInLineOfControl(space, faction) && !his_self.isSpaceControlled(space, faction) && his_self.returnFactionLandUnitsInSpace(faction, space) > 0 && (space.besieged == 1 || his_self.game.state.events.scots_raid == 1)) {
          //
          // now check if there are squadrons in the port or sea protecting the town
          //
          let squadrons_protecting_space = his_self.returnNumberOfSquadronsProtectingSpace(space.key);
          if (squadrons_protecting_space == 0) { return 1; }

          for (let y = 0; y < space.ports.length; y++) {
            let attacker_squadrons_adjacent = 0;
            let sea = space.ports[y];
	    for (let f in his_self.game.navalspaces[sea].units) {
              if (his_self.returnControllingPower(f) == his_self.returnControllingPower(faction)) {
                for (let z = 0; z < his_self.game.navalspaces[sea].units[f].length; z++) {
                  let u = his_self.game.navalspaces[sea].units[faction][z];
                  if (u.type == "squadron") { attacker_squadrons_adjacent++; }
                }
              }
            }
	    if (attacker_squadrons_adjacent <= squadrons_protecting_space) { return 0; }
          }

	  return 1;

        }
	return 0;
      },

      function(destination_spacekey) {
	his_self.updateStatus("assaulting...");
	if (faction == "ottoman" && destination_spacekey == "persia") { his_self.addMove("war\tottoman\tpersia"); his_self.endTurn(); return; }
	if (faction == "ottoman" && destination_spacekey == "egypt") { his_self.addMove("war\tottoman\tegypt"); his_self.endTurn(); return; }
	if (faction == "england" && destination_spacekey == "ireland") { his_self.addMove("war\tottoman\tireland"); his_self.endTurn(); return; }
	his_self.addMove("assault\t"+faction+"\t"+destination_spacekey);
	if (his_self.game.state.events.intervention_on_assault_possible == 0 || (his_self.game.deck[0].discards["031"] && his_self.game.deck[0].discards["032"])) {
	  let from_whom = his_self.returnArrayOfPlayersInSpacekey(destination_spacekey);
          his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" announces siege of "+his_self.game.spaces[destination_spacekey].name + "\tassault\t" + destination_spacekey);
	} else {
          his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" announces siege of "+his_self.game.spaces[destination_spacekey].name + "\tassault\t" + destination_spacekey);
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
	}
	his_self.endTurn();
      },

      null ,

      true ,
    );
  }

  canPlayerRemoveUnrest(his_self, player, faction) {

    let spaces_in_unrest = his_self.returnSpacesInUnrest();

    //
    // 2P requires only that it is in protestant or catholic religious influence
    // protestants can remove unrest even in catholic spaces before the League
    //
    if (his_self.game.players.length == 2) {
      for (let i = 0; i < spaces_in_unrest.length; i++) {
        if (his_self.game.spaces[spaces_in_unrest[i]].religion == "protestant" && faction == "protestant") { return 1; }
        if (faction == "protestant" && (his_self.game.spaces[spaces_in_unrest[i]].home != "independent" && his_self.game.spaces[spaces_in_unrest[i]].home == "") && his_self.game.spaces[spaces_in_unrest[i]].language == "german" && his_self.game.state.events.schmalkaldic_league == 0) { return 1; }
        if (his_self.game.spaces[spaces_in_unrest[i]].religion == "catholic" && faction == "papacy") { return 1; }
      }
    }

    //
    // protestants can always remove unrest in protestant home spaces pre-league (home = "" && language = "german")
    //
    if (faction == "protestant") {
      for (let i = 0; i < spaces_in_unrest.length; i++) {
        if ((his_self.game.spaces[spaces_in_unrest[i]].home != "independent" && his_self.game.spaces[spaces_in_unrest[i]].home == "") && his_self.game.spaces[spaces_in_unrest[i]].language == "german" && his_self.game.state.events.schmalkaldic_league == 0) { return 1; }
      }
    }

    //
    // otherwise, requires adjacent or direct military presence
    //
    let adjacent_influence = his_self.returnSpacesWithAdjacentFactionInfantry(faction);
    let direct_influence = his_self.returnSpacesWithFactionInfantry(faction);

    for (let i = 0; i < spaces_in_unrest.length; i++) {

      //
      // i have regulars / infantry in this space
      //
      if (direct_influence.includes(spaces_in_unrest[i])) { return true; }

      //
      // i have adjacent regulars / infantry, and no enemies do
      //
      if (adjacent_influence.includes(spaces_in_unrest[i])) {

	let neighbours = his_self.game.spaces[spaces_in_unrest[i]].neighbours;
	let pass = his_self.game.spaces[spaces_in_unrest[i]].pass;
	let do_any_enemies_impede_control = false;

	for (let z = 0; z < neighbours.length; z++) {

	  if (z > 0 && do_any_enemies_impede_control == false) { return 1; }
	  do_any_enemies_impede_control = false;

	  let number_of_hostiles = his_self.returnHostileLandUnitsInSpace(faction, neighbours[z]);
	  if (number_of_hostiles > 0) {
	    if (pass.includes(neighbours[z])) {
	    } else {
	      do_any_enemies_impede_control = true;
	    }
	  } else {
	    do_any_enemies_impede_control = false;
	  }
	}

      }
    }

    return 0;
  }
  canPlayerControlUnfortifiedSpace(his_self, player, faction) {
 
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let conquerable_spaces = his_self.returnSpacesWithAdjacentFactionInfantry(faction);

    //
    // removed fortified spaces
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let n = his_self.game.spaces[conquerable_spaces[i]];
      if (his_self.isSpaceFortified(n)) {
        conquerable_spaces.splice(i, 1); // remove
      }
    }

    //
    // remove spaces with other infantry
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let n = his_self.game.spaces[conquerable_spaces[i]];
      if (his_self.returnNonFactionLandUnitsInSpace(faction, n) > 0) {
        conquerable_spaces.splice(i, 1); // remove
      }
    }

    //
    // remove spaces with adjacent other infantry
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let removed_space = false;
      let ns = his_self.game.spaces[conquerable_spaces[i]].neighbours;
      for (let z = 0; removed_space == false && z < ns.length; z++) {
        let n = his_self.game.spaces[ns[z]];
        if (his_self.returnHostileLandUnitsInSpace(faction, n) > 0) {
	  // unless we are there
          if (his_self.returnFactionLandUnitsInSpace(faction, conquerable_spaces[i]) > 0) {} else {
            conquerable_spaces.splice(i, 1); // remove
            removed_space = true;
          }
        }
      }
    }

    //
    // remove home spaces i control
    //
    for (let i = 0; i < conquerable_spaces.length; i++) {
      let s = his_self.game.spaces[conquerable_spaces[i]];
      if (his_self.isSpaceControlled(s, faction)) { 
        conquerable_spaces.splice(i, 1); // remove
	i--;
      }
    }   
          

    //
    // remove non-independent, non-enemy spaces
    //
    for (let i = 0; i < conquerable_spaces.length; i++) {
      let s = his_self.game.spaces[conquerable_spaces[i]];
      if (!his_self.isSpaceHostileOrIndependent(s, faction)) {
        conquerable_spaces.splice(i, 1); // remove
        i--;
      }
    }

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
	if (his_self.game.spaces[conquerable_spaces[i]].besieged != 1 && his_self.game.spaces[conquerable_spaces[i]].besieged != 2) {
	  return 1;
	}
      } 
    }
    return 0;
  }
  async playerRemoveUnrest(his_self, player, faction, ops_to_spend, ops_remaining=0) {

    // BACK moves us to OPS menu
    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("discard\t"+his_self.returnControllingPower(faction)+"\t"+his_self.game.player_last_card); his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let spaces_to_fix = [];

    if (his_self.game.players.length == 2) {
      for (let i = 0; i < spaces_in_unrest.length; i++) {
        if (faction == "protestant" && his_self.game.spaces[spaces_in_unrest[i]].religion == "protestant"){spaces_to_fix.push(spaces_in_unrest[i]);}
        if (faction == "protestant" && his_self.game.spaces[spaces_in_unrest[i]].home == "" && his_self.game.spaces[spaces_in_unrest[i]].language == "german" && his_self.game.state.events.schmalkaldic_league == 0) {spaces_to_fix.push(spaces_in_unrest[i]);}
        if (faction == "papacy" && his_self.game.spaces[spaces_in_unrest[i]].religion == "catholic"){spaces_to_fix.push(spaces_in_unrest[i]);}
      }
    } else {

      let adjacent_influence = his_self.returnSpacesWithAdjacentFactionInfantry(faction);
      let direct_influence = his_self.returnSpacesWithFactionInfantry(faction);

      for (let i = 0; i < spaces_in_unrest.length; i++) {

        if (faction == "protestant" && his_self.game.state.events.schmalkaldic_league == 0 && his_self.game.spaces[spaces_in_unrest[i]].language == "german") {
          spaces_to_fix.push(spaces_in_unrest[i]);
        } else {

          //
          // i have regulars / infantry in this space
          //
	  if (direct_influence.includes(spaces_in_unrest[i])) {
	    spaces_to_fix.push(spaces_in_unrest[i]);
	  } else {
	    if (adjacent_influence.includes(spaces_in_unrest[i])) {

	      let neighbours = his_self.game.spaces[spaces_in_unrest[i]].neighbours;
	      let pass = his_self.game.spaces[spaces_in_unrest[i]].pass;
	      let any_violent_neighbours = false;

	      for (let z = 0; z < neighbours.length; z++) {

	        if (!his_self.game.spaces[spaces_in_unrest[i]].pass.includes(neighbours[z])) {	
	          let number_of_hostiles = his_self.returnHostileLandUnitsInSpace(faction, neighbours[z]);
	          if (number_of_hostiles > 0) {
	  	    if (!pass.includes(neighbours[z])) {
		      any_violent_neighbours = true;
		    }
	          }
	        }
	      }
	      if (any_violent_neighbours == false) {
	        spaces_to_fix.push(spaces_in_unrest[i]);
	      }
	    }
	  }
	}
      }
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
    if (his_self.game.state.may_explore[faction] == 0) { return 0; }
    if (faction === "protestant") {  return false; }
    // already explored this round
    for (let i = 0; i < his_self.game.state.explorations.length; i++) {
      if (his_self.game.state.explorations[i].faction == faction && his_self.game.state.explorations[i].round >= his_self.game.state.round) { return 0; }
    }
    if (
      his_self.game.state.newworld['stlawrence'].claimed == 1 &&
      his_self.game.state.newworld['mississippi'].claimed == 1 &&
      his_self.game.state.newworld['greatlakes'].claimed == 1 &&
      his_self.game.state.newworld['amazon'].claimed == 1 &&
      his_self.game.state.newworld['pacificstrait'].claimed == 1 &&
      his_self.game.state.newworld['circumnavigation'].claimed == 1
    ) { return 0; }
    return 1;
  }
  async playerControlUnfortifiedSpace(his_self, player, faction, ops_to_spend=0, ops_remaining=0) {

    // BACK moves us to OPS menu
    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.addMove("discard\t"+his_self.returnControllingPower(faction)+"\t"+his_self.game.player_last_card); his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

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
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction, true); // include adjacency

    //
    // removed any spaces controlled by non-independent major powers i am not at war with
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let n = his_self.game.spaces[conquerable_spaces[i]];
      if (n.political != "" && n.political != "genoa" && n.political != "hungary" && n.political != "venice" && n.political != "scotland") {
	if (!his_self.areEnemies(faction, n.political)) {
          conquerable_spaces.splice(i, 1); // remove
        }
      }
    }

    //
    // removed fortified spaces
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let n = his_self.game.spaces[conquerable_spaces[i]];
      if (his_self.isSpaceFortified(n)) {
        conquerable_spaces.splice(i, 1); // remove
      }
    }

    //
    // remove spaces with other infantry
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let n = his_self.game.spaces[conquerable_spaces[i]];
      if (his_self.returnNonFactionLandUnitsInSpace(faction, n) > 0) {
        conquerable_spaces.splice(i, 1); // remove
      }
    }

    //
    // remove spaces with adjacent other infantry
    //
    for (let i = conquerable_spaces.length-1; i >= 0; i--) {
      let removed_space = false;
      let ns = his_self.game.spaces[conquerable_spaces[i]].neighbours;
      for (let z = 0; removed_space == false && z < ns.length; z++) {
        let n = his_self.game.spaces[ns[z]];
        if (his_self.returnHostileLandUnitsInSpace(faction, n) > 0) {
	  // unless we are there
          if (his_self.returnFactionLandUnitsInSpace(faction, conquerable_spaces[i]) > 0) {} else {
            conquerable_spaces.splice(i, 1); // remove
            removed_space = true;
          }
        }
      }
    }

    //
    // remove home spaces i control
    //
    for (let i = 0; i < conquerable_spaces.length; i++) {
      let s = his_self.game.spaces[conquerable_spaces[i]];
      if (his_self.isSpaceControlled(s, faction)) { 
        conquerable_spaces.splice(i, 1); // remove
	i--;
      }
    }   
          

    //
    // remove non-independent, non-enemy spaces
    //
    for (let i = 0; i < conquerable_spaces.length; i++) {
      let s = his_self.game.spaces[conquerable_spaces[i]];
      if (!his_self.isSpaceHostileOrIndependent(s, faction)) {
        conquerable_spaces.splice(i, 1); // remove
        i--;
      }
    }

    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (his_self.isSpaceControlled(conquerable_spaces[i], faction) || his_self.game.spaces[conquerable_spaces[i]].besieged == 1 || his_self.game.spaces[conquerable_spaces[i]].besieged == 2) {
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
	his_self.updateStatus("Controlling Space...");
	his_self.addMove("pacify\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
    return 0;
  }
  canPlayerColonize(his_self, player, faction) {

    if (his_self.game.state.may_colonize[faction] == 0) { return 0; }

    // no for protestants early-game
    if (faction === "protestant") { return false; }
    if (faction === "ottoman") { return false; }
    if (faction === "papacy") { return false; }

    for (let i = 0; i < his_self.game.state.colonies.length; i++) {
      if (his_self.game.state.colonies[i].faction == faction) {
        if (his_self.game.state.colonies[i].round >= his_self.game.state.round) { return 0; }
      }
    }
    if (faction === "england") {
      if (his_self.game.state.newworld['england_colony1'].claimed == 1 && his_self.game.state.newworld['england_colony2'].claimed == 1){ return 0; }
    }
    if (faction === "france") {
      if (his_self.game.state.newworld['france_colony1'].claimed == 1 && his_self.game.state.newworld['france_colony2'].claimed == 1){ return 0; }
    }
    if (faction === "hapsburg") {
      if (his_self.game.state.newworld['hapsburg_colony1'].claimed == 1 && his_self.game.state.newworld['hapsburg_colony2'].claimed == 1 && his_self.game.state.newworld['hapsburg_colony3'].claimed == 1){ return 0; }
    }

    //
    // Potosi takes the last colony
    //
    if (his_self.game.state.events.potosi_silver_mines_added == faction) {
      if (faction === "england") {
        if (his_self.game.state.newworld['england_colony1'].claimed == 1) { return 0; }
      }
      if (faction === "france") {
        if (his_self.game.state.newworld['france_colony1'].claimed == 1) { return 0; }
      }
      if (faction === "hapsburg") {
        if (his_self.game.state.newworld['hapsburg_colony1'].claimed == 1 && his_self.game.state.newworld['hapsburg_colony2'].claimed == 1) { return 0; }
      }
    }

    return 1;
  }

  async playerExplore(his_self, player, faction) {
    his_self.addMove("explore\t"+faction);
    his_self.endTurn();
    return 0;
  }
  async playerColonize(his_self, player, faction) {
    his_self.addMove("colonize\t"+faction);
    his_self.endTurn();
    return 0;
  }
  canPlayerConquer(his_self, player, faction) {
    if (his_self.game.state.may_conquer[faction] == 0) { return 0; }
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    for (let i = 0; i < his_self.game.state.conquests.length; i++) {
      if (his_self.game.state.conquests[i].round == his_self.game.state.round && his_self.game.state.conquests[i].faction == faction) { return 0; }
    }
    // nothing left to take
    if (his_self.game.state.newworld['inca'].claimed == 1 && his_self.game.state.newworld['aztec'].claimed == 1 && his_self.game.state.newworld['maya'].claimed == 1) { return 0; }
    return 1;
  }
  async playerConquer(his_self, player, faction) {
    his_self.addMove("conquer\t"+faction);
    his_self.endTurn();
    return 0;
  }
  canPlayerInitiatePiracyInASea(his_self, player, faction, selected_card) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (faction === "ottoman" && his_self.game.state.events.ottoman_piracy_attempts < 4 && his_self.game.state.events.ottoman_piracy_enabled == 1) { 

      for (let key in his_self.game.navalspaces) {
        let targetsea = false;
        for (let i = 0; i < his_self.game.navalspaces[key].units[faction].length; i++) {
  	  if (his_self.game.navalspaces[key].units[faction][i].type == "corsair") {
	    if (!his_self.game.state.events.ottoman_piracy_seazones.includes(key)) {
	      targetsea = true;
	    }
	  }
        }
        if (targetsea == true) {
          return 1;
        }
      }

    }

    return 0;
  }

  async playerInitiatePiracyInASea(his_self, player, faction, ops_to_spend=0, ops_remaining=0) {

    // relevant vars defined for this function
    //state.events.ottoman_piracy_enabled = 0;
    //state.events.ottoman_corsairs_enabled = 0;
    //state.events.ottoman_piracy_attempts = 0;
    //state.events.ottoman_piracy_seazones = [];

    his_self.bindBackButtonFunction(() => { his_self.displayBoard(); his_self.moves = []; his_self.playerPlayOps("", his_self.returnControllingPower(faction), ops_remaining+ops_to_spend, ""); });

    let msg = "Select Sea for Piracy: ";
    let html = '<ul>';
    for (let key in his_self.game.navalspaces) {
      let targetsea = false;
      for (let i = 0; i < his_self.game.navalspaces[key].units[faction].length; i++) {
	if (his_self.game.navalspaces[key].units[faction][i].type == "corsair") { 
	  if (!his_self.game.state.events.ottoman_piracy_seazones.includes(key)) {
	    targetsea = true;
	  }
	}
      }
      if (targetsea == true) {
        html += '<li class="option" id="'+key+'">'+his_self.returnSpaceName(key)+'</li>';
      }
    }
    html += '</ul>';

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
 
      // maybe no targets
      //his_self.unbindBackButtonFunction();
      his_self.updateStatus("acknowledge");
      let key = $(this).attr("id");
      let ports = [];
      let dragut = false;
      let barbarossa = false;

      let target_space = his_self.game.navalspaces[key];
      let adjacent_spaces = [];
      let io = his_self.returnImpulseOrder();
      let factions_at_war_with_ottoman = his_self.returnEnemies("ottoman", true); // true = include minor powers

      for (let i = 0; i < target_space.neighbours.length; i++) {
	adjacent_spaces.push(his_self.game.navalspaces[target_space.neighbours[i]]);
      }
      for (let i = 0; i < target_space.ports.length; i++) {
	adjacent_spaces.push(his_self.game.spaces[target_space.ports[i]]);
      }

      ports = his_self.game.navalspaces[key].ports;
      for (let i = 0; i < his_self.game.navalspaces[key].units[faction].length; i++) {
	if (his_self.game.navalspaces[key].units[faction][i].type == "dragut") { dragut = true; }
	if (his_self.game.navalspaces[key].units[faction][i].type == "barbarossa") { barbarossa = true; }
      }

      let msg = "Select Target for Piracy: ";
      let html = '<ul>';

      for (let z = 0; z < ports.length; z++) {
	let controller = his_self.game.spaces[ports[z]].political;
	if (his_self.game.spaces[ports[z]].political == "") { controller = his_self.game.spaces[ports[z]].home; }
        if (io.includes(controller) && controller != "ottoman") {
          html += '<li class="option" id="'+ports[z]+'">'+his_self.returnSpaceName(ports[z])+'</li>';
        }
      }
      html += '</ul>';

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let target_port = $(this).attr("id");
        his_self.unbindBackButtonFunction();
        his_self.updateStatus("acknowledge");
	his_self.addMove("piracy\t"+faction+"\t"+key+"\t"+target_port);
	his_self.endTurn();

      });
    });

    return 0;
  }
  canPlayerBuyCavalry(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "cavalry") == 0) { return false; }

    return 1;
  }
  async playerBuyCavalry(his_self, player, faction, ops_to_spend, ops_remaining) {

    //
    // ui for building multiple units
    //
    his_self.build_overlay.render(faction, "cavalry", (parseInt(ops_remaining)+parseInt(ops_to_spend)), parseInt(ops_to_spend), (num, costs) => {

      //
      // modify "continue" instruction if this is a move over a pass
      //
      for (let i = 0; i < his_self.moves.length; i++) {
        let x = his_self.moves[i];
        let y = x.split("\t");
        let new_ops_remaining = (parseInt(ops_remaining)+parseInt(ops_to_spend)) - (num*costs);
        if (y[0] === "continue") {
          if (new_ops_remaining) {
            his_self.moves[i] = y[0] + "\t" + y[1] + "\t" + y[2] + "\t" + y[3] + "\t" + new_ops_remaining + "\t" + y[5];
          } else {
            his_self.moves.splice(i, 1);
          }
        }
      }

      //
      // and place
      //
      name : "" ,
      his_self.playerSelectSpaceWithFilter(

        `Select Destination for ${num} Cavalry`,

        function(space) {
	  if (faction === "ottoman" && his_self.game.state.events.barbary_pirates == 1) {
	    // can only build corsairs in a pirate haven
	    if (space.key == "algiers" || space.pirate_haven == 1) { 
	      if (his_self.game.state.events.foreign_recruits != "ottoman") { return 0; }
	    }
	  }
  	  if (faction === "ottoman" && his_self.game.state.events.war_in_persia == 1) {
	    if (his_self.returnFactionLandUnitsInSpace("ottoman", "persia") < 5) {
	      if (space.key == "persia") { return 1; }
	      else { return 0; }
	    } else {
	      if (space.key == "persia") { return 1; }
	    }
	  }
	  if (faction === "ottoman" && his_self.game.state.events.revolt_in_egypt == 1) {
	    if (his_self.returnFactionLandUnitsInSpace("ottoman", "egypt") < 5) {
	      if (space.key == "egypt") { return 1; }
	      else { return 0; }
	    } else {
	      if (space.key == "egypt") { return 1; }
	    }
	  }
          if (his_self.doesSpaceHaveEnemyUnits(space, faction)) { return 0; }
	  if (his_self.game.state.events.foreign_recruits == faction && space.political == faction) { return 1; }
          if (space.owner === faction) { return 1; }
          if (space.home === faction) { return 1; }
          if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	  return 0;
        },

        function(destination_spacekey) {
          his_self.unbindBackButtonFunction();
	  his_self.updateStatus("acknowledge...");
	  for (let z = 0; z < num; z++) {
	    his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+destination_spacekey);
	  }
	  his_self.endTurn();
        },

        null,

        true

      );

    });

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Cavalry",

      function(space) {
	if (faction === "ottoman" && his_self.game.state.events.barbary_pirates == 1) {
	  // can only build corsairs in a pirate haven
	  if (space.key == "algiers" || space.pirate_haven == 1) { 
	    if (his_self.game.state.events.foreign_recruits != "ottoman") { return 0; }
	  }
	}
	if (faction === "ottoman" && his_self.game.state.events.war_in_persia == 1) {
	  if (his_self.returnFactionLandUnitsInSpace("ottoman", "persia") < 5) {
	    if (space.key == "persia") { return 1; }
	    else { return 0; }
	  } else {
	    if (space.key == "persia") { return 1; }
	  }
	}
	if (faction === "ottoman" && his_self.game.state.events.revolt_in_egypt == 1) {
	  if (his_self.returnFactionLandUnitsInSpace("ottoman", "egypt") < 5) {
	    if (space.key == "egypt") { return 1; }
	    else { return 0; }
	  } else {
	    if (space.key == "egypt") { return 1; }
	  }
	}
        if (his_self.doesSpaceHaveEnemyUnits(space, faction)) { return 0; }
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
        if (his_self.isSpaceControlled(space, faction) && his_self.game.state.events.foreign_recruits == faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");
	his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
  }
  canPlayerBuyCorsair(his_self, player, faction) {
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "squadron") == 0) { return 0; }   
    if (faction === "ottoman" && his_self.game.state.events.ottoman_corsairs_enabled == 1) {
      if (his_self.isSpaceControlled("algiers", "ottoman") && his_self.game.spaces["algiers"].besieged == 0) { return 1; }
      if (his_self.isSpaceControlled("tripoli", "ottoman") && his_self.game.spaces["tripoli"].pirate_haven == 1) { return 1; }
      if (his_self.isSpaceControlled("oran", "ottoman") && his_self.game.spaces["oran"].pirate_haven == 1) { return 1; }
    }
    if (his_self.returnNumberOfUnitsAvailableForConstruction(faction, "corsair") == 0) { return 0; }
    return 0;
  }
  async playerBuyCorsair(his_self, player, faction) {

    let count = his_self.countSpacesWithFilter((space) => {
      if (space.besieged != 0) { return 0; }
      if (space.pirate_haven == 1 && his_self.isSpaceControlled(space.key, "ottoman")) { return 1; }
      if (space.ports.length > 0 && space.home == "ottoman" && his_self.isSpaceControlled(space.key, "ottoman")) { return 1; }
      return 0;
    });


    his_self.playerSelectSpaceWithFilter(

      "Select Port for Corsair",

      function(space) {
        if (space.besieged != 0) { return 0; }
        if (space.pirate_haven == 1 && his_self.isSpaceControlled(space.key, "ottoman")) { return 1; }
        if (space.ports.length > 0 && space.home == "ottoman" && his_self.isSpaceControlled(space.key, "ottoman")) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");
	his_self.addMove("build\tland\t"+faction+"\t"+"corsair"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
  }
  canPlayerTranslateScripture(his_self, player, faction) {
    if (faction === "protestant") { return 1; }
    return 0;
  }
  async playerTranslateScripture(his_self, player, faction, ops_to_spend=1, ops_remaining=0) {

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
      his_self.updateStatus("selecting...");
      his_self.language_zone_overlay.hide();

      if (id == 1 || id == 4) {
	his_self.addMove("translation\tgerman\t"+ops_to_spend);
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in German Language Zone\ttranslation_german_language_zone\tgerman\t"+faction);
      }
      if (id == 2 || id == 5) { 
	his_self.addMove("translation\tfrench\t"+ops_to_spend); 
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in French Language Zone\ttranslation_french_language_zone\tfrench\t"+faction);
      }
      if (id == 3 || id == 6) { 
	his_self.addMove("translation\tenglish\t"+ops_to_spend);
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in English Language Zone\ttranslation_english_language_zone\tenglish\t"+faction);
      }
      // we only ask for our own CONFIRMS
      his_self.addMove("RESETCONFIRMSNEEDED\t"+his_self.game.player);
      his_self.endTurn();

    });

  }
  canPlayerPublishTreatise(his_self, player, faction) {
    if (faction === "protestant") {
      if (his_self.canProtestantsReformInLanguageZone("german")) { return 1; }
      if (his_self.canProtestantsReformInLanguageZone("english")) { return 1; }
      if (his_self.canProtestantsReformInLanguageZone("french")) { return 1; }
      if (his_self.canProtestantsReformInLanguageZone("spanish")) { return 1; }
      if (his_self.canProtestantsReformInLanguageZone("italian")) { return 1; }
      return 0;
    }
    if (faction === "england") {
      let where_is_cranmer = his_self.isPersonageOnMap("england", "cranmer-reformer");
      if (where_is_cranmer != "") {
        return 1;
      }
    }
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {

    if (faction === "protestant") {

      let msg = "Select Language Zone for Reformation Attempts:";
      let html = '<ul>';
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("german") || his_self.canProtestantsReformInLanguageZone("german")) {
        html += '<li class="option german" style="" id="german">German</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("english") || his_self.canProtestantsReformInLanguageZone("english")) {
        html += '<li class="option english" style="" id="english">English</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("french") || his_self.canProtestantsReformInLanguageZone("french")) {
        html += '<li class="option french" style="" id="french">French</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("spanish") || his_self.canProtestantsReformInLanguageZone("spanish")) {
        html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("italian") || his_self.canProtestantsReformInLanguageZone("italian")) {
        html += '<li class="option italian" style="" id="italian">Italian</li>';
      }
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
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    } else {
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench\t1");
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench\t1");
	    }
	    his_self.addMove("show_overlay\tpublish_treatise\tfrench");
	    if (id === "calvin-debater") {
	      his_self.addMove("commit\tprotestant\tcalvin-debater\t1");
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
	      his_self.addMove("SETVAR\tstate\tevents\tcarlstadt_debater\t0");
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    } else {
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman\t1");
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman\t1");
	    }
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
	his_self.addMove("protestant_reformation\t"+player+"\t"+id+"\t1");
	his_self.addMove("protestant_reformation\t"+player+"\t"+id+"\t1");
	his_self.addMove("show_overlay\tpublish_treatise\t"+id);
	his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.endTurn();
      });

    }


    if (faction === "england") {
      let id = "english";
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.endTurn();
    }

    return 0;
  }
  canPlayerCallTheologicalDebateMaryI(his_self, player, faction) {
    if (his_self.returnDebatersInLanguageZone("english", "protestant", 0) || his_self.returnDebatersInLanguageZone("english", "protestant", 1)) {
      return his_self.canPlayerCallTheologicalDebate(his_self, player, faction, 1);
    } else {
      return 0;
    }
  }
  canPlayerCallTheologicalDebate(his_self, player, faction, mary_i=0) {
    if (his_self.returnNumberOfUncommittedDebaters(faction) <= 0) { return 0; }
    if (his_self.game.state.events.wartburg == 1) { if (faction === "protestant") { return 0; } }
    if (faction === "protestant") { return 1; }
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerCallTheologicalDebateMaryI(his_self, player, faction) {
    return his_self.playerCallTheologicalDebate(his_self, player, faction, 1);
  }
  async playerCallTheologicalDebateInRegion(his_self, player, faction, region="", mary_i=0) {

      let language_zone = region;
      let opponent_faction = "protestant";
      if (faction != "papacy") { opponent_faction = "papacy"; }

      let msg = "Against Commited or Uncommited Debater?";
      let html = '<ul>';
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 1)) {
          html += '<li class="option committed" id="committed">Committed</li>';
      }
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 0)) {
          html += '<li class="option uncommitted" id="uncommitted">Uncommitted</li>';
      }
      html += '</ul>';

      //
      // show visual language zone selector
      //
      his_self.language_zone_overlay.render();
      his_self.language_zone_overlay.pushHudUnderOverlay();

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.committed').on('mouseover', function () {
        his_self.language_zone_overlay.hideDebaters();
        if (faction == "papacy") { 
	  his_self.language_zone_overlay.showDebaters(language_zone, "committed", "protestant"); 
	} else {
          his_self.language_zone_overlay.showDebaters(language_zone, "committed", "papacy");
	}
      });
      $('.committed').on('mouseout', function () {
        his_self.language_zone_overlay.hideDebaters();
      });
      $('.uncommitted').on('mouseover', function () {
        his_self.language_zone_overlay.hideDebaters();
	if (faction == "papacy") {
          his_self.language_zone_overlay.showDebaters(language_zone, "uncommitted", "protestant");
	} else {
          his_self.language_zone_overlay.showDebaters(language_zone, "uncommitted", "papacy");
	}
      });
      $('.uncommitted').on('mouseout', function () {
        his_self.language_zone_overlay.hideDebaters();
      });

      $('.option').on('click', function () {

        let committed = $(this).attr("id");

        his_self.language_zone_overlay.hide();

        if (committed === "committed") { committed = 1; } else { committed = 0; }

        if (faction === "papacy") {
	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate\t"+language_zone);
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+committed);
        } else {
    	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tProtestants call a theological debate\tdebate\t"+language_zone);
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
    	  his_self.addMove("pick_first_round_debaters\tprotestant\tpapacy\t"+language_zone+"\t"+committed);
        }
        his_self.endTurn();

      });

    return 0;

  }
  async playerCallTheologicalDebate(his_self, player, faction, mary_i=0) {

    let msg = "Select Language Zone for Theological Debate:";
    let html = '<ul>';

    if (faction === "protestant" || faction === "england") {
      if (his_self.returnDebatersInLanguageZone("german", "protestant", 0)) {
        html += '<li class="option german" style="" id="german">German</li>';
      }
      if (his_self.returnDebatersInLanguageZone("french", "protestant", 0)) {
        html += '<li class="option french" style="" id="french">French</li>';
      }
      if (his_self.returnDebatersInLanguageZone("english", "protestant", 0)) {
	if (his_self.game.state.events.more_executed_limits_debates != 1) {
          html += '<li class="option english" style="" id="english">English</li>';
        }
      }
    }
    if (faction === "papacy") {
      if (mary_i == 1) {
        html += '<li class="option english" style="" id="english">English</li>';
      } else {
        html += '<li class="option german" style="" id="german">German</li>';
        if (his_self.returnDebatersInLanguageZone("french", "protestant", 0) || his_self.returnDebatersInLanguageZone("french", "protestant", 1)) {
          html += '<li class="option french" style="" id="french">French</li>';
        }
        if (his_self.returnDebatersInLanguageZone("english", "protestant", 0) || his_self.returnDebatersInLanguageZone("english", "protestant", 1)) {
          html += '<li class="option english" style="" id="english">English</li>';
        }
      }
    }
    html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();
    his_self.language_zone_overlay.pushHudUnderOverlay();

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
          html += '<li class="option committed" id="committed">Committed</li>';
      }
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 0)) {
          html += '<li class="option uncommitted" id="uncommitted">Uncommitted</li>';
      }
      html += '</ul>';

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.committed').on('mouseover', function () {
        his_self.language_zone_overlay.hideDebaters();
        if (faction == "papacy") { 
	  his_self.language_zone_overlay.showDebaters(language_zone, "committed", "protestant"); 
	} else {
          his_self.language_zone_overlay.showDebaters(language_zone, "committed", "papacy");
	}
      });
      $('.committed').on('mouseout', function () {
        his_self.language_zone_overlay.hideDebaters();
      });
      $('.uncommitted').on('mouseover', function () {
        his_self.language_zone_overlay.hideDebaters();
	if (faction == "papacy") {
          his_self.language_zone_overlay.showDebaters(language_zone, "uncommitted", "protestant");
	} else {
          his_self.language_zone_overlay.showDebaters(language_zone, "uncommitted", "papacy");
	}
      });
      $('.uncommitted').on('mouseout', function () {
        his_self.language_zone_overlay.hideDebaters();
      });

      $('.option').on('click', function () {

        let committed = $(this).attr("id");

        his_self.language_zone_overlay.hide();

        if (committed === "committed") { committed = 1; } else { committed = 0; }

        if (faction === "papacy") {
	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate\t"+language_zone);
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+committed);
        } else {
    	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tProtestants call a theological debate\tdebate\t"+language_zone);
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
  async playerBuildSaintPeters(his_self, player, faction, ops_to_spend=1, ops_remaining=0) {
    for (let z = 0; z < ops_to_spend; z++) {
      his_self.addMove("build_saint_peters\t"+player+"\t"+faction);
    }
    his_self.endTurn();
    return 0;
  }

  canPlayerShowTutorial(his_self, player, faction) {
    if (his_self.game.state.round == 1) { return 1; }
    return 0;
  }
  async playerShowTutorial(his_self, player, faction, ops_to_spend=1, ops_remaining=0) {

    his_self.game.state.may_explore['england'] = 1;
    his_self.game.state.may_explore['france'] = 1;
    his_self.game.state.may_explore['hapsburg'] = 1;
    his_self.game.state.may_conquer['england'] = 1;
    his_self.game.state.may_conquer['france'] = 1;
    his_self.game.state.may_conquer['hapsburg'] = 1;
    his_self.game.state.may_colonize['england'] = 1;
    his_self.game.state.may_colonize['france'] = 1;
    his_self.game.state.may_colonize['hapsburg'] = 1;

    let title = "";
    let text = "";
    let img = "";
    let card = "";

    let options = [];

    //
    // Protestant
    //
    if (faction == "protestant") {

      title = "Publish a Treatise?";
      text = "You get +1 roll for each adjacent Protestant space. Committing debaters give bonus but make debaters vulnerable in theological debates...";
      img = "/his/img/backgrounds/move/printing_press.jpg";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      title = "Watch the Discard Pile";
      text = "Play your home card to retrieve cards from the discard pile. Play immediately or hold for future use...";
      img = "/his/img/backgrounds/move/publish_treatise.jpg";
      card = his_self.returnCardImage("007");
      options.push({ title : title , text : text , img : img , card : card });

      if (ops_remaining == 1) {
        title = "Translate the Bible!";
        text = "Translate the New Testament for 6 reformation attempts. Translate the Full Bible for 6 more with +1 modifier on each roll and a 1 VP bonus.";
        img = "/his/img/backgrounds/move/translate.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

    }

    //
    // Papacy
    //
    if (faction == "papacy") {

      title = "Convene a Debate?";
      text = "Play Leipzig Debate and pick your strongest debater. You can burn opponents or force Luther to defend his flock, wasting 5 Protestant OPs";
      img = "/his/img/backgrounds/move/theological_debate.jpg";
      card = his_self.returnCardImage("007");
      options.push({ title : title , text : text , img : img , card : card });

      title = "Conquer Florence";
      text = "Move your troops into Siena. Control Siena to create a line of control to Florence. Then besiege and assault the city.";
      img = "/his/img/backgrounds/move/papacy-florence.png";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      if (ops_remaining == 1) {
        title = "Build St. Peters!";
        text = "The Papacy earns VP for building St. Peter's Cathedral.";
        img = "/his/img/backgrounds/move/saint_peters.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }
    }

    //
    // Ottoman
    //
    if (faction == "ottoman") {

      title = "Crush the Hungarians";
      text = "Conquer Belgrade and Buda to earn 2 VP and force the Hapsburgs into war...";
      img = "/his/img/backgrounds/tutorials/ottoman-hungary.png";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      title = "Control the Mediterranean";
      text = "Piracy is harder around fortresses. Move ships into the Aegean Sea, and transport your units to Rhodes to assault the fortress...";
      img = "/his/img/backgrounds/tutorials/ottoman-rhodes.png";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      if (his_self.game.state.events.barbary_pirates == 1) {
        title = "Piracy?!";
        text = "Build corsairs in Algiers. Move them around the Mediterranean and target opponents with Piracy. Every hit earns VP or a card draw...";
        card = his_self.returnCardImage("009");
        img = "/his/img/backgrounds/move/piracy.jpg";
        options.push({ title : title , text : text , img : img , card : card });
      }

    }

    //
    // Hapsburg
    //
    if (faction == "hapsburg") {

      if (his_self.game.spaces["metz"].besieged == 0) {
        title = "Control Metz";
        text = "Build troops on Becanson and move them north to Metz. Assault the city the following turn.";
        img = "/his/img/backgrounds/tutorials/hapsburg-metz.png";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

      title = "Invade France";
      text = "Build infantry in Navarre and move them north to besiege Bordeaux. Assault the city the following turn.";
      img = "/his/img/backgrounds/tutorials/hapsburg-bordeaux.png";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      if (his_self.game.state.may_conquer['hapsburg'] == 1) {
        title = "New World Conquest";
        text = "Conquests are more difficult than Explorations, but can earn you bonus cards in the New World phase...";
        img = "/his/img/backgrounds/move/conquer.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

      if (his_self.game.state.may_colonize['hapsburg'] == 1) {
        title = "Found a Colony";
        text = "At the end of every round each colony rolls dice to win bonus cards for the following round...";
        img = "/his/img/backgrounds/move/colonize.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

    }

    //
    // France
    //
    if (faction == "france") {

      title = "Build a Chateaux";
      text = "Your Home Card earns VP and bonus cards, and your chance of success increases if France is not under attack.";
      img = "/his/img/backgrounds/chateaux.png";
      card = his_self.returnCardImage("004");
      options.push({ title : title , text : text , img : img , card : card });

      title = "Conquer the New World";
      text = "Conquests are more difficult than Explorations, but can earn you bonus cards in the New World phase...";
      img = "/his/img/backgrounds/move/conquer.jpg";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      if (his_self.game.state.may_explore['france'] == 1) {
        title = "Explore the New World";
        text = "New World Explorations cost 2 OPs and earn VP if they succeed. Dice are rolled and discoveries are made at the end of each turn.";
        img = "/his/img/backgrounds/move/explore.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

      if (his_self.game.state.may_colonize['france'] == 1) {
        title = "Found a Colony";
        text = "At the end of every round each colony rolls dice to win bonus cards for the following round...";
        img = "/his/img/backgrounds/move/colonize.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

      if (his_self.game.state.may_conquer['france'] == 1) {
        title = "Fortify Italy";
        text = "France struggles to move forces into Italy and Milan is vulnerable to attack. Protect and expand your Italian territories.";
        img = "/his/img/backgrounds/tutorials/france-milan.png";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

    }

    //
    // England
    //
    if (faction == "england") {

      title = "Unify the British Isles?";
      text = "Your Home Card lets you declare war on Scotland, which is necessary for attacking Edinburgh. Remember you will need 2 squadrons in the North Sea to assault the city.";
      img = "/his/img/backgrounds/tutorials/england-edinburgh.png";
      card = his_self.returnCardImage("003");
      options.push({ title : title , text : text , img : img , card : card });

      title = "Henry VIII and Marriage";
      text = "From round 2 on, event your Home Card to advance Henry VIII's marital status. England earns 6 VP once a male heir is born.";
      img = "/his/img/backgrounds/henry_viii.jpeg";
      card = his_self.returnCardImage("003");
      options.push({ title : title , text : text , img : img , card : card });

      title = "Fortify Calais?";
      text = "Calais is vulnerable to attack from the French and offers your landing point for invasions of the continent. Consider reinforcing it sooner rather than later.";
      img = "/his/img/backgrounds/tutorials/england-calais.png";
      card = "";
      options.push({ title : title , text : text , img : img , card : card });

      if (his_self.game.state.may_conquer['england'] == 1) {
        title = "Conquer the New World";
        text = "Conquests are harder than Explorations. In addition to earning VP if they succeed, they also roll dice for bonus cards at the end of every turn. Consider sending an expedition!";
        img = "/his/img/backgrounds/move/conquer.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

      if (his_self.game.state.may_explore['england'] == 1) {
        title = "Explore the New World";
        text = "New World Explorations cost 2 OPs and earn VP if they succeed. Dice are rolled and discoveries are made at the end of each turn.";
        img = "/his/img/backgrounds/move/explore.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

      if (his_self.game.state.may_colonize['england'] == 1) {
        title = "Found a Colony";
        text = "You are allowed up to three colonies. At the end of every turn your surviving colonies will roll dice for bonus cards. Having more cards can provide a crucial advantage later in the game."
        img = "/his/img/backgrounds/move/colonize.jpg";
        card = "";
        options.push({ title : title , text : text , img : img , card : card });
      }

    }

    let x = Math.floor(Math.random() * options.length);

    his_self.welcome_overlay.renderCustom({
      title : options[x].title ,
      text : options[x].text ,
      card : options[x].card ,
      img : options[x].img ,
    });

    return 0;

  }

  canPlayerBurnBooksMaryI(his_self, player, faction) {
    return his_self.canPlayerBurnBooks(his_self, player, faction, 1);
  }
  canPlayerBurnBooks(his_self, player, faction, mary_i=0) {
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerBurnBooksMaryI(his_self, player, faction, ops_to_spend=0, ops_remaining=0, mary_i=1) {
    return his_self.playerBurnBooks(his_self, player, faction, ops_to_spend, ops_remaining, 1);
    return 0;
  }
  async playerBurnBooks(his_self, player, faction, ops_to_spend, ops_remaining, mary_i=0) {

    let msg = "Select Language Zone for Counter Reformations";
    let html = '<ul>';

    if (mary_i == 0) {
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("german")) {
        html += '<li class="option german" style="" id="german">German</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("english")) {
        html += '<li class="option english" style="" id="english">English</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("french")) {
        html += '<li class="option french" style="" id="french">French</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("spanish")) {
        html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
      }
      if (his_self.returnNumberOfProtestantSpacesInLanguageZone("italian")) {
        html += '<li class="option italian" style="" id="italian">Italian</li>';
      }
    } else {
      html += '<li class="option english" style="" id="english">English</li>';
    }
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
            his_self.addMove("commit\tpapacy\ttetzel-debater\t1");
	  }

	  his_self.addMove("hide_overlay\tburn_books\t"+id);
	  his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	  if (id2 === "cajetan-debater" || id2 === "caraffa-debater") {
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	    if (id2 === "cajetan-debater") { his_self.addMove("commit\tpapacy\tcajetan-debater"); }
	    if (id2 === "caraffa-debater") { his_self.addMove("commit\tpapacy\tcaraffa-debater"); }
	  } else {
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id+"\t1");
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id+"\t1");
	  }
	  his_self.addMove("show_overlay\tburn_books\t"+id);
	  his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	  his_self.endTurn();

	  return 0;
	});

	return 0;
      }

      his_self.addMove("hide_overlay\tburn_books\t"+id);
      his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id+"\t1");
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id+"\t1");
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
        if (space.religion === "catholic" && space.university != 1) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.updateStatus("building university...");
        his_self.addMove("found_jesuit_university\t"+destination_spacekey);
        his_self.addMove("SETVAR\tstate\tloyola_bonus_active\t1");
	his_self.endTurn();
      },

      null,

      true

    );

    return 0;
  }

  playerPlaceUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;

    let count = his_self.countSpacesWithFilter(filter_func);

    if (count == 0) { his_self.endTurn(); return 0; }

    his_self.playerSelectSpaceWithFilter(

      `Place ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {
        
        his_self.unbindBackButtonFunction();
	his_self.updateStatus("acknowledge...");
	his_self.addUnit(faction, spacekey, unittype);
	his_self.displaySpace(spacekey);
        his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);	
	if (mycallback != null) { mycallback(spacekey); }

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

    let count = his_self.countSpacesWithFilter(filter_func);
    if (count == 0) { 
      his_self.updateStatus("No Spaces Available for Unit Removal"); 
      his_self.endTurn();
      return 0;
    }

    his_self.playerSelectSpaceWithFilter(

      `Remove ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {

	his_self.updateStatus("removing unit...");

	his_self.removeUnit(faction, spacekey, unittype);

	his_self.displaySpace(spacekey);

        his_self.addMove("remove_unit\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerRemoveUnitsInSpaceWithFilter(unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}

      },

      cancel_func,

      true

    );
  }



  playerRemoveAnyFactionUnitsInSpaceWithFilter(unittype, num, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;

    let count = his_self.countSpacesWithFilter(filter_func);
    if (count == 0) { 
      his_self.updateStatus("No Spaces Available for Unit Removal"); 
      his_self.endTurn();
      return 0;
    }

    his_self.playerSelectSpaceWithFilter(

      `Remove ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {

	his_self.updateStatus("removing unit...");

	let s = his_self.game.spaces[spacekey];
	let factions_with_units = [];
	for (let f in s.units) {
	  for (let z = 0; z < s.units[f].length; z++) {
	    if (s.units[f][z].type === unittype && !factions_with_units.includes(f)) { factions_with_units.push(f); z = 100; }
	  }
        }

	if (factions_with_units.length == 1) {
	  let faction = factions_with_units[0];
	  his_self.removeUnit(faction, spacekey, unittype);
	  his_self.displaySpace(spacekey);
          his_self.addMove("remove_unit\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);	
  	  if (num == 1) {
            his_self.endTurn();
	  } else {
  	    his_self.playerRemoveAnyFactionUnitsInSpaceWithFilter(unittype, num-1, filter_func, mycallback, cancel_func, board_clickable);
	  }
	} else {

          let msg = "Remove Mercenary from which Faction?";
          let html = '<ul>';
          for (let z = 0; z < factions_with_units.length; z++) {
	    html += `<li class="option" id="${factions_with_units[z]}">${his_self.returnFactionName(factions_with_units[z])}</li>`;
	  }
          html += '</ul>';
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {
            let faction = $(this).attr("id");
	    his_self.removeUnit(faction, spacekey, unittype);
	    his_self.displaySpace(spacekey);
            his_self.addMove("remove_unit\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);	
  	    if (num == 1) {
              his_self.endTurn();
	    } else {
  	      his_self.playerRemoveAnyFactionUnitsInSpaceWithFilter(unittype, num-1, filter_func, mycallback, cancel_func, board_clickable);
	    }
          });
	}
      },

      cancel_func,

      true

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


  playerManuallyRemoveExcommunication(his_self, faction) {

    let msg = "Give Papacy Card to Remove Excommunication?";
    let html = '<ul>';
    html += `<li class="option" id="yes">give random card</li>`;
    html += `<li class="option" id="no">remain excommunicated</li>`;
    html += '</ul>';

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let id = $(this).attr("id");

      if (id == "yes") {
        his_self.addMove("unexcommunicate_faction\t"+faction);
        his_self.addMove("pull_card\t"+"papacy"+"\t"+faction);
        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " gives card to remove excommunication");
      }
      his_self.endTurn();

    });
  }


  canFactionSueForPeace(faction) {

    let his_self = this;
    let f = [];
    let io = this.returnImpulseOrder();

    for (let i = 0; i < io.length; i++) {
      if (this.areEnemies(faction, io[i])) {
	for (let key in this.game.spaces) {
	  if (this.game.spaces[key].home == faction) {
	    if (this.returnFactionControllingSpace(key) == io[i]) {
	      if (!f.includes(io[i])) {
	        f.push(io[i]);
	      }
	    }
	  }
	}
	if (!f.includes(io[i])) {
	  let p2 = this.returnPlayerCommandingFaction(io[i]);
          for (let z = 0; z < his_self.game.state.players_info[p2-1].captured.length; z++) {
	    if (his_self.game.state.players_info[p2-1].captured[z].faction == faction) {
	      if (!f.includes(io[i])) {
	        f.push(io[i]);
	      }
	    }
	  }
        }
      }
    }

    if (faction == "protestant") {
      for (let z = 0; z < f.length; z++) {
	if (f[z] == "hapsburg" || f[z] == "papacy") { 
	  f.splice(z, 1);
	  z--;
	}
      }
    }
    if (faction == "papacy" || faction == "hapsburg") {
      for (let z = 0; z < f.length; z++) {
	if (f[z] == "protestant") {
	  f.splice(z, 1);
	  z--;
	}
      }
    }

    return f;

  }

  playerSueForPeace(his_self, faction) {

    let f = this.canFactionSueForPeace(faction);

    let msg = `${his_self.returnFactionName(faction)} - Sue for Peace?`;
    let html = '<ul>';
    for (let i = 0; i < f.length; i++) {
      html += `<li class="option" id="${f[i]}">${his_self.returnFactionName(f[i])}</li>`;
    }
    html += `<li class="option" id="skip">skip</li>`;
    html += '</ul>';

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      his_self.bindBackButtonFunction(() => { his_self.moves = []; his_self.playerSueForPeace(his_self, faction); });

      let target_faction = $(this).attr("id");

      if (target_faction == "skip") {
	his_self.unbindBackButtonFunction();
        his_self.updateStatus("skipping...");
	his_self.endTurn();
	return;
      }

      //
      // notify us
      //
      his_self.addMove("NOTIFY\t" + his_self.returnFactionName(faction) + " sues for peace with " + his_self.returnFactionName(target_faction));

      //
      // no longer enemies
      //
      his_self.addMove("unset_enemies\t"+faction+"\t"+target_faction);

      //
      // +1 War Winner VP
      //
      let bonus_vp = 1;
      if (target_faction == "ottoman" || faction == "ottoman") { bonus_vp = 2; }

      his_self.addMove("display_vp_track");
      for (let z = 0; z < bonus_vp; z++) {
        if (target_faction == "protestant") { his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t${parseInt(his_self.game.state.protestant_war_winner_vp)+1}`); }
        if (target_faction == "ottoman")    { his_self.addMove(`SETVAR\tstate\tottoman_war_winner_vp\t${parseInt(his_self.game.state.ottoman_war_winner_vp)+1}`); }
        if (target_faction == "papacy")     { his_self.addMove(`SETVAR\tstate\tpapacy_war_winner_vp\t${parseInt(his_self.game.state.papacy_war_winner_vp)+1}`); }
        if (target_faction == "france")     { his_self.addMove(`SETVAR\tstate\tfrance_war_winner_vp\t${parseInt(his_self.game.state.france_war_winner_vp)+1}`); }
        if (target_faction == "england")    { his_self.addMove(`SETVAR\tstate\tengland_war_winner_vp\t${parseInt(his_self.game.state.england_war_winner_vp)+1}`); }
        if (target_faction == "hapsburg")   { his_self.addMove(`SETVAR\tstate\thapsburg_war_winner_vp\t${parseInt(his_self.game.state.hapsburg_war_winner_vp)+1}`); }
      }

      //
      // loser returns winner home spaces
      //
      for (let key in his_self.game.spaces) {
	if (his_self.game.spaces[key].home === target_faction) {
	  if (his_self.returnControllingPower(his_self.game.spaces[key].political) === faction) {
            his_self.addMove(`control\t${target_faction}\t${key}`);
	    for (let f in his_self.game.spaces[key].units) {
	      if (his_self.returnControllingPower(f) == faction) {
                his_self.addMove(`withdraw_to_nearest_fortified_space\t${f}\t${key}`);
	      }
	    }
	  }
        }
      }

      //
      // loser removes 2 units
      //
      his_self.playerSelectSpaceOrNavalSpaceWithFilter(
        `Select Space to Remove 1st Unit` ,
        function(space) {
          if (space.units[faction].length > 0) {
	    for (let i = 0; i < space.units[faction].length; i++) {
	      let u = space.units[faction][i];
	      if (u.type == "regular" || u.type == "squadron" || u.type == "corsair" || u.type == "mercenary" || u.type == "cavalry") { return 1; }
	    }
	  }
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
          let faction_to_destroy = faction;
          let msg = "Destroy Which Unit: ";
          let unittypes = [];
          let html = '<ul>';
          for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
            if (space.units[faction_to_destroy][i].command_value == 0 && space.units[faction_to_destroy][i].personage != true) {
              if (!unittypes.includes(space.units[faction_to_destroy][i].key)) {
                html += `<li class="option" id="${space.units[faction_to_destroy][i].key}">${space.units[faction_to_destroy][i].key}</li>`;
                unittypes.push(space.units[faction_to_destroy][i].key);
              }
            }
          }
          html += '</ul>';
          his_self.updateStatusWithOptions(msg, html);
          $('.option').off();
          $('.option').on('click', function () {
            let unittype = $(this).attr("id");
            his_self.updateStatus("removing unit...");
            his_self.removeUnit(faction_to_destroy, spacekey, unittype);
            his_self.bindBackButtonFunction(() => { his_self.moves = []; his_self.addUnit(faction_to_destroy, spacekey, unittype); his_self.displayBoard(); his_self.playerSueForPeace(his_self, faction); });
            his_self.displaySpace(spacekey);
            his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
            //
            // loser removes 2 units
            //
            his_self.playerSelectSpaceOrNavalSpaceWithFilter(
              `Select Space to Remove 2nd Unit` ,
              function(space) {
                if (space.units[faction].length > 0) {
	          for (let i = 0; i < space.units[faction].length; i++) {
	          let u = space.units[faction][i];
	            if (u.type == "regular" || u.type == "squadron" || u.type == "corsair" || u.type == "mercenary" || u.type == "cavalry") { return 1; }
	          }
	        }
                return 0;
              },
              function(spacekey) {
                his_self.updateStatus("removing unit...");
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
                let faction_to_destroy = faction;
                let msg = "Destroy Which Unit: ";
                let unittypes = [];
                let html = '<ul>';
                for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                  if (space.units[faction_to_destroy][i].personage != true && space.units[faction_to_destroy][i].battle_rating != 1) {
                    if (!unittypes.includes(space.units[faction_to_destroy][i].key)) {
                      html += `<li class="option" id="${space.units[faction_to_destroy][i].key}">${space.units[faction_to_destroy][i].key}</li>`;
                      unittypes.push(space.units[faction_to_destroy][i].key);
                    }
                  }
                }
	        html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
                $('.option').off();
                $('.option').on('click', function () {
                  let unittype = $(this).attr("id");
                  his_self.updateStatus("removing unit...");
                  his_self.removeUnit(faction_to_destroy, spacekey, unittype);
		  his_self.unbindBackButtonFunction();
                  his_self.displaySpace(spacekey);
                  his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
                  let z = false;
                  his_self.prependMove("war_loser_regain_keys_for_vp\t"+faction+"\t"+target_faction);
                  his_self.prependMove("war_loser_regain_spaces_for_vp_or_cards\t"+faction+"\t"+target_faction);
                  his_self.prependMove("war_loser_regain_leaders_for_vp_or_cards\t"+faction+"\t"+target_faction);
                  his_self.endTurn();
                });
              },
              null ,
              1
            );
          });
        },
        null ,
        1
      );
    });
   

  }

  canPlayerDeclareWar(his_self, faction) {

    let t = his_self.returnDeclarationOfWarTargets(faction);
    for (let i = 0; i < t.length; i++) {
      if (t[i].cost > 0) { return 1; }
    }

    return 0;

  }

  //
  // similar to playerDeclareWar but permits choosing multiple
  // targets for war...
  //
  playerMakeDeclarationsOfWar(his_self, faction) {

    let t = his_self.returnDeclarationOfWarTargets(faction);
    let targets = [];

    let selectFactionsInterface = function(selectFactionsInterface, payCostsInterface) {

      his_self.war_overlay.render();

      let msg = `${his_self.returnFactionName(faction)} - Declarations of War?`;
      let existing_cost = 0;
      let html = '<ul>';
      let final_message = "do not declare war";

      for (let i = 0; i < targets.length; i++) {
	existing_cost += parseInt(targets[i].cost);
      }

      if (existing_cost > 0) { msg += " (cost: "+existing_cost+")"; }

      for (let i = 0; i < t.length; i++) {

	let include_faction = true;
	let already_declaring_war = false;
	for (let z = 0; z < targets.length; z++) {
	  if (targets[z].faction === t[i].faction) { 
	    already_declaring_war = true;
	  }
	}
	if (his_self.areEnemies(faction, t[i].faction)) {
	  include_faction = false;
	}

	if (include_faction) {
          if (already_declaring_war) {
  	    html += `<li class="option" id="${i}">* ${his_self.returnFactionName(t[i].faction)} (${t[i].cost} OPS) *</li>`;
            final_message = "declare war (and pay)";
	  } else {
            html += `<li class="option" id="${i}">${his_self.returnFactionName(t[i].faction)} (${t[i].cost} OPS)</li>`;
          }
        }
      }
      html += `<li class="option" id="end">${final_message}</li>`;
      html += '</ul>';

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

	let action = $(this).attr("id");

        his_self.war_overlay.hide();

        let id = parseInt(action);
	$('.option').off();

	if (action == "end") {
	  if (targets.length == 0) {
	    his_self.endTurn();
	    return;
	  }
	  payCostsInterface(selectFactionsInterface, payCostsInterface);
	  return;
	}

        let enemy = t[id].faction;
        let cost = t[id].cost;

	let total_cost = 0;
	for (let i = 0; i < targets.length; i++) {
	  total_cost += targets[i].cost;
	}

	let already_in_targets = false;
	for (let i = 0; i < targets.length; i++) {
	  if (targets[i].faction == enemy) {
	    already_in_targets = true;
	    targets.splice(i, 1);
	  }
	}

	if (already_in_targets == false) {
	  targets.push({ faction : enemy , cost : cost });
	}

	selectFactionsInterface(selectFactionsInterface, payCostsInterface);

      });
    }


    let payCostsInterface = function(selectFactionsInterface, payCostsInterface) {

      let total_cost = 0;
      let total_cost_paid = 0;
      let cards_selected = [];

      for (let i = 0; i < targets.length; i++) {
        total_cost += targets[i].cost;
      }
  
      let selectCardsInterface = function(selectCardsInterface, selectFactionsInterface, payCostsInterface) {

        let msg = "Declare War: " + total_cost_paid + " of " + total_cost + " OPS"; 

        his_self.playerSelectOps(faction, 1, (card) => {

	  if (!cards_selected.includes(card)) { cards_selected.push(card); }
	  total_cost_paid += parseInt(his_self.game.deck[0].cards[card].ops);	 
          his_self.addMove(`discard\t${faction}\t${card}`);

	  if (total_cost_paid >= total_cost) {
	    his_self.updateStatus("acknowledge");
	    for (let i = 0; i < targets.length; i++) {
              his_self.addMove(`declare_war\t${faction}\t${targets[i].faction}`);
	    }
	    his_self.endTurn();
	  } else {
	    selectCardsInterface(selectCardsInterface, selectFactionsInterface, payCostsInterface);
	  }

        }, msg, cards_selected);
	
      }

      selectCardsInterface(selectCardsInterface, selectFactionsInterface, payCostsInterface);

    }

    selectFactionsInterface(selectFactionsInterface, payCostsInterface);

    return 0;

  }

  playerDeclareWar(his_self, faction, cost=-1, targets=[]) {

    let t = his_self.returnDeclarationOfWarTargets(faction);

    let msg = "Declare War on which Power?";
    let html = '<ul>';
    for (let i = 0; i < t.length; i++) {
      if ((this.canPlayerSelectOps(faction, t[i].cost) || cost == -1) || (this.canPlayerSelectOps(faction, cost))) {
	if (targets.length > 0) {
          if (targets.includes(t[i].faction)) {
	    html += `<li class="option" id="${i}">${t[i].faction}</li>`;
	  }
	} else {
          html += `<li class="option" id="${i}">${t[i].faction}</li>`;
        }
      }
    }
    html += '</ul>';

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let id = $(this).attr("id");
      let enemy = t[id].faction;
      let cost = t[id].cost;

      his_self.playerSelectOps(faction, cost, (card) => {
        his_self.addMove(`discard\t${faction}\t${card}`);
        his_self.addMove(`declare_war\t${faction}\t${cost}`);
        his_self.endTurn();
      });

    });
     
    return 0;
  }

