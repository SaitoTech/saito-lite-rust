const MovementOverlayTemplate = require('./movement.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class MovementOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.fade_out_available_units = false;
		this.mobj = null;
		this.selectUnitsInterface = null;
		this.selectDestinationInterface = null;
	}

	hide() {
		this.overlay.hide();
		return;
	}

	renderForceOpen(mobj, units_to_move, selectUnitsInterface = null, selectDestinationInterface = null) {
		this.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface, true);
	}

        pullHudOverOverlay() {
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
                        this.mod.hud.zIndex = overlay_zindex + 1;
                }
        }

        pushHudUnderOverlay() {
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
                        this.mod.hud.zIndex = overlay_zindex - 2;
                }
        }

	render(
		mobj,
		units_to_move = null,
		selectUnitsInterface = null,
		selectDestinationInterface = null ,
		force_open = false ,
	) {

		if (force_open == false) {
                	this.overlay.closebox = false;
                	this.overlay.clickToClose = false;
                	this.overlay.clickBackdropToClose = false;
		} else {
                	this.overlay.closebox = true;
                	this.overlay.clickToClose = false;
                	this.overlay.clickBackdropToClose = true;
		}

		let his_self = this.mod;
		let space = mobj.space;
		this.mobj = mobj;
		this.selectUnitsInterface = selectUnitsInterface;
		this.selectDestinationInterface = selectDestinationInterface;
		let faction = mobj.faction;
		let source = mobj.source;
		let destination = mobj.destination;
		let max_formation_size = this.mod.returnMaxFormationSize(
			units_to_move,
			faction,
			source
		);
		let units = space.units[faction];

		let from = this.mod.game.spaces[source].name;
		let to = '';
		if (destination === '') {
			destination = '?';
		} else {
			to = this.mod.game.spaces[destination].name;
		}
		if (!mobj.unmoved_units) {
			mobj.unmoved_units = [];
		}
		if (!mobj.moved_units) {
			mobj.moved_units = [];
		}

		//
		// create list of figures in each space
		//
		let moved_units = mobj.moved_units;
		let unmoved_units = mobj.unmoved_units;
		let destination_units = [];

		//
		// reset on-chit-ui if no moved units
		//
		if (moved_units.length == 0) { 
		  this.fade_out_available_units = false; 
		  document.querySelectorAll(".army_tile").forEach((el) => {
		    if (el.classList.contains("nonopaque")) {
		      el.classList.remove("nonopaque");
		      el.classList.add("opaque");
		    }
		  });
		}

		let s = destination;
		try {
			if (this.mod.game.spaces[s]) {
				s = this.mod.game.spaces[s];
			}
		} catch (err) {}
		for (let key in s.units) {
			if (his_self.returnPlayerCommandingFaction(key) == faction) {
				for (let i = 0; i < s.units[key].length; i++) {
					if (
						s.units[key][i].land_or_sea === 'land' ||
						s.units[key][i].land_or_sea === 'both'
					) {
						destination_units.push({
							faction: key,
							idx: i,
							type: s.units[key][i].type
						});
					}
				}
			}
		}

		let obj = {
			faction: faction,
			moved_units: moved_units,
			unmoved_units: unmoved_units,
			destination_units: destination_units,
			space: space,
			from: from,
			to: to,
			max_formation_size: max_formation_size ,
			units_to_move : units_to_move ,
			selectUnitsInterface : selectUnitsInterface ,
			selectDestinationInterface : selectDestinationInterface ,
		};

                this.mod.available_units_overlay.hide();
		this.overlay.show(MovementOverlayTemplate(obj, this.mod));
		this.mod.available_units_overlay.renderMove(mobj, faction, space.key);
		if (this.fade_out_available_units) { this.mod.available_units_overlay.fadeOut(); }

		this.pushHudUnderOverlay();

		this.attachEvents(obj);
	}

	attachEvents(obj) {
	  document.querySelectorAll(".movement-unit.option").forEach((el) => {
	    el.onclick = (e) => {
	      this.fade_out_available_units = true;
	    }
	  });
	}
}

module.exports = MovementOverlay;

