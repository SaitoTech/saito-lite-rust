const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const JoinLeagueTemplate = require("./join.template");
const SaitoLoader = require("./../../../../lib/saito/ui/saito-loader/saito-loader");


class JoinLeague {

  constructor(app, mod, league_id=""){
    this.app = app;
    this.mod = mod;
    this.league_id = league_id;
    this.overlay = new SaitoOverlay(app, mod, false, true);
    this.loader = new SaitoLoader(app, mod, ".league-join-controls");

    this.app.connection.on("join-league-success", ()=>{
      console.log("Join success!");
      this.loader.remove();
      this.render();
    });
  }

  async render(league_id="") {

    if (league_id != "") { this.league_id = league_id; }
    let league = this.mod.returnLeague(this.league_id);

    if (league == null) {
      salert(`League not found`);
      console.log("League id: " + this.league_id);
      return;
    }

    this.game_mod = this.app.modules.returnModuleByName(league.game);
    this.overlay.show(JoinLeagueTemplate(this.app, this.mod, league));
    this.overlay.setBackground(this.game_mod.returnArcadeImg());

    this.attachEvents();

    let key = this.app.keychain.returnKey(this.app.wallet.returnPublicKey());

    if (!key?.identifier){
      this.app.connection.emit("register-username-or-login");
    }else if (!key?.email){
      this.app.connection.emit("recovery-backup-overlay-render-request");
    }

  }


  attachEvents() {

    const league_join_btn = document.getElementById('league-join-btn');

    if (!league_join_btn) { return; }

    league_join_btn.onclick = (e) => {

      window.history.pushState("", "", `/league/`);
      e.preventDefault();

      let league_id = e.target.getAttribute("data-id");
      let key = this.app.keychain.returnKey(this.app.wallet.returnPublicKey());
      let user_email = key.email || "";

      //
      // show loader
      //
      document.querySelector(".league-join-controls").innerHTML = "";
      this.loader.render();

      let newtx = this.mod.createJoinTransaction(league_id, user_email);
      this.app.network.propagateTransaction(newtx);

      if (this.mod.debug){
        console.log("Join sent! " + league_id);
      }

    }  

  }
}

module.exports = JoinLeague;

