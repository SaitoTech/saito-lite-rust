module.exports = LeaderboardTemplate = (app, mod, league, players) => {

	const makePlayerRow = (player, rank) => {
	   	let html = 	`
	    <div class="saito-table-row">
              <div>${rank}</div>
              <div class="saito-address saito-address-${player.pkey}" data-id="${player.pkey}">${player.pkey}</div>
              <div class="">${Math.round(player.score)}</div>
              <div class="">${player.games_won}</div>
              <div class="">${player.games_finished - player.games_won}</div>
            </div>
	   	`;
	   	return html;
	}



        let myKey = app.wallet.returnPublicKey();

	let html = "";

	let cnt = 1;
	for (let r of players){
		html += makePlayerRow(r, cnt++);
	}

   	return html;
};
