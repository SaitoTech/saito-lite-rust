

  onNewRound() {
  }

  onNewTurn() {

    this.game.state.mandated_offensives = {};
    this.game.state.mandated_offensives.central = "";
    this.game.state.mandated_offensives.allies = "";

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

    this.game.state.rp = {};
    this.game.state.rp['central'] = {};
    this.game.state.rp['allies'] = {};
    this.game.state.rp['central']['ge'] = 0;
    this.game.state.rp['central']['ah'] = 0;
    this.game.state.rp['central']['tu'] = 0;
    this.game.state.rp['central']['bu'] = 0;
    this.game.state.rp['central']['cp'] = 0;
    this.game.state.rp['allies']['a'] = 0;
    this.game.state.rp['allies']['br'] = 0;
    this.game.state.rp['allies']['fr'] = 0;
    this.game.state.rp['allies']['it'] = 0;
    this.game.state.rp['allies']['ru'] = 0;
    this.game.state.rp['allies']['ap'] = 0;

    this.game.state.events = {};

  }


  calculateVictoryPoints() {

    let vp = 0;

    //
    // central VP spaces
    //
    for (let key in this.game.spaces) { if (this.game.spaces[key].vp > 0 && this.game.spaces[key].control == "central") { vp++; } }

    this.game.state.general_records_track.vp = vp;
   
    return vp;

  }

  returnState() {

    let state = {};

    state.events = {};
    state.players = [];
    state.removed = []; // removed cards
    state.turn = 0;
    state.skip_counter_or_acknowledge = 0; // don't skip
    state.cards_left = {};

    state.mandated_offensives = {};
    state.mandated_offensives.central = "";
    state.mandated_offensives.allies = "";

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

    state.general_records_track.current_cp_russian_vp = 0;

    state.us_commitment_track = 1;
    state.russian_capitulation_track = 1;

    state.reserves = {};
    //state.reserves['central'] = ["ah_corps","ah_corps","ah_corps","ah_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps","ge_corps"];
    //state.reserves['allies'] = ["it_corps","it_corps","it_corps","it_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","fr_corps","br_corps","bef_corps","ru_corps","ru_corps","ru_corps","ru_corps","ru_corps","be_corps","sb_corps","sb_corps"];
    state.reserves['central'] = ["ge_army04", "ge_army06", "ge_army08"];
    state.reserves['allies'] = ["fr_army01", "br_corps", "ru_army09", "ru_army10"];

    state.eliminated = {};
    state.eliminated['central'] = [];
    state.eliminated['allies'] = [];

    state.rp = {};
    state.rp['central'] = {};
    state.rp['allies'] = {};
    state.rp['central']['ge'] = 0;
    state.rp['central']['ah'] = 0;
    state.rp['central']['tu'] = 0;
    state.rp['central']['bu'] = 0;
    state.rp['central']['cp'] = 0;
    state.rp['allies']['a'] = 0;
    state.rp['allies']['br'] = 0;
    state.rp['allies']['fr'] = 0;
    state.rp['allies']['it'] = 0;
    state.rp['allies']['ru'] = 0;
    state.rp['allies']['ap'] = 0;

    state.active_player = -1;

    state.central_limited_war_cards_added = false;
    state.allies_limited_war_cards_added = false;
    state.central_total_war_cards_added = false;
    state.allies_total_war_cards_added = false;

    return state;

  }

  returnActivationCost(key) {
    return 1;
  }

  returnMovementCost(key) {
    return 1;
  }

