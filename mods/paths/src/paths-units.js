
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

    if (!obj.name)      { obj.name      = "Unknown"; }
    if (!obj.army)	{ obj.army 	= 0; }
    if (!obj.corps)	{ obj.corps 	= 0; }
    if (!obj.combat)	{ obj.combat 	= 5; }
    if (!obj.loss)	{ obj.loss 	= 3; }
    if (!obj.movement)	{ obj.movement 	= 3; }
    if (!obj.rcombat)	{ obj.rcombat 	= 5; }
    if (!obj.rloss)	{ obj.rloss 	= 3; }
    if (!obj.rmovement)	{ obj.rmovement = 3; }

    if (!obj.attacked)	{ obj.attacked  = 0; }
    if (!obj.moved)	{ obj.moved     = 0; }

    if (!obj.damaged)	{ obj.damaged = false; }
    if (!obj.destroyed)	{ obj.destroyed = false; }
    if (!obj.spacekey)  { obj.spacekey = ""; }

    if (key.indexOf("army") > -1) { obj.army = 1; } else { obj.corps = 1; }

    this.game.units[key] = obj;

  }

  moveUnit(sourcekey, sourceidx, destinationkey) {
    let unit = this.game.spaces[sourcekey].units[sourceidx];
    this.game.spaces[sourcekey].units[sourceidx].moved = 1;
    this.game.spaces[sourcekey].units.splice(sourceidx, 1);
    if (!this.game.spaces[destinationkey].units) { this.game.spaces[destinationkey].units = []; }
    this.game.spaces[destinationkey].units.push(unit);
    unit.spacekey = destinationkey;
    this.displaySpace(sourcekey);
    this.displaySpace(destinationkey);
  }

  returnUnitImage(unit, just_link=false) {
    let key = unit.key;
    if (unit.damaged) {
      if (just_link) { return `/paths/img/army/${key}_back.png`; }
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile" />`;
    } else {
      if (just_link) { return `/paths/img/army/${key}.png`; }
      return `<img src="/paths/img/army/${key}.png" class="army-tile" />`;
    }
  }
  returnUnitImageWithMouseoverOfStepwiseLoss(unit) {
    let key = unit.key;
    let face_img = "";
    let back_img = "";

    if (unit.damaged) {
      face_img = `/paths/img/army/${key}_back.png`;
      back_img = this.returnUnitImageWithStepwiseLoss(unit, true);
    } else {
      face_img = `/paths/img/army/${key}.png`;
      back_img = `/paths/img/army/${key}_back.png`;
    }

    return `<img src="${face_img}" onmouseover="this.src='${back_img}'" onmouseout="this.src='${face_img}'" class="army-tile" />`;

  }
  returnUnitImageInSpaceWithIndex(spacekey, idx) {
    let unit = this.game.spaces[spacekey].units[idx];
    return this.returnUnitImage(unit);
  }
  returnUnitImageWithStepwiseLoss(unit, just_link=false) {

    let key = unit.key;

    if (!unit.damaged) {

      if (just_link) { return `/paths/img/army/${key}_back.png`; }
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile" />`;

    } else {

      //
      // replace with corps if destroyed
      //
      if (unit.key.indexOf('army')) {
        let corpskey = unit.key.split('_')[0] + '_corps';
        let new_unit = this.cloneUnit(corpskey);
        return this.returnUnitImage(new_unit, just_link);
      } else {

	//
	// damaged core? should show DESTROYED IMAGE
	//

      }

    }
  }

  cloneUnit(unitkey) {
    return JSON.parse(JSON.stringify(this.game.units[unitkey]));
  }

  addUnitToSpace(unitkey, spacekey) {
    let unit = this.cloneUnit(unitkey);
    unit.spacekey = spacekey;
    this.game.spaces[spacekey].units.push(unit);
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


