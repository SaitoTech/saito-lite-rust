const WinterTemplate = require('./winter.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class WinterOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, false);
		this.stage = "stage1";
	}

	hide() {
		this.overlay.hide();
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

	render(stage = '') {

		// skip showing on first round start
		if (this.mod.game.state.starting_round == this.mod.game.state.round) {
		  return;
		}


		if (stage != "") { this.stage = stage; } 

		let his_self = this.mod;

		this.overlay.show(WinterTemplate(stage));

	        document.querySelector(`.winter-text ul li.${this.stage}`).classList.add("active");


		if (stage == "stage5" || stage == "stage6" || stage == "stage7" || stage == "stage8") {
		  try {
		    document.querySelector('.saito-overlay .winter').style.backgroundImage = "url(/his/img/backgrounds/diplomacy/ambassadors.jpeg)";
		    document.querySelector('.saito-overlay .winter').style.backgroundSize = "cover";
		    document.querySelector('.saito-overlay .winter .winter-title').innerHTML = "Diplomacy Phase";
		    document.querySelector('.stage5').style.display = "block";
		    document.querySelector('.stage6').style.display = "block";
		    document.querySelector('.stage7').style.display = "block";
		    document.querySelector('.stage8').style.display = "block";
		    document.querySelector('.stage1').style.display = "none";
		    document.querySelector('.stage2').style.display = "none";
		    document.querySelector('.stage3').style.display = "none";
		    document.querySelector('.stage4').style.display = "none";
		  } catch (err) {

		  }
		} else {
		    document.querySelector('.saito-overlay .winter').style.backgroundImage = "url(/his/img/backgrounds/winter_background.jpg)";
		    document.querySelector('.saito-overlay .winter').style.backgroundSize = "cover";
		    document.querySelector('.saito-overlay .winter .winter-title').innerHTML = "A Passage of Winter";
		    document.querySelector('.stage1').style.display = "block";
		    document.querySelector('.stage2').style.display = "block";
		    document.querySelector('.stage3').style.display = "block";
		    document.querySelector('.stage4').style.display = "block";
		    document.querySelector('.stage5').style.display = "none";
		    document.querySelector('.stage6').style.display = "none";
		    document.querySelector('.stage7').style.display = "none";
		    document.querySelector('.stage8').style.display = "none";
		}


		this.pullHudOverOverlay();

		this.attachEvents();
	}

	attachEvents() {
		let his_self = this.mod;

		$('.winter').on('click', function () {
			if (document.querySelector('#confirmit')) {
				$('#confirmit').click();
			}
		});
	}
}

module.exports = WinterOverlay;
