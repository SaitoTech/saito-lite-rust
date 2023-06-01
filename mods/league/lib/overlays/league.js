const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");
const LeagueWelcomeTemplate = require("./league-welcome.template");
const JoinLeagueOverlay = require("./join");

class LeagueOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod);
    this.league = null;

    this.leaderboards = {};

     app.connection.on('league-overlay-render-request', (league_id) => {
      //console.log('league-overlay-render-request:',league_id);
      this.league = this.mod.returnLeague(league_id);
      this.render();
    });
     app.connection.on("league-overlay-remove-request", ()=> {
      this.overlay.remove();
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
      obj["league"] = this.league.id; ///>>>>>>>>>>>>>>
    }
    this.app.connection.emit("league-overlay-games-list", obj);

    //Add click event to create game
    this.attachEvents();

  }

  attachEvents() {

    if (document.getElementById("league-overlay-create-game-button")){
      document.getElementById("league-overlay-create-game-button").onclick = (e) => {
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
    }

    if (document.querySelector(".join_league")) {
      document.querySelector(".join_league").onclick = () => {
        let jlo = new JoinLeagueOverlay(this.app, this.mod, this.league.id);
        jlo.render();
      }
    }

    if (document.querySelector(".backup_account")) {
      document.querySelector(".backup_account").onclick = () => {
        this.app.connection.emit("recovery-backup-overlay-render-request", {
          success_callback: ()=>{ this.render(); }
        });
      }
    }

    if (document.querySelector(".contact_admin")) {
      document.querySelector(".contact_admin").onclick = () => {
        document.querySelector("#admin_details").classList.remove("hidden");
      }
    }

    //if (!document.querySelector(".contactAdminWarning")){
      Array.from(document.querySelectorAll(".menu-icon")).forEach(item => {
        item.onclick = (e) => {
          let nav = e.currentTarget.id;

          try{

            document.querySelector(".active-tab").classList.remove("active-tab");
            document.querySelector(".league-overlay-leaderboard").classList.remove("hidden");
            Array.from(document.querySelectorAll(".league-overlay-body-content > .league-overlay-content-box")).forEach(div => div.classList.add("hidden"));

            switch (nav){
            case "home":
              document.querySelector(".league-overlay-description").classList.remove("hidden");
              break;
            case "contact":
              document.querySelector("#admin_details").classList.remove("hidden");
              document.querySelector("#admin_note").classList.remove("hidden");
              break;
            case "games":
              document.querySelector(".league-overlay-league-body-games").classList.remove("hidden");
              break;
            case "players":
              document.querySelector("#admin-widget").classList.remove("hidden");
              document.querySelector(".league-overlay-leaderboard").classList.add("hidden");
              this.loadPlayersUI();
            }
          }catch(err){
            console.error("dom selection in league overlay", err);
          }
        e.currentTarget.classList.add("active-tab");
        }
      });
    //}

  }

  loadPlayersUI(){

    this.app.browser.replaceElementById(`<div id="admin-widget" class="admin-widget league-overlay-content-box">
      <div class="saito-table">
        <div class="saito-table-header">
          <div>Player</div>
          <div>Score</div>
          <div>Games Completed</div>
          <div>Games Started</div>
          <div>Last Activity</div>
          <div>Email</div>
          <div>Remove</div>
        </div>
        <div class="saito-table-body"></div>
        </div>
        </div>`, "admin-widget");
  
    console.log(JSON.parse(JSON.stringify(this.league)));

    if (!this.league) { return; }

    let html = "";
    for (let player of this.league.players) {
      let datetime = this.app.browser.formatDate(player.ts);
      console.log(player.ts);
      console.log(datetime);
      html += `<div class="saito-table-row">
        <div>${this.app.browser.returnAddressHTML(player.publickey)}</div>
        <div>${Math.round(player.score)}</div>
        <div>${Math.round(player.games_finished)}</div>
        <div>${Math.round(player.games_started)}</div>
        <div>${datetime.day} ${datetime.month} ${datetime.year}</div>
        <div class="email_field" data-id="${player.publickey}" contenteditable="true">${player.email}</div>
        <div><i class="fas fa-ban"></i></div>
      </div> `;
    }

    this.app.browser.addElementToSelector(html, "#admin-widget .saito-table-body");

    Array.from(document.querySelectorAll(".email_field")).forEach(player_contact => {
      player_contact.onblur = (e) => {

        let newtx = this.mod.createUpdatePlayerTransaction(this.league.id, e.currentTarget.dataset.id, sanitize(player_contact.textContent), "email");
        this.app.network.propagateTransaction(newtx);

        for (let i = 0; i < this.league.players.length; i++){
          if (this.league.players[i].publickey === e.currentTarget.dataset.id){
            this.league.players[i].email = sanitize(player_contact.textContent);
          }
        }
      }
    });

  }
}

module.exports = LeagueOverlay;

