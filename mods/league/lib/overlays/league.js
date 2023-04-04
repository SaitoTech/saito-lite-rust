const LeagueOverlayTemplate = require("./league.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const Leaderboard = require("./../leaderboard");
const LeagueWelcomeTemplate = require("./league-welcome.template");

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


    if (this.league.admin == this.app.wallet.returnPublicKey()){
      let desc_div = document.querySelector(".league-overlay-description");
      if (!desc_div) { return; }

      let orig_desc = desc_div.textContent;

      desc_div.contentEditable = true;
      this.app.browser.addElementToSelector(`<i class="fas fa-pencil"></i>`, ".league-overlay-description");
    
      desc_div.onblur = (e) => {
        console.log("Focus out", desc_div.textContent);
        if (desc_div.textContent !== orig_desc){
          console.log("Transaction sent!");
          let newtx = this.mod.createUpdateTransaction(this.league.id, sanitize(desc_div.textContent), "description");
          this.app.network.propagateTransaction(newtx);
        }
      };

      let contact = document.querySelector("#admin_contact");
      if (contact){
        let orig_contact = contact.textContent;
        contact.contentEditable = true;
        this.app.browser.addElementToSelector(`<i class="fas fa-pencil"></i>`, "#admin_contact");
        
        contact.onblur = (e) => {
          console.log("Focus out", contact.textContent);
          if (contact.textContent !== orig_contact){
            console.log("Transaction sent!");
            let newtx = this.mod.createUpdateTransaction(this.league.id, sanitize(contact.textContent, "contact"));
            this.app.network.propagateTransaction(newtx);
          }  
        }    
      }

    }

    if (document.querySelector(".backup_account")) {
      document.querySelector(".backup_account").onclick = () => {
        this.app.connection.emit("recovery-backup-overlay-render-request", ()=>{
          this.render();
        });
      }
    }

    if (document.querySelector(".contact_admin")) {
      document.querySelector(".contact_admin").onclick = () => {
        $(".league-overlay-body-content > div").addClass("hidden");
        $("#admin_details").removeClass("hidden");
        $("#admin_note").removeClass("hidden");
      }
    }

    Array.from(document.querySelectorAll(".menu-icon")).forEach(item => {
      item.onclick = (e) => {
        let nav = e.currentTarget.id;

        $(".active-tab").removeClass("active-tab");
        $(".league-overlay-leaderboard").removeClass("hidden");
        $(".league-overlay-body-content > div").addClass("hidden");
        switch (nav){
        case "home":
          $(".league-overlay-description").removeClass("hidden");
          break;
        case "contact":
          $("#admin_details").removeClass("hidden");
          $("#admin_note").removeClass("hidden");
          break;
        case "games":
          $(".league-overlay-league-body-games").removeClass("hidden");
          break;
        case "players":
          $("#admin-widget").removeClass("hidden");
          $("#admin_details").removeClass("hidden");
          $(".league-overlay-leaderboard").addClass("hidden");
          this.loadPlayersUI();
        }

        e.currentTarget.classList.add("active-tab");
      }
    })

  }

  loadPlayersUI(){

    this.app.browser.replaceElementById(`<div id="admin-widget" class="admin-widget">
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
  }
}

module.exports = LeagueOverlay;

