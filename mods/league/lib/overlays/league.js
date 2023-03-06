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
    this.app.modules.renderInto(".league-overlay-league-body-games-list");

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


  renderRecentGames(league) {

    let html = "";

    //
    // recent league games 
    //
    if (league.games.length > 0) {
      html += `
        <h5>Recent${league.admin?" League":""} Matches</h5>
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
        players_html += `<div class="league_recent_player${g.winner==player?" winner":""}"><img class="saito-module-identicon saito-identicon" id-${player}" src="${this.app.keychain.returnIdenticon(player)}"></div>`;

        /*players_html += `<div class="league_recent_players_list_item"><div class='league_recent_player saito-address' data-id='${player}'>${player}</div>`;
        if (g.winner == player) {
          players_html += `<div class="league_recent_player_winner">(w)</i></div>`;
        } else {
          players_html += `<div></div>`;
        }
        players_html += `</div>`;
        */
      });
      players_html += "</div>";

      html += `
        <div class="saito-table-row league_recent_game">
          <div class="league_recent_date">${date}</div>${players_html}<div class="league_recent_cause">${g.method?g.method:""}</div>
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

