const ReformationTemplate = require('./reformation.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ReformationOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);
	}

	hide() {
		this.overlay.hide();
	}

	render(res = null) {
		this.visible = true;
		let name = '';
		if (res) {
			name = res.name;
		}
		this.overlay.show(ReformationTemplate(name, res));
		this.overlay.setBackgroundColor('#000'); // black background

		//
		// pull over theses-overlay / zoom if visible
		//
		document.querySelectorAll('.theses-overlay').forEach((el) => {
			let zindex = el.style.zIndex;
			let my_zindex = document.querySelector('.reformation-overlay');
			if (my_zindex) {
				if (parseInt(zindex) >= parseInt(my_zindex.style.zIndex)) {
					my_zindex.style.zIndex = parseInt(zindex) + 1;
				}
			}
		});

		if (res == null) {
			return;
		}

		for (let i = 0; i < res.pdice.length; i++) {
			let rrclass = '';
			if (res.protestants_win == 1) {
				if (res.pdice[i] >= res.p_high) {
					rrclass = 'hit';
				}
			}
			let html = `
			    <div class="reformation-row">
			    	<div class="reform-box-description">${res.p_roll_desc[i].name} <div class="adjacency">${res.p_roll_desc[i].desc}</div></div>
		            	<div class="reform-roll ${rrclass}">${res.pdice[i]}</div>
		            </div>	
			  `;
			this.app.browser.addElementToSelector(
				html,
				'.reformation-box .protestant'
			);
		}
		for (let i = 0; i < res.cdice.length; i++) {
			let rrclass = '';
			if (res.protestants_win != 1) {
				if (res.cdice[i] >= res.c_high) {
					rrclass = 'hit';
				}
			}
			let html = `	  
			    <div class="reformation-row">
			    	<div class="reform-box-description">${res.c_roll_desc[i].name} <div class="adjacency">${res.c_roll_desc[i].desc}</div></div>
		            	<div class="reform-roll ${rrclass}">${res.cdice[i]}</div>
		            </div>
			  `;
			this.app.browser.addElementToSelector(
				html,
				'.reformation-box .papacy'
			);
		}
	}

	attachEvents() {}
}

module.exports = ReformationOverlay;
