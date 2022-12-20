const SaitoModuleImageBoxTemplate = require('./../../../../lib/saito/new-ui/templates/saito-module-imagebox.template');
const SaitoUser = require('./../../../../lib/saito/new-ui/templates/saito-user-small.template');

module.exports = ArcadeLeagueTemplate = (app, mod) => {

    let league_mod = app.modules.returnModule("League");
    let leagues = league_mod.respondTo("user-leagues");

    let all_games = (mod.viewing_game_homepage == mod.name);
    let number_leagues_displayed = 0;

    let html = `<div id="arcade-leagues" class="arcade-leagues">
				    <div class="arcade-league-header">
				    	<div class="arcade-league-title" id="goto-league-page">Community Leagues</div>
				    </div>
				    
				    <div class="arcade-league-boxes">
    `;

    for (let league of leagues){
    	if (!all_games && mod.viewing_game_homepage !== league.game){
    		continue;
    	}
    	let gameMod = app.modules.returnModule(league.game);
    	let modimage = `/${gameMod.returnSlug()}/img/arcade/arcade.jpg`;
    	number_leagues_displayed++;
        html += `
        	<div class="saito-game${(all_games)?"":" minimize"}">
	        	${SaitoModuleImageBoxTemplate(league.name, modimage)}
          		<div class="saito-game-content">
            		<div class="saito-leaderboard">
              			<div class="saito-table">
        `;
        
         for (let i = 1; i <= 3; i ++){
	        let player = (i <= league.top3.length) ? league.top3[i-1] : null;
	        if (player){
	            html += `<div class="saito-table-row ${(i%2 == 1)?"odd":""}">
	                        <div class="saito-leaderboard-gamename">${SaitoUser(app, player)}</div>
	                        <div class="saito-leaderboard-rank">${i}</div>
	                     </div>`;     
	       	}
        }

	   	html += `
              		</div>
             	</div>
             	
             	<div class="saito-box-buttons">
                	<div class="button saito-button-primary league-button" data-cmd="view" data-id="${league.id}">VIEW</div>
		`;
		if (league.myRank > 0){
			if (league.game && league_mod.checkDate(league.enddate) && league_mod.checkDate(league.startdate, true)){
			  html += `<div class="button saito-button-primary league-button" data-id="${league.id}" data-cmd="play">PLAY</div>`;
			}
		}else{
			if (league.max_players == 0 || league?.playerCnt < league.max_players){
			  if (league_mod.checkDate(league.startdate) || league.allowlate){
			  	if (league.type === "public"){
				    html += `<div data-id="${league.id}" data-cmd="join" class="button saito-button-primary league-button">JOIN</div>`;			  		
			  	}
			  }
			}
		}         
        
        html += ` </div>
        		</div>
          
          	</div>
      	`;

    }

    html += `</div></div>`;

    if (number_leagues_displayed > 0){
    	return html;	
    }else{
    	return `<div id="arcade-leagues" class="arcade-leagues"></div>`;
    }
    
}

