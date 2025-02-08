module.exports = PotDetailsTemplate = (game_mod) => {
	
	let pp = game_mod.game.state.player_pot;
	let pn = game_mod.game.state.player_names;

	let html = `<div class="pot-details-overlay">`;
	
	for (let i = 0; i < pp.length; i++){
		html += `<div class="saito-table-row">
					<div class="player-name">${pn[i]}</div>
					<div class="player-role">${game_mod.returnPlayerRole(i+1)}</div>
					<div class="player-bet">${pp[i]}</div>
				</div>`;
	}

	html += `</div>`;

	return html;
};
