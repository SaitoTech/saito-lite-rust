const LeagueRankingsTemplate = require("./rankings.template");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");

class LeagueRankings {
	
  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(this.app, this.mod);

    app.connection.on('league-rankings-render-request', () => {
      this.render();
    });


  }

  render() {

    //
    // insert content we will render into
    //
    if (document.querySelector(".league-rankings")) {
      this.app.browser.replaceElementBySelector(LeagueRankingsTemplate(), ".league-rankings");
    } else {
      this.app.browser.addElementToSelector(LeagueRankingsTemplate(), this.container);
    }

    //
    // add content to league rankings
    //
    let leagues = this.mod.leagues;
    let html = "";
    if (leagues.length > 0){
      let cnt = 0;
      leagues.forEach(l => {
        if (l.rank > 0) {
          html += `
	    <div data-id="${l.id}" class="saito-table-row league-leaderboard-ranking">
              <div class="saito-table-gamename">${l.name}</div>
              <div class="saito-table-rank">${l.rank}</div>
            </div>
                  `;
        }
      });
      leagues.forEach(l => {
        if (l.rank <= 0) {
          html += `
	    <div data-id="${l.id}" class="saito-table-row league-leaderboard-ranking">
              <div class="saito-table-gamename">${l.name}</div>
              <div class="saito-table-rank saito-deemphasize">…</div>
            </div>`;
        }
      });
    }

    this.app.browser.addElementToSelector(html, ".league-rankings .saito-table-body");

    this.attachEvents();

  }

  attachEvents() {

    document.querySelectorAll(".league-leaderboard-ranking").forEach((el) => {
      el.onclick = (e) => {
	let lid = e.currentTarget.getAttribute("data-id");

	this.overlay.show(`LID: ${lid}`);

      }
    });

  }

};

module.exports = LeagueRankings;

