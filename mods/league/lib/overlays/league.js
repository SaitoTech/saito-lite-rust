const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.games = [];
    this.leaderboards = {};
  }

  async render() {

console.log("LEAGUES IDX: " + this.mod.league_idx);

    let league = this.mod.leagues[this.mod.league_idx];

console.log(JSON.stringify(league));

    if (this.leaderboards[this.mod.leagues[this.mod.league_idx].id]) {
    } else {
      this.leaderboards[this.mod.leagues[this.mod.league_idx].id] = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard", league);    
    }

    let game_mod = this.app.modules.returnModuleByName(league.game);    
    this.overlay.show(LeagueOverlayTemplate(this.app, this.mod, this));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);
    
console.log("render recent 3");

    this.leaderboards[this.mod.leagues[this.mod.league_idx].id].render();

console.log("render recent 4");

    //
    //
    //
    this.renderRecentGames(league);
    this.fetchLeagueGames(league.id, () => {
      this.renderRecentGames(league);
    });

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


  renderRecentGames(league) {

    let html = "";

    //
    // recent league games 
    //
    for (let i = 0; i < league.games.length; i++) {

      let g = league.games[i];
      let players = g.players_array.split("_");
      let datetime = this_obj.app.browser.formatDate(g.time_finished);
      let date = datetime.month + ' ' + datetime.day + ', ' + datetime.year; 
      let players_html = "";

      players.forEach( (player, key) => {
        players_html += (key == (players.length-1))  ? `<span class='league_recent_player saito-address' data-id='${player}'>${player}</span>` 
          : `<span class='league_recent_player saito-address' data-id='${player}'>${player}</span>` + ' vs ';
      });

      html += `
        <div class="saito-table-row league_recent_game">
          <div> <span>${date}</span> ( ${players_html}) </div>
        </div>
      `;
    }

    this.app.browser.addElementToSelector(html, ".league_recent_games");

  }

}

module.exports = LeagueOverlay;

