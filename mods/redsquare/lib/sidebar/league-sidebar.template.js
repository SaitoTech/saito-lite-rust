module.exports = RedSquareLeagueSidebarTemplate = (app, mod) => {

	let league_mod = app.modules.returnModule("League");
	let html = "";

	if (league_mod){
	  html += `<div class="saito-leaderboard">
	        <h6>Your Rankings:</h6>
	        <div class="saito-table">`;

	  if (league_mod.leagues.length > 0){
	    let cnt = 1;
	    for (let l of league_mod.leagues){
	      html += `<div class="saito-table-row ${(cnt%2 == 1)?"odd":""}">
	                      <div class="saito-table-gamename">${l.name}</div>
	                      <div class="saito-table-rank">${(l.myRank <= 0)?"unranked":l.myRank}</div>
	                  </div>`;
	      cnt++;
	    }
	  }
	  html += "</div>";
	}
    return html;
};