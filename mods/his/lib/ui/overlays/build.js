const BuildTemplate = require('./build.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class BuildOverlay {

	constructor(app, mod, c1, c2, c3) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, true, false, false);
		this.max_units = 1;
		this.units = 1;
		this.cost = 0;
		this.ops_available = 0;
		this.ops_spent = 0;
	}

	hide() {
		this.overlay.hide();
		document.querySelector(".build-overlay-units-available").remove();
	}

	pullHudOverOverlay() {
		//
		// pull GAME HUD over overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}
	pushHudUnderOverlay() {
		//
		// push GAME HUD under overlay
		//
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

		this.addUnitsAvailableToPage(faction, unit, max_buildable_units);

		this.attachEvents(faction, unit, ops, cost, mycallback);
	}

	attachEvents(faction, unit, ops, cost, mycallback) {

	  document.querySelectorAll(".build-overlay-units-available .army_tile").forEach((el) => { el.onclick = (e) => {
	    this.units = parseInt(e.currentTarget.id);
	    this.hide();
	    mycallback(this.units, this.cost);
	  } });

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

	addUnitsAvailableToPage(faction="", utype="regular", max_units=6) {

	  this.app.browser.addElementToSelector(`<div class="build-overlay-units-available"></div>`);

	  let his_self = this.mod;
	  let f = faction;
  	  let muc = "";
          let available = his_self.game.state.board[f].available;

	  if (utype == "regular") {
          		for (let i = 0; i < available['regular']['1']; i++) {
				if (max_units < 1) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-1.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-1.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-1.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-1.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-1.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-1.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-1.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-1.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-1.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-1.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-1.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
			}
                        for (let i = 0; i < available['regular']['2']; i++) {
				if (max_units < 2) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-2.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-2.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-2.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-2.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-2.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-2.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-2.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-2.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-2.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-2.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-2.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['4']; i++) {
				if (max_units < 4) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-4.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-4.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-4.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-4.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-4.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-4.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-4.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-4.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-4.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-4.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-4.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['6']; i++) {
				if (max_units < 6) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-6.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-6.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-6.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-6.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-6.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-6.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-6.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-6.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-6.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-6.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-6.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
	  }

	  if (utype == "mercenary") {
          		for (let i = 0; i < available['regular']['1']; i++) {
				if (max_units < 1) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-1.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-1.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-1.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-1.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-1.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-1.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-1.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-1.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-1.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-1.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-1.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
			}
                        for (let i = 0; i < available['regular']['2']; i++) {
				if (max_units < 2) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-2.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-2.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-2.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-2.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-2.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-2.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-2.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-2.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-2.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-2.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-2.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['4']; i++) {
				if (max_units < 4) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-4.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-4.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-4.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-4.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-4.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-4.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-4.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-4.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-4.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-4.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-4.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['6']; i++) {
				if (max_units < 6) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-6.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-6.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-6.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-6.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-6.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-6.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-6.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-6.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-6.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-6.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-6.svg" />`;
                                }
                                let qs = `.build-overlay-units-available`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
	  }
	}

}

module.exports = BuildOverlay;
