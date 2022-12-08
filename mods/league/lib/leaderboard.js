const LeaderboardTemplate = require("./leaderboard.template");


class Leaderboard {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;

    app.connection.on('league-leaderboard-render-request', (league) => {
      this.render(league);
    });


  }


  render(league=null) {


    if (document.querySelector(".leaderboard")) {
      this.app.browser.replaceElementBySelector(LeaderboardTemplate(this.app, this.mod), ".leaderboard");
    } else {
      this.app.browser.addElementToSelectorOrDom(LeaderboardTemplate(this.app, this.mod), this.container);
    }  

    //
    // TODO render from league.players, right-align?
    //
    for (let i = 0; i < 20; i++) {

      let html = `
        <div class="saito-table-row">
          <div class="center-align">3</div>
          <div class="saito-address saito-address-urgg5fVRPXYM4agBxec3zF3ieHJNTCQ6h5KYphntuSkN" data-id="urgg5fVRPXYM4agBxec3zF3ieHJNTCQ6h5KYphntuSkN">urgg5fVRPXYM4agBxec3zF3ieHJNTCQ6h5KYphntuSkN</div>
          <div class="right-align">1672</div>
          <div class="right-align">16</div>
          <div class="right-align">3</div>
        </div>    
      `;

      this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");

    }
  }

}

module.exports = Leaderboard;



