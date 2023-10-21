
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

  returnUnitImage(key) {

    let unit = this.game.units[key];

    if (unit.damaged) {
      return `<img src="/paths/img/tiles/${key}_back.png" class="army-tile" />`;
    } else {
      return `<img src="/paths/img/tiles/${key}.png" class="army-tile" />`;
    }

  }

  addUnitToSpace(unitkey, spacekey) {
    if (!this.game.spaces[spacekey]) { return; }
    if (!this.game.spaces[spacekey].units) { return; }
    if (this.game.spaces[spacekey].units.includes(unitkey)) { return; }
    this.game.spaces[spacekey].units.push(unitkey);
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


