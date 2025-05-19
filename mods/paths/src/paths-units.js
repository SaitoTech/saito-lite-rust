
  returnFactionOfUnit(unit) { return this.returnPowerOfUnit(unit); }
  returnPowerOfUnit(unit) {

    try { if (!unit.ckey) { unit = this.game.units[unit]; } } catch (err) {}

    let allied = ["FR", "RU", "BR", "BE", "IT", "US", "ANA", "AUS", "BEF", "CAU", "CND", "CZL", "GR", "MEF", "MN", "NE", "OA", "POL", "PT" , "RO", "SB"];
    let central = ["GE", "AH", "TU", "BG", "AOI", "BU", "SN" , "YLD"];

    if (allied.includes(unit.ckey)) { return "allies"; }
    if (central.includes(unit.ckey)) { return "central"; }

    return "";

  }



  importUnit(key, obj) {

    if (!this.game.units) { this.game.units = {}; }

    //
    // avoid re-importing
    //
    if (this.game.units[key]) {
      if (obj.checkSupplyStatus) {
	this.game.units[key].checkSupplyStatus = obj.checkSupplyStatus;
      } else {
	this.game.units[key].checkSupplyStatus = (paths_self, spacekey) => { return 0; }
      }
      return;
    }

    obj.key = key;

    if (!obj.name)      	{ obj.name      = "Unknown"; }
    if (!obj.army)		{ obj.army 	= 0; }
    if (!obj.corps)		{ obj.corps 	= 0; }
    if (!obj.combat)		{ obj.combat 	= 5; }
    if (!obj.loss)		{ obj.loss 	= 3; }
    if (!obj.movement)		{ obj.movement 	= 3; }
    if (!obj.rcombat)		{ obj.rcombat 	= 5; }
    if (!obj.rloss)		{ obj.rloss 	= 3; }
    if (!obj.rmovement)		{ obj.rmovement = 3; }

    if (!obj.attacked)		{ obj.attacked  = 0; }
    if (!obj.moved)		{ obj.moved     = 0; }

    if (!obj.damaged)		{ obj.damaged = false; }
    if (!obj.destroyed)		{ obj.destroyed = false; }
    if (!obj.spacekey)  	{ obj.spacekey = ""; }
    if (!obj.checkSupplyStatus) { obj.checkSupplyStatus = (paths_self, spacekey) => { return 0; } };

    if (key.indexOf("army") > -1) { obj.army = 1; } else { obj.corps = 1; }

    this.game.units[key] = obj;

  }

  moveUnit(sourcekey, sourceidx, destinationkey) {
    let unit = this.game.spaces[sourcekey].units[sourceidx];
    this.game.spaces[sourcekey].units[sourceidx].moved = 1;
    this.game.spaces[sourcekey].units.splice(sourceidx, 1);
    if (!this.game.spaces[destinationkey].units) { this.game.spaces[destinationkey].units = []; }

    if (destinationkey == "aeubox" || destinationkey == "ceubox") {
      this.updateLog(unit.name + " eliminated.");
    } else {
      this.updateLog(unit.name + " moves from " + this.returnSpaceNameForLog(sourcekey) + " to " + this.returnSpaceNameForLog(destinationkey));
    }

    unit.spacekey = destinationkey;
    this.game.spaces[destinationkey].units.push(unit);
    unit.spacekey = destinationkey;
    this.displaySpace(sourcekey);
    this.displaySpace(destinationkey);
  }

  returnUnitImage(unit, just_link=false) {
    let key = unit.key;

    if (unit.destroyed) {
     return this.returnDestroyedUnitImage(unit, just_link);
    }

    if (unit.damaged) {
      if (just_link) { return `/paths/img/army/${key}_back.png`; }
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile ${unit.key}" />`;
    } else {
      if (just_link) { return `/paths/img/army/${key}.png`; }
      return `<img src="/paths/img/army/${key}.png" class="army-tile ${unit.key}" />`;
    }
  }
  returnUnitBackImage(unit, just_link=false) {
    let key = unit.key;
    if (just_link) { return `/paths/img/army/${key}_back.png`; }
    return `<img src="/paths/img/army/${key}_back.png" class="army-tile ${unit.key}" />`;
  }
  returnUnitImageWithMouseoverOfStepwiseLoss(unit, just_link="", mouseout_first=false) {
    let key = unit.key;
    let face_img = "";
    let back_img = "";

    if (unit.destroyed) {
     return this.returnDestroyedUnitImage(unit, just_link);
    }

    if (unit.damaged) {
      face_img = `/paths/img/army/${key}_back.png`;
      back_img = this.returnUnitImageWithStepwiseLoss(unit, true);
    } else {
      face_img = `/paths/img/army/${key}.png`;
      back_img = `/paths/img/army/${key}_back.png`;
    }

    //
    // the workaround below is part of our strategy to prevent tiles from insta-
    // flipping once clicked on, so that mouseout is required in order to trigger
    // tiles showing their reversed side on mouseover. see /lib/ui/overlays/loss.js
    //
    if (!mouseout_first) {
      return `<img src="${face_img}" onmouseover="this.src='${back_img}'" onmouseout="this.src='${face_img}'" class="army-tile ${unit.key}" />`;
    } else {
      return `<img src="${face_img}" data-mouseover="false" onmouseover="if (this.dataset.mouseover === 'true') { this.src='${back_img}' }" onmouseout="this.dataset.mouseover = 'true'; this.src='${face_img}'" class="army-tile ${unit.key}" />`;
    }

  }
  returnUnitImageInSpaceWithIndex(spacekey, idx) {
    let unit = this.game.spaces[spacekey].units[idx];
    return this.returnUnitImage(unit);
  }
  returnDestroyedUnitImage(unit, just_link=false) {
    if (just_link) {
      return `/paths/img/cancel_x.png`;
    } else {
      return `<img src="/paths/img/cancel_x.png" class="army-tile ${unit.key}" />`;
    }

  }

  returnUnitImageWithStepwiseLoss(unit, just_link=false) {

    let key = unit.key;

    if (unit.destroyed) {
     return this.returnDestroyedUnitImage(unit, just_link);
    }

    if (!unit.damaged) {

      if (just_link) { return `/paths/img/army/${key}_back.png`; }
      return `<img src="/paths/img/army/${key}_back.png" class="army-tile ${unit.key}" />`;

    } else {

      //
      // replace with corps if destroyed
      //
      if (unit.key.indexOf('army') >= 0) {
        let corpskey = unit.key.split('_')[0] + '_corps';
        let new_unit = this.cloneUnit(corpskey);
        return this.returnUnitImage(new_unit, just_link);

      } else {

	return this.returnDestroyedUnitImage(unit, just_link);
      }

    }

    return "";
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


