const ArcadeLeagueViewTemplate = require("./arcade-league-view.template");
const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
module.exports = ArcadeLeagueView = {

  render(app, mod, league) {
  	this.league = league;
    if (this.overlay == null) {
      this.overlay = new SaitoOverlay(app);
    }
    this.overlay.show(app, mod, ArcadeLeagueViewTemplate(app, mod, league));
    this.loadLeaderboard(app, mod, league);
    this.attachEvents(app, mod);
  },

  /**
  * Query the league for the latest stats
  */
  loadLeaderboard(app, mod, league){
  	let leaderboard = [];
  	let al = this;
    mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${league.id}' ORDER BY score DESC` ,
        (res) => {
          if (res.rows) {
            for (let p of res.rows){
              console.log(p);
              leaderboard.push(p);
            }
          }
          al.injectLeaderboard(app, mod, leaderboard);
        }
      );
  },

  /**
   * Replace the loader with formatted html of the stats
   */
   injectLeaderboard(app, mod, leaderboard){
   		let loader = document.querySelector(".leaderboard-spinner");
   		if (loader){ loader.remove();}
      let myKey = app.wallet.returnPublicKey();

   		if (leaderboard.length > 0){
   			let html = `<table><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Games</th>`;
        if (this.league.admin == myKey){
          html += `<th>Games Started</th>`;
        }
        html += `<th>Wins</th><th>Ties</th><th></th></tr></thead><tbody>`;
   			let cnt = 1;
   			for (let r of leaderboard){
   				html += `<tr><th>${cnt++}</th><td>${app.keys.returnUsername(r.pkey)}</td><td>${r.score}</td><td>${r.games_finished}</td>`;
          if (this.league.admin == myKey){
            html += `<td>${r.games_started}</td>`;
          }
          html += `<td>${r.games_won}</td><td>${r.games_tied}</td><td>`;

          if (r.pkey !== myKey && r.league_id !== "SAITOLICIOUS"){
            html += `<button class="button challenge-btn" data-id="${r.pkey}">CHALLENGE</button>`;
          }
          html += "</td></tr>";
   			}

   			html += `</tbody></table>`;
   			app.browser.addElementToDom(html, "league-leaderboard");
   		}else{
   			app.browser.addElementToDom(`<div class="league-error">No Stats for the league</div>`, "league-leaderboard");
   		}
   },

  // TODO: Add functionality to CHALLENGE button 
  attachEvents(app, mod) {
    let joinBtn = document.getElementById("join-btn");
    if (joinBtn){
    	joinBtn.onclick = ()=> {
    		mod.sendJoinLeagueTransaction(this.league.id);
    		salert('League joined');
        joinBtn.remove();
        this.overlay.hide();
    	}
    	
    }
    let inviteBtn = document.getElementById("invite-btn");
    if (inviteBtn){
      inviteBtn.onclick = () => {
        mod.showShareLink(this.league.id, app.modules.returnActiveModule());
      }
    }
   Array.from(document.getElementsByClassName('challenge-btn')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        app.modules.returnActiveModule().overlay.show(app, mod, `<h2>Coming soon</h2><div class="warning">This feature is not supported yet</div>`);
      }
    });
  },
}
