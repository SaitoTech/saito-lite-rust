const ReservesTemplate = require('./reserves.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ReservesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
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

	hide() {
		this.visible = false;
		this.overlay.hide();
	}


	pickUnitAndTriggerCallback(faction="allies", mycallback=null) {
		this.render(faction);
		document.querySelectorAll(".reserves-overlay .units .army-tile").forEach((el) => {
			el.onclick = (e) => {
				let id = e.currentTarget.id;
				if (mycallback) { mycallback(id); }
			}

		});
	}

	render(faction="allies") {
		this.pushHudUnderOverlay();

		//
		// if already visible, don't reload
		//
		if (this.visible == true) {
			if (document.querySelector('.zoom_overlay')) {
				return;
			}
		}

		this.visible = true;
		this.overlay.show(ReservesTemplate(faction));

		let arb = document.querySelector(".reserves-overlay .units");
		arb.innerHTML = "";
		if (faction == "allies") {
		  for (let z = 0; z < this.mod.game.spaces["arbox"].units.length; z++) {
          	    if (this.mod.game.spaces["arbox"].units[z].damaged) {
      		      arb.innerHTML += `<img id="${z}" class="army-tile" src="/paths/img/army/${this.mod.game.spaces["arbox"].units[z].back}" />`;
      		    } else {
      		      arb.innerHTML += `<img id="${z}" class="army-tile" src="/paths/img/army/${this.mod.game.spaces["arbox"].units[z].front}" />`;
		    }
      		  }
	        }
		if (faction == "central") {
      		  for (let z = 0; z < this.mod.game.spaces["crbox"].units.length; z++) {
          	    if (this.mod.game.spaces["crbox"].units[z].damaged) {
      		      arb.innerHTML += `<img id="${z}" class="army-tile" src="/paths/img/army/${this.mod.game.spaces["crbox"].units[z].back}" />`;
		    } else {
      		      arb.innerHTML += `<img id="${z}" class="army-tile" src="/paths/img/army/${this.mod.game.spaces["crbox"].units[z].front}" />`;
		    }
      		  }
		}


		this.attachEvents();
	}

	attachEvents() {
	}
}

module.exports = ReservesOverlay;
