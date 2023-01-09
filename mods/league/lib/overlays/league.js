const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.leaderboard = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard");
  }

  render() {

    let league = this.mod.leagues[this.mod.league_idx];
    let game_mod = this.app.modules.returnModuleByName(league.game);

    this.overlay.show(LeagueOverlayTemplate(this.app, this.mod));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);
    this.leaderboard.render();
    this.attachEvents();
    this.mod.attachStyleSheets();

  }

  attachEvents() {

    Array.from(document.querySelectorAll('.league-overlay-create-game-button')).forEach(game => {
      game.onclick = (e) => {
        let modname = e.currentTarget.getAttribute("data-id");
        let league = this.mod.leagues[this.mod.league_idx];
	this.overlay.remove();
	if (league.default == 0) {
	  // private leagues get league provided
          this.app.connection.emit("arcade-launch-game-wizard", ({ game: modname , league : league }));
	} else {
	  // default games skip as invites are open
          this.app.connection.emit("arcade-launch-game-wizard", ({ game: modname }));
	}
      };
    });
  }

};

module.exports = LeagueOverlay;

