const DietOfWormsTemplate = require('./diet-of-worms.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DietOfWormsOverlay {
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

	render() {
		this.visible = true;
		this.overlay.show(
			DietOfWormsTemplate(this.mod, this.mod.game.players.length)
		);

		//
		// pull GAME HUD over overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}

		this.attachEvents();
	}

	attachEvents() {}

	addCardToCardfan(card, fan = 'protestant') {
		if (!document.querySelector('.diet-overlay')) {
			return;
		}

		let html = `<div id="${card}" class="card hud-card ${card}">${this.mod.returnCardImage(
			card,
			0
		)}</div>`;

		if (fan === 'protestant') {
			this.app.browser.addElementToSelector(
				html,
				'.cardfans .protestant'
			);
		} else {
			this.app.browser.addElementToSelector(html, '.cardfans .catholic');
		}

		//
		// add cardfan effect if 2 cards
		//
		if (
			document
				.querySelector('.cardfans .catholic')
				.querySelectorAll('div').length > 1
		) {
			document.querySelector(
				'.catholic>.card:nth-child(1)'
			).style.transform = 'rotate(-10deg)';
			document.querySelector(
				'.catholic>.card:nth-child(1)'
			).style.zIndex = 30;
		}
	}

	showResults(obj) {
		let his_self = this.mod;

		this.mod.hud.zIndex = 10;
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = 10;
		}
		this.mod.updateStatus('');

		if (!document.querySelector('.diet-overlay')) {
			return;
		}

		let protestant_hits = obj.protestant_hits;
		let papacy_hits = obj.papacy_hits;
		let protestant_rolls = obj.protestant_rolls;
		let papacy_rolls = obj.papacy_rolls;
		let winner = obj.winner;
		let difference = obj.difference;
		let html = '';

		html = 'Protestants: [';
		for (let i = 0; i < protestant_rolls.length; i++) {
			if (i > 0) {
				html += ', ';
			}
			html += protestant_rolls[i];
		}
		html += '] ' + protestant_hits + ' ';
		if (protestant_hits == 1) {
			html += 'hit';
		} else {
			html += 'hits';
		}

		html += '<p></p>';

		html += 'Catholics: [';
		for (let i = 0; i < papacy_rolls.length; i++) {
			if (i > 0) {
				html += ', ';
			}
			html += papacy_rolls[i];
		}
		html += '] ' + papacy_hits + ' ';
		if (papacy_hits == 1) {
			html += 'hit';
		} else {
			html += 'hits';
		}

		html += '<p></p>';

		let hits = 'hits';
		if (difference == 1) {
			hits = 'hit';
		}
		let spaces = 'spaces';
		if (difference == 1) {
			spaces = 'space';
		}

		if (winner === 'protestant') {
			html +=
				'Protestants may convert ' +
				difference +
				' ' +
				spaces +
				' (<span class="diet_of_worms_end"> click here </span>)';
		} else {
			if (winner === 'papacy') {
				html +=
					'Papacy may convert ' +
					difference +
					' ' +
					spaces +
					' (<span class="diet_of_worms_end"> click here </span>)';
			} else {
				html +=
					'Diet of Worms ends inconclusively (<span class="diet_of_worms_noskip"> click here </span>)';
			}
		}

		document.querySelector('.diet-overlay .help').innerHTML = html;
		$('.diet_of_worms_noskip').off();
		$('.diet_of_worms_noskip').on('click', () => {
			this.hide();
		});

		$('.diet_of_worms_end').off();
		$('.diet_of_worms_end').on('click', () => {
			let lqe = his_self.game.queue[his_self.game.queue.length - 1];
			let mv = lqe.split('\t');
			if (mv[0] === 'ACKNOWLEDGE') {
		    		let obj = document.querySelector(".option.acknowledge");
				if (obj) {
					obj.click();
				} else {
					his_self.game.queue.splice(his_self.game.queue.length - 1, 1);
					his_self.restartQueue();
				}
			}
			this.overlay.remove();
		});
	}
}

module.exports = DietOfWormsOverlay;
