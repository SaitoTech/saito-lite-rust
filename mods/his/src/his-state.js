
  onNewImpulse() {

    //
    // reset player last move
    //
    this.game.state.player_last_move = "";
    this.game.state.player_last_spacekey = "";
    this.game.state.field_battle_relief_battle = false;
    this.game.state.rejected_pre_battle_fortification = [];

    //
    // remove foul weather
    //
    this.game.state.events.foul_weather = 0;
    this.game.state.events.foreign_recruits = "";
    this.game.state.spring_deploy_across_passes = [];
    this.game.state.spring_deploy_across_seas = [];
    this.game.state.foreign_wars_fought_this_impulse = [];
    this.game.state.events.spring_preparations = "";
    this.game.state.events.henry_petitions_for_divorce_grant = 0;
    this.game.state.spaces_assaulted_this_turn = [];
    this.game.state.events.more_executed_limits_debates = 0;
    this.game.state.events.more_bonus = 0;
    this.game.state.events.sack_of_rome = 0;
    this.game.state.events.roxelana = 0;
    this.game.state.loyola_bonus_active = 0;

    //
    // add cranmer if needed
    //
    if (this.game.state.events.cranmer_active == 1) { 
      if (this.game.state.round >= 3) {
        let where_is_cranmer = this.isPersonageOnMap("england", "cranmer-reformer");
        if (where_is_cranmer) { this.game.state.events.cranmer_active = 0; }
      }
    } else {
      if (this.game.state.round >= 3) {
        let where_is_cranmer = this.isPersonageOnMap("england", "cranmer-reformer");
        if (where_is_cranmer) { this.game.state.events.cranmer_active = 1; }
      }
    }

    //
    // reset impulse commits
    //
    this.game.state.debater_committed_this_impulse = {};
    this.game.state.assaulted_this_impulse = 0;
    this.game.state.naval_avoid_battle_bonus = 0;
    this.game.state.naval_intercept_bonus = 0;


    // display cards left
    this.displayCardsLeft();

    //
    // remove gout
    //
    if (this.game.state.events.gout != 0) {
      for (let i in this.game.spaces) {
	let space = this.game.spaces[i];
        for (let f in space.units) {
          for (let z = space.units[f].length-1;  z >= 0; z--) {
	    space.units[f][z].gout = false; 
	    space.units[f][z].relief_force = 0;
  	  }
        }
      }
      this.game.state.events.gout = 0;    
    }

    //
    // remove temporary bonuses and modifiers
    //
    this.game.state.events.augsburg_confession = false;

    // allow stuff to move again
    this.resetLockedTroops();

  }

  onNewRound() {

    //
    // reset piracy markers
    //
    for (let key in this.game.navalspaces) {
      this.hidePiracyMarker(key);
    }

    //
    // add cranmer if needed
    //
    if (this.game.state.events.cranmer_active != 1) { 
      if (this.game.state.round >= 3) {
        let where_is_cranmer = this.isPersonageOnMap("england", "cranmer-reformer");
        if (where_is_cranmer) { this.game.state.events.cranmer_active = 1; }
      }
    }

    //
    // reset variables that permit intervention
    //
    this.game.state.events.intervention_venetian_informant_possible = 0;
    this.game.state.events.intervention_on_movement_possible = 0;
    this.game.state.events.intervention_on_events_possible = 0;
    this.game.state.events.intervention_on_assault_possible = 0;
    this.game.state.events.intervention_post_assault_possible = 0;
    this.game.state.events.intervention_post_naval_battle_possible = 0;
    this.game.state.events.intervention_naval_avoid_battle_possible = 0;
    this.game.state.events.intervention_naval_intercept_possible = 0;

    this.game.state.field_battle_relief_battle = false;

    //
    // reset impulse commits
    //
    this.game.state.debater_committed_this_impulse = {};
    this.game.state.spaces_assaulted_this_turn = [];
    this.game.state.printing_press_active = 0;
    this.game.state.events.sack_of_rome = 0;
    this.game.state.events.julia_gonzaga_activated = 0;
    this.game.state.events.england_changed_rulers_this_turn = 0;
    this.game.state.events.smallpox = "";
    this.game.state.protestant_cards_evented = [];
    this.game.state.cards_evented = [];
    this.game.state.foreign_wars_fought_this_impulse = [];
    this.game.state.henry_viii_pope_approves_divorce = 0;
    this.game.state.events.cromwell = 0;

    this.game.state.may_explore['england'] = 1;
    this.game.state.may_explore['france'] = 1;
    this.game.state.may_explore['hapsburg'] = 1;
    this.game.state.may_conquer['england'] = 1;
    this.game.state.may_conquer['france'] = 1;
    this.game.state.may_conquer['hapsburg'] = 1;
    this.game.state.may_colonize['england'] = 1;
    this.game.state.may_colonize['france'] = 1;
    this.game.state.may_colonize['hapsburg'] = 1;

    this.game.state.cards_issued = {};
    this.game.state.cards_issued['ottoman'] = 0;
    this.game.state.cards_issued['hapsburg'] = 0;
    this.game.state.cards_issued['england'] = 0;
    this.game.state.cards_issued['france'] = 0;
    this.game.state.cards_issued['papacy'] = 0;
    this.game.state.cards_issued['protestant'] = 0;

    this.game.state.ships_destroyed = {};
    this.game.state.ships_destroyed['ottoman'] = 0;
    this.game.state.ships_destroyed['hapsburg'] = 0;
    this.game.state.ships_destroyed['england'] = 0;
    this.game.state.ships_destroyed['france'] = 0;
    this.game.state.ships_destroyed['papacy'] = 0;
    this.game.state.ships_destroyed['protestant'] = 0;
    this.game.state.ships_destroyed['scotland'] = 0;
    this.game.state.ships_destroyed['venice'] = 0;
    this.game.state.ships_destroyed['hungary'] = 0;
    this.game.state.ships_destroyed['genoa'] = 0;

    this.game.state.naval_avoid_battle_bonus = 0;
    this.game.state.naval_intercept_bonus = 0;

    this.game.state.events.ottoman_piracy_wartburg = 0;
    this.game.state.events.ottoman_piracy_attempts = 0;
    this.game.state.events.ottoman_piracy_seazones = [];

    this.game.state.events.intervention_venetian_informant_possible = 0;
    this.game.state.events.intervention_on_movement_possible = 0;
    this.game.state.events.intervention_on_events_possible = 0;
    this.game.state.events.intervention_on_assault_possible = 0;
    this.game.state.events.intervention_post_assault_possible = 0;
    this.game.state.events.intervention_post_naval_battle_possible = 0;
    this.game.state.events.intervention_naval_avoid_battle_possible = 0;
    this.game.state.events.intervention_naval_intercept_possible = 0;

    this.game.state.tmp_reformations_this_turn = [];
    this.game.state.tmp_counter_reformations_this_turn = [];
    this.game.state.tmp_protestant_translation_bonus = 0;
    this.game.state.tmp_protestant_reformation_modifier = 0;
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_protestant_reformation_bonus_spaces = [];
    this.game.state.tmp_catholic_reformation_modifier = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus_spaces = [];
            
    this.game.state.tmp_protestant_counter_reformation_modifier = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus_spaces = [];
    this.game.state.tmp_catholic_counter_reformation_modifier = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus_spaces = [];
    this.game.state.tmp_papacy_may_specify_debater = 0;
    this.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    this.game.state.impulse = 0;
    this.game.state.events.more_executed_limits_debates = 0;
    this.game.state.events.more_bonus = 0;
    this.game.state.events.unexpected_war = 0;
 
    this.game.state.newworld.results.colonies = [];
    this.game.state.newworld.results.explorations = [];
    this.game.state.newworld.results.conquests = [];

 
    //
    // allow stuff to move again
    //
    this.resetLockedTroops();
    this.removeBesiegedSpaces();

    this.displayCardsLeft();
    this.displayTurnTrack();

    try { document.querySelector(".crossing_atlantic").innerHTML = ""; } catch (err) {}

    this.displayNewWorld();
    this.displayVictoryTrack();

  }

  returnLoanedUnits() {
    for (let i in this.game.spaces) {
      space = this.game.spaces[i];
      for (let f in space.units) {
        for (let z = space.units[f].length-1;  z >= 0; z--) {
	  let unit = space.units[f][z];
	  if (unit.loaned != false) {
	    let lender = unit.loaned;
	    space.units[f].splice(z, 1);
	    space.units[lender].push(unit);
	  }
        }
      }
    }
    for (let i in this.game.navalspaces) {
      space = this.game.navalspaces[i];
      for (let f in space.units) {
        for (let z = space.units[f].length-1;  z >= 0; z--) {
	  let unit = space.units[f][z];
	  if (unit.loaned != false) {
	    let lender = unit.loaned;
	    space.units[f].splice(z, 1);
	    space.units[lender].push(unit);
	  }
        }
      }
    }
  }

  isCaptured(faction, unittype) {
    for (let i = 0; i < this.game.players.length; i++) {
      let p = this.game.state.players_info[i];
      for (let z = 0; z < p.captured.length; z++) {
        if (p.captured[z].type == unittype) { return 1; }
      }
    }
    return 0;
  }

  isSpaceBesieged(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let faction_with_units = "";
    let faction_in_control = this.returnFactionControllingSpace(space);
    if (space.besieged == 1 || space.besieged == 2 || space.besieged == true) {
      //
      // are we still besieged? will be unit
      //
      for (let f in space.units) {
        for (let i = 0; i < space.units[f].length; i++) {
  	  if (space.units[f][i].besieged == true || space.units[f][i].besieged == 1) {
	    //
	    // we are still besieged if there are any enemy units here
	    //
	    for (let zf in space.units) {
	      if (zf != f) {
		if (space.units[zf].length > 0) {
		  if (!this.areAllies(zf, f)) {
		    if (this.returnFactionLandUnitsInSpace(zf, space.key) > 0) { return true; }
		  }
		}
	      }
	    }

	    //
	    // no-one else is here, so I guess we aren't anymore
	    //
	    return false;
	  } else {
	    // if not independent (which won't attack) or allies, then someone must be besieged
	    if (f != "independent") {
	      if (!this.areAllies(f, faction_in_control)) { return true; }    
	    }
	  }
        }
      }

      return false; // everyone here is allied or independent and not-besieged
    }
    return false;
  }
  isBesieged(faction, unittype) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].besieged) {
	for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].type == unittype) {
	    if (this.game.spaces[key].units[faction][i].besieged == true) {
	      return 1;
	    }
	  }
	}
      }
    }
    return 0;
  }

  captureLeader(winning_faction, losing_faction, space, unit = false) {

    if (!unit) { return; }
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    winning_faction = this.returnControllingPower(winning_faction);

    let return_to_nearest_fortified_key = false;

    //
    // special treatment if unaligned minor power captures
    //
    // independent factions cannot capture leaders, so we return them to the nearest
    // friendly, fortified space. edge-case out of rule book. rules determination here
    // by Ed Beach (Oct 29, 2024 on WhatsApp)
    //
    if (["independent","venice","hungary","genoa","scotland"].includes(winning_faction)) {

      let res = this.returnNearestFriendlyFortifiedSpacesTransitPasses(losing_faction, space, 0, 0);
      let capitals = this.returnCapitals(losing_faction);

      if (res.length > 0) {
	this.addArmyLeader(losing_faction, res[0].key, unit.type);
	return;
      } else {
	for (let z = 0; z < capitals.length; z++) {
	  if (this.isSpaceControlled(losing_faction, capitals[z])) {
	    this.addArmyLeader(losing_faction, capitals[z], unit.type);
	    return;
	  }
	}
      }

      //
      // no capital? push problem until next round
      //
      // no need to delete, function will sort out after return in this case
      //
      this.game.state.military_leaders_removed_until_next_round.push(unit);
      return;

    }

    let winning_player = this.returnPlayerCommandingFaction(winning_faction);
    if (winning_player > 0) {
      let p = this.game.state.players_info[winning_player-1];
      let unitjson = JSON.stringify(unit);
      for (let z = 0; z < p.captured.length; z++) {
        if (JSON.stringify(p.captured[z]) === unitjson) { return; }
      }
      unit.capturing_faction = winning_faction;
      this.updateLog(this.returnFactionName(winning_faction) + " captures " + unit.name);
      p.captured.push(unit);
    }
  }

  captureNavalLeader(winning_faction, losing_faction, space, unit) {
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    this.game.state.naval_leaders_lost_at_sea.push(unit);
  }

  isPersonageOnMap(faction, personage) {
    for (let s in this.game.spaces) {
      if (this.game.spaces[s].units[faction].length > 0) {
	for (let i = 0; i < this.game.spaces[s].units[faction].length; i++) {
	  let unit = this.game.spaces[s].units[faction][i];
	  if (unit.key === personage) { return unit; }
	}
      }
    }
    return null;
  }

  addUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.newUnit(faction, type));
    this.updateOnBoardUnits();
  }

  removeUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = space.units[faction].length - 1; i >= 0; i--) {
      if (space.units[faction][i].type == type) {
        this.updateLog(this.returnFactionName(faction) + " removes " + type + " in " + space.name);
	space.units[faction].splice(i, 1);
        this.updateOnBoardUnits();
	return;
      }
    }
  }

  isLandUnit(unit) {
    if (unit.type === "regular") { return 1; }
    if (unit.type === "mercenary") { return 1; }
    if (unit.type === "cavalry") { return 1; }
    return 0;
  }

  addRegular(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "regular"));
    }
    this.updateOnBoardUnits();
  }

  addMercenary(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "mercenary"));
    }
    this.updateOnBoardUnits();
  }

  addCavalry(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "cavalry"));
    }
    this.updateOnBoardUnits();
  }

  addNavalSquadron(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "squadron"));
    }
    this.updateOnBoardUnits();
  }

  addCorsair(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "corsair"));
    }
  }

  //
  // figure out how many base points people have
  //
  calculateVictoryPoints() {

    let factions = {};

    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
        factions[this.game.state.players_info[i].factions[ii]] = {
	  faction : this.game.state.players_info[i].factions[ii] ,
	  vp_base : 0 ,
	  vp_bonus : 0 ,
	  vp_special : 0 ,
	  vp : 0 ,
	  keys : 0 ,
	  religious : 0 ,
	  victory : 0,	  
	  details : "",
	};
      }
    }

    //
    // let factions calculate their VP
    //
    for (let f in factions) {
      factions[f].vp_base = this.factions[f].calculateBaseVictoryPoints(this);
      factions[f].vp_bonus = this.factions[f].calculateBonusVictoryPoints(this);
      factions[f].vp_special = this.factions[f].calculateSpecialVictoryPoints(this);
      factions[f].vp = (factions[f].vp_base + factions[f].vp_bonus + factions[f].vp_special);
    }

    //
    // calculate keys controlled
    //
    for (let f in factions) {
      factions[f].keys = this.returnNumberOfKeysControlledByFaction(f);
      if (f === "protestant") {
	factions[f].religious = this.returnNumberOfProtestantSpacesInLanguageZone();
      }
    }

    //
    // military victory
    //
    if (factions['hapsburg']) {
      if (factions['hapsburg'].keys >= this.game.state.autowin_hapsburg_keys_controlled) {
        factions['hapsburg'].victory = 1;
        factions['hapsburg'].details = "military victory";
      }
    }
    if (factions['ottoman']) {
      if (factions['ottoman'].keys >= this.game.state.autowin_ottoman_keys_controlled) {
        factions['ottoman'].victory = 1;
        factions['ottoman'].details = "military victory";
      }
    }
    if (factions['france']) {
      if (factions['france'].keys >= this.game.state.autowin_france_keys_controlled) {
        factions['france'].victory = 1;
        factions['france'].details = "military victory";
      }
    }
    if (factions['england']) {
      if (factions['england'].keys >= this.game.state.autowin_england_keys_controlled) {
        factions['england'].victory = 1;
        factions['england'].details = "military victory";
      }
    }
    if (factions['papacy']) {
      if (factions['papacy'].keys >= this.game.state.autowin_papacy_keys_controlled) {
        factions['papacy'].victory = 1;
        factions['papacy'].details = "military victory";
      }
    }

    //
    // religious victory
    //
    if (factions['protestant']) {
      if (factions['protestant'].religious >= 50) {
        factions['papacy'].victory = 1;
        factions['papacy'].details = "religious victory";
      }
    }

    //
    // PROCESS BONUS VP
    //
    // Copernicus (2 VP) or Michael Servetus (1 VP) event
    if (this.game.state.events.michael_servetus) {
      factions[this.game.state.events.michael_servetus].vp_special++;
      factions[this.game.state.events.michael_servetus].vp++;
    }
    if (this.game.state.events.copernicus) {
      factions[this.game.state.events.copernicus].vp_special += parseInt(this.game.state.events.copernicus_vp);
      factions[this.game.state.events.copernicus].vp += parseInt(this.game.state.events.copernicus_vp);
    }

    //
    // War Winner VP
    //
    factions["protestant"].vp += parseInt(this.game.state.protestant_war_winner_vp);
    factions["papacy"].vp     += parseInt(this.game.state.papacy_war_winner_vp);
    try {
      factions["ottoman"].vp    += parseInt(this.game.state.ottoman_war_winner_vp);
      factions["hapsburg"].vp   += parseInt(this.game.state.hapsburg_war_winner_vp);
      factions["england"].vp    += parseInt(this.game.state.england_war_winner_vp);
      factions["france"].vp     += parseInt(this.game.state.france_war_winner_vp);
    } catch (err) {}

    //
    // Master of Italy
    //
    factions["protestant"].vp += parseInt(this.game.state.master_of_italy["protestant"]);
    factions["papacy"].vp += parseInt(this.game.state.master_of_italy["papacy"]);
    try {
      factions["ottoman"].vp += parseInt(this.game.state.master_of_italy["ottoman"]);
      factions["hapsburg"].vp += parseInt(this.game.state.master_of_italy["hapsburg"]);
      factions["england"].vp += parseInt(this.game.state.master_of_italy["england"]);
      factions["france"].vp += parseInt(this.game.state.master_of_italy["france"]);
    } catch (err) {}

    //
    // New World
    //
    for (let key in this.game.state.newworld) {
      if (this.game.state.newworld[key].vp > 0) {
	if (this.game.state.newworld[key].faction) {	  
	  if (this.factions[this.game.state.newworld[key].faction]) {
	    factions[this.game.state.newworld[key].faction].vp += parseInt(this.game.state.newworld[key].vp);
	  }
	}
      }
    }

    //
    //• Bible translation completed (1 VP for each language)    ***
    // protestant faction class
    //• Protestant debater burned (1 per debate rating)         ***
    // protestant faction class
    //• Papal debater disgraced (1 per debate rating)           ***
    // protestant faction class

    //• JuliaGonzaga(1VP)followed by successful Ottoman piracy in Tyrrhenian Sea
    //• War Winner marker received during Peace Segment
    //• Master of Italy VP marker received during Action Phase


    //
    // domination victory (5 more vp than everyone else
    //
    let max_vp = 0;
    let runner_up_vp = 0;
    let lead_required = 5;
    let domination_round = 5;
    if (this.game.players.length == 2) { lead_required = 8; domination_round = 4; }

    let leaders = [];
    for (let key in factions) {
      if (factions[key].vp == max_vp) {
        leaders.push(key);
      }
      if (factions[key].vp > max_vp) {
	runner_up_vp = max_vp;
	max_vp = factions[key].vp;
	leaders = [];
        leaders.push(key);
      }
      if (factions[key].vp < max_vp && factions[key].vp > runner_up_vp) {
	runner_up_vp = factions[key].vp;
      }

    }
    if (max_vp >= (runner_up_vp+lead_required) && this.game.state.round >= domination_round && this.game.players.length > 2) {
      if (leaders.length == 1) {
        factions[leaders[0]].victory = 1;
	factions[leaders[0]].reason = "Domination Victory";
      }
    }

    //
    // final victory if round 9
    //
    if (this.game.state.round >= 9) {
      for (let i = 0; i < leaders.length; i++) {
	factions[leaders[0]].victory = 1;
	factions[leaders[0]].reason = "Final Victory";
      }
    }

    //
    // 8 VP lead in 2P
    //
if (this.game.state.scenario != "is_testing") {
    if (this.game.players.length == 2 && this.game.state.round >= 4) {
      if ((factions["protestant"].vp - factions["papacy"].vp) >= 8) {
	factions["protestant"].victory = 1;
	factions["protestant"].reason = "Commanding 8 VP Lead";
      }
      if ((factions["papacy"].vp - factions["protestant"].vp) >= 8) {
	factions["papacy"].victory = 1;
	factions["papacy"].reason = "Commanding 8 VP Lead";
      }
    }
}

    //
    // tied at 25 VP or higher
    //
    let highest_vp = 0;
    let fs = [];
    if (this.game.state.round > 0) {
      while (this.game.state.vp.length < this.game.state.round) { this.game.state.vp.push({}); }
      for (let key in factions) {
        if (factions[key].vp == highest_vp) {
 	  fs.push(key);
        }
        if (factions[key].vp > highest_vp) {
	  fs = [];
	  fs.push(key);
  	  highest_vp = factions[key].vp;
        }
        this.game.state.vp[this.game.state.round-1][key] = factions[key].vp;
      }
      if (fs.length == 1 && highest_vp >= 25) {
        factions[fs[0]].victory = 1;
        factions[fs[0]].reason = "Standard Victory"; 
      }
      //
      // historical resolution -
      //
      if (fs.length > 1 && highest_vp >= 25) {
        for (let z = 0; z < fs.length; z++) {
          factions[fs[z]].victory = 1;
          factions[fs[z]].reason = "Score Tied";
        }
      }
    }

    return factions;

  }


  //
  // faction is papacy or (anything), since debaters aren't really owned by factions outside
  // papcy and protestants, even if they are tagged as would be historically appropriate
  //
  returnDebatersInLanguageZone(language_zone="german", faction="papacy", committed=-1) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].language_zone === language_zone || this.game.state.debaters[i].language_zone === "any") {
        if (this.game.state.debaters[i].faction === faction || (faction != "papacy" && this.game.state.debaters[i].faction != "papacy")) {
          if (this.game.state.debaters[i].committed === committed || committed == -1) {
	    num++;
          }
        }
      }
    }
    return num;
  }


  canProtestantsReformInLanguageZone(lang="german") {
    let access_spots = [];
    let zone_has_catholic_spaces = false;
    let zone_has_protestant_spaces = false;
    if (lang == "german") { access_spots = ["amsterdam","liege","metz","becanson","geneva","trent","trieste","agram","pressburg","brunn","prague","breslau","antwerp","calais","london","norwich","berwick","edinburgh"]; }
    if (lang == "italian") { access_spots = ["innsbruck","graz","geneva","grenoble","nice","agram","zara","bastia","ragusa","scutari","durazzo","corfu","nice"]; }
    if (lang == "spanish") { access_spots = ["bordeaux","toulouse","avignon","marseille","nice","bastia","palma","cagliari","tunis","algiers","oran","nantes","brest"]; }
    if (lang == "english") { access_spots = ["brest","rouen","boulogne","calais","antwerp","amsterdam","bremen","hamburg"]; }
    if (lang == "french") { access_spots = ["plymouth","portsmouth","london","calais","antwerp","cologne","trier","strasburg","basel","turin","genoa","bastia","palma","valencia","barcelona","navarre","corunna"]; }

    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion == "protestant") {
        if (this.game.spaces[key].language == lang) { zone_has_protestant_spaces = true; }
	if (access_spots.includes(key)) { return 1; }
      } else {
        if (this.game.spaces[key].language == lang) { zone_has_catholic_spaces = true; }
      }
    }

    if (zone_has_protestant_spaces == true && zone_has_catholic_spaces == true) { return 1; }

    //
    // add access to any space with a reformer
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].language == lang) {
        for (let z = 0; z < this.game.spaces[key].units["protestant"].length; z++) {
	  let u = this.game.spaces[key].units["protestant"][z];
	  if (u.reformer == true) {
	    return 1;
	  }
	}
      }
    }

    return 0;
  }

  returnDiplomacyImpulseOrder(faction="") {
    if (faction == "ottoman") {
      return ["hapsburg","england","france","papacy","protestant"];
    }
    if (faction == "hapsburg") {
      return ["england","france","papacy","protestant"];
    }
    if (faction == "england") {
      return ["france","papacy","protestant"];
    }
    if (faction == "france") {
      return ["papacy","protestant"];
    }
    if (faction == "papacy") {
      return ["protestant"];
    }
    return [];
  }

  returnImpulseOrder() {
    return ["ottoman","hapsburg","england","france","papacy","protestant"];
  }

  returnNumberOfUncommittedDebaters(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].owner === faction && this.game.state.debaters[i].committed == 0) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfCommittedDebaters(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].owner === faction && this.game.state.debaters[i].committed == 1) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfUncommittedExplorers(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].owner === faction && this.game.state.explorers[i].committed == 0) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfCommittedExplorers(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].owner === faction && this.game.state.explorers[i].committed == 1) {
	num++;
      }
    }
    return num;
  }

  /////////////////////
  // Core Game State //
  /////////////////////
  returnState() {

    let state = {};

    state.skip_counter_or_acknowledge = 0; // don't skip

    state.scenario = "1517";
    if (this.game.options.scenario) { state.scenario = this.game.options.scenario; }
    state.round = 0;
    state.starting_round = 0; // if we start > 1, set this
    state.vp = [];
    state.newworld = this.returnNewWorld();
    state.impulse = 0;
    state.players = [];
    state.events = {};
    state.removed = []; // removed cards
    state.spaces_assaulted_this_turn = [];
    state.board_updated = new Date().getTime();
    state.board = {}; // units on board
    state.protestant_cards_evented = [];
    state.cards_evented = [];

    state.foreign_wars_fought_this_impulse = [];

    state.assaulted_this_impulse = 0;
    state.alliances = this.returnDiplomacyAlliance();
    state.diplomacy = [];

    // whose turn is it? (attacker)
    state.active_player = -1;

    // which ones are activated
    state.minor_activated_powers = [];

    state.naval_leaders_lost_at_sea = [];

    state.debater_committed_this_impulse = {};

    state.cards_left = {};
    state.rejected_pre_battle_fortification = [];

    state.master_of_italy = {};
    state.master_of_italy['ottoman'] = 0;
    state.master_of_italy['hapsburg'] = 0;
    state.master_of_italy['england'] = 0;
    state.master_of_italy['france'] = 0;
    state.master_of_italy['papacy'] = 0;
    state.master_of_italy['protestant'] = 0;

    state.activated_powers = {};
    state.activated_powers['ottoman'] = [];
    state.activated_powers['hapsburg'] = [];
    state.activated_powers['france'] = [];
    state.activated_powers['england'] = [];
    state.activated_powers['papacy'] = [];
    state.activated_powers['protestant'] = [];
    // following for safety
    state.activated_powers['venice'] = [];
    state.activated_powers['scotland'] = [];
    state.activated_powers['genoa'] = [];
    state.activated_powers['hungary'] = [];
    state.activated_powers['independent'] = [];

    state.events.potosi_silver_mines = "";

    state.translations = {};
    state.translations['new'] = {};
    state.translations['new']['german'] = 0;
    state.translations['new']['french'] = 0;
    state.translations['new']['english'] = 0;
    state.translations['full'] = {};
    state.translations['full']['german'] = 0;
    state.translations['full']['french'] = 0;
    state.translations['full']['english'] = 0;

    state.papacy_card_bonus = 0;
    state.protestant_card_bonus = 0;
    state.ottoman_card_bonus = 0;
    state.france_card_bonus = 0;
    state.england_card_bonus = 0;
    state.hapsburg_card_bonus = 0;

    state.ships_destroyed = {};
    state.ships_destroyed['ottoman'] = 0;
    state.ships_destroyed['hapsburg'] = 0;
    state.ships_destroyed['england'] = 0;
    state.ships_destroyed['france'] = 0;
    state.ships_destroyed['papacy'] = 0;
    state.ships_destroyed['protestant'] = 0;
    state.ships_destroyed['scotland'] = 0;
    state.ships_destroyed['venice'] = 0;
    state.ships_destroyed['hungary'] = 0;
    state.ships_destroyed['genoa'] = 0;

    state.protestant_war_winner_vp = 0;
    state.papacy_war_winner_vp = 0;
    state.ottoman_war_winner_vp = 0;
    state.hapsburg_war_winner_vp = 0;
    state.england_war_winner_vp = 0;
    state.france_war_winner_vp = 0;

    state.bonus_vp = {};
    state.bonus_vp['protestant'] = 0;
    state.bonus_vp['papacy'] = 0;
    state.bonus_vp['england'] = 0;
    state.bonus_vp['france'] = 0;
    state.bonus_vp['hapsburg'] = 0;
    state.bonus_vp['ottoman'] = 0;

    state.cards_issued = {};
    state.cards_issued['ottoman'] = 0;
    state.cards_issued['hapsburg'] = 0;
    state.cards_issued['england'] = 0;
    state.cards_issued['france'] = 0;
    state.cards_issued['papacy'] = 0;
    state.cards_issued['protestant'] = 0;

    state.saint_peters_cathedral = {};
    state.saint_peters_cathedral['state'] = 0;
    state.saint_peters_cathedral['vp'] = 0;    

    state.papal_debaters_disgraced_vp = 0;
    state.protestant_debaters_burned_vp = 0;

    state.events.michael_servetus = "";  // faction that gets VP
    state.events.copernicus = "";        // faction that gets VP
    state.events.copernicus_vp = 0;     // 1 or 2 VP
    state.events.scots_raid = 0;	// 1 if active, limits French activities
    state.events.cromwell = 0;		// 1 if England publishes for 2 CP

    state.french_chateaux_vp = 0;

    state.tmp_reformations_this_turn = [];
    state.tmp_counter_reformations_this_turn = [];
    state.tmp_protestant_reformation_modifier = 0;
    state.tmp_protestant_reformation_bonus = 0;
    state.tmp_protestant_reformation_bonus_spaces = [];
    state.tmp_catholic_reformation_modifier = 0;
    state.tmp_catholic_reformation_bonus = 0;
    state.tmp_catholic_reformation_bonus_spaces = [];

    state.tmp_protestant_counter_reformation_modifier = 0;
    state.tmp_protestant_counter_reformation_bonus = 0;
    state.tmp_protestant_counter_reformation_bonus_spaces = [];
    state.tmp_catholic_counter_reformation_modifier = 0;
    state.tmp_catholic_counter_reformation_bonus = 0;
    state.tmp_catholic_counter_reformation_bonus_spaces = [];
    state.tmp_papacy_may_specify_debater = 0;
    state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    state.tmp_bonus_protestant_translation_german_zone = 0;
    state.tmp_bonus_protestant_translation_french_zone = 0;
    state.tmp_bonus_protestant_translation_english_zone = 0;
    state.tmp_bonus_papacy_burn_books = 0;

    state.events.mercators_map = "";
    state.events.england_changed_rulers_this_turn = 0;
    state.events.colonial_governor = "";

    state.raiders = {};
    state.raiders['protestant'] = 0;
    state.raiders['papacy'] = 0;
    state.raiders['france'] = 0;
    state.raiders['england'] = 0;
    state.raiders['ottoman'] = 0;
    state.raiders['hapsburg'] = 0;
    state.plantations = {};
    state.plantations['protestant'] = 0;
    state.plantations['papacy'] = 0;
    state.plantations['france'] = 0;
    state.plantations['england'] = 0;
    state.plantations['ottoman'] = 0;
    state.plantations['hapsburg'] = 0;

    // bonus cards
    state.new_world_bonus = {};
    state.new_world_bonus['england'] = 0;
    state.new_world_bonus['france'] = 0;
    state.new_world_bonus['hapsburg'] = 0;
    state.new_world_bonus['protestant'] = 0;
    state.new_world_bonus['ottoman'] = 0;
    state.new_world_bonus['papacy'] = 0;

    state.may_explore = {};
    state.may_explore['england'] = 1;
    state.may_explore['france'] = 1;
    state.may_explore['hapsburg'] = 1;
    state.may_explore['protestant'] = 0;
    state.may_explore['papacy'] = 0;
    state.may_explore['ottoman'] = 0;
    state.may_conquer = {};
    state.may_conquer['england'] = 1;
    state.may_conquer['france'] = 1;
    state.may_conquer['hapsburg'] = 1;
    state.may_conquer['protestant'] = 0;
    state.may_conquer['papacy'] = 0;
    state.may_conquer['ottoman'] = 0;
    state.may_colonize = {};
    state.may_colonize['england'] = 1;
    state.may_colonize['france'] = 1;
    state.may_colonize['hapsburg'] = 1;
    state.may_colonize['protestant'] = 0;
    state.may_colonize['papacy'] = 0;
    state.france_uncharted = 1;
    state.hapsburg_uncharted = 1;
    state.england_uncharted = 1;

    state.skip_next_impulse = [];

    //
    // foreign wars
    //
    state.events.war_in_persia = 0;
    state.events.revolt_in_ireland = 0;
    state.events.revolt_in_egypt = 0;

    state.augsburg_electoral_bonus = 0;
    state.mainz_electoral_bonus = 0;
    state.trier_electoral_bonus = 0;
    state.cologne_electoral_bonus = 0;
    state.wittenberg_electoral_bonus = 0;
    state.brandenburg_electoral_bonus = 0;

    state.galleons = {};
    state.galleons['france'] = 0;
    state.galleons['hapsburg'] = 0;
    state.galleons['england'] = 0;

    state.autowin_hapsburg_keys_controlled = 14;
    state.autowin_ottoman_keys_controlled = 11;
    state.autowin_papacy_keys_controlled = 7;
    state.autowin_france_keys_controlled = 11;
    state.autowin_england_keys_controlled = 9;

    state.military_leaders_removed_until_next_round = [];
    state.excommunicated_factions = {};
    state.already_excommunicated = [];
    state.excommunicated = [];
    state.burned = [];
    state.debaters = [];
    state.explorers = [];
    state.conquistadors = [];

    state.leaders = {};
    state.leaders.francis_i = 1;
    state.leaders.henry_viii = 1;
    state.leaders.charles_v = 1;
    state.leaders.suleiman = 1;
    state.leaders.leo_x = 1;
    state.leaders.luther = 1
    state.leaders.clement_vii = 0;
    state.leaders.paul_iii = 0;
    state.leaders.edward_vi = 0;
    state.leaders.henry_ii = 0;
    state.leaders.mary_i = 0;
    state.leaders.julius_iii = 0;
    state.leaders.elizabeth_i = 0;
    state.leaders.calvin = 0;

    state.spring_deploy_across_seas = [];
    state.spring_deploy_across_passes = [];

    state.henry_viii_marital_status = 0;
    state.henry_viii_healthy_edward = 0;
    state.henry_viii_sickly_edward = 0;
    state.henry_viii_add_elizabeth = 0;
    state.henry_viii_auto_reroll = 0;
    state.henry_viii_rolls = [];
    state.henry_viii_wives = [];
    state.henry_viii_pope_approves_divorce = 0;
    state.henry_viii_pope_approves_divorce_round = 0;

    state.knights_of_st_john = "";

    state.events.maurice_of_saxony = "";
    state.events.papacy_may_found_jesuit_universities = 0;
    state.events.edward_vi_born = 0;
    state.events.wartburg = 0;

    // mandatory events
    state.events.schmalkaldic_league = 0;
    state.events.clement_vii = 0;
    state.events.barbary_pirates = 0;
    state.events.paul_iii = 0;
    state.events.society_of_jesus = 0;

    state.events.diplomatic_alliance_triggers_hapsburg_hungary_alliance = 0;
    state.events.defeat_of_hungary_bohemia = 0;

    state.events.ottoman_piracy_enabled = 0;
    state.events.ottoman_corsairs_enabled = 0;
    state.events.ottoman_piracy_attempts = 0;
    state.events.ottoman_piracy_seazones = [];
    state.events.ottoman_piracy_vp = 0;

    //
    // {
    //    faction : faction
    //    round   : 0
    //  
    state.colonies = [];
    state.conquests = [];
    state.explorations = [];

    state.events.smallpox = "";
    state.events.cabot_england = 0;
    state.events.cabot_france = 0;
    state.events.cabot_hapsburg = 0;
    state.events.ottoman_julia_gonzaga_vp = 0;

    return state;

  }

  unexcommunicateFaction(faction="") {
    this.game.state.excommunicated_factions[faction] = 0;
    return;
  }

  excommunicateFaction(faction="") {
    this.game.state.already_excommunicated.push(faction);
    this.game.state.excommunicated_factions[faction] = 1;
    return;
  }


  returnJustificationForExcommunication(faction) {
    if (this.areEnemies(faction, "papacy")) { return "Wickedness against Saint Peter's Church and the Kingdom of Heaven"; }
    if (this.areAllies(faction, "ottoman")) { return "Providing Succor to the Enemies of Christendom"; }
    if (faction == "england") {
      if (this.game.state.leaders.henry_viii == 1) {
	for (let key in this.game.spaces) {
	  if (this.game.spaces[key].home == "england") {
	    if (this.game.spaces[key].religion == "protestant") { return "Tacit Support for the Protestant Sect in England"; }
	  }
	}
      }
    }
    return "";
  }


  canPapacyExcommunicateFaction(faction) {
    if (this.game.state.already_excommunicated.includes(faction)) { return 0; }
    if (this.areEnemies(faction, "papacy")) { return 1; }
    if (this.areAllies(faction, "ottoman")) { return 1; }
    if (faction == "england") {
      if (this.game.state.leaders.henry_viii == 1) {
	for (let key in this.game.spaces) {
	  if (this.game.spaces[key].home == "england") {
	    if (this.game.spaces[key].religion == "protestant") { return 1; }
	  }
	}
      }
    }
    return 0;
  }

  excommunicateReformer(reformer="") {

    this.game.state.already_excommunicated.push(reformer);
    if (reformer == "") { return; }
    if (this.returnSpaceOfPersonage("protestant", reformer) == "") { return; }

    //
    // debater
    //
    let debater = reformer.replace("-reformer", "-debater");
    let faction = "protestant";
    let s = this.returnSpaceOfPersonage("protestant", reformer);
    let idx = -1;

    if (s === "") { faction = "england"; s = this.returnSpaceOfPersonage("england", reformer); }
    if (s === "") { faction = "france"; s = this.returnSpaceOfPersonage("france", reformer); }

    if (s !== "") {
      idx = this.returnIndexOfPersonageInSpace(faction, reformer, s);
    }

    let obj = {};
    obj.space = s;
    obj.faction = faction;
    obj.idx = idx;
    obj.reformer = this.game.spaces[s].units[faction][idx];

    //
    // remove reformer
    //
    if (idx != -1) {
      this.game.spaces[s].units[faction].splice(idx, 1);
    }

    //
    // remove debater
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key === debater) {
        // and commit the debater too !
        this.game.state.debaters[i].committed = 1;
        obj.debater = this.game.state.debaters[i];
        obj.debater.committed = 1;
        this.game.state.debaters.splice(i, 1);
      }
    }

    //
    // add to excommunicated list
    //
    this.game.state.excommunicated.push(obj);

    return;

  }

  restoreDebaters() {

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      this.game.state.debaters[i].committed = 0;
    }

  }

  restoreReformers() {

    for (let i = 0; i < this.game.state.excommunicated.length; i++) {
      let obj = this.game.state.excommunicated[i];
      if (obj.reformer) {

        let reformer = obj.reformer;
        let debater = obj.debater;
	let s = obj.space;
        let faction = obj.faction;

	if (reformer) {
	  if (s) {
	    if (faction) {
	      this.game.spaces[s].units[faction].push(reformer);
	    }
	  }
	}

	if (obj.debater) {
	  // debater uncommitted for restoration
	  obj.debater.committed = 0;
          this.game.state.debaters.push(obj.debater);
	}


	this.game.state.excommunicated.splice(i, 1);
	i--;

        this.displaySpace(s);

      }
    }

  }

  //
  // military leader returned to original space or capital (if controlled)
  //
  restoreMilitaryLeaders() {

    for (let i = 0; i < this.game.state.military_leaders_removed_until_next_round.length; i++) {
      let obj = this.game.state.military_leaders_removed_until_next_round[i];
      if (obj.leader) {
        let leader = obj.leader;
	let s = obj.space;
        let faction = obj.faction;

	//	
	// only return to original space if controlled
	//
	let fcs = this.returnFactionControllingSpace(s);

	if (this.returnControllingPower(fcs) == this.returnControllingPower(faction) || this.areAllies(faction, fcs)) {
	} else {
	  let capitals = this.returnCapitals(faction);
	  for (let z = 0; z < capitals.length; z++) {
	    if (this.returnFactionControllingSpace(capitals[0]) == faction) {
	      s = capitals[z];
	    }
	  }
	}

	this.restoreMilitaryLeader(leader, s, faction);

      }
    }

    this.game.state.military_leaders_removed_until_next_round = [];

  }

  restoreMilitaryLeader(leader, spacekey, faction) {

	let s = spacekey;
	let navalspace = false;

        if (faction == "ottoman") {
	  if (leader.navy_leader == true) {
            if (this.isSpaceControlled("algiers", "ottoman")) { s = "algiers"; } else {
              if (this.isSpaceControlled("oran", "ottoman")) { s = "oran"; } else {
                if (this.isSpaceControlled("oran", "ottoman")) { s = "tripoli"; };
              }
            }
          }
        }

	if (leader) {
	  if (faction) {

	    if (s == "") {
	      let capitals = this.returnCapitals(faction);
              for (let z = 0; z < capitals.length; z++) {
                if (this.isSpaceControlled(capitals[z], faction)) {
	          s = capitals[z];
	          z = capitals.length += 2;
	        }
	      }
	    }

	    if (s != "") {
	      leader.spacekey = s;
	      this.game.spaces[s].units[faction].push(leader);
	      this.displaySpace(s);
	    }
	  }
	}

  }

  returnPregnancyChart() {

    let chart = {};

    chart['1'] = {
      top : 1270,
      left : 4075,
    }

    chart['2'] = {
      top : 1185,
      left : 4075,
    }

    chart['3'] = {
      top : 1100,
      left : 4075,
    }

    chart['4'] = {
      top : 1015,
      left : 4075,
    }

    chart['5'] = {
      top : 930,
      left : 4075,
    }

    chart['6'] = {
      top : 810,
      left : 4075,
    }

    return chart;

  }

  returnColonies() {

    let colonies = {};

    colonies['1'] = {
      top : 1007,
      left : 55
    }
    colonies['2'] = {
      top : 1120,
      left : 55
    }
    colonies['3'] = {
      top : 1232,
      left : 55
    }
    colonies['4'] = {
      top : 1344,
      left : 55
    }
    colonies['5'] = {
      top : 1456,
      left : 55
    }
    colonies['6'] = {
      top : 1530,
      left : 55
    }
    colonies['7'] = {
      top : 1680,
      left : 55
    }

    return colonies;

  }


  returnNewWorld() {

    let nw = {};

    nw.results = {};
    nw.results.colonies = [];
    nw.results.explorations = [];
    nw.results.conquests = [];

    nw['england_colony1'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/Roanoke.svg' ,
    }
    nw['england_colony2'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/Jamestown.svg' ,
    }
    nw['france_colony1'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/Charlesbourg.svg' ,
    }
    nw['france_colony2'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/Montreal.svg' ,
    }
    nw['hapsburg_colony1'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/PuertoRico.svg' ,
    }
    nw['hapsburg_colony2'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/Cuba.svg' ,
    }
    nw['hapsburg_colony3'] = {
      type : "colony" ,
      img : '/his/img/tiles/colonies/Hispaniola.svg' ,
    }
    nw['england_conquest1'] = {
      type : "conquest" ,
    }
    nw['england_conquest2'] = {
      type : "conquest" ,
    }
    nw['france_conquest1'] = {
      type : "conquest" ,
    }
    nw['france_conquest2'] = {
      top : 1340 ,
    }
    nw['hapsburg_conquest1'] = {
      type : "conquest" ,
    }
    nw['hapsburg_conquest2'] = {
      type : "conquest" ,
    }
    nw['hapsburg_conquest3'] = {
      type : "conquest" ,
    }
    nw['greatlakes'] = {
      img : "/his/img/vp/GreatLakes1VP.svg",
      type : "discovery" ,
      name : "Great Lakes" ,
      vp : 1
    }
    nw['stlawrence'] = {
      img : "/his/img/vp/StLawrenceRiver1VP.svg",
      type : "discovery" ,
      name : "St. Lawrence River" ,
      vp : 1
    }
    nw['mississippi'] = {
      img : "/his/img/vp/MississippiRiver1VP.svg",
      type : "discovery" ,
      name : "Mississippi" ,
      vp : 1
    }
    nw['aztec'] = {
      img : "/his/img/vp/Aztecs2VP.svg",
      type : "discovery" ,
      name : "Aztec" ,
      vp : 2
    }
    nw['maya'] = {
      img : "/his/img/vp/Maya1VP.svg",
      type : "discovery" ,
      name : "Maya" ,
      vp : 1
    }
    nw['amazon'] = {
      img : "/his/img/vp/AmazonRiver2VP.svg",
      type : "discovery" ,
      name : "Amazon River" ,
      vp : 2
    }
    nw['inca'] = {
      img : "/his/img/vp/Inca2VP.svg",
      type : "discovery" ,
      name : "Inca" ,
      vp : 2
    }
    nw['circumnavigation'] = {
      img : "/his/img/vp/Circumnavigation3VP.svg",
      type : "discovery" ,
      name : "Circumnavigation" ,
      vp : 3
    }
    nw['pacificstrait'] = {
      img : "/his/img/vp/PacificStraight1VP.svg",
      type : "discovery" ,
      name : "Pacific Strait" ,
      vp : 1
    }

    return nw;

  }


  returnConquest() {

    let conquest = {};

    conquest['1'] = {
      top : 1007,
      left : 178
    }
    conquest['2'] = {
      top : 1120,
      left : 178
    }
    conquest['3'] = {
      top : 1232,
      left : 178
    }
    conquest['4'] = {
      top : 1344,
      left : 178
    }
    conquest['5'] = {
      top : 1456,
      left : 178
    }
    conquest['6'] = {
      top : 1530,
      left : 178
    }
    conquest['7'] = {
      top : 1680,
      left : 178
    }

    return conquest;

  }

  returnVictoryPointTrack() {

    let track = {};

    track['0'] = {
      top : 2912,
      left : 2025
    }
    track['1'] = {
      top : 2912,
      left : 2138
    }
    track['2'] = {
      top : 2912,
      left : 2252
    }
    track['3'] = {
      top : 2912,
      left : 2366
    }
    track['4'] = {
      top : 2912,
      left : 2480
    }
    track['5'] = {
      top : 2912,
      left : 2594
    }
    track['6'] = {
      top : 2912,
      left : 2708
    }
    track['7'] = {
      top : 2912,
      left : 2822
    }
    track['8'] = {
      top : 2912,
      left : 2936
    }
    track['9'] = {
      top : 2912,
      left : 3050
    }
    track['10'] = {
      top : 3026,
      left : 884
    }
    track['11'] = {
      top : 3026,
      left : 998
    }
    track['12'] = {
      top : 3026,
      left : 1112
    }
    track['13'] = {
      top : 3026,
      left: 1226,
    }
    track['14'] = {
      top : 3026,
      left : 1340
    }
    track['15'] = {
      top : 3026,
      left : 1454
    }
    track['16'] = {
      top : 3026,
      left : 1569
    }
    track['17'] = {
      top : 3026,
      left : 1682
    }
    track['18'] = {
      top : 3026,
      left : 1796
    }
    track['19'] = {
      top : 3026,
      left : 1910
    }
    track['20'] = {
      top : 3026,
      left : 2024
    }
    track['21'] = {
      top : 3026,
      left : 2138
    }
    track['22'] = {
      top : 3026,
      left : 2252
    }
    track['23'] = {
      top : 3026,
      left : 2366
    }
    track['24'] = {
      top : 3026,
      left : 2480
    }
    track['25'] = {
      top : 3026,
      left : 2594
    }
    track['26'] = {
      top : 3026,
      left : 2708
    }
    track['27'] = {
      top : 3026,
      left : 2822
    }
    track['28'] = {
      top : 3026,
      left : 2936
    }
    track['29'] = {
      top : 3026,
      left : 3050
    }

    return track;
  }


  returnElectorateDisplay() {

    let electorates = {};

    electorates['augsburg'] = {
      top: 190,
      left: 3380,
    }
    electorates['trier'] = {
      top: 190,
      left: 3510,
    }
    electorates['cologne'] = {
      top: 190,
      left: 3642,
    }
    electorates['wittenberg'] = {
      top: 376,
      left: 3380,
    }
    electorates['mainz'] = {
      top: 376,
      left: 3510,
    }
    electorates['brandenburg'] = {
      top: 376,
      left: 3642,
    }

    return electorates;

  }


  returnDiplomacyAlliance() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["england"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["france"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["papacy"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["protestant"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["hapsburg"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["venice"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["genoa"] 		= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["hungary"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["scotland"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
    };

    return diplomacy;
  }

  returnDiplomacyTable() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {};
    diplomacy["england"] 	= {};
    diplomacy["france"] 	= {};
    diplomacy["papacy"] 	= {};
    diplomacy["protestant"] 	= {};
    diplomacy["hapsburg"] 	= {};

    diplomacy["ottoman"]["hapsburg"] = {
        top 	:	170 ,
        left	:	4128 ,
    }
    diplomacy["hapsburg"]["ottoman"] = {
        top 	:	170 ,
        left	:	4128 ,
    }
    diplomacy["ottoman"]["england"] = {
        top 	:	170 ,
        left	:	4222 ,
    }
    diplomacy["england"]["ottoman"] = {
        top 	:	170 ,
        left	:	4222 ,
    }
    diplomacy["ottoman"]["france"] = {
        top 	:       170 ,
        left	:	4310 ,
    }
    diplomacy["france"]["ottoman"] = {
        top 	:       170 ,
        left	:	4310 ,
    }
    diplomacy["ottoman"]["papacy"] = {
        top 	:	170 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["ottoman"] = {
        top 	:	170 ,
        left	:	4400 ,
    }
    diplomacy["ottoman"]["protestant"] = {
        top 	:	170 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["ottoman"] = {
        top 	:	170 ,
        left	:	4490 ,
    }
    diplomacy["ottoman"]["genoa"] = {
        top 	:	170 ,
        left	:	4580 ,
    }
    diplomacy["ottoman"]["hungary"] = {
        top 	:	170 ,
        left	:	4670 ,
    }
    diplomacy["ottoman"]["scotland"] = {
        top 	:	170 ,
        left	:	4760 ,
    }
    diplomacy["ottoman"]["venice"] = {
        top 	:	170 ,
        left	:	4851 ,
    }

    diplomacy["hapsburg"]["england"] = {
        top 	:	260 ,
        left	:	4220 ,
    }
    diplomacy["england"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4220 ,
    }
    diplomacy["hapsburg"]["france"] = {
        top 	:	260 ,
        left	:	4310 ,
    }
    diplomacy["france"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4310 ,
    }
    diplomacy["hapsburg"]["papacy"] = {
        top 	:	260 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4400 ,
    }
    diplomacy["hapsburg"]["protestant"] = {
        top 	:	260 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4490 ,
    }
    diplomacy["hapsburg"]["genoa"] = {
        top 	:	260 ,
        left	:	4580 ,
    }
    diplomacy["hapsburg"]["hungary"] = {
        top 	:	260 ,
        left	:	4670 ,
    }
    diplomacy["hapsburg"]["scotland"] = {
        top 	:	260 ,
        left	:	4760 ,
    }
    diplomacy["hapsburg"]["venice"] = {
        top 	:	260 ,
        left	:	4851 ,
    }


    diplomacy["england"]["france"] = {
        top 	:	350 ,
        left	:	4310 ,
    }
    diplomacy["france"]["england"] = {
        top 	:	350 ,
        left	:	4310 ,
    }
    diplomacy["england"]["papacy"] = {
        top 	:	350 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["england"] = {
        top 	:	350 ,
        left	:	4400 ,
    }
    diplomacy["england"]["protestant"] = {
        top 	:	350 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["england"] = {
        top 	:	350 ,
        left	:	4490 ,
    }
    diplomacy["england"]["genoa"] = {
        top 	:	350 ,
        left	:	4580 ,
    }
    diplomacy["england"]["hungary"] = {
        top 	:	350 ,
        left	:	4670 ,
    }
    diplomacy["england"]["scotland"] = {
        top 	:	350 ,
        left	:	4760 ,
    }
    diplomacy["england"]["venice"] = {
        top 	:	350 ,
        left	:	4851 ,
    }

    diplomacy["france"]["papacy"] = {
        top     :       440 ,
        left    :       4400 ,    
    }
    diplomacy["papacy"]["france"] = {
        top     :       440 ,
        left    :       4400 ,    
    }
    diplomacy["france"]["protestant"] = {
        top     :       440 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["france"] = {
        top     :       440 ,
        left    :       4490 ,    
    }
    diplomacy["france"]["genoa"] = {
        top     :       440 ,
        left    :       4580 ,    
    }
    diplomacy["france"]["hungary"] = {
        top     :       440 ,
        left    :       4670 ,    
    }
    diplomacy["france"]["scotland"] = {
        top     :       440 ,
        left    :       4760 ,    
    }
    diplomacy["france"]["venice"] = {
        top     :       440 ,
        left    :       4851 ,    
    }


    diplomacy["papacy"]["protestant"] = {
        top     :       530 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["papacy"] = {
        top     :       530 ,
        left    :       4490 ,    
    }
    diplomacy["papacy"]["genoa"] = {
        top     :       530 ,
        left    :       4580 ,    
    }
    diplomacy["papacy"]["hungary"] = {
        top     :       530 ,
        left    :       4670 ,    
    }
    diplomacy["papacy"]["scotland"] = {
        top     :       530 ,
        left    :       4760 ,    
    }
    diplomacy["papacy"]["venice"] = {
        top     :       530 ,
        left    :       4851 ,    
    }

    diplomacy["protestant"]["genoa"] = {
        top     :       620 ,
        left    :       4580 ,    
    }
    diplomacy["protestant"]["hungary"] = {
        top     :       620 ,
        left    :       4670 ,    
    }
    diplomacy["protestant"]["scotland"] = {
        top     :       620 ,
        left    :       4760 ,    
    }
    diplomacy["protestant"]["venice"] = {
        top     :       530 ,
        left    :       4851 ,    
    }

    return diplomacy;

  }



  triggerDefeatOfHungaryBohemia() {

    if (this.areAllies("hapsburg", "hungary")) { return false; }
    if (this.game.state.events.defeat_of_hungary_bohemia == 1) { return false; }

    let does_this_trigger_the_defeat_of_hungary_bohemia = false;

    //
    // Hungary-Bohemia has been activated as a Hapsburg ally through Diplomatic Marriage 
    // and the Ottomans control two home keys of Hungary-Bohemia
    //
    let ottoman_controlled_hungarian_home_spaces = 0;
    let hungarian_regulars_remaining_on_map = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].home == "hungary") {
        ottoman_controlled_hungarian_home_spaces++;
      }
      for (let z = 0; z < this.game.spaces[key].units["hungary"].length; z++) {
	if (this.game.spaces[key].units["hungary"][z].type === "regular") {
	  hungarian_regulars_remaining_on_map++;
	}
      }
    }

    if (this.game.state.events.diplomatic_alliance_triggers_hapsburg_hungary_alliance == 1 && ottoman_controlled_hungarian_home_spaces >= 2) { 
      does_this_trigger_the_defeat_of_hungary_bohemia = true;
    }

    if (hungarian_regulars_remaining_on_map < 5 && ottoman_controlled_hungarian_home_spaces >= 1) {
      does_this_trigger_the_defeat_of_hungary_bohemia = true;
    }

    if (does_this_trigger_the_defeat_of_hungary_bohemia) {

      this.game.state.events.defeat_of_hungary_bohemia = 1;

      //
      // best friends forever
      //
      if (!this.areAllies("hapsburg", "hungary")) {
        this.setAllies("hapsburg", "hungary");
      }

      //
      // natural ally intervention
      //
      if (this.areAllies("hapsburg", "ottoman")) {
	this.unsetAllies("hapsburg", "ottoman");
      }
      this.setEnemies("hapsburg", "ottoman");


      //
      // turks get control of more spaces
      //
      for (let key in this.game.spaces) {
        if (this.game.spaces[key].home == "hungary") {
	  // ottoman gets the spaces, but not the keys
	  if (this.game.spaces[key].units["ottoman"].length > 0 && this.game.spaces[key].type != "key") {
	    this.game.spaces[key].units["hungary"] = [];
	    this.controlSpace("ottoman", key);
	  }
	}
      }

      //
      // Ottomans points for winning war
      //
      this.updateLog("Hungary-Bohemia are defeated, pulling the Hapsburgs into war with the Ottoman Empire");
      this.game.state.ottoman_war_winner_vp += 2;
      this.displayWarBox();
      this.displayVictoryTrack();

      //
      // add war
      //
      for (let z = this.game.queue.length-1; z >= 0; z--) {
	let lmv = this.game.queue[z].split("\t");
	if (lmv[0] === "cards_left" || lmv[0] == "continue" || lmv[0] == "play" || lmv[0] == "action_phase" || lmv[0] == "discard") {
	  this.game.queue.splice(z, 0, `unexpected_war\thapsburg\tottoman`);
	  z = 0;
	  break;
	}
      }

      // let's notify the player visually
      this.game.queue.push("ACKNOWLEDGE\tThe Hapsburgs are pulled into the War in Hungary");
      this.game.queue.push("display_custom_overlay\tbattle-of-mohacs");

    }
  }

