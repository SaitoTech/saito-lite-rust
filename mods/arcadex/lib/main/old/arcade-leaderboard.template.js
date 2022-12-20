
module.exports = ArcadeLeaderboardTemplate = (app, mod) => {

	let league_id = (mod.viewing_game_homepage == mod.name)? "SAITOLICIOUS" : mod.viewing_game_homepage.toUpperCase();
	let league_mod = app.modules.returnModule("League");
	let leagueFound = false;

	let html = `<div id="arcade-leaderboard" class="saito-sidebar-right">
				<div class="leaderboard-header tip">Saito Leaderboard<div class="tiptext">View full leaderboard</div></div>`;
    
	for (let i = 0; i < league_mod.leagues.length; i++){
		if (league_mod.leagues[i].id == league_id){
			leagueFound = (league_mod.leagues[i].players.length > 0);
			for (let j = 0; j < league_mod.leagues[i].players.length; j++){
				let player = league_mod.leagues[i].players[j];
				if (j < 50 || player == app.wallet.returnPublicKey()){
					html += `<div class="saito-table-row">
		              			 <div>${j+1}</div>
		              			 <div class="saito-address saito-address-${player} ${(player ==app.wallet.returnPublicKey())?"me":""}" data-id="${player}">${player}</div>
		              		</div>`;
				}
			}
		}
	} 

	html += `</div>`;

	if (!leagueFound){
		html = `<div id="arcade-leaderboard" class="saito-sidebar-right" style="display:none;"></div>`;
	}

	return html;
	
};