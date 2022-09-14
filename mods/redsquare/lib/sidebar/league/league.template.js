module.exports = RedSquareLeagueTemplate = (app, mod, league_mod) => {
	let html = "";

	if (league_mod){

	  let leagues = league_mod.filterLeagues(app);

	  if (leagues.length > 0){
	  	html += `<div class="saito-leaderboard">
	        <h6>Your Rankings:</h6>
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
				<div class="saito-table-rank saito-deemphasize"></div>
			</div>`;
			}
		});

	  }
	  //What's this for???
	  //Call to action (to get folks to play) - when games supports it.

	  html += `
	   <!--div class="saito-table-row">
	     <div></div>
		 <div><a href="#games">Play Now</a></div>
	   </div--> 
     </div>
  `;
	}
    return html;
};

