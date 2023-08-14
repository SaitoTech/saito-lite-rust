const LeaderboardTemplate = require("./leaderboard.template");

class Leaderboard {
  constructor(app, mod, container = ".league-overlay-leaderboard", league = null) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.league = league;
  }

  async render() {
    if (this.league == null) {
      console.error("ERROR: leaderboard does not have league defined");
      return;
    }

    let title = "Games";
    let gm = this.app.modules.returnModuleByName(this.league.game);
    if (gm) {
      title = gm.statistical_unit + "s";
    }

    if (document.querySelector(".league-leaderboard")) {
      this.app.browser.replaceElementBySelector(LeaderboardTemplate(title), ".league-leaderboard");
    } else {
      this.app.browser.addElementToSelector(LeaderboardTemplate(title), this.container);
    }

    //
    //
    await this.renderLeaderboardContents();
    //
    // fetch league info if it is not already downloaded
    //
    if (
      this.league.players.length == 0 ||
      !this.league.timestamp ||
      this.league.timestamp + 900000 < new Date().getTime()
    ) {
      if (this.mod.debug) {
        console.log(
          this.league.numPlayers,
          this.league.players.length,
          "Query Server for leaderboard"
        );
      }
      await this.mod.fetchLeagueLeaderboard(this.league.id, async (rows) => {
        await this.renderLeaderboardContents();
      });
    }
  }

  async renderLeaderboardContents() {
    //
    // safety check
    //
    if (!document.querySelector(".league-leaderboard .saito-table-body")) {
      return;
    }

    document.querySelector(".league-leaderboard .saito-table-body").innerHTML = "";

    //
    // add players
    //
    for (let i = 0; i < this.league.players.length; i++) {
      let html = "";
      let player = this.league.players[i];
      let publicKey = player.publicKey;
      html += `
        <div class="saito-table-row${
          publicKey == this.mod.publicKey ? " my-leaderboard-position" : ""
        }">
          <div class="center-align">${i + 1}</div>
          ${this.app.browser.returnAddressHTML(publicKey)}
          <div class="right-align">${Math.round(player.score)}</div>
          <div class="right-align">${Math.round(player.games_finished)}</div>
        </div>
      `;

      //Player score is stored as an integer, but we round just in case things change

      this.app.browser.addElementToSelector(html, ".league-leaderboard .saito-table-body");
    }

    let myListing = document.querySelector(".my-leaderboard-position");
    if (myListing) {
      myListing.scrollIntoView();
      myListing.parentElement.parentElement.parentElement.parentElement.scrollBy(0, -42);
    }
  }
}

module.exports = Leaderboard;
