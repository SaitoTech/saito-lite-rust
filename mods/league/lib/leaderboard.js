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

    
    if (this.league != null) {  
      this.loadLeaderboard(this.league);     
    }
  }


  /**
  * Query the league.players for the latest stats
  */
  async loadLeaderboard(league){
    let leaderboard = [];
    let players = [];

    //Recompute league stats
    let pid = this.app.wallet.returnPublicKey();
    league.myRank = -1;

    return this.mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${league.id}' 
      ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
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

    
      let html = ``;
      if (leaderboard.length > 0) {        
        for (let i=0; i<leaderboard.length; i++){
          console.log("rankkk");
          console.log(leaderboard[i]);

          html += `
            <div class="saito-table-row">
              <div class="center-align">${i+1}</div>
              <div class="saito-address saito-address-${leaderboard[i].pkey}" data-id="${leaderboard[i].pkey}">${leaderboard[i].pkey}</div>
              <div class="right-align">${Math.round(leaderboard[i].score)}</div>
            </div>    
          `;
        }
      }

      html = (players == null || html == null) ? `<div class="league-error">No ranking stats for this league</div>` : html;
      if (html != ``) {
       this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");      
      }
    });

  }


}

module.exports = Leaderboard;



