

  importUnit(name, obj) {

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
    //obj = this.addEvents(obj);
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

  newReformer(faction, reformer) {
    for (let key in this.units) {
      if (this.units[key].type === reformer) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = faction;
	return new_unit;
      }
    }
    return null;
  }
  newDebater(faction, debater) {
    for (let key in this.units) {
      if (this.units[key].type === debater) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = faction;
	new_unit.committed = 0;
	return new_unit;
      }
    }
    return null;
  }
  commitDebater(faction, debater) {
    let his_self = this;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	this.game.state.debaters[i].committed = 1;
	this.units[debater].onCommitted(his_self, this.game.state.debaters[i].owner);
      }
    }
  }


  newExplorer(faction, explorer) {
    for (let key in this.units) {
      if (this.units[key].type === explorer) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = faction;
	new_unit.committed = 0;
	return new_unit;
      }
    }
    return null;
  }
  commitExplorer(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].key == explorer) {
	this.game.state.explorer[i].committed = 1;
	this.units[explorer].onCommitted(his_self, this.game.state.explorers[i].owner);
      }
    }
  }


  newConquistador(faction, explorer) {
    for (let key in this.units) {
      if (this.units[key].type === explorer) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = faction;
	new_unit.committed = 0;
	return new_unit;
      }
    }
    return null;
  }
  commitConquistador(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      if (this.game.state.conquistadors[i].key == explorer) {
	this.game.state.conquistadors[i].committed = 1;
	this.units[explorer].onCommitted(his_self, this.game.state.conquistadors[i].owner);
      }
    }
  }



  newPersonage(faction, personage) {
    for (let key in this.units) {
      if (this.units[key].type === personage) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = faction;
	return new_unit;
      }
    }
    return null;
  }



