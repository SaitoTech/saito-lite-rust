const HudPopupTemplate = require('./overlays/welcome.template');

class HudPopup {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
	}

	render(obj = {}) {

                let his_self = this.mod;

		let title = ""; if (obj.title) { title = obj.title; }
		let text = ""; if (obj.text) { text = obj.title; }
		if (title === text) { text = ""; }
		let img = ""; if (obj.img) { img = obj.img; }
		let card = ""; if (obj.card) { card = obj.card; }
		let styles = ""; if (obj.styles) { 
		  for (let z = 0; z < obj.styles.length; z++) {
		    styles += `${obj.styles[z].key}:${obj.styles[z].val} `;
		  }
		}

		let html = '';

		if (title != "") { title = `<div class="welcome-title">${title}</div>`; }
		if (text != "") { text = `<div class="welcome-text">${text}</div>`; }

		if (img != "") {

		  html = `
		    <div class="welcome " style="display: block; ${styles}; background-image: url(${img});" >
		      ${title}
		      ${text}
		    </div>
		  `;

		} else {

		  html = `
		    <div class="welcome " style="display: block; ${styles}; " >
		      ${title}
		      ${text}
		    </div>
		  `;

		}

                his_self.hud.showPopup(html, 5000); 

	}

	remove() {
          this.mod.hud.hidePopup();
	}

	hide() {
          this.mod.hud.hidePopup();
	}
}

module.exports = HudPopup;

