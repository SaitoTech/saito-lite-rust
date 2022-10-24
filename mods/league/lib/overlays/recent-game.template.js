const SaitoModuleXTemplate = require("./../../../../lib/saito/new-ui/templates/saito-module-x.template");
const Moment = require("moment");

module.exports = RecentGameTemplate = (app, mod, league, games) => {

	const formatPlayers = (winner, playerList) =>{
		winner = winner.split("_");
		playerList = playerList.split("_");
		let playersHtml = `<div class="saito-module-description-identicon-box">`;
		for (let player of playerList){
	        let identicon = app.keys.returnIdenticon(player);
    	    playersHtml += `<div class="saito-module-identicon-box tip${(winner.includes(player))?" winner":""}"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(player)}</div></div>`;
		}
		playersHtml += `</div>`;
		return playersHtml;
	}


	// const makeGameRow = (game) => {
	//    	let html = 	`${(league.id == "SAITOLICIOUS")?`<div>${game.module}</div>`:""}
	//    				<div class="leagueGameplayerList">${formatPlayers(game.winner, game.players_array)}</div>
	//    				<div>${Moment(game.time_finished).fromNow()}</div>
	//    				<div>${game.method}</div>
	//    				<div><button class="button review-btn" data-id="${game.game_id}">REVIEW</button></div>
	//    				`;

	//    	return html;
	// }


	const makeGameRow = (game) => {

		console.log('game');
		console.log(game);

		let player_identicons = formatPlayers(game.winner, game.players_array);
		let game_img = '/'+game.module.toLowerCase()+'/img/arcade/arcade.jpg';
	   	let game_option = 	`${game.method} - ${Moment(game.time_finished).fromNow()}`;
	   	return SaitoModuleXTemplate(game.module, player_identicons, game_img, game_option, "Review", game.game_id);
	}

	let html = "";

	//
	//The table is represented as a grid with implicit rows
	//
	// html = `<div class="league-game-table ${(league.id == "SAITOLICIOUS")?" saitolicious":""}">
	// 			${(league.id == "SAITOLICIOUS")?"<div><b>Game</b></div>":""}
	// 			<div><b>Players</b></div>
	// 			<div><b>Time Finished</b></div>
	// 			<div></div>
	// 			<div></div>`;

    //add content
	for (let r of games){
		html += makeGameRow(r);
	}

   	return html;
};