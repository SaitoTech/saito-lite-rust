const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);

    this.leaderboards = {};

     app.connection.on('league-overlay-render-request', (league_id) => {
      //console.log('league-overlay-render-request:',league_id);
      this.league = this.mod.returnLeague(league_id);
      this.render();
    });

  }

  // --------------------------------------------
  // Do not directly call render -- emit an event
  // --------------------------------------------
  async render() {
    
    if (!this.league) { return; }

    // So we keep a kopy of the league - leaderboard for faster clicking
    if (!this.leaderboards[this.league.id]) {
      this.leaderboards[this.league.id] = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard", this.league);    
    }

    this.overlay.show(LeagueOverlayTemplate(this.app, this.mod, this.league));

    let game_mod = this.app.modules.returnModuleByName(this.league.game);    
    this.overlay.setBackground(game_mod?.returnArcadeImg());
    
    //Show Leaderboard
    this.leaderboards[this.league.id].render();

    //Show list of recent games (once refreshed)
    this.app.modules.renderInto(".league-overlay-games-list");

    let obj = {game: this.league.game};
    if (this.league.admin){
      obj["league"] = this.league.id;
    }
    this.app.connection.emit("league-overlay-games-list", obj);

    //Add click event to create game
    this.attachEvents();

  }

  attachEvents() {

    Array.from(document.querySelectorAll('.league-overlay-create-game-button')).forEach(game => {
      game.onclick = (e) => {
	
        this.overlay.remove();
        this.app.browser.logMatomoEvent("GameWizard", "LeagueOverlay", this.league.game);
      	if (this.league.admin) {
          // private leagues get league provided
          this.app.connection.emit("arcade-launch-game-wizard", ({ game: this.league.game , league : this.league }));
      	} else {
      	  // default games skip as invites are open
          this.app.connection.emit("arcade-launch-game-wizard", ({ game: this.league.game }));
      	}
      };
    });

  }

}

module.exports = LeagueOverlay;

