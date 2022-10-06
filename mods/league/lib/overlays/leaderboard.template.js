module.exports = LeaderboardTemplate = (app, mod, league, players) => {

	const makePlayerRow = (player, rank) => {
	   	let html = 	`<div>${rank}</div>
	                 <div id="${player.pkey}" class="${(player.pkey == myKey)?"mystats":""} ${(player.pkey !== myKey)?"newfriend":""}">
	                 	${app.keys.returnIdentifierByPublicKey(player.pkey, true)}</div>
	                 <div class="${(player.pkey == myKey)?"mystats":""}">${Math.round(player.score)}</div>
	                 <div class="${(player.pkey == myKey)?"mystats":""}">${player.games_finished}</div>
	                 <div class="${(player.pkey == myKey)?"mystats":""}">${player.games_won}</div>
	                 <div class="${(player.pkey == myKey)?"mystats":""}">${player.games_tied}</div>`;
		if (league.admin == myKey){
		    html += `<div class="${(player.pkey == myKey)?"mystats":""}">${player.games_started}</div>`;
		    html += `<div class="edit_player" data-id="${player.pkey}"><i class="fas fa-edit"></i></div>`;
		    html += `<div class="delete_player" data-id="${player.pkey}"><i class="fa fa-trash"></i></div>`;
		}

	    if (league.id !== "SAITOLICIOUS"){
		    if (player.pkey !== myKey) {
		    	html +=  `<div><button class="button challenge-btn" data-id="${player.pkey}" style="display:none">CHALLENGE</button></div>`
		    }else{
		    	html += `<div></div>`;	
		    }
		}
	   	return html;
	}



    let myKey = app.wallet.returnPublicKey();

	let html = "";

	//
	//The table is represented as a grid with implicit rows
	//
	html = `<div class="league-leaderboard-table${(league.admin == myKey)?" admin":""}${(league.id == "SAITOLICIOUS")?" saitolicious":""}">
				<div><b>Rank</b></div>
				<div><b>Player</b></div>
				<div><b>Score</b></div>
				<div><b>Games</b></div>
				<div><b>Wins</b></div>
				<div><b>Ties</b></div>
				${(league.admin == myKey)?`<div><b>Games Started</b></div><div></div><div></div>` : ""}
				${(league.id !== "SAITOLICIOUS")? '<div></div>':""}`;

    //add content
	let cnt = 1;
	for (let r of players){
		html += makePlayerRow(r, cnt++);
	}

	html += `</div>`;

   	return html;
};