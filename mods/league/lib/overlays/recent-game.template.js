const Moment = require("moment");

module.exports = RecentGameTemplate = (app, mod, league, games) => {

	const formatPlayers = (winner, playerList) =>{
		winner = winner.split("_");
		playerList = playerList.split("_");
		let playersHtml = "";
		for (let player of playerList){
	        let identicon = app.keys.returnIdenticon(player);
    	    playersHtml += `<div class="player-slot tip${(winner.includes(player))?" winner":""}"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(player)}</div></div>`;
		}
		return playersHtml;
	}


	const makeGameRow = (game) => {
	   	let html = 	`${(league.id == "SAITOLICIOUS")?`<div>${game.module}</div>`:""}
	   				<div class="leagueGameplayerList">${formatPlayers(game.winner, game.players_array)}</div>
	   				<div>${Moment(game.time_finished).fromNow()}</div>
	   				<div>${game.method}</div>
	   				<div><button class="button review-btn" data-id="${game.game_id}">REVIEW</button></div>
	   				`;

	   	return html;
	}



	let html = "";

	//
	//The table is represented as a grid with implicit rows
	//
	html = `<div class="league-game-table ${(league.id == "SAITOLICIOUS")?" saitolicious":""}">
				${(league.id == "SAITOLICIOUS")?"<div><b>Game</b></div>":""}
				<div><b>Players</b></div>
				<div><b>Time Finished</b></div>
				<div></div>
				<div></div>`;

    //add content
	for (let r of games){
		html += makeGameRow(r);
	}

	html += `</div>`;

   	return html;
};