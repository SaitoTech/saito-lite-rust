module.exports = (app, mod, invite) => {
	let time = invite.time_finished || invite.time_created;
	let datetime = app.browser.formatDate(time);
	let date = datetime.hours + ':' + datetime.minutes;
	if (invite.time_finished) {
		date += ', ' + datetime.day + ' ' + datetime.month;
	}

	let players_html = `<div class="league_recent_players_list">`;
	// render players who have joined
	for (let i = 0; i < invite.players.length; i++) {
		players_html += `
          <div class="league_recent_player${
	invite.winner?.includes(invite.players[i]) ? ' winner' : ''
}"><img class="saito-module-identicon saito-identicon" id-${
	invite.players[i]
}" src="${app.keychain.returnIdenticon(invite.players[i])}"></div>

      `;
	}
	players_html += '</div>';

	return `
        <div class="saito-table-row league_recent_game" id="saito-game-${
	invite.game_id
}">
          <div class="league_recent_date">${date}</div>${players_html}<div class="league_recent_cause">${
	invite.method ? invite.method : invite?.step || 0
}</div>
        </div>
    `;
};
