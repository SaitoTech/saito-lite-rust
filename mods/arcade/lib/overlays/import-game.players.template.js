module.exports  = (app, mod, game_mod, gameobj) => {

	let html = "";

	for (let i = 0; i < gameobj.players_info.length; i++) {
		html += `Player ${JSON.stringify(gameobj.players_info[i])}`;
	}

	return html;
};
