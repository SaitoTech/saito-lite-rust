
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
      if (p.captured.includes(unittype)) { return 1; }
    }
    return 0;
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



  captureLeader(winning_faction, losing_faction, space, unit) {
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let p = this.returnPlayerOfFaction(winning_faction);
    let unitjson = JSON.stringify(unit);
    for (let z = 0; z < p.captured.length; z++) {
      if (JSON.stringify(p.captured[z]) === unitjson) { return; }
    }
    p.captured.push(unit);
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
  }

  removeUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = space.units[faction].length - 1; i >= 0; i--) {
      if (space.units[faction].type === type) {
	space.units[faction].splice(i, 1);
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
  }

  addMercenary(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "mercenary"));
    }
  }

  addCavalry(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "cavalry"));
    }
  }

  addNavalSquadron(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "squadron"));
    }
  }

  addCorsair(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
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
    //• Copernicus (2 VP) or Michael Servetus (1 VP) event
    if (this.game.state.events.michael_servetus) {
      factions[this.game.state.events.michael_servetus].vp_special++;
      factions[this.game.state.events.michael_servetus].vp++;
    }
    if (this.game.state.events.copernicus) {
      factions[this.game.state.events.copernicus].vp_special += this.game.state.events.copernicus_vp;
      factions[this.game.state.events.copernicus].vp += this.game.state.events.copernicus_vp;
    }


    // base

    // protestant spaces

    // bonus vp
    //• Bible translation completed (1 VP for each language)    ***
    //• Protestant debater burned (1 per debate rating)         ***
    //• Papal debater disgraced (1 per debate rating)           ***
    //• Successful voyage of exploration
    //• Successful voyage of conquest
    //• JuliaGonzaga(1VP)followed by successful Ottoman piracy in Tyrrhenian Sea
    //• War Winner marker received during Peace Segment
    //• Master of Italy VP marker received during Action Phase

    return factions;

  }


  //
  // faction is papacy or (anything), since debaters aren't really owned by factions outside
  // papcy and protestants, even if they are tagged as would be historically appropriate
  //
  returnDebatersInLanguageZone(language_zone="german", faction="papacy", committed=-1) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].language_zone === language_zone || this.game.state.debaters[i].langauge_zone === "any") {
        if (this.game.state.debaters[i].faction === faction || (faction != "papacy" && this.game.state.debaters[i].faction != "papacy")) {
          if (this.game.state.debaters[i].committed === committed || committed == -1) {
	    num++;
          }
        }
      }
    }
    return num;
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
    state.players = [];
    state.events = {};

    // whose turn is it? (attacker)
    state.active_player = -1;

    // which ones are activated
    state.minor_activated_powers = [];

    state.naval_leaders_lost_at_sea = [];

    state.activated_powers = {};
    state.activated_powers['ottoman'] = [];
    state.activated_powers['hapsburg'] = [];
    state.activated_powers['france'] = [];
    state.activated_powers['england'] = [];
    state.activated_powers['papacy'] = [];
    state.activated_powers['protestant'] = [];

    state.translations = {};
    state.translations['new'] = {};
    state.translations['new']['german'] = 0;
    state.translations['new']['french'] = 0;
    state.translations['new']['english'] = 0;
    state.translations['full'] = {};
    state.translations['full']['german'] = 0;
    state.translations['full']['french'] = 0;
    state.translations['full']['english'] = 0;

    state.saint_peters_cathedral = {};
    state.saint_peters_cathedral['state'] = 0;
    state.saint_peters_cathedral['vp'] = 0;    

    state.papal_debaters_disgraced_vp = 0;
    state.protestant_debaters_burned_vp = 0;

    state.events.michael_servetus = "";  // faction that gets VP
    state.events.copernicus = "";        // faction that gets VP
    state.events.copernicus_vp = 0;     // 1 or 2 VP

    state.french_chateaux_vp = 0;

    state.tmp_reformations_this_turn = [];
    state.tmp_counter_reformations_this_turn = [];
    state.tmp_protestant_reformation_bonus = 0;
    state.tmp_catholic_reformation_bonus = 0;
    state.tmp_protestant_counter_reformation_bonus = 0;
    state.tmp_protestant_reformation_bonus_spaces = [];
    state.tmp_catholic_counter_reformation_bonus = 0;
    state.tmp_catholic_counter_reformation_bonus_spaces = [];
    state.tmp_papacy_may_specify_debater = 0;
    state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    state.tmp_bonus_protestant_translation_german_zone = 0;
    state.tmp_bonus_protestant_translation_french_zone = 0;
    state.tmp_bonus_protestant_translation_english_zone = 0;
    state.tmp_bonus_papacy_burn_books = 0;

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

    state.autowin_hapsburg_keys_controlled = 14;
    state.autowin_ottoman_keys_controlled = 11;
    state.autowin_papacy_keys_controlled = 7;
    state.autowin_france_keys_controlled = 11;
    state.autowin_england_keys_controlled = 9;



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

    state.events.ottoman_piracy_enabled = 0;
    state.events.ottoman_corsairs_enabled = 0;
    state.events.papacy_may_found_jesuit_universities = 0;
    state.events.schmalkaldic_league = 0;
    state.events.edward_vi_born = 0;
    state.events.wartburg = 0;

    return state;

  }



  returnPregnancyChart() {

    let chart = {};

    chart['1'] = {
      top : 1307,
      left : 4075,
    }

    chart['2'] = {
      top : 1220,
      left : 4075,
    }

    chart['3'] = {
      top : 1135,
      left : 4075,
    }

    chart['4'] = {
      top : 1051,
      left : 4075,
    }

    chart['5'] = {
      top : 963,
      left : 4075,
    }

    chart['1'] = {
      top : 850,
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
      top : 1568,
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

    nw['greatlakes'] = {
      top : 1906 ,
      left : 280,
      vp : 1
    }
    nw['stlawrence'] = {
      top : 1886 ,
      left : 515,
      vp : 1
    }
    nw['mississippi'] = {
      top : 2075 ,
      left : 280 ,
      vp : 1
    }
    nw['aztec'] = {
      top : 2258 ,
      left : 168 ,
      vp : 2
    }
    nw['maya'] = {
      top : 2300 ,
      left : 302 ,
      vp : 2
    }
    nw['amazon'] = {
      top : 2536 ,
      left : 668 ,
      vp : 2
    }
    nw['inca'] = {
      top : 2660 ,
      left : 225,
      vp : 2
    }
    nw['circumnavigation'] = {
      top : 2698,
      left : 128,
      vp : 3
    }
    nw['pacificstrait'] = {
      top : 2996 ,
      left : 486 ,
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
      top : 1568,
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
      top : 1226,
      left : 1
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
      left : 1568
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


  returnDiplomacyTable() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {};
    diplomacy["england"] 	= {};
    diplomacy["france"] 	= {};
    diplomacy["papacy"] 	= {};
    diplomacy["protestant"] 	= {};
    diplomacy["hapsburg"] 	= {};

    diplomacy["ottoman"]["hapsburg"] = {
        top 	:	205 ,
        left	:	4128 ,
    }
    diplomacy["ottoman"]["england"] = {
        top 	:	205 ,
        left	:	4222 ,
    }
    diplomacy["ottoman"]["france"] = {
        top 	:             205 ,
        left	:	4310 ,
    }
    diplomacy["ottoman"]["papacy"] = {
        top 	:	205 ,
        left	:	4400 ,
    }
    diplomacy["ottoman"]["protestant"] = {
        top 	:	205 ,
        left	:	4490 ,
    }
    diplomacy["ottoman"]["genoa"] = {
        top 	:	205 ,
        left	:	4580 ,
    }
    diplomacy["ottoman"]["hungary"] = {
        top 	:	205 ,
        left	:	4670 ,
    }
    diplomacy["ottoman"]["scotland"] = {
        top 	:	205 ,
        left	:	4760 ,
    }
    diplomacy["ottoman"]["venice"] = {
        top 	:	205 ,
        left	:	4851 ,
    }

    diplomacy["hapsburg"]["ottoman"] = {
        top 	:	205 ,
        left	:	4128 ,
    }
    diplomacy["hapsburg"]["england"] = {
        top 	:	297 ,
        left	:	4220 ,
    }
    diplomacy["hapsburg"]["france"] = {
        top 	:	297 ,
        left	:	4310 ,
    }
    diplomacy["hapsburg"]["papacy"] = {
        top 	:	297 ,
        left	:	4400 ,
    }
    diplomacy["hapsburg"]["protestant"] = {
        top 	:	297 ,
        left	:	4490 ,
    }
    diplomacy["hapsburg"]["genoa"] = {
        top 	:	297 ,
        left	:	4580 ,
    }
    diplomacy["hapsburg"]["hungary"] = {
        top 	:	297 ,
        left	:	4670 ,
    }
    diplomacy["hapsburg"]["scotland"] = {
        top 	:	297 ,
        left	:	4760 ,
    }
    diplomacy["hapsburg"]["venice"] = {
        top 	:	297 ,
        left	:	4851 ,
    }


    diplomacy["england"]["ottoman"] = {
        top 	:	205 ,
        left	:	4222 ,
    }
    diplomacy["england"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4220 ,
    }
    diplomacy["england"]["france"] = {
        top 	:	386 ,
        left	:	4310 ,
    }
    diplomacy["england"]["papacy"] = {
        top 	:	386 ,
        left	:	4400 ,
    }
    diplomacy["england"]["protestant"] = {
        top 	:	386 ,
        left	:	4490 ,
    }
    diplomacy["england"]["genoa"] = {
        top 	:	386 ,
        left	:	4580 ,
    }
    diplomacy["england"]["hungary"] = {
        top 	:	386 ,
        left	:	4670 ,
    }
    diplomacy["england"]["scotland"] = {
        top 	:	386 ,
        left	:	4760 ,
    }
    diplomacy["england"]["venice"] = {
        top 	:	386 ,
        left	:	4851 ,
    }

    diplomacy["france"]["ottoman"] = {
        top 	:       205 ,
        left	:	4310 ,
    }
    diplomacy["france"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4310 ,
    }
    diplomacy["france"]["england"] = {
        top 	:	386 ,
        left	:	4310 ,
    }
    diplomacy["france"]["papacy"] = {
        top     :       478 ,
        left    :       4400 ,    
    }
    diplomacy["france"]["protestant"] = {
        top     :       478 ,
        left    :       4490 ,    
    }
    diplomacy["france"]["genoa"] = {
        top     :       478 ,
        left    :       4580 ,    
    }
    diplomacy["france"]["hungary"] = {
        top     :       478 ,
        left    :       4670 ,    
    }
    diplomacy["france"]["scotland"] = {
        top     :       478 ,
        left    :       4760 ,    
    }
    diplomacy["france"]["venice"] = {
        top     :       478 ,
        left    :       4851 ,    
    }


    diplomacy["papacy"]["ottoman"] = {
        top 	:	205 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["england"] = {
        top 	:	386 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["france"] = {
        top     :       478 ,
        left    :       4400 ,    
    }
    diplomacy["papacy"]["protestant"] = {
        top     :       568 ,
        left    :       4490 ,    
    }
    diplomacy["papacy"]["genoa"] = {
        top     :       568 ,
        left    :       4580 ,    
    }
    diplomacy["papacy"]["hungary"] = {
        top     :       568 ,
        left    :       4670 ,    
    }
    diplomacy["papacy"]["scotland"] = {
        top     :       568 ,
        left    :       4760 ,    
    }
    diplomacy["papacy"]["venice"] = {
        top     :       568 ,
        left    :       4851 ,    
    }

    diplomacy["protestant"]["ottoman"] = {
        top 	:	205 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["england"] = {
        top 	:	386 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["france"] = {
        top     :       478 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["papacy"] = {
        top     :       568 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["genoa"] = {
        top     :       658 ,
        left    :       4580 ,    
    }
    diplomacy["protestant"]["hungary"] = {
        top     :       658 ,
        left    :       4670 ,    
    }
    diplomacy["protestant"]["scotland"] = {
        top     :       658 ,
        left    :       4760 ,    
    }
    diplomacy["protestant"]["venice"] = {
        top     :       568 ,
        left    :       4851 ,    
    }

    return diplomacy;

  }


