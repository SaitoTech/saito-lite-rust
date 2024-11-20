const SectorOverlayTemplate = require('./sector.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class SectorOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render(sector) {
		let sys = this.mod.returnSectorAndPlanets(sector);
		let fleet = '';

		//
		// fleet in sector
		//
		for (let i = 0; i < sys.s.units.length; i++) {
			if (sys.s.units[i].length > 0) {
				fleet += this.mod.returnPlayerFleetInSector(i + 1, sector);
				i = sys.s.units.length;
			}
		}

		//
		// overlay
		//
		this.overlay.show(SectorOverlayTemplate(sys, fleet));

		//
		// planet
		//
		for (let i = 0; i < sys.p.length; i++) {
			let planet = sys.p[i];
			let owner = 'UNCONTROLLED';
			if (planet.owner > -1) {
				owner = this.mod.returnFactionNickname(sys.p[i].owner);
			}

	
			html = `
		        	<div class="planet">
		        	  ${owner}
		        	  <div class="system_summary_content">
		        	    ${this.mod.returnInfantryOnPlanet(sys.p[i])} infantry
		        	    <br />
		        	    ${this.mod.returnPDSOnPlanet(sys.p[i])} PDS
		        	    <br />
		        	    ${this.mod.returnSpaceDocksOnPlanet(sys.p[i])} spacedocks
		        	  </div>
		        	  <div class="planet-card" style="background-image: url('${sys.p[i].img}');"></div>
			        </div>
		      	`;

			this.app.browser.addElementToSelector(
				html,
				'.sector-overlay .planet-grid'
			);
		}
	}
}

module.exports = SectorOverlay;
