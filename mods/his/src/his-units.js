

  importUnit(name, obj) {

    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }

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

  newDebater(faction, debater) {
    for (let key in this.units) {
      if (this.units[key].type === debater) {
	let new_unit = JSON.parse(JSON.stringify(this.units[key]));
	new_unit.owner = faction;
	return new_unit;
      }
    }
    return null;
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

