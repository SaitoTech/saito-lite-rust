/*********************************************************************************
 GAME ACKNOWLEDGE

 

**********************************************************************************/

class GameAcknowledge {
	playerAcknowledgeNotice(msg, mycallback) {
		let html = `<ul><li class="option acknowledge" id="confirmit">${this.acknowledge_text}</li></ul>`;

		//
		// overlays, etc. may also have control display options
		//
		document.querySelectorAll('.controls').forEach((el) => {
			el.innerHTML = html;
		});
		if (document.getElementById('controls')) {
			document.getElementById('controls').innerHTML = html;
		}

		try {
			this.hud.back_button = false;
			this.updateStatusWithOptions(msg, html);

			this.attachCardboxEvents();
			document.querySelectorAll('.acknowledge').forEach((el) => {
				el.onclick = (e) => {

					this.updateStatus("acknowledge");

					// update controls
					this.updateControls('');
					// if player clicks multiple times, don't want callback executed multiple times
					document.querySelectorAll('.acknowledge').forEach((el) => {
						el.onclick = null;
					});
					mycallback();
				};
			});
		} catch (err) {
			console.error('Error with ACKWNOLEDGE notice!: ' + err);
		}

		return 0;
	}

	addPublickeyConfirm(pubkey, confs) {
		this.game.tmp_confirms_received += parseInt(confs);
		this.game.tmp_confirms_players.push(pubkey);
	}
	hasPlayerConfirmed(pubkey) {
		if (this.game.tmp_confirms_players.includes(pubkey)) {
			return 1;
		}
		if (this.game.confirms_players.includes(pubkey)) {
			return 1;
		}
		return 0;
	}
	isGameHalted() {
		for (let z = this.game.queue.length-1; z >= 0; z--) {
		  let gle = this.game.queue[z].split("\t");
		  if (gle[0] === "HALTED") { return 1; }
		}
		return 0;
	}
	areMoreConfirmsNeeded(array_of_player_nums) {
		if (this.game.confirms_received < this.game.confirms_needed.length) {
			return 1;
		}
		return 0;
	}
	removeConfirmsNeeded(array_of_player_nums) {
		this.game.confirms_needed = [];
		this.game.confirms_received = 0;
		this.game.confirms_players = [];
		this.game.tmp_confirms_received = 0;
		this.game.tmp_confirms_players = [];

		for (let i = 0; i < this.game.players.length; i++) {
			this.game.confirms_needed[i] = 0;
		}
	}
	resetConfirmsNeeded(array_of_player_nums) {
		this.game.confirms_needed = [];
		this.game.confirms_received = 0;
		this.game.confirms_players = [];
		this.game.tmp_confirms_received = 0;
		this.game.tmp_confirms_players = [];

		for (let i = 0; i < this.game.players.length; i++) {
			if (
				array_of_player_nums.includes(i + 1) ||
				array_of_player_nums.includes(this.game.players[i])
			) {
				this.game.confirms_needed[i] = 1;
			} else {
				this.game.confirms_needed[i] = 0;
			}
		}
	}
}

module.exports = GameAcknowledge;
