/*********************************************************************************
 GAME ACKNOWLEDGE

 

**********************************************************************************/

class GameAcknowledge {

	playerAcknowledgeNotice(msg, mycallback) {

		let html = '';
		let options = null;
		if (Array.isArray(mycallback)) {
			options = mycallback;
		}

	    if (options) {
		  html = `<ul>`;
   		  for (let z = 0; z < options.length; z++) {
		    html += `<li class="option acknowledge" id="${z}">${options[z].text}</li>`;
		  }
		  html += `</ul>`;
        } else {
		  html = `<ul><li class="option acknowledge" id="confirmit">${this.acknowledge_text}</li></ul>`;
		}

		if (!this.game.player){
			console.log("Game observer goes into ACKWNOLEDGE state");
		}

		//
		// overlays, etc. may also have control display options
		// so we loop through anything that has ".controls" as its
		// class and update it to display the option.
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

			this.lockInterface();

			this.attachCardboxEvents();
			document.querySelectorAll('.acknowledge').forEach((el) => {

				el.onclick = async (e) => {
					e.stopPropagation();
					
					this.unlockInterface();
					this.updateStatus("acknowledged");
					this.clearShotClock();

					// update controls
					this.updateControls('');
					// if player clicks multiple times, don't want callback executed multiple times
					document.querySelectorAll('.acknowledge').forEach((el) => {
						el.onclick = null;
					});

					if (options) {
					  let idx = parseInt(e.currentTarget.id);
					  await options[idx].mycallback();
					} else {
					  await mycallback();
					}

					// undo halted
					this.halted = 0;

				};
			});

			this.playChime();
			this.ignore_notifications = false;

		} catch (err) {
			console.error('Error with ACKWNOLEDGE notice!: ' + err);
		}

		console.info('Halt game for acknowledge');
		
		// this should be ok
		this.halted = 1;

		// pls do not re-enable without thinking very, very carefully
		//this.saveGame(this.game.id);

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
	areMoreConfirmsNeeded() {
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
		this.game.tmp_confirm_sent = 0;
		this.game.tmp_confirms_received = 0;
		this.game.tmp_confirms_players = [];

		let type_of_indicator = 1; // numb

		if (array_of_player_nums.length > 0) {
		  if (array_of_player_nums[0].length > 10) { type_of_indicator = 2; }
		}

		if (type_of_indicator == 1) {
		  for (let i = 0; i < array_of_player_nums.length; i++) {
		    array_of_player_nums[i] = parseInt(array_of_player_nums[i]);
		  }
		}

console.log("RESETCONFIRMSNEEDED in");
console.log("type of indicator: " + type_of_indicator);
console.log("array of player nums: " + JSON.stringify(array_of_player_nums));

		for (let i = 0; i < this.game.players.length; i++) {
			if (type_of_indicator == 1) {
				if (
					array_of_player_nums.includes((i+1))
				) {
					this.game.confirms_needed[i] = 1;
				} else {
					this.game.confirms_needed[i] = 0;
				}
			} else {
console.log("checking: " + this.game.players[i]);
				if (
					array_of_player_nums.includes(this.game.players[i])
				) {
console.log("confirm needed!");
					this.game.confirms_needed[i] = 1;
				} else {
console.log("confirm not needed!");
					this.game.confirms_needed[i] = 0;
				}
			}
		}
	}
}

module.exports = GameAcknowledge;
