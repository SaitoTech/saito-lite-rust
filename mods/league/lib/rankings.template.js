module.exports = LeagueRankingsTemplate = (app, mod) => {

    let html = "";
    let leagues = mod.filterLeagues(app);

    if (leagues.length > 0){

      html += `

 	      <div class="saito-leaderboard">

	        <h6>Rankings:</h6>
	        <div class="saito-table">`;

		let cnt = 0;
		leagues.forEach(l => {
			if (l.myRank > 0) {
				html += `<div id="league_${l.id}" class="saito-table-row league-leaderboard-ranking${(cnt%2 == 1)?" odd":""}">
				<div class="saito-table-gamename">${l.name}</div>
				<div class="saito-table-rank">${l.myRank}</div>
			</div>`;
			}
		});
		leagues.forEach(l => {
			if (l.myRank <= 0) {
				html += `<div <div id="league_${l.id}" class="saito-table-row league-leaderboard-ranking${(cnt%2 == 1)?" odd":""}">
				<div class="saito-table-gamename">${l.name}</div>
				<div class="saito-table-rank saito-deemphasize">…</div>
			</div>`;
			}
		});

	  html += `</div>`;
	}
    return html;
};

