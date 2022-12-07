const LeaderboardTemplate = require("./leaderboard.template");


class Leaderboard {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;

  }


  render() {


    if (document.querySelector(".leaderboard")) {
      this.app.browser.replaceElementBySelector(LeaderboardTemplate(this.app, this.mod), ".leaderboard");
    } else {
      this.app.browser.addElementToSelectorOrDom(LeaderboardTemplate(this.app, this.mod), this.container);
    }  

    for (let i = 0; i < 20; i++) {

      let html = `
        <div class="saito-table-row">
          <div>3</div>
          <div class="saito-address saito-address-urgg5fVRPXYM4agBxec3zF3ieHJNTCQ6h5KYphntuSkN" data-id="urgg5fVRPXYM4agBxec3zF3ieHJNTCQ6h5KYphntuSkN">urgg5fVRPXYM4agBxec3zF3ieHJNTCQ6h5KYphntuSkN</div>
          <div class="">1672</div>
          <div class="">16</div>
          <div class="">3</div>
        </div>    
      `;

      this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");

    }
  }


/*
    mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${league.id}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
    mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM games WHERE league_id = '${league.id}' LIMIT 10` ,
*/

}

module.exports = Leaderboard;



