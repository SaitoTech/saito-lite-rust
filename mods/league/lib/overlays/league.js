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

    let league = this.mod.leagues[this.mod.league_idx];

    if (this.leaderboards[this.mod.leagues[this.mod.league_idx].id]) {
    } else {
      this.leaderboards[this.mod.leagues[this.mod.league_idx].id] = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard", league);    
    }

    let game_mod = this.app.modules.returnModuleByName(league.game);    
    this.overlay.show(LeagueOverlayTemplate(this.app, this.mod, this));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);
    
    this.leaderboards[this.mod.leagues[this.mod.league_idx].id].render();

    //
    //
    //
    //this.renderRecentGames(league);
    this.mod.fetchLeagueGames(league.id, () => {
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
    if (league.games.length > 0) {
      html += `
        <h5>Recent League Matches</h5>
        <div class="saito-table league_recent_others">
          <div class="saito-table-body">
      `;
    }
    for (let i = 0; i < league.games.length; i++) {

      let g = league.games[i];
      let players = g.players_array.split("_");
      let datetime = this.app.browser.formatDate(g.time_finished);
      let date = datetime.month + ' ' + datetime.day + ', ' + datetime.year; 
      let players_html = `<div class="league_recent_players_list">`;

      players.forEach( (player, key) => {
        players_html += `<div class="league_recent_players_list_item"><div class='league_recent_player saito-address' data-id='${player}'>${player}</div>`;
        if (g.winner == player) {
          players_html += `<div class="league_recent_player_winner">(w)</i></div>`;
        } else {
          players_html += `<div></div>`;
        }
        players_html += `</div>`;
      });
      players_html += "</div>";

      html += `
        <div class="saito-table-row league_recent_game">
          <div class="league_recent_date">${date}</div>${players_html}
        </div>
      `;
    }
    if (league.games.length > 0) {
      html += `
          </div>
        </div>
      `;
    }

    this.app.browser.addElementToSelector(html, ".league_recent_games");

  }

}

module.exports = LeagueOverlay;

