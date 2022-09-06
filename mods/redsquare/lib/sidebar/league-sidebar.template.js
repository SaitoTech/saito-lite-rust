module.exports = RedSquareLeagueSidebarTemplate = (app, mod) => {

	let league_mod = app.modules.returnModule("League");
	let html = "";

	if (league_mod){
	  if (league_mod.leagues.length > 0){
	  	html += `<div class="saito-leaderboard">
	        <h6>Your Rankings:</h6>
	        <div class="saito-table">`;

		var leagues = league_mod.leagues.sort((a,b) => a.myRank < b.myRank);
		let cnt = 0;

        for (let l of league_mod.leagues){
          html += `<div id="league_${l.id}" class="saito-table-row rs-league-sidebar-ranking${(cnt%2 == 1)?" odd":""}">
                          <div class="saito-table-gamename">${l.name}</div>
                          <div class="saito-table-rank">${(l.myRank <= 0)?"Unranked":l.myRank}</div>
                      </div>`;
          cnt++;
        }

	  }
	  //What's this for???
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

