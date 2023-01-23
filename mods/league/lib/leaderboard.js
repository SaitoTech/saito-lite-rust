const LeaderboardTemplate = require("./leaderboard.template");


class Leaderboard {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.league = null;

    app.connection.on('league-leaderboard-render-request', (league) => {
      this.render(league);
    });

  }


  render() {

    if (document.querySelector(".leaderboard")) {
      this.app.browser.replaceElementBySelector(LeaderboardTemplate(this.app, this.mod), ".leaderboard");
    } else {
      this.app.browser.addElementToSelectorOrDom(LeaderboardTemplate(this.app, this.mod), this.container);
    }  

    console.log("THIS LEAGUE");
    console.log(this.league);
    
    let players = null;
    let html = null;

    if (this.league != null) {
      players = this.loadLeaderboard(this.league);
      if (players) {
        for (let r of players){
          html += `
            <div class="saito-table-row">
              <div class="center-align">3</div>
              <div class="saito-address saito-address-${player.pkey}" data-id="${player.pkey}">${player.pkey}</div>
              <div class="right-align">${Math.round(player.score)}</div>
            </div>    
          `;
        }
      } 
    }

    html = (players == null || html == null) ? `<div class="league-error">No ranking stats for this league</div>` : html;
    this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");
  }


  /**
  * Query the league.players for the latest stats
  */
  loadLeaderboard(league){
    let leaderboard = [];
    let players = [];

    //Recompute league stats
    let pid = this.app.wallet.returnPublicKey();
    league.myRank = -1;

    this.mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${league.id}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
      (res) => {
        league.playerCnt = 0;
        
        console.log("result");
        console.log(res);

        if (res.rows) {
          let cnt = 0;
          for (let p of res.rows){
            cnt++;
            leaderboard.push(p);
            if (p.pkey == pid){
              league.myRank = cnt; //I am the cnt player in the leaderboard
            }else{
              players.push(p.pkey);
            }
          }
          league.playerCnt = cnt;
        }

        if (leaderboard.length > 0){
          return leaderboard;
        }

        return false;
      });
  }


}

module.exports = Leaderboard;



