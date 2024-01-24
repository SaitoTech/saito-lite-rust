const ImperiumTechTreeOverlayTemplate = require('./tech-tree.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class TechTreeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(style = 0) {
		//
		// list all tech
		//
		let tech = this.mod.returnTechnology();

		let normal_tech = [];
		let unit_tech = [];
		let faction_tech = [];
		let faction_unit = [];

		for (let x in tech) {
			if (tech[x].type == 'normal' && tech[x].unit != 1) {
				normal_tech.push(tech[x]);
			}
		}
		for (let x in tech) {
			if (tech[x].type == 'normal' && tech[x].unit == 1) {
				unit_tech.push(tech[x]);
			}
		}
		for (let x in tech) {
			if (tech[x].type == 'special' && tech[x].unit != 1) {
				faction_tech.push(tech[x]);
			}
		}
		for (let x in tech) {
			if (tech[x].type == 'special' && tech[x].unit == 1) {
				faction_unit.push(tech[x]);
			}
		}

		let t = normal_tech.concat(unit_tech);

		this.overlay.showCardSelectionOverlay(this.app, this.mod, t, {
			backgroundImage: '/imperium/img/backgrounds/unit-upgrades.jpg',
			padding: '50px'
		});

		//this.overlay.show(ImperiumTechTreeOverlayTemplate());
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = TechTreeOverlay;
