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

console.log("MOBJ: " + JSON.stringify(mobj));
console.log("UNITS 2 MOVE: " + JSON.stringify(units_to_move));

    let his_self = this.mod;
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
    // create list of figures in each space
    //
    let moved_units = mobj.moved_units;
    let unmoved_units = mobj.unmoved_units;
    let destination_units = [];

/***
    let s = space;
    try { if (this.mod.game.spaces[s]) { s = this.mod.game.spaces[s]; } } catch (err) {}
    for (let key in s.units) {
      if (his_self.returnPlayerCommandingFaction(key) == faction) {
        for (let i = 0; i < s.units[key].length; i++) {
          if (s.units[key][i].land_or_sea === "land" || s.units[key][i].land_or_sea === "both") {
            if (s.units[key][i].locked != true && (his_self.game.state.events.foul_weather != 1 && s.units[key][i].already_moved != 1)) {
              let does_units_to_move_have_unit = false;
              for (let z = 0; z < units_to_move.length; z++) {
                if (units_to_move[z].faction == key && units_to_move[z].idx == i) { does_units_to_move_have_unit = true; break; }
              }
              if (does_units_to_move_have_unit) {
                moved_units.push({ faction : key , idx : i , type : s.units[key][i].type});
              } else {
                unmoved_units.push({ faction : key , idx : i , type : s.units[key][i].type});
              }
            }
          }
        }
      }
    }
***/

    let s = destination;
    try { if (this.mod.game.spaces[s]) { s = this.mod.game.spaces[s]; } } catch (err) {}
    for (let key in s.units) {
      if (his_self.returnPlayerCommandingFaction(key) == faction) {
        for (let i = 0; i < s.units[key].length; i++) {
          if (s.units[key][i].land_or_sea === "land" || s.units[key][i].land_or_sea === "both") {
            destination_units.push({ faction : key , idx : i , type : s.units[key][i].type});
          }
        }
      }
    }

/*****
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {

	if (space.units[faction][i].command_value > 0) {
	  if (space.units[faction][i].gout != true) {
	    commanders.push(i);
	  }
	}
*****/

    let obj = {
      faction : faction ,
      moved_units : moved_units ,
      unmoved_units : unmoved_units ,
      destination_units : destination_units ,
      space : space ,
      from : from ,
      to : to ,
      max_formation_size : max_formation_size ,
    };

    this.overlay.show(MovementOverlayTemplate(obj));

    this.attachEvents(obj);

  }

  attachEvents(obj) {

  }

}

module.exports = MovementOverlay;

