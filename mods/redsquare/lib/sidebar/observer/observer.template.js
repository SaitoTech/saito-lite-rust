const Moment = require("moment");

module.exports = RedSquareObserverTemplate = (app, mod, obs_mod, games) => {
	let html = "";
	if (games.length < 1) {
		// games = obs_mod.games;
	}

	if (obs_mod){
		let cutoff = new Date().getTime() - 5 * 60 * 1000;

		html = `<div id="rs_sidebar_observer" class="observer_sidebar">`;

			html += `<h6>Live Games:</h6>`;
			html += `<div class="saito-table">`;
			let cnt = 0;

			for (let g of games){
				//We will only display live games
				if (g.game_status !== "over" && g.ts > cutoff){
				 cnt++;

					let gameModule = app.modules.returnModule(g.module);
		  		    let slug = gameModule.returnSlug();

				    let playersHtml = `<div class="playerInfo" style="grid-template-columns: repeat(${g.players_array.split("_").length}, 1fr);">`;
				    let gameName= gameModule.gamename || gameModule.name;
				  
				    let gametime = g.ts;
				    let datetime = app.browser.formatDate(gametime);

				    g.players_array.split("_").forEach((player) => {
				      let identicon = app.keys.returnIdenticon(player);
				      playersHtml += `<div class="player-slot tip id-${player}"><img class="identicon" src="${identicon}"><div class="tiptext">${app.browser.returnAddressHTML(player)}</div></div>`;
				    });
				    playersHtml += '</div>';

				    let gameBack = gameModule.respondTo("arcade-games")?.img || `/${slug}/img/arcade.jpg`;
				    let isMyGame = false;
				   	for (let local_game of app.options.games) {
	    				if (local_game.id === g.game_id) {
	    					if (local_game.player !== 0){
	    						isMyGame = true;	
	    					}
	    				}
	    			}

					let inviteHtml = `
					    <div class="saito-table-row">
					        <div class="saito-table-gamename observer-info">
					            <div>${gameName}</div>
					            ${playersHtml}
					        </div>
					        <div class="observer-details saito-deemphasize"><p>${g.step} moves</p><p>Started ${Moment(g.ts).fromNow()}</p></div>
					        <div class="observer-action"><a href="#" data-sig="${g.game_id}" data-cmd="watch" class="button observe-game-btn">${(isMyGame)?"Play":"Watch"}</a></div>
					    </div>
					`;

					html += inviteHtml;
				}
			}


		html +=  `
			</div>
		</div>`;

		//IF there are no games, we want this to be invisible
		if (cnt == 0){
			html = "";
		}
	}
  	
  	return html;
};