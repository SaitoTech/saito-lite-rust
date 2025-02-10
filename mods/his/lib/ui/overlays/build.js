const BuildTemplate = require('./build.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class BuildOverlay {

	constructor(app, mod, c1, c2, c3) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, false, false);
		this.max_units = 1;
		this.units = 1;
		this.cost = 0;
		this.ops_available = 0;
		this.ops_spent = 0;
	}

	hide() {
		this.overlay.hide();
		try { 
		  this.mod.available_units_overlay.hide();
		} catch (err) {
console.log("error closing available units overlay...");
		}
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

	render(faction, unit, ops, cost, mycallback) {

		let his_self = this.mod;

	  	this.units = 1;
	 	this.cost = cost;
		this.ops_available = ops;
		this.ops_spent = cost;
		this.max_units = his_self.returnNumberOfUnitsAvailableForConstruction(faction, unit);
		let max_buildable_units = (ops / cost);

		//
		// if we cannot possibly build more than 1 unit, do not show the 
		// UI overlay intended to save us time in building multiple units
		//
	        if ((cost * 2) > this.ops_available) { return; }

		this.overlay.show(BuildTemplate());
		this.overlay.callback_on_close = () => { this.hide(); }

	 	if (unit === "mercenary") {
		  document.querySelector(".unit-details").style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)) , url(/his/img/backgrounds/move/mercenary.jpg)';
		}
	 	if (unit === "cavalry") {
		  document.querySelector(".unit-details").style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)) , url(/his/img/backgrounds/move/cavalry.jpg)';
		}
	 	if (unit === "corsair") {
		  document.querySelector(".unit-details").style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)) , url(/his/img/backgrounds/move/corsair.jpg)';
		}
	 	if (unit === "squadron") {
		  document.querySelector(".unit-details").style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)) , url(/his/img/backgrounds/move/squadron.jpg)';
		}
		this.mod.available_units_overlay.hide();
		this.mod.available_units_overlay.renderBuild(faction, unit, ops, cost, (num) => {
	          this.hide();
	    	  mycallback(num, this.cost);
		});
		this.attachEvents(faction, unit, ops, cost, mycallback);
	}

	attachEvents(faction, unit, ops, cost, mycallback) {
	  document.querySelector(".fewer-units").onclick = (e) => {
	    if (this.units == 1) { alert("cannot produce less than one unit"); return; }
	    this.units--;
	    this.ops_spent = this.ops_available - (this.cost * this.units);
	    document.querySelector(".unit-details").innerHTML = this.units;
	  }
	  document.querySelector(".more-units").onclick = (e) => {
	    if (this.ops_available < (this.cost * (this.units+1))) { alert("not enough OPs to produce more"); return; }
	    if (this.max_units <= this.units) { alert("at unit production limit..."); return; }
	    this.units++;
	    this.ops_spent = this.ops_available - (this.cost * this.units);
	    document.querySelector(".unit-details").innerHTML = this.units;
	  }
	  document.querySelector(".build-submit").onclick = (e) => {
	    this.hide();
	    mycallback(this.units, this.cost);
	  }
	}

}

module.exports = BuildOverlay;
