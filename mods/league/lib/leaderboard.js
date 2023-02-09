const LeaderboardTemplate = require("./leaderboard.template");


class Leaderboard {

  constructor(app, mod, container = "", league=null) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.league = league;

    app.connection.on('league-leaderboard-render-request', (league=null) => {
      if (league != null) { this.league = league; }
      this.render(league);
    });
  }


  render() {

    if (document.querySelector(".leaderboard")) {
      this.app.browser.replaceElementBySelector(LeaderboardTemplate(this.app, this.mod), ".leaderboard");
    } else {
      this.app.browser.addElementToSelectorOrDom(LeaderboardTemplate(this.app, this.mod), this.container);
    }  

    //
    // fetch league info if it is not already downloaded
    //
    if (this.league == null) {  
      console.log("ERROR: leaderboard does not have league defined");
    } else {
      this.renderLeaderboardContents();
      //
      // ask for update
      //
console.log("submitting with leagueid: " + this.league.id);
      this.mod.fetchLeagueLeaderboard(this.league.id, (rows) => {
console.log("INTO RENDER LEADERBOAR CONTENST");
        this.renderLeaderboardContents();
console.log("OUT OF RENDER LEADERBOAR CONTENST");
      });
    }
  }


  renderLeaderboardContents() {

    //
    // safety check
    //
    if (!document.querySelector(".league-leaderboard .saito-table-body")) { return; }

    //
    // reset to empty
    //
    document.querySelector(".league-leaderboard .saito-table-body").innerHTML = "";

    //
    // add players
    //
    if (this.league) {
console.log("league exists...");
      for (let i = 0; i < this.league.players.length; i++) {
console.log("league exists... i: " + i);
        html = "";
        let player = this.league.players[i];
        let publickey = player.publickey;
        html += `
          <div class="saito-table-row">
            <div class="center-align">${i+1}</div>
            <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${publickey}</div>
            <div class="right-align">${Math.round(player.score)}</div>
          </div>
        `;
        this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");
      }
    }
console.log("league exists done.");
  }

}

module.exports = Leaderboard;



