module.exports = RedSquareLeagueSidebarTemplate = (app, mod) => {

	let league_mod = app.modules.returnModule("League");
	let html = "";

	if (league_mod){
	  html += `<div class="saito-leaderboard">
	        <h6>Your Rankings:</h6>
	        <div class="saito-table">`;

	  if (league_mod.leagues.length > 0){
		var leagues = league_mod.leagues.sort((a,b) => a.myRank < b.myRank);
	    leagues.forEach(l => {
			if (l.myRank > 0) {
				html += `<div class="saito-table-row">
				<div class="saito-table-gamename">${l.name}</div>
				<div class="saito-table-rank">${l.myRank}</div>
			</div>`;
			}
		});
		leagues.forEach(l => {
			if (l.myRank <= 0) {
				html += `<div class="saito-table-row">
				<div class="saito-table-gamename">${l.name}</div>
				<div class="saito-table-rank">Unranked</div>
			</div>`;
			}
		});

	  }
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