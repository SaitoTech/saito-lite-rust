
  importUnit(name, obj) {

    if (obj.type == null)               { obj.type = "unit"; }
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
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)             { obj.loaned = false; }
    if (obj.key == null)                { obj.key = name; }
    if (obj.gout == null)               { obj.gout = false; }
    if (obj.locked == null)		{ obj.locked = false; }
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
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.army[name] = obj;
  }

  importNavyLeader(name, obj) {
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
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.navy[name] = obj;
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
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.wives[name] = obj;
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
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.reformers[name] = obj;
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
    if (obj.besieged == null)           { obj.besieged = false; }
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

    this.addEvents(obj);
    this.debaters[name] = obj;
  }

  importExplorer(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
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
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.explorers[name] = obj;
  }

  importConquistador(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
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
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.conquistadors[name] = obj;
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

  }

  addWife(faction, wife) {

    if (!this.wives[wife]) {
      console.log("WIFE: " + wife + " not found");
      return;
    }

    this.game.state.wives.push(this.wives[wife]);
    this.game.state.wives[this.game.state.wives.length-1].owner = faction; 

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
  addDebater(faction, debater) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    this.game.state.debaters.push(this.debaters[debater]);
    this.game.state.debaters[this.game.state.debaters.length-1].owner = faction; 
    this.game.state.debaters[this.game.state.debaters.length-1].committed = 0; 

  }

  addExplorer(faction, explorer) {

    if (!this.explorers[explorer]) {
      console.log("EXPLORER: " + explorer + " not found");
      return;
    }

    this.game.state.explorers.push(this.explorers[explorer]);
  }

  addConquistador(faction, conquistador) {

    if (!this.conquistadors[conquistador]) {
      console.log("CONQUISTADOR: " + conquistador + " not found");
      return;
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
  isCommitted(debater) { return this.isDebaterCommitted(debater); }
  isDebaterCommitted(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 1) { return 1; }
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



