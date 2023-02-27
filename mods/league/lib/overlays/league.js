const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.leaderboard = new Leaderboard(this.app, this.mod, ".league-overlay-leaderboard");
    this.games = [];
    this.games['mine'] = [];
    this.games['others'] = [];
  }

  async render() {

    let league = this.mod.leagues[this.mod.league_idx];


    let game_mod = this.app.modules.returnModuleByName(league.game);
    this.overlay.show(LeagueOverlayTemplate(this.app, this.mod, this));
    this.overlay.setBackground(`/${game_mod.returnSlug()}/img/arcade/arcade.jpg`);

    this.leaderboard.league = league;
    this.leaderboard.render();

    await this.loadRecentGames(league);

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
          this.app.connection.emit("arcade-launch-game-wizard", ({ game: modname, league: league }));
        } else {
          // default games skip as invites are open
          this.app.connection.emit("arcade-launch-game-wizard", ({ game: modname }));
        }
      };
    });
  }


  async loadRecentGames(league) {
    this_obj = this;

    this.mod.sendPeerDatabaseRequestWithFilter("League", `SELECT * FROM games WHERE league_id = '${league.id}' LIMIT 10`,
      (res) => {
        let pid = this_obj.app.wallet.getPublicKey();
        let html = ``;
        if (res.rows) {
          for (let g of res.rows) {

            let players = g.players_array.split("_");

            if (players.includes(pid)) {
              this.games['mine'].push(g);
            } else {
              this.games['others'].push(g);
            }
          }
        }

        let html_mine = ``;
        if (this_obj.games['mine'].length > 0) {
          html_mine = this.create_games_html(this_obj.games['mine']);
          this_obj.app.browser.addElementToSelector(html_mine, ".league_recent_mine .saito-table-body");
        } else {
          document.querySelector(".league_recent_parent_mine").style.display = "none";
        }


        let html_others = ``;
        if (this_obj.games['others'].length > 0) {
          html_others = this.create_games_html(this_obj.games['others']);
          this_obj.app.browser.addElementToSelector(html_others, ".league_recent_others .saito-table-body");
        } else {
          document.querySelector(".league_recent_parent_others").style.display = "none";
        }

      });
  }

  create_games_html(games) {
    this_obj = this;
    let html = ``;

    games.forEach(function(game, key) {

      let dt = this_obj.app.browser.formatDate(game.time_finished);
      let players_html = ``;
      let players = game.players_array.split("_");
      let date = dt.month + ' ' + dt.day + ', ' + dt.year;

      players.forEach(function(player, key) {
        players_html += (key == (players.length - 1)) ? `<span class='league_recent_player saito-address' data-id='${player}'>${player}</span>`
          : `<span class='league_recent_player saito-address' data-id='${player}'>${player}</span>` + ' vs ';
      });

      html += `
          <div class="saito-table-row league_recent_game">
              <div> <span>${date}</span> ( ${players_html}) </div>
          </div>
      `;
    });

    return html;
  }
}

module.exports = LeagueOverlay;

