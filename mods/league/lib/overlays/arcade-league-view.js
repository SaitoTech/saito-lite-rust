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
    
  },

  /**
  * Query the league for the latest stats
  */
  loadLeaderboard(app, mod, league){
  	let leaderboard = [];
  	let al = this;

    //Recompute league stats
    let pid = app.wallet.returnPublicKey();
    league.myRank = -1;
    league.playerCnt = 0;

    mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${league.id}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
        (res) => {
          if (res.rows) {
            let cnt = 0;
            for (let p of res.rows){
              cnt++;
              leaderboard.push(p);
              if (p.pkey == pid){
                league.myRank = cnt; //I am the cnt player in the leaderboard
              }
            }
            league.playerCnt = cnt;
          }
          al.overlay.show(app, mod, ArcadeLeagueViewTemplate(app, mod, league));
          al.injectLeaderboard(app, mod, leaderboard);
          al.attachEvents(app, mod);    
          mod.renderLeagues(app, mod);
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
   			let html = `<table><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Games</th><th>Wins</th><th>Ties</th>`;
        if (this.league.admin == myKey){
          html += `<th>Games Started</th><th></th><th></th>`;
        }
        html += `<th></th></tr></thead><tbody>`;
   			let cnt = 1;
   			for (let r of leaderboard){
   				html += `<tr class="${(r.pkey == myKey)?"mystats":""}">
                    <th>${cnt++}</th>
                    <td id="${r.pkey}" class="${(r.pkey !== myKey)?"newfriend":""}">${app.keys.returnUsername(r.pkey)}</td>
                    <td>${Math.round(r.score)}</td>
                    <td>${r.games_finished}</td>
                    <td>${r.games_won}</td>
                    <td>${r.games_tied}</td>`;
          if (this.league.admin == myKey){
            html += `<td>${r.games_started}</td>`;
            html += `<td class="edit_player" data-id="${r.pkey}"><i class="fas fa-edit"></i></td>`;
            html += `<td class="delete_player" data-id="${r.pkey}"><i class="fa fa-trash"></i></td>`;
          }

          html += `<td>`;
          if (r.pkey !== myKey && r.league_id !== "SAITOLICIOUS"){
            html += `<button class="button challenge-btn" data-id="${r.pkey}" style="display:none">CHALLENGE</button>`;
          }
          html += "</td></tr>";
   			}

   			html += `</tbody></table>`;
   			app.browser.addElementToId(html, "league-leaderboard");


   		}else{
   			app.browser.addElementToId(`<div class="league-error">No Stats for the league</div>`, "league-leaderboard");
   		}
   },

  /*
  We call attachEvents after we load all the players, so we can attach functionality all in one place
  */ 
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

    //ActiveModule should be Arcade
    //We only render the button in the template if that is the case
    let createGameBtn = document.getElementById("game-invite-btn");
    if (createGameBtn){
      createGameBtn.onclick = () => {
        this.overlay.hide();
        mod.launchGame(this.league);
      }
    }

    //TODO: Implement this
     Array.from(document.getElementsByClassName('challenge-btn')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        app.modules.returnActiveModule().overlay.show(app, mod, `<h2>Coming soon</h2><div class="warning">This feature is not supported yet</div>`);
      }
    });

   //Need to attach events for clicking on players on the leaderboard
    const startKeyExchange = async (publickey) => {
      console.log("pkey1: " + publickey);
      publickey = app.keys.fetchPublicKey(publickey);
      console.log("pkey2: " + publickey);

      if (publickey) {
        let encrypt_mod = app.modules.returnModule("Encrypt");
        encrypt_mod.initiate_key_exchange(publickey);
        console.log("done initiate key exchange");
      } 
    };
    Array.from(document.querySelectorAll(".newfriend")).forEach((username)=>{
      username.onclick = (e) =>{
        startKeyExchange(e.target.getAttribute("id"));
      }
    });

    //Give admin ability to edit league
    Array.from(document.querySelectorAll(".edit_player")).forEach((player)=>{
      player.onclick = async (e) =>{
        let player_key = e.currentTarget.getAttribute("data-id");
        //let confirm = await sconfirm(`Do you want to change ${player_key}'s stats?`);
        salert("Manual editing not available yet");
      }
    });
    Array.from(document.querySelectorAll(".delete_player")).forEach((player)=>{
      player.onclick = async (e) =>{
        let player_key = e.currentTarget.getAttribute("data-id");
        let confirm = await sconfirm(`Do you want to remove ${player_key} from the League?`);
        if (confirm){
          mod.sendQuitLeagueTransaction(player_key, this.league.id);
        }
      }
    });
  },
}
