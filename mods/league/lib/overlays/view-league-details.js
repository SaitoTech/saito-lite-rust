const LeagueDetailsTemplate = require("./view-league-details.template");
const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const LeaderboardTemplate = require("./leaderboard.template");
const RecentGameTemplate = require("./recent-game.template");

class ViewLeagueDetails {
  constructor(app){
    this.app = app;

    var s = document.createElement("link");
    s.rel = "stylesheet";
    s.type = "text/css";
    s.href = "/league/view-league-details.css";
    document.querySelector('head link').after(s);

    app.connection.on("relay-is-online", (pkey)=>{
      let playerRow = document.querySelector(`.newfriend[data-id="${pkey}"]`);
      if (playerRow){
        playerRow.classList.add("online");
      }
      let playerChallenge = document.querySelector(`.challenge-btn[data-id="${pkey}"]`);
      if (playerChallenge){
        playerChallenge.style.display = "block";
      }
    });
  }

  render(app, mod, league) {
  	this.league = league;
    this.mod = mod;

    if (this.overlay == null) {
      this.overlay = new SaitoOverlay(app);
    }
    this.overlay.show(app, mod, LeagueDetailsTemplate(app, mod, league));
    //this.loadLeaderboard(app, mod, league);
    
  }

  /**
  * Query the league.players for the latest stats
  */
  loadLeaderboard(app, mod, league){
  	let leaderboard = [];
    let players = [];
  	let al = this;

    //Recompute league stats
    let pid = app.wallet.returnPublicKey();
    league.myRank = -1;

    mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM players WHERE league_id = '${league.id}' ORDER BY score DESC, games_won DESC, games_tied DESC, games_finished DESC` ,
        (res) => {
          league.playerCnt = 0;
          if (res.rows) {
            let cnt = 0;
            for (let p of res.rows){
              cnt++;
              leaderboard.push(p);
              if (p.pkey == pid){
                league.myRank = cnt; //I am the cnt player in the leaderboard
              }else{
                players.push(p.pkey);
              }
            }
            league.playerCnt = cnt;
          }
          al.overlay.show(app, mod, LeagueDetailsTemplate(app, mod, league));

          let target = document.getElementById("league-leaderboard");
          if (target){
            target.innerHTML = (leaderboard.length > 0) ? LeaderboardTemplate(app, mod, league, leaderboard) : `<div class="league-error">No Stats for the league</div>`;
          }
          al.attachEvents(app, mod);    

          //Ping all players in league
          let pingTx = {};//mod.createPingTX(players);
          app.connection.emit("send-relay-message", {recipient: players, request: "ping", data: pingTx});
        });
  }


  /**
  * Query the league.games for the latest stats
  */
  loadRecentGames(app, mod, league){
    let games = [];
    let al = this;

    mod.sendPeerDatabaseRequestWithFilter("League" , `SELECT * FROM games WHERE league_id = '${league.id}' LIMIT 10` ,
      (res) => {
        if (res.rows){
          for (let g of res.rows){
            games.push(g);
          }

          let target = document.getElementById("league-leaderboard");
          if (target){
            target.innerHTML = (games.length > 0) ? RecentGameTemplate(app, mod, league, games) : `<div class="league-error">No Recent Games for the league</div>`;
          }
          al.attachEvents(app, mod);    

        }          
      });    
  }


  /*
  We call attachEvents after we load all the players, so we can attach functionality all in one place
  */ 
  attachEvents(app, mod) {
    
    let joinBtn = document.getElementById("join-btn");
    if (joinBtn){
    	joinBtn.onclick = ()=> {
    		mod.sendJoinLeagueTransaction(this.league.id);
    		salert('Sending TX to join league...');
        joinBtn.remove();
        this.overlay.hide();
    	}
    	
    }
    let inviteBtn = document.getElementById("invite-btn");
    if (inviteBtn){
      inviteBtn.onclick = () => {
        //ActiveModule should be Arcade
        mod.showShareLink(this.league.id);
      }
    }

    let viewToggle = document.getElementById("game-leaderboard-toggle");
    if (viewToggle){
      viewToggle.onclick = () => {
        if (viewToggle.classList.contains("view_leaderboard")){
          viewToggle.outerHTML = `<button type="button" id="game-leaderboard-toggle" class="view_games">Show Leaderboard</button>`
          let target = document.getElementById("league-leaderboard");
          if (target){
            target.innerHTML = `<div class="leaderboard-spinner loader"></div>`;
          }
          this.loadRecentGames(this.app, this.mod, this.league);
        }else{
          this.overlay.show(this.app, this.mod, LeagueDetailsTemplate(this.app, this.mod, this.league));
          this.loadLeaderboard(this.app, this.mod, this.league);
       }
      }
    }


    //We only render the button in the template if that is the case
    let createGameBtn = document.getElementById("game-invite-btn");
    if (createGameBtn){
      createGameBtn.onclick = () => {
        this.overlay.remove();
        mod.createLeagueGame(this.league);
      }
    }

    //Observer hook
     Array.from(document.getElementsByClassName('review-btn')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        let game_id = e.currentTarget.getAttribute("data-id");
        app.connection.emit("arcade-observer-review-game",game_id);
        this.overlay.remove();
      }
    });


    //TODO: Implement this
     Array.from(document.getElementsByClassName('challenge-btn')).forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        mod.createLeagueChallenge(this.league, e.currentTarget.getAttribute("data-id"));
        this.overlay.remove();
      };
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
        startKeyExchange(e.target.getAttribute("data-id"));
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
  }
}

module.exports = ViewLeagueDetails;