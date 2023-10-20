
  importUnit(key, obj) {

    if (!this.units) { this.units = {}; }

    obj.key = key;

    if (!obj.combat)	{ obj.combat 	= 5; }
    if (!obj.loss)	{ obj.loss 	= 3; }
    if (!obj.movement)	{ obj.movement 	= 3; }
    if (!obj.rcombat)	{ obj.rcombat 	= 5; }
    if (!obj.rloss)	{ obj.rloss 	= 3; }
    if (!obj.rmovement)	{ obj.rmovement = 3; }

    if (!obj.damaged)	{ obj.damaged = false; }
    if (obj.returnTileImage == null) {
      obj.returnTileImage = () => { return ""; }
    }

    this.addEvents(obj);
    this.units[name] = obj;

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


