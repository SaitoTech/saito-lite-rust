const PotTemplate = require('./pot.template');
const PotDetailsTemplate = require('./pot-details.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class Pot {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.pot_active = true;
		this.overlay = new SaitoOverlay(app, mod);
	}

	render(pot = -1) {

		if (!this.game_mod.gameBrowserActive()){
			return;
		}
		
		// By default, calculate the dynamic pot...
		if (pot == -1) {
			pot = 0;
			if (this.pot_active){
				for (let i = 0; i < this.game_mod.game.state.player_pot.length; i++) {
				  pot += this.game_mod.game.state.player_pot[i];
		        }
			}

		}

		if (!document.querySelector(".pot")) {
			if (!this.ticker){
				this.ticker = this.game_mod.returnTicker();
			}
		  	this.app.browser.addElementToDom(PotTemplate(this));
		} 

		try {
			// Toggle opacity
			if (!this.pot_active || pot == '0'){
				document.querySelector(".pot").classList.add("invisible");
			}else{
				document.querySelector(".pot").classList.remove("invisible");
			}

			//Update values
			const l2 = document.querySelector(".potholder .line2");
			const l3 = document.querySelector(".potholder .line3");

			let chip = pot === 1 ? "CHIP" : "CHIPS";

			if (this.ticker === 'CHIPS') {
				l2.innerHTML = this.game_mod.convertChipsToCrypto(pot, true);
				l3.innerHTML = chip;
			}else{
				l2.innerHTML = `${pot} <span class="smaller-font">${chip}</span>`;
				l3.innerHTML = `${this.game_mod.convertChipsToCrypto(pot, true)} <span class="smaller-font">${this.ticker}</span>`
			}
		} catch (err) {
			console.error(err);
		}
		
		if (pot && !this.game_mod.animating) {
			this.attachEvents();	
		}
		
		return pot;
	}

	activate(){
		this.pot_active = true;
	}

	clearPot(){
		this.pot_active = false;
		this.render(0);
	}

	addPulse(){
		if (document.querySelector(".pot .line2")){
			document.querySelector(".pot .line2").classList.add("pulse");
		}
	}

	attachEvents() {
		if (document.querySelector(".pot")){
			document.querySelector(".pot").onclick = () => {
				this.overlay.show(PotDetailsTemplate(this.game_mod));
			}
		}
	}

}

module.exports = Pot;

