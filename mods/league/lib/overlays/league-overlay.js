const LeagueOverlayTemplate = require("./league-overlay.template");
const Leaderboard = require("./../leaderboard");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;

    this.container = "";

    this.leaderboard = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard");
    this.league = null;
    this.game = null;

    this.overlay = new SaitoOverlay(this.app, this.mod);

    app.connection.on('league-overlay-render-request', (league) => {
      this.render();
    });


  }

  render() {

    this.overlay.show(LeagueOverlayTemplate());

    this.leaderboard.render();

    this.attachEvents();

  }

  attachEvents() {

  }

};

module.exports = LeagueOverlay;

