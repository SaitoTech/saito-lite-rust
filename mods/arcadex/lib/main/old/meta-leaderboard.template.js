module.exports = MetaLeaderboardTemplate = (app, mod) => {
	let html = "";
    let league_mod = app.modules.returnModule("League");

	if (league_mod){

	  let leagues = league_mod.filterLeagues(app);
	  leagues = leagues.filter(l => l.admin == "saito");
	  
	  if (leagues.length > 0){
	  	html += `
			<div id="arcade-leaderboard" class="saito-sidebar-right">
	  			<div class="saito-leaderboard">
	        		<h6>Leaderboards:</h6>
	        		<div class="saito-table">`;

		let cnt = 0;
		leagues.forEach(l => {
			if (l.myRank > 0) {
				html += `<div id="league_${l.id}" class="saito-table-row rs-league-sidebar-ranking${(cnt%2 == 1)?" odd":""}">
				<div class="saito-table-gamename">${l.name}</div>
				<div class="saito-table-rank">${l.myRank}</div>
			</div>`;
			}
		});
		leagues.forEach(l => {
			if (l.myRank <= 0) {
				html += `<div <div id="league_${l.id}" class="saito-table-row rs-league-sidebar-ranking${(cnt%2 == 1)?" odd":""}">
				<div class="saito-table-gamename">${l.name}</div>
				<div class="saito-table-rank saito-deemphasize">…</div>
			</div>`;
			}
		});
		html += "</div>";
	  }
	}
    return html;
};

