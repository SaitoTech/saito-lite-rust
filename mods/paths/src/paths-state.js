

  // turns have several rounds
  onNewRound() {

    this.calculateVictoryPoints();
    this.displayGeneralRecordsTrack();
    this.calculateRussianCapitulationTrack();
    this.displayActionRoundTracks();

    this.game.state.events.wireless_intercepts = 0;
    this.game.state.events.withdrawal = 0;
    this.game.state.events.withdrawal_bonus_used = 0;
    this.game.state.events.brusilov_offensive = 0;

    this.game.state.attacks = {};

    if (this.game.state.events.high_seas_fleet > 1) { this.game.state.events.high_seas_fleet--; }

    for (let key in this.game.spaces) {
      let redisplay = false;
      if (this.game.spaces[key].activated_for_combat || this.game.spaces[key].activated_for_movement) {
        redisplay = true;
      }
      this.game.spaces[key].activated_for_combat = 0;
      this.game.spaces[key].activated_for_movement = 0;
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
	this.game.spaces[key].units[z].moved = 0;
	this.game.spaces[key].units[z].attacked = 0;
      }
      if (redisplay) { this.displaySpace(key); }
    }

  }

  // the turn is the "round" (rounds have turns)
  onNewTurn() {

    this.game.state.mandated_offensives = {};
    this.game.state.mandated_offensives.central = "";
    this.game.state.mandated_offensives.allies = "";

    this.game.state.allies_passed = 0;
    this.game.state.central_passed = 0;

    this.game.state.ccs = {};
    this.game.state.cc_central_on_table = [];
    this.game.state.cc_central_active = [];
    this.game.state.cc_central_played_this_round = [];
    this.game.state.cc_allies_on_table = [];
    this.game.state.cc_allies_active = [];
    this.game.state.cc_allies_played_this_round = [];

    this.game.state.neutral_entry = 0;
    this.game.state.central_reinforcements_ge = 0;
    this.game.state.central_reinforcements_ah = 0;
    this.game.state.central_reinforcements_tu = 0;
    this.game.state.allies_reinforcements_fr = 0;
    this.game.state.allies_reinforcements_br = 0;
    this.game.state.allies_reinforcements_ru = 0;
    this.game.state.allies_reinforcements_it = 0;
    this.game.state.allies_reinforcements_us = 0;
    this.game.state.allies_rounds = [];
    this.game.state.central_rounds = [];

    this.game.state.entrenchments = [];

    this.game.state.mo = {};
    this.game.state.mo.allies = [];
    this.game.state.mo.central = [];
    this.game.state.mo.vp_bonus = 0;

    this.game.state.rp = {};
    this.game.state.rp['central'] = {};
    this.game.state.rp['allies'] = {};
    this.game.state.rp['central']['GE'] = 0;
    this.game.state.rp['central']['AH'] = 0;
    this.game.state.rp['central']['TU'] = 0;
    this.game.state.rp['central']['BU'] = 0;
    this.game.state.rp['central']['CP'] = 0;
    this.game.state.rp['allies']['A'] = 0;
    this.game.state.rp['allies']['BR'] = 0;
    this.game.state.rp['allies']['FR'] = 0;
    this.game.state.rp['allies']['IT'] = 0;
    this.game.state.rp['allies']['RU'] = 0;
    this.game.state.rp['allies']['AP'] = 0;

    this.game.state.events.zeppelin_raids = 0;
    this.game.state.events.great_retreat = 0;
    this.game.state.events.great_retreat_used = 0;
    this.game.state.events.fall_of_the_tsar_russian_vp = 0;
    this.game.state.events.they_shall_not_pass = 0;
    this.game.state.events.wireless_intercepts = 0;
    this.game.state.events.everyone_into_battle = 0;
    this.game.state.events.withdrawal = 0;
    this.game.state.events.withdrawal_bonus_used = 0;
    this.game.state.events.mine_attack = 0;

  }

  removeOverstackedUnits() {
    for (let key in this.game.spaces) {
      if (key != "ceubox" && key != "aeubox" && key != "arbox" && key != "crbox") {
        while (this.game.spaces[key].units.length > 3) {
	  this.updateLog(this.game.spaces[key].units[3].name + " removed from game (over-stacked)");
	  this.game.spaces[key].units.splice(3, 1);
	  this.displaySpace(key);
	  this.shakeSpacekey(key);
        }
      }
    }
    return 1;
  }

  calculateRussianCapitulationTrack() {

    let count = 0;
    let position = 1;

    for (let key in this.game.spaces) {
      let space = this.game.spaces[key];
      if (space.country == "russia" && space.control == "central" && space.vp == 1) {
	count++;
      }
    }
    if (count >= 3) { position++; }

    if (this.game.state.events.tsar_takes_command) { position++; }

    if (position >= 3) {
      if ((this.game.state.general_records_track.combined_war_status + count) >= 33) { position++; }
    }

    if (this.game.state.events.fall_of_the_tsar) { position++; }

    if (count == 7 || count > this.game.state.events.fall_of_the_tsar_russian_vp && this.game.state.events.fall_of_the_tsar_russian_vp != -1) {
      position++;
    }

    if (this.game.state.events.bolshevik_revolution) { position++; }

    if (position != this.game.state.russian_capitulation_track) {    
      this.game.state.russian_capitulation_track = position;
      this.displayRussianCapitulationTrack();
    }

  }

  returnCapital(ckey="BR") {
    if (ckey == "BR") { return ["london"]; }
    if (ckey == "AH") { return ["vienna","budapest"]; }
    if (ckey == "BE") { return ["brussels"]; }
    if (ckey == "BU") { return ["sofia"]; }
    if (ckey == "FR") { return ["paris"]; }
    if (ckey == "GE") { return ["berlin"]; }
    if (ckey == "GR") { return ["athens"]; }
    if (ckey == "IT") { return ["rome"]; }
    if (ckey == "MN") { return ["cetinje"]; }
    if (ckey == "RO") { return ["bucharest"]; }
    if (ckey == "SB") { return ["belgrade"]; }
    if (ckey == "TU") { return ["constantinople"]; }
    return [];
  }

  calculateVictoryPoints() {

    let vp = 0;
    let central_controlled_vp_spaces = 0;

    //
    // central VP spaces
    //
    for (let key in this.game.spaces) { if (this.game.spaces[key].vp > 0 && this.game.spaces[key].control == "central") { central_controlled_vp_spaces++; } }

    //
    //
    //
    let expected_central_vp_spaces = this.countSpacesWithFilter((spacekey) => {
      if (this.game.spaces[spacekey].country == "germany" && this.game.spaces[spacekey].vp > 0) { return 1; }
      if (this.game.spaces[spacekey].country == "austria" && this.game.spaces[spacekey].vp > 0) { return 1; }
      if (this.game.state.events.bulgaria) { 
        if (this.game.spaces[spacekey].country == "bulgaria" && this.game.spaces[spacekey].vp > 0) { return 1; }
      }
    });

    vp = central_controlled_vp_spaces - expected_central_vp_spaces + 10;

    if (this.game.state.events.rape_of_belgium) { vp--; }
    if (this.game.state.events.belgium) { 
      if (this.game.state.turn >= 5) { vp--; }
      if (this.game.state.turn >= 9) { vp--; }
      if (this.game.state.turn >= 13) { vp--; }
      if (this.game.state.turn >= 17) { vp--; }
    }
    if (this.game.state.events.reichstag_truce) { vp++; }
    if (this.game.state.events.lusitania) { vp--; }
    if (this.game.state.events.war_in_africa_vp) { vp++; }
    if (this.game.state.events.fall_of_the_tsar) { vp++; }
    if (this.game.state.events.fall_of_the_tsar_romania_bonus) { vp++; }
    if (this.game.state.events.fourteen_points) { vp--; }
    if (this.game.state.events.convoy) { vp--; }
    if (this.game.state.events.zimmerman_telegram) { vp--; }
    if (this.game.state.events.blockade > 1) { vp -= (this.game.state.events.blockade-1); }

    if (this.game.state.mo.vp_bonus > 0) { vp += this.game.state.mo.vp_bonus; }

    this.game.state.general_records_track.vp = vp;
  
    return vp;

  }

  returnState() {

    let state = {};

    state.events = {};

    state.players = [];
    state.removed = []; // removed cards
    state.round = 0;
    state.turn = 0;
    state.skip_counter_or_acknowledge = 0; // don't skip
    state.cards_left = {};

    state.neutral_entry = 0;

    state.mandated_offensives = {};
    state.mandated_offensives.central = "";
    state.mandated_offensives.allies = "";

    state.allies_rounds = [];
    state.central_rounds = [];

    state.entrenchments = [];

    state.general_records_track = {};
    state.general_records_track.vp = 10;
    state.general_records_track.allies_war_status = 0;
    state.general_records_track.central_war_status = 0;
    state.general_records_track.combined_war_status = 0;

    state.general_records_track.ge_replacements = 0;
    state.general_records_track.ah_replacements = 0;
    state.general_records_track.allied_replacements = 0;
    state.general_records_track.br_replacements = 0;
    state.general_records_track.fr_replacements = 0;
    state.general_records_track.ru_replacements = 0;

    state.central_reinforcements_ge = 0;
    state.central_reinforcements_ah = 0;
    state.central_reinforcements_tu = 0;
    state.allies_reinforcements_fr = 0;
    state.allies_reinforcements_br = 0;
    state.allies_reinforcements_ru = 0;
    state.allies_reinforcements_it = 0;
    state.allies_reinforcements_us = 0;

    state.general_records_track.current_cp_russian_vp = 0;

    state.us_commitment_track = 1;		// 1 = neutral
						// 2 = Zimmerman Telegram Allowed
						// 3 = Zimmerman Telegram
						// 4 = Over There !

    state.russian_capitulation_track = 1;	// 1 = God Save the Tsar
						// 2 = Tsar Takes Command Allowed 
						// 3 = Tsar Takes Command
						// 4 = Fall of the Tsar Allowed
						// 5 = Fall of the Tsar
						// 6 = Bolshevik Revolution Allowed
						// 7 = Bolshevik Revolution
						// 8 = Treaty of Bresk Litovsk

    state.reserves = {};
    //state.reserves['central'] = ["ah_corps","ah_corps","ah_corps","ah_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps"];
    //state.reserves['allies'] = ["it_corps","it_corps","it_corps","it_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","br_corps","bef_corps","ru_corps","ru_corps","ru_corps","ru_corps","ru_corps","be_corps","sb_corps","sb_corps"];
    state.reserves['central'] = ["ge_army04", "ge_army06", "ge_army08"];
    state.reserves['allies'] = ["fr_army01", "br_corps", "ru_army09", "ru_army10"];

    state.allies_passed = 0;
    state.central_passed = 0;

    state.eliminated = {};
    state.eliminated['central'] = [];
    state.eliminated['allies'] = [];

    state.rp = {};
    state.rp['central'] = {};
    state.rp['allies'] = {};
    state.rp['central']['GE'] = 0;
    state.rp['central']['AH'] = 0;
    state.rp['central']['TU'] = 0;
    state.rp['central']['BU'] = 0;
    state.rp['central']['CP'] = 0;
    state.rp['allies']['A'] = 0;
    state.rp['allies']['BR'] = 0;
    state.rp['allies']['FR'] = 0;
    state.rp['allies']['IT'] = 0;
    state.rp['allies']['RU'] = 0;
    state.rp['allies']['AP'] = 0;

    // tracks mandated offensives - who each attacked against
    state.mo = {};
    state.mo.allies = [];
    state.mo.central = [];
    state.mo.vp_bonus = 0;
    state.attacks = {};

    state.active_player = -1;

    state.ccs = {};
    state.cc_central_active = [];
    state.cc_central_played_this_round = [];
    state.cc_allies_active = [];
    state.cc_allies_played_this_round = [];


    state.central_limited_war_cards_added = false;
    state.allies_limited_war_cards_added = false;
    state.central_total_war_cards_added = false;
    state.allies_total_war_cards_added = false;

    //
    // countries get marked when they enter the war...
    //
    state.events.belgium = 1;
    state.events.montenegro = 1;
    state.events.serbia = 1;
    state.events.austria = 1;
    state.events.germany = 1;
    state.events.france = 1;
    state.events.england = 1;
    state.events.russia = 1;

    state.events.war_in_africa_vp = 0;
    state.events.blockade = 0;
    state.events.great_retreat = 0;
    state.events.great_retreat_used = 0;

    return state;

  }


  moveUnitToSpacekey(ukey, to="") {

    let unit = this.game.units[ukey];

    for (let key in this.game.spaces) {
      for (let i = 0; i < this.game.spaces[key].units.length; i++) {
        if (this.game.spaces[key].units[i].key == ukey) {
	  unit = this.game.spaces[key].units[i];
	  this.game.spaces[key].units.splice(i, 1);
	  break;
        }
      }
    }

    unit.spacekey = to;
    this.game.spaces[to].units.push(unit);

    this.displayBoard();
    
    return 1;

  }


