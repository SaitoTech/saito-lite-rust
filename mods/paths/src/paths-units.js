
  returnPowerOfUnit(unit) {

    try { if (!unit.ckey) { unit = this.game.units[unit]; } } catch (err) {}

    let allied = ["FR", "RU", "BR", "BE", "IT", "US"];
    let central = ["GE", "AH", "TU", "BG"];

    if (allied.includes(unit.ckey)) { return "allies"; }
    if (central.includes(unit.ckey)) { return "central"; }

    return "";

  }


  importUnit(key, obj) {

    if (!this.game.units) { this.game.units = {}; }

    //
    // avoid re-importing
    //
    if (this.game.units[key]) { return; }

    obj.key = key;

    if (!obj.combat)	{ obj.combat 	= 5; }
    if (!obj.loss)	{ obj.loss 	= 3; }
    if (!obj.movement)	{ obj.movement 	= 3; }
    if (!obj.rcombat)	{ obj.rcombat 	= 5; }
    if (!obj.rloss)	{ obj.rloss 	= 3; }
    if (!obj.rmovement)	{ obj.rmovement = 3; }

    if (!obj.damaged)	{ obj.damaged = false; }

    this.game.units[key] = obj;

  }

  returnUnitImage(spacekey, idx) {

    let unit = this.game.spaces[spacekey].units[idx];
    let key = unit.key;

    if (unit.damaged) {
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile" />`;
    } else {
      return `<img src="/paths/img/army/${key}.png" class="army-tile" />`;
    }

  }

  cloneUnit(unitkey) {
    return JSON.parse(JSON.stringify(this.game.units[unitkey]));
  }

  addUnitToSpace(unitkey, spacekey) {
    this.game.spaces[spacekey].units.push(this.cloneUnit(unitkey));
console.log("SPACE: " + spacekey + ": " + JSON.stringify(this.game.spaces[spacekey]));
  }

  damageUnitInSpace(unitkey, spacekey) {
    if (!this.game.spaces[spacekey]) { return; }
    if (!this.game.spaces[spacekey].includes(unitkey)) { return; }
    for (let i = 0; i < this.game.spaces[spacekey].units.length; i++) {
      let u = this.game.spaces[spacekey].units[i];
      if (u.key === unitkey) {
	if (u.damaged == false) { u.damaged = true; }
      }
    }
  }


