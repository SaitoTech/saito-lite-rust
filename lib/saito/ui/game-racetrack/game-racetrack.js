const GameRaceTrackTemplate = require('./game-racetrack.template');

class GameRaceTrack {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		this.min = 0; //Starting score
		this.win = 10; //winning score
		this.title = 'Victory Points';

		this.icon = `<i class="fas fa-flag-checkered"></i>`;
		//this.icon = `<i class="fa-solid fa-trophy"></i>`;

		this.players = [];
		/* Player obj
      {
        name
        score
        color
      }

    */
	}

	render() {
		if (document.getElementById('racetrack')) {
			this.app.browser.replaceElementById(
				GameRaceTrackTemplate(this),
				'racetrack'
			);
		} else {
			this.app.browser.addElementToDom(GameRaceTrackTemplate(this));
		}

		this.lock();
		this.attachEvents();
	}

	advancePlayer(player, amt = 1) {
		if (player < 1 || player > this.players.length) {
			return;
		}
		this.players[player - 1].score += amt;
		this.render();
	}

	attachEvents() {
		document.querySelector('.racetrack').onclick = (e) => {
			if (
				document
					.querySelector('.racetrack')
					.classList.contains('racetrack-lock')
			) {
				document
					.querySelector('.racetrack')
					.classList.remove('racetrack-lock');
			} else {
				document
					.querySelector('.racetrack')
					.classList.add('racetrack-lock');
			}
		};
	}

	lock() {
		try {
			document
				.querySelector('.racetrack')
				.classList.add('racetrack-lock');
			setTimeout(function () {
				document
					.querySelector('.racetrack')
					.classList.remove('racetrack-lock');
			}, 3000);
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = GameRaceTrack;
