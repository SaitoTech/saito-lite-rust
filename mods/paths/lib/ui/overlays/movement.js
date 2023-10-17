const MovementOverlayTemplate = require("./movement.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MovementOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  hide() {
    this.overlay.hide();
    return;
  }

  render(mobj, units_to_move = null, selectUnitsInterface = null, selectDestinationInterface = null) {

    let space = mobj.space;
    let faction = mobj.faction;
    let source = mobj.source;
    let destination = mobj.destination;
    let max_formation_size = this.mod.returnMaxFormationSize(units_to_move, faction, source);
    let units = space.units[faction];

    let from = this.mod.game.spaces[source].name;
    let to = "";
    if (destination === "") { destination = "?"; } else { to = this.mod.game.spaces[destination].name; }

    //
    // regular to move
    // regular already moved
    // cavalry to move
    // cavalry already moved
    // mercenary to move
    // mercenary already moved
    //
    let rtm = -1;
    let ram = -1;
    let mtm = -1;
    let mam = -1;
    let ctm = -1;
    let cam = -1;
    let has_regulars = 0;
    let has_mercenaries = 0;
    let has_cavalry = 0;
    let source_regulars_total = 0;
    let source_mercenaries_total = 0;
    let source_cavalry_total = 0;
    let source_regulars_moved = 0;
    let source_mercenaries_moved = 0;
    let source_cavalry_moved = 0;
    let commanders = [];

    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {

	if (space.units[faction][i].command_value > 0) {
	  if (space.units[faction][i].gout != true) {
	    commanders.push(i);
	  }
	}

	if (space.units[faction][i].type == "regular") {
	  source_regulars_total++;
	  if (units_to_move.includes(i)) {
	    source_regulars_moved++;
	    if (ram == -1) {
              has_regulars = 1;
	      ram = i;
	    }
	  } else {
	    if (rtm == -1) {
              has_regulars = 1;
	      rtm = i;
	    }
	  }
	}

	if (space.units[faction][i].type == "mercenary") {
	  source_mercenaries_total++;
	  if (units_to_move.includes(i)) {
	    source_mercenaries_moved++;
	    if (mam == -1) {
              has_mercenaries = 1;
	      mam = i;
	    }
	  } else {
	    if (mtm == -1) {
              has_mercenaries = 1;
	      mtm = i;
	    }
	  }
	}

	if (space.units[faction][i].type == "cavalry") {
	  source_cavalry_total++;
	  if (units_to_move.includes(i)) {
	    source_cavalry_moved++;
	    if (cam == -1) {
              has_cavalry = 1;
	      cam = i;
	    }
	  } else {
	    if (ctm == -1) {
              has_cavalry = 1;
	      ctm = i;
	    }
	  }
	}

      }
    }

    let obj = {
      faction : faction ,
      has_regulars : has_regulars ,
      has_mercenaries : has_mercenaries ,
      has_cavalry : has_cavalry ,
      source_regulars_total : source_regulars_total ,
      source_mercenaries_total : source_mercenaries_total ,
      source_cavalry_total : source_cavalry_total ,
      source_regulars_moved : source_regulars_moved ,
      source_mercenaries_moved : source_mercenaries_moved ,
      source_cavalry_moved : source_cavalry_moved ,
      rtm_idx : rtm ,
      ram_idx : ram ,
      mtm_idx : mtm ,
      mam_idx : mam ,
      ctm_idx : ctm ,
      cam_idx : cam ,
      space : space ,
      commanders : commanders ,
      units_to_move : units_to_move ,
      from : from ,
      to : to ,
      max_formation_size : max_formation_size ,
    };

    this.overlay.show(MovementOverlayTemplate(obj));

    this.attachEvents(obj);

  }

  attachEvents(obj) {

    let qs = "";
    let el;

    qs = `.regular .unit-available`;
    el = document.querySelector(qs);
    if (el) {
      el.innerHTML = obj.source_regulars_total - obj.source_regulars_moved;
    }

    qs = `.regular .unit-moving`;
    el = document.querySelector(qs);
    if (el) {
      el.innerHTML = obj.source_regulars_moved;
    }

    qs = `.mercenary .unit-available`;
    el = document.querySelector(qs);
    if (el) {
      el.innerHTML = obj.source_mercenaries_total - obj.source_mercenaries_moved;
    }

    qs = `.mercentary .unit-moving`;
    el = document.querySelector(qs);
    if (el) {
      el.innerHTML = obj.source_mercenaries_moved;
    }

    qs = `.cavalry .unit-available`;
    el = document.querySelector(qs);
    if (el) {
      el.innerHTML = obj.source_cavalry_total - obj.source_cavalry_moved;
    }

    qs = `.cavalry .unit-moving`;
    el = document.querySelector(qs);
    if (el) {
      el.innerHTML = obj.source_cavalry_moved;
    }
  }

}

module.exports = MovementOverlay;

