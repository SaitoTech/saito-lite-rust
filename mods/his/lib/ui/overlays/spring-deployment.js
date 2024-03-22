const SpringDeploymentTemplate = require('./spring-deployment.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class SpringDeploymentOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
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

	updateInstructions(msg) {
	  try {
	    document.querySelector(".spring-deployment-overlay .instructions").innerHTML = msg;
	  } catch (err) {}
	}

	render(faction = "", mycallback = null) {

		this.visible = true;
		this.overlay.show(SpringDeploymentTemplate());

		if (this.mod.game.state.round == 1 && faction == "ottoman") {
			this.updateInstructions("First Game as Ottomans? Perhaps use Spring Deployment to move your forces to Nezh and attempt to seize Belgrade?");
		}
		if (this.mod.game.state.round == 1 && faction == "papacy") {
			this.updateInstructions("First Game as the Papacy? If you plan to attack Florence, using Spring Deployment to shift forces to Ravenna can help...");
		}
		if (this.mod.game.state.round == 1 && faction == "england") {
			this.updateInstructions("First Game as England? Spring Deployment can let you move forces to Scotland to help pacify the North, or shift forces south to Calais and France...");
		}
		if (this.mod.game.state.round == 1 && faction == "hapsburg") {
			this.updateInstructions("First Game as the Hapsburg? Spring Deployment becomes more important for you as the game stretches on...");
		}

		this.attachEvents(mycallback);

	}

	attachEvents(mycallback = null) {
	}

}

module.exports = SpringDeploymentOverlay;
