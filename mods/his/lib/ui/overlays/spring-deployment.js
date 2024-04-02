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
		this.overlay.show(SpringDeploymentTemplate(faction));

		if (this.mod.game.state.round == 1 && faction == "ottoman") {
			this.updateInstructions("The Ottoman Empire starts at War with Hungary. You earn Victory Points and will get dealt more cards each turn if you expand your empire to control more strategic keys like Belgrade. Why not deploy north to Nezh and attempt to seize the city?");
		}
		if (this.mod.game.state.round == 1 && faction == "france") {
			this.updateInstructions("France starts at War with the Hapsburgs and Papacy - should you deploy forces to the Italian or Spanish border? Or stay in defensive near Paris and move against the English if they aggress on Scotland?");
		}
		if (this.mod.game.state.round == 1 && faction == "papacy") {
			this.updateInstructions("The Papacy starts at War with France. Beyond your duty to resist the Protestant menace, you earn Victory Points and get dealt more cards each turn if you expand your control over strategic keys like Florence or Milan...");
		}
		if (this.mod.game.state.round == 1 && faction == "england") {
			this.updateInstructions("England can deploy north to pacify Scotland or south to protect Calais and aggress on France. If you choose the former, remember you need two squadrons in the North Sea to assault Edinburgh...");
		}
		if (this.mod.game.state.round == 1 && faction == "hapsburg") {
			this.updateInstructions("The Hapsburg Empire starts at War with France, but can deploy its forces to subdue independent keys like Metz as well...");
		}
		if (this.mod.game.state.round == 2) {
			this.updateInstructions("TIP: you must have more squadrons in the sea adjacent to a port in order to assault it during a siege...");
		}
		if (this.mod.game.state.round == 3) {
			this.updateInstructions("TIP: once your fleet is in position, you can move units across open seas using the More Across Seas menu option...");
		}
		if (this.mod.game.state.round == 4) {
			this.updateInstructions("TIP: you can't be excommunicated by the Papacy if you don't go to war with them and don't ally with the Ottomans");
		}
		if (this.mod.game.state.round > 4) {
			this.updateInstructions("TIP: find something difficult to understand? suggestions on tips to include on this help screen are very welcome...");
		}

		this.attachEvents(mycallback);
		this.pushHudUnderOverlay();

	}

	attachEvents(mycallback = null) {
	}

}

module.exports = SpringDeploymentOverlay;
