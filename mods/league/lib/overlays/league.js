const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod);
    this.leaderboard = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard");
  }

  render() {
    this.overlay.show(LeagueOverlayTemplate())
    this.leaderboard.render();
    this.attachEvents();
  }

  attachEvents() {
    league_self = this;

    Array.from(document.querySelectorAll('.league-overlay-create-game-button')).forEach(game => {
      game.onclick = (e) => {
        console.log('league_self', league_self)
        let modname = e.currentTarget.getAttribute("data-id");
        league_self.app.connection.emit("launch-game-wizard", { game: modname });
      };
    });
  }

};

module.exports = LeagueOverlay;

