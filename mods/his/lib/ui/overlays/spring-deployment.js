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
                        document.querySelector('.hud').style.zIndex = overlay_zindex - 3;
                        this.mod.hud.zIndex = overlay_zindex - 3;
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
		this.pushHudUnderOverlay();

		let tips = [
			"TIP: you need more squadrons in the sea adjacent to a port than defending it to assault..." ,
			"TIP: you cannot assault a key without a line-of-controlled spaces connecting it to another controlled key..." ,
			"TIP: once your ships are at sea, the \"Move Across Seas\" option lets you move units overseas..." ,
			"TIP: you can only move into independent spaces, or those where you allied with or at war with its controller" ,
			"TIP: when assaulting fortified troops you need 2 units for each dice roll (round up)",
			"TIP: you cannot assault a space in the same turn you move into positition to assault it" ,
			"TIP: you can't be excommunicated by the Papacy if you don't go to war with them and don't ally with the Ottomans" ,
			"TIP: factions get -1 card each turn if excommunicated or stuck in an unfinished Foreign War" ,
			"TIP: find something difficult to understand? suggest tips to include on this help screen..." ,
		];

		if (this.mod.game.state.round == 1 && faction == "ottoman") {
			this.updateInstructions("You start at War with Hungary. Why not deploy from Istanbul to Nezh and try to seize Belgrade?");
		}
		if (this.mod.game.state.round == 1 && faction == "france") {
			this.updateInstructions("France starts at War with the Hapsburgs and Papacy - the independent key of Metz is also within reach of Paris...");
		}
		if (this.mod.game.state.round == 1 && faction == "papacy") {
			this.updateInstructions("The Papacy starts at War with France. Manage that conflict while fighting the Protestants and controlling strategic keys like Florence and Milan...");
		}
		if (this.mod.game.state.round == 1 && faction == "england") {
			this.updateInstructions("England usually deploys north to pacify Scotland. Your home card will let you declare war on the Scots, but remember you need more squadrons in the North Sea than are defending Edinburgh to assault the city...");
		}
		if (this.mod.game.state.round == 1 && faction == "hapsburg") {
			this.updateInstructions("Move infantry into Germany to slow the Protestants, or subdue independent keys for VP and bonus cards...");
		}

		if (this.mod.game.state.round > 1) {
			this.updateInstructions(tips[Math.floor(Math.random() * tips.length)]);
		}

		this.attachEvents(mycallback);
		this.pushHudUnderOverlay();

	}

	attachEvents(mycallback = null) {
	}

}

module.exports = SpringDeploymentOverlay;
