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
  }

  async render(league_id="") {

    if (league_id != "") { this.league_id = league_id; }
    let league = this.mod.returnLeague(this.league_id);

    if (league == null) {
      alert("League not found");
      return;
    }

    this.game_mod = this.app.modules.returnModuleByName(league.game);
    this.overlay.show(JoinLeagueTemplate(this.app, this.mod, league));
    this.overlay.setBackground(this.game_mod.returnArcadeImg());

    this.attachEvents();
  }


  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    const league_join_form = document.getElementById('league-join-form');

    league_join_form.addEventListener('submit', (e) => {

      e.preventDefault();

      let league_id = e.target.getAttribute("data-league-id");
      let email = document.getElementById("saito-login-email").value;
      let pass = document.getElementById("saito-login-password").value;

      //
      // show loader
      //
      document.querySelector(".league-join-controls").innerHTML = "";
      this.loader.render();

      //
      // before 
      //
      app.browser.requestBackup(

	//
	// successful login / backup
	//
	(res) => {

          let co = document.querySelector(".league-join-overlay-box");
          if (co) {
            co.style.display = "none";
          }

          let newtx = this.mod.createJoinTransaction(league_id, {"email": email});
          this.app.network.propagateTransaction(newtx);

          this.mod.addLeaguePlayer({league_id, email, publickey: this.app.wallet.returnPublicKey()}); 
          this.mod.saveLeagues();

          //setTimeout(function(){
          //  window.location = window.location.origin+"/arcade";
          //}, 1500);

	},

	//
	// failed login / backup
	//
	(res) => {
	  alert("Account Recovery required for League Membership!");
	}, 

	email ,

	pass ,

      );

    });  

  }
}

module.exports = JoinLeague;

