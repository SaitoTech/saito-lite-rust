module.exports  = (imperium_self) => {
	let factions = imperium_self.returnFactions();
	let vp_needed = 14;
	if (
		imperium_self.game.state.vp_target != 14 &&
		imperium_self.game.state.vp_target > 0
	) {
		vp_needed = imperium_self.game.state.vp_target;
	}
	if (imperium_self.game.options.vp) {
		vp_needed = parseInt(imperium_self.game.options.vp);
	}

	let html = `<div class="leaderboard" id="leaderboard">`;
	html +=
		'<div class="VP-track-label" id="VP-track-label">Victory Points</div>';
	for (let j = vp_needed; j >= 0; j--) {
		html +=
			'<div class="vp ' +
			j +
			'-points"><div class="player-vp-background">' +
			j +
			'</div>';
		html += '<div class="vp-players">';
		for (let i = 0; i < imperium_self.game.state.players_info.length; i++) {
			if (imperium_self.game.state.players_info[i].vp == j) {
				html += `  <div class="player-vp" style="background-color:var(--p${
					i + 1
				});"><div class="vp-faction-name">${
					factions[imperium_self.game.state.players_info[i].faction]
						.name
				}</div></div>`;
			}
		}
		html += '</div></div>';
	}
	html += '</div>';

	return html;
};
