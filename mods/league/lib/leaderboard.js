const LeaderboardTemplate = require("./leaderboard.template");


class Leaderboard {

  constructor(app, mod, container = ".league-overlay-leaderboard", league=null) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.league = league;

  }


  render() {

    if (this.league == null) {  
      console.error("ERROR: leaderboard does not have league defined");
      return;
    }

    if (document.querySelector(".league-leaderboard")) {
      this.app.browser.replaceElementBySelector(LeaderboardTemplate(this.app, this.mod), ".league-leaderboard");
    } else {
      this.app.browser.addElementToSelectorOrDom(LeaderboardTemplate(this.app, this.mod), this.container);
    }  

    //
    //
    this.renderLeaderboardContents();
    //
    // fetch league info if it is not already downloaded
    //
    this.mod.fetchLeagueLeaderboard(this.league.id, (rows) => {
      this.renderLeaderboardContents();
    });
  
  }


  renderLeaderboardContents() {

    //
    // safety check
    //
    if (!document.querySelector(".league-leaderboard .saito-table-body")) { return; }

    document.querySelector(".league-leaderboard .saito-table-body").innerHTML = "";

    //
    // add players
    //
    for (let i = 0; i < this.league.players.length; i++) {
      html = "";
      let player = this.league.players[i];
      let publickey = player.publickey;
      html += `
        <div class="saito-table-row${(publickey == this.app.wallet.returnPublicKey())?" my-leaderboard-position":""}">
          <div class="center-align">${i+1}</div>
          <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${publickey}</div>
          <div class="right-align">${Math.round(player.score)}</div>
          <div class="right-align">${Math.round(player.games_finished)}</div>
        </div>
      `;

      //Player score is stored as an integer, but we round just in case things change

      this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");
    }
    
    //this.app.browser.addIdentifiersToDom();
    let myListing = document.querySelector('.my-leaderboard-position');
    if (myListing) {
      myListing.scrollIntoView();
    }
  }

}

module.exports = Leaderboard;



