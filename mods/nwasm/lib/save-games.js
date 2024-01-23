const saito = require('./../../../lib/saito/saito');
const SaveGamesTemplate = require('./save-games.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const JSON = require('json-bigint');

class SaveGamesOverlay {
	constructor(app, mod = null, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(this.app, this.mod);
	}

	render() {
		let app = this.app;
		let mod = this.mod;

		this.overlay.show(SaveGamesTemplate(app, mod));
		document.getElementById('nwasm-saved-games').innerHTML = '';

		for (let i = 0; i < mod.active_game_saves.length; i++) {
			let s = mod.active_game_saves[i];
			let stxmsg = s.returnMessage();
			let time_played = stxmsg.time_played;

			let hours = 0;
			let minutes = 0;
			let seconds = 0;

			let res = app.browser.formatTime(time_played);

			if (res.hours) {
				hours = res.hours;
			}
			if (res.minutes) {
				minutes = res.minutes;
			}
			if (res.seconds) {
				seconds = res.seconds;
			}

			let hours_full = '00';
			let minutes_full = '00';
			let seconds_full = '00';

			if (hours != 0) {
				if (hours < 10) {
					hours_full = '0' + hours.toString() + ':';
				} else {
					hours_full = hours.toString() + ':';
				}
			} else {
				hours_full = '';
			}

			if (minutes != 0) {
				if (minutes < 10) {
					minutes_full = '0' + minutes.toString() + ':';
				} else {
					minutes_full = minutes.toString() + ':';
				}
			} else {
				minutes_full = '00:';
			}
			if (seconds != 0) {
				if (seconds < 10) {
					seconds_full = '0' + seconds.toString();
				} else {
					seconds_full = seconds.toString();
				}
			} else {
				seconds_full = '00';
			}

			let time_elapsed = hours_full + minutes_full + seconds_full;

			let html = `
        <div id="save_game_${i}" data-id="${s.signature}" class="nwasm-saved-games-item">
          <div class="nwasm-saved-games-screenshot"><img src="${stxmsg.screenshot}" /><div class="nwasn_time_elapsed">${time_elapsed}</div></div>
        </div>
      `;
			if (!document.getElementById(`save_game_${i}`)) {
				app.browser.addElementToId(html, 'nwasm-saved-games');
			}
		}
		this.attachEvents();
	}

	attachEvents() {
		let app = this.app;
		let mod = this.mod;

		let sgo = this;

		for (let i = 0; i < mod.active_game_saves.length; i++) {
			let s = mod.active_game_saves[i];
			let obj = document.getElementById(`save_game_${i}`);
			obj.onclick = (e) => {
				sgo.overlay.hide();
				sgo.overlay.remove();
				let sig = e.currentTarget.getAttribute('data-id');
				mod.loadSaveGame(sig);
				sgo.overlay.hide();
			};
		}
	}
}

module.exports = SaveGamesOverlay;
