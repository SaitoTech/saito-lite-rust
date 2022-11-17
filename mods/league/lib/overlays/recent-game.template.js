const SaitoModuleXTemplate = require("./../../../../lib/saito/new-ui/templates/saito-module-x.template");
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
	    	let html = 	//`${(league.id == "SAITOLICIOUS")?`<div>${game.module}</div>`:""}
	    				`<div class="league-player-list player-info">${formatPlayers(game.winner, game.players_array)}</div>
	    				<div>${Moment(game.time_finished).fromNow()}</div>
	    				<div>${game.method}</div>
	     				`;
	     	if (game.players_array.includes(app.wallet.returnPublicKey())){
	     		html += `<div class="button saito-button-primary challenge-btn" data-id="${game.game_id}">DISPUTE</div>`;
	     	}else{
	     		html += `<div></div>`;
	     	}
	    	return html;
	 }


	/*const makeGameRow = (game) => {

		console.log('game');
		console.log(game);

		let player_identicons = formatPlayers(game.winner, game.players_array);
		let game_img = '/'+game.module.toLowerCase()+'/img/arcade/arcade.jpg';
	   	let game_option = 	`${game.method} - ${Moment(game.time_finished).fromNow()}`;
	   	return SaitoModuleXTemplate(game.module, player_identicons, game_img, game_option, "Review", game.game_id);
	}*/

	let html = "";

    //add content
	for (let r of games){
		html += makeGameRow(r);
	}

   	return html;
};