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
  }


  attachEvents() {

    const league_join_form = document.getElementById('league-join-form');

    league_join_form.onsubmit = (e) => {

      e.preventDefault();

      let league_id = e.target.getAttribute("data-league-id");
      let email = document.getElementById("saito-login-email").value;
      let pass = document.getElementById("saito-login-password").value;

      //
      // show loader
      //
      document.querySelector(".league-join-controls").innerHTML = "";
      this.loader.render();

      let newtx = this.mod.createJoinTransaction(league_id, null);
      this.app.network.propagateTransaction(newtx);

      console.log("Join sent!");

    }  

  }
}

module.exports = JoinLeague;

