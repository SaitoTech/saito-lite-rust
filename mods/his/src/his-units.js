
  importUnit(name, obj) {

    if (obj.type == null)               { obj.type = name; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.active == null)		{ obj.active = 0; } // if bonus is active for debaters
    if (obj.besieged == null)           { obj.besieged = 0; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)             { obj.loaned = false; }
    if (obj.key == null)                { obj.key = name; }
    if (obj.gout == null)               { obj.gout = false; }
    if (obj.locked == null)		{ obj.locked = 0; }
    if (obj.lost_field_battle == null)	{ obj.lost_field_battle = 0; }
    if (obj.lost_naval_battle == null)	{ obj.lost_naval_battle = 0; }
    if (obj.relief_force == null)	{ obj.relief_force = false; }
    if (obj.already_moved == null)	{ obj.already_moved = 0; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (obj.returnCardImage == null) {
      obj.returnCardImage = () => { return ""; }
    }

    this.addEvents(obj);
    this.units[name] = obj;

  }

  newUnit(faction, type) {
    for (let key in this.units) {
      if (this.units[key].type === type) {
        let new_unit = JSON.parse(JSON.stringify(this.units[key]));
        new_unit.owner = faction;
        return new_unit;
      }
    }
    return null;
  }

  importArmyLeader(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = true; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = 0; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.army[name]) {
      this.addEvents(obj);
      this.army[name] = obj;
    }
  }

  importNavyLeader(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "both"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = true; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = 0; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.navy[name]) {
      this.addEvents(obj);
      this.navy[name] = obj;
    }
  }

  importWife(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = 0; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.wives[name]) {
      this.addEvents(obj);
      this.wives[name] = obj;
    }
  }

  importReformer(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = true; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = 0; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.reformers[name]) {
      this.addEvents(obj);
      this.reformers[name] = obj;
    }
  }

  returnReformerName(ref) {
    if (this.reformers[ref]) { return this.reformers[ref].name; }
    return "Unknown";
  }

  importDebater(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = true; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = 0; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.power == null)		{ obj.power = 0; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (obj.returnCardImage == null) {
      obj.returnCardImage = () => {
        let tile_f = "/his/img/tiles/debaters/" + obj.img;
        let tile_b = tile_f.replace('.svg', '_back.svg');
	return `
	  <div class="debater-card" id="${obj.key}" style="background-image: url('${tile_f}'); background-size: cover"></div>	
	`;
      }
    }

    if (!this.debaters[name]) {
      this.debaters[name] = obj;
      this.addEvents(obj);
    }
  }

  importConquistador(name, obj) {
    if (obj.faction == null)            { obj.faction = ""; }
    if (obj.type == null)               { obj.type = name; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.power == null)		{ obj.power = 0; }
    if (!this.conquistadors[name]) {
      this.addEvents(obj);
      this.conquistadors[name] = obj;
    }
  }

  importExplorer(name, obj) {
    if (obj.faction == null)            { obj.faction = ""; }
    if (obj.type == null)               { obj.type = name; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.power == null)		{ obj.power = 0; }
    if (!this.explorers[name]) {
      this.addEvents(obj);
      this.explorers[name] = obj;
    }
  }

  returnLeaderName(key) {
    if (this.army[leader]) { return this.army[leader].name; }
    if (this.name[leader]) { return this.navy[leader].name; }
    return key;
  }

  returnConquistadorName(key) {
    if (this.conquistadors[key]) { return this.conquistadors[key].name; }
    return "Conquistador";
  }
  returnExplorerName(key) {
    if (key == "Cabot" || key == "cabot") { return "Sebastian Cabot"; }
    if (this.explorers[key]) { return this.explorers[key].name; }
    return "Explorer";
  }

  returnAvailableExplorers(faction="") {
    let unavailable = [];
    let available = [];
    for (let z = 0; z < this.game.state.explorations.length; z++) {
      let exp = this.game.state.explorations[z];
      if (exp.faction == faction) {
	if (exp.explorer_lost == 1) {
	  unavailable.push(exp.explorer);
        }
      }
    }
    for (let key in this.explorers) {
      if (this.explorers[key].faction == faction) {
        if (!unavailable.includes(key)) {
	  available.push(key);
        }
      }
    }
    return available;
  }

  returnAvailableConquistadors(faction="") {
    let unavailable = [];
    let available = [];
    for (let z = 0; z < this.game.state.conquests.length; z++) {
      let exp = this.game.state.conquests[z];
      if (exp.faction == faction) {
	if (exp.conquistador_lost == 1) {
	  unavailable.push(exp.conquistador);
        }
      }
    }
    for (let key in this.conquistadors) {
      if (this.conquistadors[key].faction == faction) {
        if (!unavailable.includes(key)) {
	  available.push(key);
        }
      }
    }
    return available;
  }

  removeArmyLeader(faction, space, leader) {

    if (!this.army[leader]) {
      console.log("ARMY LEADER: " + leader + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === leader) {
	space.units[faction].splice(i, 1);
      }
    }

    for (let i = 0; i < this.game.state.players_info.length; i++) {
      let c = this.game.state.players_info[i].captured;
      for (let ii = 0; ii < c.length; ii++) {
        if (c[ii].leader == leader) {
	  c.splice(ii, 1);
	}
      }
    }

  }


  addArmyLeader(faction, space, leader) {
    if (!this.army[leader]) {
      console.log("ARMY LEADER: " + leader + " not found");
      return;
    }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.army[leader]);
    space.units[faction][space.units[faction].length-1].owner = faction; 
  }


  addNavyLeader(faction, space, leader) {
    if (!this.navy[leader]) {
      console.log("NAVY LEADER: " + leader + " not found");
      return;
    }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let z = 0; z < space.units[faction].length; z++) {
      if (space.units[faction][z].type == leader) { return 1; }
    }
    space.units[faction].push(this.navy[leader]);
    space.units[faction][space.units[faction].length-1].owner = faction; 
  }


  removeReformer(faction, space, reformer) {
    if (!this.reformers[reformer]) {
      console.log("REFORMER: " + reformer + " not found");
      return;
    }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === reformer) {
	space.units[faction].splice(i, 1);
      }
    }
  }

  addReformer(faction, space, reformer) {
    if (!this.reformers[reformer]) {
      console.log("REFORMER: " + reformer + " not found");
      return;
    }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.reformers[reformer]);
    space.units[faction][space.units[faction].length-1].owner = faction; 
    if (reformer == "cranmer-reformer") { this.game.state.events.cranmer_active = 1; }
  }

  returnDebaterName(key) {
    if (this.debaters[key]) { return this.debaters[key].name; }
    return "Debater";
  }

  removeDebater(faction, debater) {
    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].type == debater) { 
	this.game.state.debaters.splice(i, 1);
      }
    }
  }

  disgraceDebater(debater) { return this.burnDebater(debater, 1); }
  burnDebater(debater, disgraced = 0) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    //
    // remove the debater
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].type == debater) { 

	if (this.game.state.debaters[i].owner == "papacy") {
	  this.updateLog("Protestants gain " + this.game.state.debaters[i].power + " VP");
	  this.updateLog(this.popup(debater) + " disgraced");
	} else {
	  this.updateLog("Papacy gains " + this.game.state.debaters[i].power + " VP");
	  this.updateLog(this.popup(debater) + " burned");
	}

	this.game.state.debaters.splice(i, 1);
        this.game.state.burned.push(debater);

        let x = debater.split("-");

	//
	// also remove reformer (if exists)
	//
	try {
	  let reformer = x[0] + "-reformer";
          let s = this.returnSpaceOfPersonage(this.debaters[debater].faction, reformer);
	  if (s) { this.removeReformer(this.debaters[debater].faction, reformer); }
	  // re-display space
	  this.displaySpace(s);
	} catch (err) {
	  // reformer does not exist
	}
      }
    }

    //
    //
    //
    this.displayVictoryTrack();

  }

  addDebater(faction, debater) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].type === debater) {
	console.log("DEBATER: " + debater + " already added");
	return;
      }
    }

    this.game.state.debaters.push(this.debaters[debater]);
    this.game.state.debaters[this.game.state.debaters.length-1].owner = faction; 
    this.game.state.debaters[this.game.state.debaters.length-1].committed = 0; 
    if (debater == "cranmer-debater") { this.game.state.events.cranmer_active = 1; }

  }

  removeConquistador(faction, conquistador) {
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      if (this.game.state.conquistadors[i].type === conquistador) {
	this.game.state.conquistadors.splice(i, 1);
	return;
      }
    }
  }

  removeExplorer(faction, explorer) {
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].type === explorer) {
	this.game.state.explorers.splice(i, 1);
	return;
      }
    }
  }

  addExplorer(faction, explorer) {

    if (!this.explorers[explorer]) {
      console.log("EXPLORER: " + explorer + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].type === explorer) {
	console.log("EXPLORER: " + explorer + " already added");
	return;
      }
    }

    this.game.state.explorers.push(this.explorers[explorer]);
  }

  addConquistador(faction, conquistador) {

    if (!this.conquistadors[conquistador]) {
      console.log("CONQUISTADOR: " + conquistador + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.conquistador.length; i++) {
      if (this.game.state.conquistador[i].type === conquistador) {
	return;
      }
    }

    this.game.state.conquistador.push(this.conquistadors[conquistador]);

  }

  isActive(debater) { return this.isDebaterActive(debater); }
  isDebaterActive(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].active == 1) { return 1; }
      }
    }
    return 0;
  }

  isDebaterDisgraced(debater) { return this.isBurned(debater); }
  isDisgraced(debater) { return this.isBurned(debater); }
  isDebaterBurned(debater) { return this.isBurned(debater); }
  isBurned(debater) { if (this.game.state.burned.includes(debater)) { return true; } return false; }
  isCommitted(debater) { return this.isDebaterCommitted(debater); }
  isDebaterCommitted(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 1) { return 1; }
      }
    }
    // sometimes debaters will be excommunicated without being committed
    for (let i = 0; i < this.game.state.excommunicated.length; i++) {
      if (this.game.state.excommunicated[i].debater) {
	if (this.game.state.excommunicated[i].debater.type == debater) {
	  if (this.game.state.debaters[i].committed == 1) { return 1; }
	  // sorry, you're committed !
	  return 1;
        }
      }
    }
    return 0;
  }

  isDebaterAvailable(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 0) { return 1; }
      }
    }
    return 0;
  }

  deactivateDebater(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key === debater) {
        this.game.state.debaters[i].active = 0;
      }
    }
  }
  deactivateDebaters() {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      this.game.state.debaters[i].active = 0;
    }
  }

  commitDebater(faction, debater, activate=1) {

    let his_self = this;

    //
    // we can only commit 1 debater for the bonus each impulse, so note it if so
    //
    if (activate == 1) {
      this.game.state.debater_committed_this_impulse[faction] = 1;
    }

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	this.game.state.debaters[i].committed = 1;
	this.game.state.debaters[i].active = activate; // if the bonus is active
	this.debaters[debater].onCommitted(his_self, this.game.state.debaters[i].owner);
      }
    }
  }

  commitExplorer(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].key == explorer) {
	this.game.state.explorer[i].committed = 1;
	this.explorers[explorer].onCommitted(his_self, this.game.state.explorers[i].owner);
      }
    }
  }

  commitConquistador(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      if (this.game.state.conquistadors[i].key == explorer) {
	this.game.state.conquistadors[i].committed = 1;
	this.conquistadors[conquistador].onCommitted(his_self, this.game.state.conquistadors[i].owner);
      }
    }
  }

  //
  // each faction has a limited number of physical tokens to use to 
  // represent units that are available. the game will auto-reallocate
  // these tokens to teh extent possible.
  // 
  updateOnBoardUnits() { this.game.state.board_updated = 0; } // setting to 0 forces update next displaySpace
  returnOnBoardUnits(faction="") {

    let my_spaces = {};
    let available_units = {};
        available_units['regular'] = {};
        available_units['squadron'] = {};
        available_units['cavalry'] = {};
        available_units['corsair'] = {};
    let deployed_units = {};

    //
    // each faction has a separate token mix
    //
    if (faction == "protestant") {
      available_units['regular']['1'] = 8;    
      available_units['regular']['2'] = 5;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 2;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
      available_units['squadron']['1'] = 0;    
    }
    if (faction == "england") {
      available_units['regular']['1'] = 9;    
      available_units['regular']['2'] = 5;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 2;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
      available_units['squadron']['1'] = 5;    
    }
    if (faction == "ottoman") {
      available_units['regular']['1'] = 11;    
      available_units['regular']['2'] = 7;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 4;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
      available_units['squadron']['1'] = 9;
    }
    if (faction == "france") {
      available_units['regular']['1'] = 10;    
      available_units['regular']['2'] = 5;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 3;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
      available_units['squadron']['1'] = 5;    
    }
    if (faction == "papacy") {
      available_units['regular']['1'] = 7;    
      available_units['regular']['2'] = 4;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 2;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
      available_units['squadron']['1'] = 2;
    }
    if (faction == "hapsburg") {
      available_units['regular']['1'] = 12;    
      available_units['regular']['2'] = 6;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 3;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
      available_units['squadron']['1'] = 6;    
    }

    if (faction == "scotland") {
      available_units['regular']['1'] = 2;    
      available_units['regular']['2'] = 1;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
      available_units['squadron']['1'] = 1;
    }
    if (faction == "genoa") {
      available_units['regular']['1'] = 2;    
      available_units['regular']['2'] = 2;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
      available_units['squadron']['1'] = 1;    
    }
    if (faction == "venice") {
      available_units['regular']['1'] = 4;    
      available_units['regular']['2'] = 4;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;
      available_units['squadron']['1'] = 4;    
    }
    if (faction == "hungary") {
      available_units['regular']['1'] = 3;    
      available_units['regular']['2'] = 3;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 1;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
      available_units['squadron']['1'] = 0;
    }
    if (faction == "independent") {
      available_units['regular']['1'] = 3;    
      available_units['regular']['2'] = 3;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
      available_units['squadron']['1'] = 0;
    }

    //
    // find out what units I supposedly have deployed
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units) {
        if (this.game.spaces[key].units[faction].length > 0) {
          for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
      	    if (!my_spaces[key]) { my_spaces[key] = {}; }
	    let u = this.game.spaces[key].units[faction][i];
	    if (u.type == "squadron" || u.type == "corsair" || u.type == "regular" || u.type == "mercenary" || u.type == "cavalry") {
              if (!my_spaces[key][u.type]) { my_spaces[key][u.type] = 0; }
              my_spaces[key][this.game.spaces[key].units[faction][i].type]++;
	    }
          }
        }
      }
    }
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units) {
        if (this.game.navalspaces[key].units[faction].length > 0) {
          for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
      	    if (!my_spaces[key]) { my_spaces[key] = {}; }
	    let u = this.game.navalspaces[key].units[faction][i];
	    if (u.type == "squadron" || u.type == "corsair") {
              if (!my_spaces[key][u.type]) { my_spaces[key][u.type] = 0; }
              my_spaces[key][u.type]++;
            }
          }
        }
      }
    }

    //
    //
    //
    for (let key in my_spaces) {
      deployed_units[key] = {};
      deployed_units[key]['regular'] = {};
      deployed_units[key]['regular']['1'] = 0;
      deployed_units[key]['regular']['2'] = 0;
      deployed_units[key]['regular']['3'] = 0;
      deployed_units[key]['regular']['4'] = 0;
      deployed_units[key]['regular']['5'] = 0;
      deployed_units[key]['regular']['6'] = 0;
      deployed_units[key]['mercenary'] = {};
      deployed_units[key]['mercenary']['1'] = 0;
      deployed_units[key]['mercenary']['2'] = 0;
      deployed_units[key]['mercenary']['3'] = 0;
      deployed_units[key]['mercenary']['4'] = 0;
      deployed_units[key]['mercenary']['5'] = 0;
      deployed_units[key]['mercenary']['6'] = 0;
      deployed_units[key]['cavalry'] = {};
      deployed_units[key]['cavalry']['1'] = 0;
      deployed_units[key]['cavalry']['2'] = 0;
      deployed_units[key]['cavalry']['3'] = 0;
      deployed_units[key]['cavalry']['4'] = 0;
      deployed_units[key]['cavalry']['5'] = 0;
      deployed_units[key]['cavalry']['6'] = 0;
      deployed_units[key]['squadron'] = {};
      deployed_units[key]['squadron']['1'] = 0;
      deployed_units[key]['corsair'] = {};
      deployed_units[key]['corsair']['1'] = 0;
    }


    //
    // order spaces 
    //
    let continue_to_apportion = true;
    while (continue_to_apportion == true) {

      continue_to_apportion = false;
      let changed_anything = false;

      for (let key in my_spaces) {

	if (my_spaces[key]['regular'] >= 6 && available_units['regular']['6'] > 0) { 
	  my_spaces[key]['regular'] -= 6;
	  available_units['regular']['6']--;
	  deployed_units[key]['regular']['6']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 6 && available_units['regular']['6'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 6;
	  available_units['regular']['6']--;
	  deployed_units[key]['mercenary']['6']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['cavalry'] >= 6 && available_units['cavalry']['6'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['cavalry'] -= 6;
	  available_units['regular']['6']--;
	  deployed_units[key]['cavalry']['6']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	// !5

	if (my_spaces[key]['regular'] >= 4 && available_units['regular']['4'] > 0) { 
	  my_spaces[key]['regular'] -= 4;
	  available_units['regular']['4']--;
	  deployed_units[key]['regular']['4']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 4 && available_units['regular']['4'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 4;
	  available_units['regular']['4']--;
	  deployed_units[key]['mercenary']['4']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['cavalry'] >= 4 && available_units['regular']['4'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['cavalry'] -= 4;
	  available_units['regular']['4']--;
	  deployed_units[key]['cavalry']['4']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	// !3

	if (my_spaces[key]['regular'] >= 2 && available_units['regular']['2'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['regular'] -= 2;
	  available_units['regular']['2']--;
	  deployed_units[key]['regular']['2']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 2 && available_units['regular']['2'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 2;
	  available_units['regular']['2']--;
	  deployed_units[key]['mercenary']['2']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['cavalry'] >= 2 && available_units['regular']['2'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['cavalry'] -= 2;
	  available_units['regular']['2']--;
	  deployed_units[key]['cavalry']['2']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	// !1

	if (my_spaces[key]['regular'] >= 1 && available_units['regular']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['regular'] -= 1;
	  available_units['regular']['1']--;
	  deployed_units[key]['regular']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 1 && available_units['regular']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 1;
	  available_units['regular']['1']--;
	  deployed_units[key]['mercenary']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['cavalry'] >= 1 && available_units['regular']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['cavalry'] -= 1;
	  available_units['regular']['1']--;
	  deployed_units[key]['cavalry']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	if (my_spaces[key]['squadron'] >= 1 && available_units['squadron']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['squadron'] -= 1;
	  available_units['squadron']['1']--;
	  deployed_units[key]['squadron']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['corsair'] >= 1 && available_units['squadron']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['corsair'] -= 1;
	  available_units['squadron']['1']--;
	  deployed_units[key]['corsair']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

      }

      if (changed_anything == true) {
        continue_to_apportion = true;
      }

    }

    let results = {};
    results.deployed = deployed_units;
    results.available = available_units;
    results.missing = {};
    for (let key in this.game.spaces) {
      results.missing[key] = {};
      results.missing[key]['regular'] = {}
      results.missing[key]['regular']['1'] = 0;
      results.missing[key]['regular']['2'] = 0;
      results.missing[key]['regular']['3'] = 0;
      results.missing[key]['regular']['4'] = 0;
      results.missing[key]['regular']['5'] = 0;
      results.missing[key]['regular']['6'] = 0;
      results.missing[key]['mercenary'] = {};
      results.missing[key]['mercenary']['1'] = 0;
      results.missing[key]['mercenary']['2'] = 0;
      results.missing[key]['mercenary']['3'] = 0;
      results.missing[key]['mercenary']['4'] = 0;
      results.missing[key]['mercenary']['5'] = 0;
      results.missing[key]['mercenary']['6'] = 0;
      results.missing[key]['cavalry'] = {};
      results.missing[key]['cavalry']['1'] = 0;
      results.missing[key]['cavalry']['2'] = 0;
      results.missing[key]['cavalry']['3'] = 0;
      results.missing[key]['cavalry']['4'] = 0;
      results.missing[key]['cavalry']['5'] = 0;
      results.missing[key]['cavalry']['6'] = 0;
      results.missing[key]['squadron'] = {};
      results.missing[key]['squadron']['1'] = 0;
    }

    //
    // pieces we are having difficulty assigning
    //
    for (let key in my_spaces) {
      if (my_spaces[key]['regular'] > 0) { 
	if (!results.missing[key]) { results.missing[key] = {}; }
	results.missing[key]['regular']['1'] = my_spaces[key]['regular'];
	results.overcapacity = 1;
      }	
      if (my_spaces[key]['mercenary'] > 0) { 
	if (!results.missing[key]) { results.missing[key] = {}; }
	results.missing[key]['mercenary']['1'] = my_spaces[key]['mercenary'];
	results.overcapacity = 1;
      }	
      if (my_spaces[key]['cavalry'] > 0) { 
	if (!results.missing[key]) { results.missing[key] = {}; }
	results.missing[key]['cavalry']['1'] = my_spaces[key]['cavalry'];
	results.overcapacity = 1;
      }	
    }

    this.game.state.board_updated = new Date().getTime();

    return results;

  }


  returnNumberOfUnitsAvailableForConstruction(faction, unittype) {

    //
    // TODO -- implement limits on squadron and corsair construction
    //
    if (unittype === "corsair") { unittype = "squadron"; }
    if (unittype === "cavalry" && faction == "ottoman") { unittype = "regular"; }
    if (unittype === "mercenary") { unittype = "regular"; }

    let res = this.returnOnBoardUnits(faction);

    let amount_over_capacity = 0;
    for (let key in res.missing) {
      if ((unittype == "regular" && res.missing[key]['regular']['1'] > 0) || (unittype == "mercenary" && res.missing[key]['mercenary']['1'] > 0) || (unittype == "regular" && res.missing[key]['cavalry']['1'] > 0)) {
        return 0;
      }
    }

    let x = 0;

    if (res.available[unittype]['1'] > 0) { x += (1 * res.available[unittype]['1']); }
    if (res.available[unittype]['2'] > 0) { x += (2 * res.available[unittype]['2']); }
    if (res.available[unittype]['3'] > 0) { x += (3 * res.available[unittype]['3']); }
    if (res.available[unittype]['4'] > 0) { x += (4 * res.available[unittype]['4']); }
    if (res.available[unittype]['5'] > 0) { x += (5 * res.available[unittype]['5']); }
    if (res.available[unittype]['6'] > 0) { x += (6 * res.available[unittype]['6']); }

    //
    // squadrons and corsairs have construction limits
    //
    if (unittype == "squadron") {
      if (this.game.state.ships_destroyed[faction]) {
        if (this.game.state.ships_destroyed[faction] > 0) {
	  x -= this.game.state.ships_destroyed[faction];
	  if (x < 0) { x = 0; }
	}
      }
    }

    return x;

  }




