
  areAllies(faction1, faction2) {
    try { if (this.game.diplomacy[faction1][faction2].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.diplomacy[faction2][faction1].allies == 1) { return 1; } } catch (err) {}
    return 0;
  }

  areEnemies(faction1, faction2) {
    try { if (this.game.diplomacy[faction1][faction2].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.diplomacy[faction2][faction1].enemies == 1) { return 1; } } catch (err) {}
    return 0;
  }

  setAllies(faction1, faction2) {
    try { this.game.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
    try { this.game.diplomacy[faction1][faction2].allies = 1; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].allies = 1; } catch (err) {}
  }

  setEnemies(faction1, faction2) {
    try { this.game.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.diplomacy[faction1][faction2].enemies = 1; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].enemies = 1; } catch (err) {}
  }

  addUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.newUnit(faction, type));
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

  addReformer(faction, space, reformer) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.newReformer(faction, reformer));
  }

  addDebater(faction, debater) {
    let d = this.newDebater(faction, debater);
    this.game.state.debaters.push(d);
  }

  addPersonage(faction, space, personage) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.newPersonage(faction, personage));
  }

  // figure out how many points people have
  calculateVictoryPoints() {

    let factions = {};

    for (let i = 0; i < this.game.players_info.length; i++) {
      for (let ii = 0; ii < this.game.players_info[i].factions.length; ii++) {
        factions[this.game.players_info[i].factions[ii]] = {
	  faction : this.game.players_info[i].factions[ii] ,
	  vp : 0 ,
	  keys : 0 ,
	  religious : 0 ,
	  victory : 0,	  
	  details : "",
	};
      }
    }

    // let factions calculate their VP
    for (let f in factions) {
      factions[f].vp = this.factions[f].calculateVictoryPoints(this);
    }

    // calculate keys controlled
    for (let f in factions) {
      factions[f].keys = this.returnNumberOfKeysControlledByFaction(f);
      if (f === "protestant") {
	factions[f].religious = this.returnNumberOfSpacesControlledByProtestants();
      }
    }

    // military victory
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

    // religious victory
    if (factions['protestant']) {
    if (factions['protestant'].religious >= 50) {
      factions['papacy'].victory = 1;
      factions['papacy'].details = "religious victory";
    }
    }

    // base

    // protestant spaces

    // bonus vp
//• Protestant debater burned (1 per debate rating)
//• Papal debater disgraced (1 per debate rating)
//• Successful voyage of exploration
//• Successful voyage of conquest
//• Copernicus (2 VP) or Michael Servetus (1 VP) event
//• JuliaGonzaga(1VP)followed by successful Ottoman piracy in Tyrrhenian Sea
//• War Winner marker received during Peace Segment
//• Master of Italy VP marker received during Action Phase
//• Bible translation completed (1 VP for each language)

    return factions;

  }


  convertSpace(religion, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.religion = religion;
    this.displayBoard();
  }

  controlSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (faction === "protestant") { this.convertSpace(faction, space.key); return; }
    space.political = faction;
  }

  returnFactionLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction].type === "regular") { luis++; }
      if (space.units[faction].type === "mercenary") { luis++; }
      if (space.units[faction].type === "cavalry") { luis++; }
    }
    return luis;
  }

  doesFactionHaveNavalUnitsOnBoard(faction) {
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
	  return 1;
	}
      }
    }
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].land_or_sea === "sea") {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  returnImpulseOrder() {
    return ["ottoman","hapsburg","england","france","papacy","protestant"];
  }

  returnHomeSpaces(faction) {

    let spaces = [];

    for (let i in this.game.spaces) {
      if (this.game.spaces[i].home === faction) { spaces.push(i); }
    }

    return spaces;

  }

  returnNeighbours(space, transit_passes=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (transit_passes == 1) {
      return space.neighbours;
    }
    let neighbours = [];
    for (let i = 0; i < space.neighbours.length; i++) {
      let x = space.neighbours[i];      
      if (!space.pass.includes[x]) {
	neighbours.push(x);
      }
    }
    return neighbours;
  }

  //
  // find the nearest destination.
  //
  returnNearestSpaceWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1, transit_passes=0) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNeighbours(sourcekey, transit_passes);



    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      if (!searched_spaces.hasOwnProperty[this.game.spaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[n[i]] = { hops : (hops+1) , key : n[i] };
	      }
    	    }
	  }

	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) { continue_searching = 0; }
    }
    

    //
    // at this point we have results or not 
    //
    return results;

  }


  isSpaceControlledByFaction(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.home === faction && faction !== "protestant") { return true; }
    if (space.religion === "protestant" && faction !== "protestant") { return true; }
    if (space.political === faction) { return true; }
    return false;
  }

  isSpaceFactionCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let capitals = this.returnCapitals(faction);
    for (let i = 0; i < capitals.length; i++) {
      if (capitals[i] === space.key) { return true; }
    }
    return false;
  }

  isSpaceInUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.unrest == 1) { return true; }
    return false;
  }

  isSpaceFriendly(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    // friendly if i control it
    if (space.owner === faction) { return 1; }
    if (space.political === faction) { return 1; }
    if (space.political === "" && space.home === faction) { return 1; }
    if (space.religion === "protestant" && faction === "protestant") { return 1; }
    // friendly if ally controls it
    if (space.political === "") {
      if (this.areAllies(faction, space.home)) { return 1; }
    } else {
      if (this.areAllies(faction, space.political)) { return 1; }
    }
    return 0;
  }

  isSpaceConnectedToCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return 1;
  }

  isSpaceAdjacentToReligion(space, religion) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.neighbours.length; i++) {
      if (this.game.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
    return false;
  }

  returnNumberOfElectoratesControlledByCatholics() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "catholic") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByProtestants() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "protestant") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByFaction(faction) {
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByPlayer(player_num) {
    let faction = this.game.players_info[player_num-1].faction;
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }
  returnNumberOfSpacesControlledByProtestants() {
    let controlled_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
	controlled_spaces++;
      }
    }
    return controlled_spaces;
  }



  /////////////////////
  // Core Game State //
  /////////////////////
  returnState() {

    let state = {};

    state.scenario = "1517";
    if (this.game.options.scenario) { state.scenario = this.game.options.scenario; }
    state.round = 0;
    state.players = [];
    state.events = {};
    state.debaters = [];

    state.tmp_reformations_this_turn = [];
    state.tmp_counter_reformations_this_turn = [];

    state.tmp_protestant_reformation_bonus = 0;
    state.tmp_catholic_reformation_bonus = 0;
    state.tmp_protestant_counter_reformation_bonus = 0;
    state.tmp_catholic_counter_reformation_bonus = 0;

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

    state.leaders = {};

    state.leaders.francis_i = 1;
    state.leaders.henry_viii = 1;
    state.leaders.charles_v = 1;
    state.leaders.suleiman = 1;
    state.leaders.leo_x = 1;
    state.leaders.martin_luther = 1

    state.leaders.clement_vii = 0;
    state.leaders.paul_iii = 0;
    state.leaders.edward_vi = 0;
    state.leaders.henry_ii = 0;
    state.leaders.mary_i = 0;
    state.leaders.julius_iii = 0;
    state.leaders.elizabeth_i = 0;

    state.events.ottoman_piracy_enabled = 0;
    state.events.ottoman_corsairs_enabled = 0;
    state.events.papacy_may_found_jesuit_universities = 0;

    state.events.schmalkaldic_league = 0;

    state.debaters = [];

    return state;

  }


  returnReligiousConflictChart() {

    let chart = {};

    chart['s0'] = {
      top: "475px",
      left: "64px",
    }
    chart['s1'] = {
      top: "475px",
      left: "140px",
    }
    chart['s2'] = {
      top: "475px",
      left: "216px",
    }
    chart['s3'] = {
      top: "475px",
      left: "292px",
    }
    chart['s4'] = {
      top: "475px",
      left: "368px",
    }
    chart['s5'] = {
      top: "475px",
      left: "444px",
    }
    chart['s6'] = {
      top: "475px",
      left: "520px",
    }
    chart['s7'] = {
      top: "475px",
      left: "596px",
    }
    chart['s8'] = {
      top: "475px",
      left: "672px",
    }
    chart['s9'] = {
      top: "475px",
      left: "748px",
    }
    chart['s10'] = {
      top: "475px",
      left: "824px",
    }
    chart['s11'] = {
      top: "475px",
      left: "900px",
    }
    chart['s12'] = {
      top: "475px",
      left: "976px",
    }
    chart['s13'] = {
      top: "558px",
      left: "64px",
    }
    chart['s14'] = {
      top: "558px",
      left: "140px",
    }
    chart['s15'] = {
      top: "558px",
      left: "216px",
    }
    chart['s16'] = {
      top: "558px",
      left: "292px",
    }
    chart['s17'] = {
      top: "558px",
      left: "368px",
    }
    chart['s18'] = {
      top: "558px",
      left: "444px",
    }
    chart['s19'] = {
      top: "558px",
      left: "520px",
    }
    chart['s20'] = {
      top: "558px",
      left: "596px",
    }
    chart['s21'] = {
      top: "558px",
      left: "672px",
    }
    chart['s22'] = {
      top: "558px",
      left: "748px",
    }
    chart['s23'] = {
      top: "558px",
      left: "824px",
    }
    chart['s24'] = {
      top: "558px",
      left: "900px",
    }
    chart['s25'] = {
      top: "558px",
      left: "976px",
    }
    chart['s26'] = {
      top: "643px",
      left: "64px",
    }
    chart['s27'] = {
      top: "643px",
      left: "140px",
    }
    chart['s28'] = {
      top: "643px",
      left: "216px",
    }
    chart['s29'] = {
      top: "643px",
      left: "292px",
    }
    chart['s30'] = {
      top: "643px",
      left: "368px",
    }
    chart['s31'] = {
      top: "643px",
      left: "444px",
    }
    chart['s32'] = {
      top: "643px",
      left: "520px",
    }
    chart['s33'] = {
      top: "643px",
      left: "596px",
    }
    chart['s34'] = {
      top: "643px",
      left: "672px",
    }
    chart['s35'] = {
      top: "643px",
      left: "748px",
    }
    chart['s36'] = {
      top: "643px",
      left: "824px",
    }
    chart['s37'] = {
      top: "643px",
      left: "900px",
    }
    chart['s38'] = {
      top: "643px",
      left: "976px",
    }
    chart['s39'] = {
      top: "475px",
      left: "64px",
    }
    chart['s40'] = {
      top: "726px",
      left: "140px",
    }
    chart['s41'] = {
      top: "726px",
      left: "216px",
    }
    chart['s42'] = {
      top: "726px",
      left: "292px",
    }
    chart['s43'] = {
      top: "726px",
      left: "368px",
    }
    chart['s44'] = {
      top: "726px",
      left: "444px",
    }
    chart['s45'] = {
      top: "726px",
      left: "520px",
    }
    chart['s46'] = {
      top: "726px",
      left: "596px",
    }
    chart['s47'] = {
      top: "726px",
      left: "672px",
    }
    chart['s48'] = {
      top: "726px",
      left: "672px",
    }
    chart['s49'] = {
      top: "726px",
      left: "748px",
    }
    chart['s50'] = {
      top: "726px",
      left: "824px",
    }

    return chart;

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


  returnNavalSpaces() {

    let seas = {};

    seas['irish'] = {
      top : 875 ,
      left : 900 ,
      name : "Irish Sea" ,
      neighbours : ["biscay","north","channel"] ,
    }
    seas['biscay'] = {
      top : 1500 ,
      left : 1400 ,
      name : "Bay of Biscay" ,
      neighbours : ["irish","channel","atlantic"] ,
    }
    seas['atlantic'] = {
      top : 2700 ,
      left : 850 ,
      name : "Atlantic Ocean" ,
      neighbours : ["biscay"] ,
    }
    seas['channel'] = {
      top : 1020 ,
      left : 1450 ,
      name : "English Channel" ,
      neighbours : ["irish","biscay","north"] ,
    }
    seas['north'] = {
      top : 200 ,
      left : 2350 ,
      name : "North Sea" ,
      neighbours : ["irish","channel","baltic"] ,
    }
    seas['baltic'] = {
      top : 50 ,
      left : 3150 ,
      name : "Baltic Sea" ,
      neighbours : ["north"] ,
    }
    seas['gulflyon'] = {
      top : 1930 ,
      left : 2430 ,
      name : "Gulf of Lyon" ,
      neighbours : ["barbary","tyrrhenian"] ,
    }
    seas['barbary'] = {
      top : 2330 ,
      left : 2430 ,
      name : "Barbary Coast" ,
      neighbours : ["gulflyon","tyrrhenian","ionian","african"] ,
    }
    seas['tyrrhenian'] = {
      top : 2260 ,
      left : 3300 ,
      name : "Tyrrhenian Sea" ,
      neighbours : ["barbary","gulflyon"] ,
    }
    seas['africa'] = {
      top : 2770 ,
      left : 4200 ,
      name : "North African Coast" ,
      neighbours : ["ionian","barbary","aegean"] ,
    }
    seas['aegean'] = {
      top : 2470 ,
      left : 4450 ,
      name : "Aegean Sea" ,
      neighbours : ["black","african","ionian"] ,
    }
    seas['ionian'] = {
      top : 2390 ,
      left : 3750 ,
      name : "Ionian Sea" ,
      neighbours : ["black","aegean","adriatic"] ,
    }
    seas['adriatic'] = {
      top : 1790 ,
      left : 3400 ,
      name : "Adriatic Sea" ,
      neighbours : ["ionian"] ,
    }
    seas['black'] = {
      top : 1450 ,
      left : 4750 ,
      name : "Black Sea" ,
      neighbours : ["aegean"] ,
    }

    for (let key in seas) {
      seas[key].units = {};
      seas[key].units['england'] = [];
      seas[key].units['france'] = [];
      seas[key].units['hapsburg'] = [];
      seas[key].units['ottoman'] = [];
      seas[key].units['papacy'] = [];
      seas[key].units['protestant'] = [];
      seas[key].units['venice'] = [];
      seas[key].units['genoa'] = [];
      seas[key].units['hungary'] = [];
      seas[key].units['scotland'] = [];
      seas[key].units['independent'] = [];
    }

    return seas;
  }

  returnSpacesInUnrest() {
    let spaces_in_unrest = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].unrest == 1) { spaces_in_unrest.push(key); }
    }
    return spaces_in_unrest;
  }

  returnSpacesWithFactionInfantry(faction) {
    let spaces_with_infantry = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction].length > 0) {
        spaces_with_infantry.push(key);
      }
    }
    return spaces_with_infantry;
  }

  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 70,
      left: 1265,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["glasgow","edinburgh"],
      language: "english",
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["stirling","edinburgh","carlisle"],
      language: "english",
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["stirling","carlisle","berwick"],
      language: "english",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      ports: ["north"],
      neighbours: ["edinburgh","carlisle","york"],
      language: "english",
      religion: "catholic",
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["glasgow","berwick","york","shrewsbury"],
      language: "english",
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["berwick","carlisle","shrewsbury","lincoln"],
      language: "english",
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["shrewsbury","bristol"],
      language: "english",
      type: "key"

    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["wales","carlisle","york","london","bristol"],
      language: "english",
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["london","york"],
      language: "english",
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours:["london"],
      language: "english",
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      home: "england",
      political: "england",
      religion: "catholic",
      language: "english",
      ports: ["irish"],
      neighbours: ["shrewsbury","wales","plymouth","portsmouth","london"],
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["norwich","lincoln","bristol","portsmouth","shrewsbury"],
      language: "english",
      type: "key"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["bristol","portsmouth"],
      language: "english",
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["plymouth","bristol","london"],
      language: "english",
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      home: "england",
      political: "england",
      religion: "catholic",
      ports:["north"], 
      neighbours: ["boulogne","brussels","antwerp"],
      language: "french",
      type: "key"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["calais","rouen","paris","stquentin"],
      language: "french",
      type: "town"
    }
    spaces['stquentin'] = {
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stdizier","paris","boulogne"],
      type: "town"
    }
    spaces['stdizier'] = {
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stquentin","paris","dijon","metz"],
      language: "french",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","boulogne","stquentin","stdizier","dijon","orleans"],
      language: "french",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      ports: ["channel"],
      religion: "channelc",
      neighbours: ["boulogne","paris","tours","nantes"],
      language: "french",
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["paris","tours","dijon","lyon"],
      language: "french",
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["stdizier","paris","orleans","lyon","besancon"],
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["tours","bordeaux","lyon"],
      language: "french",
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","nantes","bordeaux","limoges","orleans"],
      language: "french",
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["brest","rouen","tours","bordeaux"],
      language: "french",
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channnel","biscay"],
      neighbours: ["nantes"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["navarre", "nantes","tours","limoges"],
      pass: ["navarre"],
      language: "french",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["avignon","limoges","orleans","dijon","geneva","grenoble"],
      language: "french",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["turin","lyon","geneva"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","toulouse","lyon","marseille"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["lyon"],
      neighbours: ["avignon","nice"],
      language: "french",
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","bordeaux","avignon"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["nantes","tours","limoges","toulouse"],
      language: "french",
      type: "key"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","kassel","cologne","amsterdam"],
      language: "german",
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours:["munster","brunswick","hamburg"],
      language: "german",
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["bremen","brunswick","lubeck"],
      language: "german",
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["hamburg","magdeburg","brandenburg","stettin"],
      language: "german",
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["lubeck","brandenburg"],
      language: "german",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 460,
      left: 3077,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["stettin","lubeck","magdeburg","wittenberg","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 600,
      left: 3130,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["brandenburg","magdeburg","leipzig","prague","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 534,
      left: 2932,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["lubeck","brandenburg","wittenberg","erfurt","brunswick"],
      language: "german",
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","hamburg","magdeburg","kassel"],
      language: "german",
      type: "town"
    }
    spaces['cologne'] = {
      top: 716,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","mainz","liege"],
      language: "german",
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","brunswick","erfurt","nuremberg","mainz"],
      language: "german",
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["magdeburg","kassel","leipzig"],
      language: "german",
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["wittenberg","prague","nuremberg","erfurt"],
      language: "german",
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["nuremberg","augsburg","salzburg","linz"],
      language: "german",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["graz","linz","regensburg","augsburg","innsbruck"],
      pass: ["graz"],
      language: "german",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1080,
      left: 2860,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["innsbruck","worms","nuremberg","regensburg","salzburg"],
      pass: ["innsbruck"],
      language: "german",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 925,
      left: 2834,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["augsburg","worms","mainz","kassel","leipzig","regensburg"],
      language: "german",
      type: "town"
    }
    spaces['mainz'] = {
      top: 868,
      left: 2666,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["trier","cologne","kassel","nuremberg","worms"],
      language: "german",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 894,
      left: 2516,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["liege","metz","mainz"],
      language: "german",
      type: "town"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["metz","besancon","basel","worms"],
      language: "german",
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["strasburg","mainz","nuremberg","augsburg"],
      language: "german",
      type: "town"
    }
    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["zaragoza","bilbao"],
      language: "spanish",
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","valladolid","zaragoza","navarre"],
      language: "spanish",
      type: "town"
    }
    spaces['corunna'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["biscay","atlantic"],
      neighbours: ["bilbao","valladolid"],
      language: "spanish",
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","bilbao","madrid"],
      language: "spanish",
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["navarre","bilbao","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["toulouse","avignon","zaragoza","valencia"],
      pass: ["toulouse","avignon"],
      language: "spanish",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      ports: ["gulflyon","barbary"],
      neighbours: ["cartagena","cagliari"],
      language: "other",
      religion: "catholic",
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","valladolid","zaragoza","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["cartagena","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","barbary"],
      neighbours: ["granada","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","gibraltar","cartagena"],
      language: "spanish",
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic"],
      neighbours: ["cordoba","gibraltar"],
      language: "spanish",
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["madrid","seville","granada"],
      language: "spanish",
      type: "town"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic","barbary"],
      neighbours: ["seville","granada"],
      language: "spanish",
      type: "fortress"
    }
    spaces['oran'] = {
      top: 2822,
      left: 1902,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "ottoman independent",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary","african"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports:["tyrrhenian","barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["messina"],
      language: "italian",
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian","ionian"],
      neighbours: ["palermo","naples","taranto"],
      language: "italian",
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["taranto","ancona","rome"],
      language: "italian",
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian"],
      neighbours: ["cerignola","naples","messina"],
      language: "italian",
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["rome","taranto","messina"],
      language: "italian",
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian","african"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["brunn","linz","graz","pressburg"],
      language: "german",
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["prague","regensburg","salzburg","vienna"],
      language: "german",
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["salzburg","vienna","mohacs","agram","trieste"],
      pass: ["salzburg"],
      language: "german",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["graz","agram","zara","venice"],
      language: "italian",
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["augsburg","trent","zurich","salzburg"],
      pass: ["augsburg","trent"],
      language: "german",
      type: "town"
    }
    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["aegean","african"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["aegean","african"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religion: "other",
      ports:["ionian","aegean"],
      neighbours: ["athens"],
      language: "other",
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["aegean"],
      neighbours: ["larissa","lepanto","coron"],
      language: "other",
      type: "key"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["ionian"],
      neighbours: ["larissa","athens"],
      language: "other",
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["durazzo","lepanto","athens","salonika"],
      pass: ["durazzo"],
      language: "other",
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["larissa","edirne"],
      language: "other",
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["larissa","scutari"],
      pass: ["larissa"],
      language: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["nezh","ragusa","durazzo"],
      pass: ["nezh"],
      language: "other",
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["varna","istanbul","salonika","sofia",],
      language: "other",
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black","aegean"],
      neighbours: ["edirne","varna"],
      language: "other",
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black"],
      neighbours: ["bucharest","edirne","istanbul"],
      language: "other",
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","varna"],
      language: "other",
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["szegedin","sofia","bucharest","belgrade"],
      pass: ["szegedin","sofia"],
      language: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","nezh","edirne"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["scutari","belgrade","sofia"],
      pass: ["scutari"],
      language: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["ragusa","szegedin","mohacs","agram","nezh","nicopolis"],
      pass: ["ragusa"],
      language: "other",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["nicopolis","buda","belgrade"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["buda","graz","agram","belgrade"],
      language: "other",
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","mohacs","agram","trieste"],
      language: "german",
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["zara","graz","trieste","belgrade","mohacs"],
      pass: ["zara"],
      language: "other",
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["pressburg","mohacs","szegedin"],
      language: "other",
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","buda"],
      language: "other",
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["breslau","prague","vienna"],
      language: "other",
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["brandenburg","wittenberg","brunn"],
      language: "other",
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["wittenberg","leipzig","linz"],
      language: "other",
      type: "key"
    }
    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","munster"],
      language: "other",
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","liege","brussels","calais"],
      language: "other",
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["antwerp","calais","stquentin","stdizier","liege"],
      language: "french",
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["cologne","trier","metz","brussels","antwerp"],
      language: "french",
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["liege","trier","strasburg","besancon","stdizier"],
      language: "french",
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["metz","dijon","geneva","basel","strasburg"],
      language: "french",
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["strasburg","besancon","geneva","zurich"],
      language: "german",
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","innsbruck"],
      language: "german",
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","besancon","lyon","turin","grenoble"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["trent","modena","pavia","turin"],
      language: "italian",
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["innsbruck","milan","modena","venice"],
      pass: ["innsbruck"],
      language: "italian",
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["trent","milan","pavia","florence","ravenna","venice"],
      language: "italian",
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["milan","turin","genoa","modena"],
      language: "italian",
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["milan","pavia","geneva","grenoble","genoa"],
      pass: ["grenoble","geneva"],
      language: "italian",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["genoa","marseille"],
      pass: ["genoa"],
      language: "french",
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["modena","genoa","siena"],
       language: "italian",
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["genoa","florence","rome"],
      language: "italian",
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: ["nice","pavia","turin","modena","siena"],
      pass: ["nice"],
      language: "italian",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["siena","ancona","cerignola","naples"],
      language: "italian",
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["ravenna","rome","cerignola"],
      language: "italian",
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["venice","modena","ancona"],
      language: "italian",
      type: "key"
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      home: "venice",
      political: "",
      religion: "catholic",
      ports:["adriatic"],
      neighbours: ["trent","modena","ravenna","trieste"],
      language: "italian",
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      home: "venice",
      political: "",
      religion: "catholic",
      neighbours: ["agram","ragusa","trieste"],
      pass: ["agram"],
      language: "other",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["belgrade","zara","scutari"],
      pass: ["belgrade"],
      language: "italian",
      type: "town"
    }


    for (let key in spaces) {
      spaces[key].units = {};
      spaces[key].units['england'] = [];
      spaces[key].units['france'] = [];
      spaces[key].units['hapsburg'] = [];
      spaces[key].units['ottoman'] = [];
      spaces[key].units['papacy'] = [];
      spaces[key].units['protestant'] = [];
      spaces[key].units['venice'] = [];
      spaces[key].units['genoa'] = [];
      spaces[key].units['hungary'] = [];
      spaces[key].units['scotland'] = [];
      spaces[key].units['independent'] = [];
      spaces[key].unrest = 0;
      if (!spaces[key].pass) { spaces[key].pass = []; }
      if (!spaces[key].name) { spaces[key].name = key.toUpperCase(); }
    }

    return spaces;

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

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {
	return `
	  <div class="space_view" id="">
	    This is the detailed view of the city or town.
	  </div>
	`;
      };

    }

    return obj;

  }


  returnNewCardsForThisTurn(turn = 1) {

    let deck = this.returnDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
	new_deck[key] = deck[key];
      }
    }

    return new_deck;

  }

  returnNewDiplomacyCardsForThisTurn(turn = 1) {

    let deck = this.returnDiplomaticDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
        new_deck[key] = deck[key];
      }
    }

    return new_deck;

  }


  returnDiplomaticDeck() {

    let deck = {};

    deck['201'] = { 
      img : "cards/HIS-201.svg" , 
      name : "Andrea Doria" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['202'] = { 
      img : "cards/HIS-202.svg" , 
      name : "Frech Constable Invades" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['203'] = { 
      img : "cards/HIS-203.svg" , 
      name : "Corsair Raid" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['204'] = { 
      img : "cards/HIS-204.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['205'] = { 
      img : "cards/HIS-205.svg" , 
      name : "Diplomatic Pressure" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['206'] = { 
      img : "cards/HIS-206.svg" , 
      name : "Frech Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['207'] = { 
      img : "cards/HIS-207.svg" , 
      name : "Henry Petitions for Divorce" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['208'] = { 
      img : "cards/HIS-208.svg" , 
      name : "Knights of St.John" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['209'] = { 
      img : "cards/HIS-209.svg" , 
      name : "Plague" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['210'] = { 
      img : "cards/HIS-210.svg" , 
      name : "Shipbuilding" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['211'] = { 
      img : "cards/HIS-211.svg" , 
      name : "Spanish Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['212'] = { 
      img : "cards/HIS-212.svg" , 
      name : "Venetian Alliance" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['213'] = { 
      img : "cards/HIS-213.svg" , 
      name : "Austrian Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['214'] = { 
      img : "cards/HIS-214.svg" , 
      name : "Imperial Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['215'] = { 
      img : "cards/HIS-215.svg" , 
      name : "Machiavelli" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['216'] = { 
      img : "cards/HIS-216.svg" , 
      name : "Ottoman Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['217'] = { 
      img : "cards/HIS-217.svg" , 
      name : "Secret Protestant Circle" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['218'] = { 
      img : "cards/HIS-218.svg" , 
      name : "Siege of Vienna" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['219'] = { 
      img : "cards/HIS-219.svg" , 
      name : "Spanish Inquisition" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


  removeCardFromGame(card) {
    try { delete this.game.deck[0].cards[card]; } catch (err) {}
    try { delete this.game.deck[0].discards[card]; } catch (err) {}
  }


  returnDeck() {

    var deck = {};

    /// HOME CARDS
    deck['001'] = { 
      img : "cards/HIS-001.svg" , 
      name : "Janissaries" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "ottoman" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['002'] = { 
      img : "cards/HIS-002.svg" , 
      name : "Holy Roman Emperor" ,
      ops : 5 ,
      turn : 1, 
      type : "normal" ,
      faction : "hapsburg" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['003'] = { 
      img : "cards/HIS-003.svg" , 
      name : "Six Wives of Henry VIII" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "england" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['004'] = { 
      img : "cards/HIS-004.svg" , 
      name : "Patron of the Arts" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "french" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    if (this.game.players.length == 2) {
      deck['005'] = { 
        img : "cards/HIS-005.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" ,
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      }
    } else {
      deck['005'] = { 
        img : "cards/HIS-005-2P.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" , 
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      }
    }
    deck['006'] = { 
      img : "cards/HIS-006.svg" , 
      name : "Leipzig Debate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" , 
      faction : "papacy" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['007'] = { 
      img : "cards/HIS-007.svg" , 
      name : "Here I Stand" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      faction : "protestant" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    // 95 Theses
    deck['008'] = { 
      img : "cards/HIS-008.svg" , 
      name : "Luther's 95 Theses" ,
      ops : 0 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeck : function(his_self, player) { return 1; } ,
      onEvent : function(game_mod, player) {

	// set player to protestant
	player = game_mod.returnPlayerOfFaction("protestant");

	// protestant gets 2 roll bonus at start
	game_mod.game.state.tmp_protestant_reformation_bonus = 2;
	game_mod.game.state.tmp_catholic_reformation_bonus = 0;
	game_mod.game.state.tmp_reformations_this_turn = [];

	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
        game_mod.game.queue.push("ACKNOWLEDGE\tThe Reformation.!");
        game_mod.convertSpace("protestant", "wittenberg");
        game_mod.addUnit("protestant", "wittenberg", "regular");
        game_mod.addUnit("protestant", "wittenberg", "regular");
        game_mod.addReformer("protestant", "wittenberg", "luther-reformer");
        game_mod.displaySpace("wittenberg");

	return 1;
      },
      handleGameLoop : function(game_mod, qe, mv) {

        if (mv[0] == "catholic_counter_reformation") {

          let player = parseInt(mv[1]);
          game_mod.game.queue.splice(qe, 1);

	  if (game_mod.game.player == player) {
            game_mod.playerSelectSpaceWithFilter(

	      "Select Counter-Reformation Attempt",

	      //
	      // protestant spaces adjacent to catholic 
	      //
	      function(space) {
		if (
		  space.religion === "protestant" &&
		  !game_mod.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
		  game_mod.isSpaceAdjacentToReligion(space, "catholic")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch counter_reformation
	      //
	      function(spacekey) {
	  	game_mod.updateStatus("Counter-Reformation attempt in "+spacekey);
		game_mod.addMove("counter_reformation\t"+spacekey);
		game_mod.endTurn();
	      },

	      null

	    );
	  }

          return 0;

        }

        if (mv[0] == "protestant_reformation") {

          let player = parseInt(mv[1]);
          game_mod.game.queue.splice(qe, 1);

	  if (game_mod.game.player == player) {
            game_mod.playerSelectSpaceWithFilter(

	      "Select Reformation Attempt",

	      //
	      // catholic spaces adjacent to protestant 
	      //
	      function(space) {
		if (
		  space.religion === "catholic" &&
		  !game_mod.game.state.tmp_reformations_this_turn.includes(space.key) &&
		  game_mod.isSpaceAdjacentToReligion(space, "protestant")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch reformation
	      //
	      function(spacekey) {
	  	game_mod.updateStatus("Reformation attempt in "+spacekey);
		game_mod.addMove("reformation\t"+spacekey);
		game_mod.endTurn();
	      },

	      null

	    );
	  }

          return 0;

        }

	return 1;
      }
    }
    deck['009'] = { 
      img : "cards/HIS-009.svg" , 
      name : "Barbary Pirates" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(game_mod, player) {

	// algiers space is now in play
	game_mod.game.spaces['algiers'].political = "ottoman";
	game_mod.addRegular("ottoman", "algiers", 2);
	game_mod.addCorsair("ottoman", "algiers", 2);
	game_mod.game.state.events.ottoman_piracy_enabled = 1;
	game_mod.game.state.events.ottoman_corsairs_enabled = 1;

	return 1;
      },

    }
    deck['010'] = { 
      img : "cards/HIS-010.svg" , 
      name : "Clement VII" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.leo_x = 0;
	game_mod.game.state.leaders.clement_vii = 1;
	return 1;
      },

    }
    deck['011'] = { 
      img : "cards/HIS-011.svg" , 
      name : "Defender of the Faith" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(game_mod, player) {

	let papacy = game_mod.returnPlayerOfFaction("papacy");

	// deal extra card if player is england
	if (player === game_mod.returnPlayerOfFaction("england")) {
	  let faction_hand_idx = game_mod.returnFactionHandIdx(player, "england");   
 	  game_mod.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+this.game.players_info[player-1].factions[faction_hand_idx]);
	  game_mod.game.queue.push(`DEAL\t1\t${player}\t1`);
        }
	// three counter-reformation attempts
	game_mod.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	game_mod.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	game_mod.game.queue.push(`counter_reformation_attempt\t${papacy}`);

	return 1;
      },
    }
    deck['012'] = { 
      img : "cards/HIS-012.svg" , 
      name : "Master of Italy" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {

	let f = {};
	if (!f[game_mod.game.space['genoa'].political]) { f[game_mod.game.space['genoa'].political] = 1; }
	else { f[game_mod.game.space['genoa'].political]++ }

	for (let key in f) {
	  if (f[key] >= 4) {
	    game_mod.gainVP(faction, 3);
	  }
	  if (f[key] == 3) {
	    game_mod.gainVP(faction, 2);
	  }
	  if (f[key] == 2) {
	    let faction_hand_idx = game_mod.returnFactionHandIdx(player, key);
 	    game_mod.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+this.game.players_info[player-1].factions[faction_hand_idx]);
	    game_mod.game.queue.push(`DEAL\t1\t${player}\t1`);
	  }
	}

	game_mod.displayVictoryTrack();

      }
    }
    deck['013'] = { 
      img : "cards/HIS-013.svg" , 
      name : "Schmalkaldic League" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {

        state.events.schmalkaldic_league = 1;

      }
    }
    deck['014'] = { 
      img : "cards/HIS-014.svg" , 
      name : "Paul III" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.leo_x = 0;
	game_mod.game.state.leaders.clement_vii = 0;
	game_mod.removeCardFromGame('010'); // remove clement vii
	game_mod.game.state.leaders.paul_iii = 1;
	return 1;
      },

    }
    deck['015'] = { 
      img : "cards/HIS-015.svg" , 
      name : "Society of Jesus" ,
      ops : 2 ,
      turn : 5 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(game_mod, player) {

	let papacy = game_mod.returnPlayerOfFaction("papacy");
	if (game_mod.game.player === papacy) {

	  game_mod.game.state.events.papacy_may_found_jesuit_universities = 1;

	  return 0;
	}

	return 0;
      }
    }
    deck['016'] = { 
      img : "cards/HIS-016.svg" , 
      name : "mandatory" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['017'] = { 
      img : "cards/HIS-017.svg" , 
      name : "Council of Trent" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['018'] = { 
      img : "cards/HIS-018.svg" , 
      name : "Dragu" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
    }
    deck['019'] = { 
      img : "cards/HIS-019.svg" , 
      name : "Edward VI" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.edward_vi = 1;
	return 1;
      },
    }
    deck['020'] = { 
      img : "cards/HIS-020.svg" , 
      name :"Henry II" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.francis_i = 0;
	game_mod.game.state.leaders.henry_ii = 1;
	return 1;
      },
    }
    deck['021'] = { 
      img : "cards/HIS-021.svg" , 
      name : "Mary I" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.henry_viii = 0;
	game_mod.game.state.leaders.edward_vi = 0;
	game_mod.game.state.leaders.mary_i = 1;
	game_mod.removeCardFromGame('021');
	return 1;
      },
    }
    deck['022'] = { 
      img : "cards/HIS-022.svg" , 
      name : "Julius III" ,
      ops : 2 ,
      turn : 7 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.leo_x = 0;
	game_mod.game.state.leaders.clement_vii = 0;
	game_mod.game.state.leaders.paul_iii = 0;
	game_mod.game.state.leaders.julius_iii = 1;
	game_mod.removeCardFromGame('010');
	game_mod.removeCardFromGame('014');
	return 1;
      },
    }
    deck['023'] = { 
      img : "cards/HIS-023.svg" , 
      name : "Elizabeth I" ,
      ops : 2 ,
      turn : 0 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(game_mod, player) {
	game_mod.game.state.leaders.henry_viii = 0;
	game_mod.game.state.leaders.edward_vi = 0;
	game_mod.game.state.leaders.mary_i = 0;
	game_mod.game.state.leaders.elizabeth_i = 1;
	game_mod.removeCardFromGame('019');
	game_mod.removeCardFromGame('021');
	return 1;
      },
    }
    deck['024'] = { 
      img : "cards/HIS-024.svg" , 
      name : "Arquebusiers" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['025'] = { 
      img : "cards/HIS-025.svg" , 
      name : "Field Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['026'] = { 
      img : "cards/HIS-026.svg" , 
      name : "Mercenaries Bribed" ,
      ops : 3 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['027'] = { 
      img : "cards/HIS-027.svg" , 
      name : "Mercenaries Grow Restless" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['028'] = { 
      img : "cards/HIS-028.svg" , 
      name : "Siege Mining" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['030'] = { 
      img : "cards/HIS-030.svg" , 
      name : "Tercios" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['031'] = { 
      img : "cards/HIS-031.svg" , 
      name : "Foul Weather" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['032'] = { 
      img : "cards/HIS-032.svg" , 
      name : "Gout" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "move") {
          return { event : 'gout', html : '<li class="option" id="gout">play gout</li>' };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player) {
        if (menu == "move") {
	  for (let i = 0; i < this.game.deck[0].fhand.length; i++) {
	    if (this.game.deck[0].fhand[i].includes('032')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player) {
        if (menu == "move") {
alert("WE PLAYED GOUT");
          his_self.endTurn();
          his_self.updateLog("looks like someone got gout");
        }
        return 0;
      },
    }
    deck['033'] = { 
      img : "cards/HIS-033.svg" , 
      name : "Landsknechts" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['034'] = { 
      img : "cards/HIS-034.svg" , 
      name : "Professional Rowers" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['035'] = { 
      img : "cards/HIS-035.svg" , 
      name : "Siege Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['036'] = { 
      img : "cards/HIS-036.svg" , 
      name : "Swiss Mercenaries" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['037'] = { 
      img : "cards/HIS-037.svg" , 
      name : "The Wartburg" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['038'] = { 
      img : "cards/HIS-038.svg" , 
      name : "Halley's Comet" ,
      ops : 2 ,
      turn : 3 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['039'] = { 
      img : "cards/HIS-039.svg" , 
      name : "Ausburg Confession" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['040'] = { 
      img : "cards/HIS-040.svg" , 
      name : "MachiaveIIi: The Prince" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['041'] = { 
      img : "cards/HIS-041.svg" , 
      name : "Marburg Colloquy" ,
      ops : 5 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['042'] = { 
      img : "cards/HIS-042.svg" , 
      name : "Roxelana" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['043'] = { 
      img : "cards/HIS-043.svg" , 
      name : "Zwingli Dons Armor" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['044'] = { 
      img : "cards/HIS-044.svg" , 
      name : "Affair of the Placards" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['045'] = { 
      img : "cards/HIS-045.svg" , 
      name : "Clavin Expelled" ,
      ops : 1 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['046'] = { 
      img : "cards/HIS-046.svg" , 
      name : "Calvin's Insitutes" ,
      ops : 5 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['047'] = { 
      img : "cards/HIS-047.svg" , 
      name : "Copernicus" ,
      ops : 6 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['048'] = { 
      img : "cards/HIS-048.svg" , 
      name : "Galleons" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['049'] = { 
      img : "cards/HIS-049.svg" , 
      name : "Huguenot Raiders" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['050'] = { 
      img : "cards/HIS-050.svg" , 
      name : "Mercator's Map" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['051'] = { 
      img : "cards/HIS-051.svg" , 
      name : "Michael Servetus" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['052'] = { 
      img : "cards/HIS-052.svg" , 
      name : "Michelangelo" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['053'] = { 
      img : "cards/HIS-053.svg" , 
      name : "Plantations" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['054'] = { 
      img : "cards/HIS-054.svg" , 
      name : "Potosi Silver Mines " ,
      ops : 3 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['055'] = { 
      img : "cards/HIS-055.svg" , 
      name : "Jesuit Education" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['056'] = { 
      img : "cards/HIS-056.svg" , 
      name : "Ppal Inquistion" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['057'] = { 
      img : "cards/HIS-057.svg" , 
      name : "Philip of Hesse's Bigamy" ,
      ops : 2 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['058'] = { 
      img : "cards/HIS-058.svg" , 
      name : "Spanish Inquisition" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['059'] = { 
      img : "cards/HIS-059.svg" , 
      name : "Lady Jane Grey" ,
      ops : 3 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['060'] = { 
      img : "cards/HIS-060.svg" , 
      name : "Maurice of Saxony" ,
      ops : 4 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['061'] = { 
      img : "cards/HIS-061.svg" , 
      name : "Mary Defies Council" ,
      ops : 1 ,
      turn : 7 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['062'] = { 
      img : "cards/HIS-062.svg" , 
      name : "Card" ,
      ops : 2 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['063'] = { 
      img : "cards/HIS-063.svg" , 
      name : "Dissolution of the Monasteries" ,
      ops : 4 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['064'] = { 
      img : "cards/HIS-064.svg" , 
      name : "Pilgrimage of Grace" ,
      ops : 3 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['065'] = { 
      img : "cards/HIS-065.svg" , 
      name : "A Mighty Fortress" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['066'] = { 
      img : "cards/HIS-066.svg" , 
      name : "Akinji Raiders" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['067'] = { 
      img : "cards/HIS-067.svg" , 
      name : "Anabaptists" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['068'] = { 
      img : "cards/HIS-068.svg" , 
      name : "Andrea Doria" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['069'] = { 
      img : "cards/HIS-069.svg" , 
      name : "Auld Alliance" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['070'] = { 
      img : "cards/HIS-070.svg" , 
      name : "Charles Bourbon" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['071'] = { 
      img : "cards/HIS-071.svg" , 
      name : "City State Rebels" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['072'] = { 
      img : "cards/HIS-072.svg" , 
      name : "Cloth Price Fluctuate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['073'] = { 
      img : "cards/HIS-073.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['074'] = { 
      img : "cards/HIS-074.svg" , 
      name : "Diplomatic Overture" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['075'] = { 
      img : "cards/HIS-075.svg" , 
      name : "Erasmus" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['076'] = { 
      img : "cards/HIS-076.svg" , 
      name : "Foreign Recruits" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['077'] = { 
      img : "cards/HIS-077.svg" , 
      name : "Card" ,
      ops : "Fountain of Youth" ,
      turn : 2 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['078'] = { 
      img : "cards/HIS-078.svg" , 
      name : "Frederick the Wise" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['079'] = { 
      img : "cards/HIS-079.svg" , 
      name : "Fuggers" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['080'] = { 
      img : "cards/HIS-080.svg" , 
      name : "Gabelle Revolt" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['081'] = { 
      img : "cards/HIS-081.svg" , 
      name : "Indulgence Vendor" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['082'] = { 
      img : "cards/HIS-082.svg" , 
      name : "Janissaries Rebel" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['083'] = { 
      img : "cards/HIS-083.svg" , 
      name : "John Zapolya" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['084'] = { 
      img : "cards/HIS-084.svg" , 
      name : "Julia Gonzaga" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['085'] = { 
      img : "cards/HIS-085.svg" , 
      name : "Katherina Bora" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['086'] = { 
      img : "cards/HIS-086.svg" , 
      name : "Knights of St.John" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['087'] = { 
      img : "cards/HIS-087.svg" , 
      name : "Mercenaries Demand Pay" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['088'] = { 
      img : "cards/HIS-088.svg" , 
      name : "Peasants' War" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['089'] = { 
      img : "cards/HIS-089.svg" , 
      name : "Pirate Haven" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['090'] = { 
      img : "cards/HIS-090.svg" , 
      name : "Printing Press" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['091'] = { 
      img : "cards/HIS-091.svg" , 
      name : "Ransom" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['092'] = { 
      img : "cards/HIS-092.svg" , 
      name : "Revolt in Egypt" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['093'] = { 
      img : "cards/HIS-093.svg" , 
      name : "Revolt in Ireland" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['094'] = { 
      img : "cards/HIS-094.svg" , 
      name : "Revolt of the Communeros" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['095'] = { 
      img : "cards/HIS-095.svg" , 
      name : "Sack of Rome" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['096'] = { 
      img : "cards/HIS-096.svg" , 
      name : "Sale of Moluccas" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['097'] = { 
      img : "cards/HIS-097.svg" , 
      name : "Scots Raid" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['098'] = { 
      img : "cards/HIS-098.svg" , 
      name : "Search for Cibola" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['099'] = { 
      img : "cards/HIS-099.svg" , 
      name : "Sebastian Cabot" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['100'] = { 
      img : "cards/HIS-100.svg" , 
      name : "Shipbuilding" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['101'] = { 
      img : "cards/HIS-101.svg" , 
      name : "Smallpox" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['102'] = { 
      img : "cards/HIS-102.svg" , 
      name : "Spring Preparations" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['103'] = { 
      img : "cards/HIS-103.svg" , 
      name : "Threat to Power" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['104'] = { 
      img : "cards/HIS-104.svg" , 
      name : "Trace Italienne" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['105'] = { 
      img : "cards/HIS-105.svg" , 
      name : "Treachery!" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['106'] = { 
      img : "cards/HIS-106.svg" , 
      name : "Unpaid Mercenaries" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['107'] = { 
      img : "cards/HIS-107.svg" , 
      name : "Unsanitary Camp" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['108'] = { 
      img : "cards/HIS-108.svg" , 
      name : "Venetian Alliance" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['109'] = { 
      img : "cards/HIS-109.svg" , 
      name : "Venetian Informant" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['110'] = { 
      img : "cards/HIS-110.svg" , 
      name : "War in Persia" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['111'] = { 
      img : "cards/HIS-111.svg" , 
      name : "Colonial Governor/Native Uprising" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['112'] = { 
      img : "cards/HIS-112.svg" , 
      name : "Thomas More" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['113'] = { 
      img : "cards/HIS-113.svg" , 
      name : "Imperial Coronation" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['114'] = { 
      img : "cards/HIS-114.svg" , 
      name : "La Forets's Embassy in Istanbul" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['115'] = { 
      img : "cards/HIS-115.svg" , 
      name : "Thomos Cromwell" ,
      ops : 3 ,
      turn : 4 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['116'] = { 
      img : "cards/HIS-116.svg" , 
      name : "Rough Wooing" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

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

