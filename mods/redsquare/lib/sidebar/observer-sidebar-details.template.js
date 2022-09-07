module.exports = RedSquareObserverSidebarDetailsTemplate = (app, mod, games) => {

	let html = `<h6>Live Games:</h6>`;
	let cnt = 0;

	for (let g of games){
		//We will only display live games
		if (g.game_status !== "over"){
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

		    
		  let inviteHtml = `
		    <div id="observe-${g.game_id}" class="arcade-tile">
		      <div class="invite-tile-wrapper">
		        <div class="game-inset-img" style="background-image: url('${gameBack}');"></div>
		        <div class="invite-col-2">
		          <div class="gameName">${gameName}</div>
		          <div style="font-size:0.9em">${g.step} moves as of ${datetime.hours}:${datetime.minutes}, ${datetime.day} ${datetime.month} ${datetime.year}</div>
		          ${playersHtml}
		        </div>
		        <div class="gameButtons" style="position:relative;">
	              <button data-sig="${g.game_id}" data-cmd="watch" class="button observe-game-btn">WATCH</button>
		        </div>
		      </div>
		    </div>`;

			html += inviteHtml;
		}
	}

	//IF there are no games, we want this to be invisible
	if (cnt == 0){
		html = "";
	}


  return html;
};

