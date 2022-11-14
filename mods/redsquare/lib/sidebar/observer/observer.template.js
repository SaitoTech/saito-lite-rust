const SaitoModuleXTemplate = require("../../../../../lib/saito/new-ui/templates/saito-module-x.template");
const Moment = require("moment");

module.exports = RedSquareObserverTemplate = (app, mod) => {
	let html = "";

	let obs_mod = app.modules.returnModule("Observer");

	if (obs_mod){

		let games = obs_mod.games;

		let cutoff = new Date().getTime() - 20 * 60 * 1000;

		html = `<div id="rs-sidebar-observer" class="observer-sidebar">`;

		html += `<h6>Watch Live:</h6>`;
		let cnt = 0;

		/*
			So each game (should) have a ts (initial creation time) of the initial game state
			and a latest_move with is the ts of the last game step.
		*/

		for (let g of games){

			let players = g.players_array.split("_");

			//Only list recent (last move within 20 minutes), ongoing (not over) games for which I am NOT a player
			if (g.game_status !== "over" && g.latest_move > cutoff && !players.includes(app.wallet.returnPublicKey())){

				let gameModule = app.modules.returnModule(g.module);
	  		    let slug = gameModule.returnSlug();

			    let playersHtml = `<div class="saito-module-description-identicon-box">`;
			    let gameName= gameModule.gamename || gameModule.name;
			  
			  	let gameState = JSON.parse(g.game_state)
			    let numSeats = /*gameState?.options?.max_players ||*/ players.length;
			    //console.log(JSON.parse(JSON.stringify(gameState)));
			    //console.log(numSeats);

				cnt++;

			    for (let i = 0; i < 4; i++){
			    	if (i == 3 && numSeats > 4){
			    		playersHtml += `<div class="saito-module-identicon-box fas fa-ellipsis-h"></div>`;  
			    	}else{
			    		if (players[i]){
					      let identicon = app.keys.returnIdenticon(players[i]);
					      playersHtml += `<div class="saito-module-identicon-box tip id-${players[i]}"><img class="saito-module-identicon small" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(players[i])}</div></div>`;
			    		}else{
			    			if (i < numSeats){
			    				playersHtml += `<div class="saito-module-identicon-box identicon-empty"></div>`;			
			    			}
			    		}
			    	}
			    }
			    playersHtml += '</div>';

			    let image = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;
			    let isMyGame = false;
			   	/*for (let local_game of app.options.games) {
    				if (local_game.id === g.game_id) {
    					if (local_game.player !== 0){
    						isMyGame = true;	
    					}
    				}
    			}*/

				let inviteHtml = SaitoModuleXTemplate(gameName, playersHtml, image, `${g.step} moves`, `${(isMyGame)?"Play":"Watch"}`, g.game_id);

				html += inviteHtml;
			}
		}


		html +=  `
		</div>`;

		//IF there are no games, we want this to be invisible
		if (cnt == 0){
			html = "";
		}
	}
  	
  	return html;
};
