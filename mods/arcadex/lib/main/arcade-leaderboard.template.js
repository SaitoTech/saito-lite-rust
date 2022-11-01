
module.exports = ArcadeLeaderboardTemplate = (app, mod) => {

	let league_id = (mod.viewing_game_homepage == mod.name)? "SAITOLICIOUS" : mod.viewing_game_homepage.toUpperCase();
	let league_mod = app.modules.returnModule("League");

	let html = `<div id="arcade-leaderboard" class="saito-sidebar-right">
				<div class="leaderboard-header">Global Rankings</div>`;
    
	for (let i = 0; i < league_mod.leagues.length; i++){
		if (league_mod.leagues[i].id == league_id){
			for (let j = 0; j < league_mod.leagues[i].players.length; j++){
				let player = league_mod.leagues[i].players[j];
				if (j < 50 || player == app.wallet.returnPublicKey()){
					html += `<div class="saito-table-row">
		              			 <div>${j+1}</div>
		              			 <div class="saito-address saito-address-${player}" data-id="${player}">${player}</div>
		              		</div>`;
				}
			}
		}
	} 

	html += `</div>`;

	return html;
	
};