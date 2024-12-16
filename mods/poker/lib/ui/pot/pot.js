const PotTemplate = require('./pot.template');

class Pot {

	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {
		if (!document.querySelector(".pot")) {
		  this.app.browser.addElementToDom(PotTemplate());
		} else {
		  this.app.browser.replaceElementBySelector(PotTemplate(), ".pot");
		}

		let pot = 0;
		for (let i = 0; i < this.game_mod.game.state.player_pot.length; i++) {
		  pot += this.game_mod.game.state.player_pot[i];
	        }

		this.game_mod.game_help.renderCustomOverlay("pot", {
    		  line1 : "pot:",
    		  line2 : `${pot} CHIPS`,
    	  	  fontsize : "2.1rem" ,
  		});

		this.attachEvents();
	}

	attachEvents() {
	}

}

module.exports = Pot;

