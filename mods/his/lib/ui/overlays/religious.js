const ReligiousTemplate = require('./religious.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ReligiousOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.overlay.hide();
	}

	render() {
		let his_self = this.mod;
		this.visible = true;

		//
		// show overlay
		//
		this.overlay.show(ReligiousTemplate());

		//
		//
		//
		let num_protestant_spaces = 0;
		let rcc = this.returnReligiousConflictChart();
		for (let key in his_self.game.spaces) {
			if (his_self.game.spaces[key].religion === 'protestant') {
				num_protestant_spaces++;
			}
		}
		if (num_protestant_spaces > 50) {
			num_protestant_spaces = 50;
		}
		let cid = 's' + num_protestant_spaces;

		//
		// list all debaters
		//
		for (let i = 0; i < his_self.game.state.debaters.length; i++) {
			let d = his_self.game.state.debaters[i];
			console.log(JSON.stringify(d));
			let dtile = `<img class="rdebater_tile" id="${i}" src="/his/img/tiles/debaters/${d.img}" />`;
			if (d.owner === 'papacy') {
				his_self.app.browser.addElementToSelector(
					dtile,
					'.papal_debaters'
				);
			}
			if (d.owner === 'england') {
				his_self.app.browser.addElementToSelector(
					dtile,
					'.anglican_debaters'
				);
			}
			if (d.owner === 'hapsburg') {
				his_self.app.browser.addElementToSelector(
					dtile,
					'.calvinist_debaters'
				);
			}
			if (d.owner === 'protestant') {
				his_self.app.browser.addElementToSelector(
					dtile,
					'.protestant_debaters'
				);
			}
		}

		let obj = document.getElementById('religious_conflict_sheet_tile');
		obj.style.top = rcc[cid].top;
		obj.style.left = rcc[cid].left;

		this.attachEvents();
	}

	attachEvents() {}

	returnReligiousConflictChart() {
		let chart = {};

		chart['s0'] = {
			top: '475px',
			left: '64px'
		};
		chart['s1'] = {
			top: '475px',
			left: '140px'
		};
		chart['s2'] = {
			top: '475px',
			left: '216px'
		};
		chart['s3'] = {
			top: '475px',
			left: '292px'
		};
		chart['s4'] = {
			top: '475px',
			left: '368px'
		};
		chart['s5'] = {
			top: '475px',
			left: '444px'
		};
		chart['s6'] = {
			top: '475px',
			left: '520px'
		};
		chart['s7'] = {
			top: '475px',
			left: '596px'
		};
		chart['s8'] = {
			top: '475px',
			left: '672px'
		};
		chart['s9'] = {
			top: '475px',
			left: '748px'
		};
		chart['s10'] = {
			top: '475px',
			left: '824px'
		};
		chart['s11'] = {
			top: '475px',
			left: '900px'
		};
		chart['s12'] = {
			top: '475px',
			left: '976px'
		};
		chart['s13'] = {
			top: '558px',
			left: '64px'
		};
		chart['s14'] = {
			top: '558px',
			left: '140px'
		};
		chart['s15'] = {
			top: '558px',
			left: '216px'
		};
		chart['s16'] = {
			top: '558px',
			left: '292px'
		};
		chart['s17'] = {
			top: '558px',
			left: '368px'
		};
		chart['s18'] = {
			top: '558px',
			left: '444px'
		};
		chart['s19'] = {
			top: '558px',
			left: '520px'
		};
		chart['s20'] = {
			top: '558px',
			left: '596px'
		};
		chart['s21'] = {
			top: '558px',
			left: '672px'
		};
		chart['s22'] = {
			top: '558px',
			left: '748px'
		};
		chart['s23'] = {
			top: '558px',
			left: '824px'
		};
		chart['s24'] = {
			top: '558px',
			left: '900px'
		};
		chart['s25'] = {
			top: '558px',
			left: '976px'
		};
		chart['s26'] = {
			top: '643px',
			left: '64px'
		};
		chart['s27'] = {
			top: '643px',
			left: '140px'
		};
		chart['s28'] = {
			top: '643px',
			left: '216px'
		};
		chart['s29'] = {
			top: '643px',
			left: '292px'
		};
		chart['s30'] = {
			top: '643px',
			left: '368px'
		};
		chart['s31'] = {
			top: '643px',
			left: '444px'
		};
		chart['s32'] = {
			top: '643px',
			left: '520px'
		};
		chart['s33'] = {
			top: '643px',
			left: '596px'
		};
		chart['s34'] = {
			top: '643px',
			left: '672px'
		};
		chart['s35'] = {
			top: '643px',
			left: '748px'
		};
		chart['s36'] = {
			top: '643px',
			left: '824px'
		};
		chart['s37'] = {
			top: '643px',
			left: '900px'
		};
		chart['s38'] = {
			top: '643px',
			left: '976px'
		};
		chart['s39'] = {
			top: '475px',
			left: '64px'
		};
		chart['s40'] = {
			top: '726px',
			left: '140px'
		};
		chart['s41'] = {
			top: '726px',
			left: '216px'
		};
		chart['s42'] = {
			top: '726px',
			left: '292px'
		};
		chart['s43'] = {
			top: '726px',
			left: '368px'
		};
		chart['s44'] = {
			top: '726px',
			left: '444px'
		};
		chart['s45'] = {
			top: '726px',
			left: '520px'
		};
		chart['s46'] = {
			top: '726px',
			left: '596px'
		};
		chart['s47'] = {
			top: '726px',
			left: '672px'
		};
		chart['s48'] = {
			top: '726px',
			left: '672px'
		};
		chart['s49'] = {
			top: '726px',
			left: '748px'
		};
		chart['s50'] = {
			top: '726px',
			left: '824px'
		};

		return chart;
	}
}

module.exports = ReligiousOverlay;
