const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const JoinLeagueTemplate = require("./join-league.template");


class JoinLeague {

  constructor(app, mod, league_id=""){
    this.app = app;
    this.mod = mod;
    this.league_id = league_id;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  async render(league_id="") {

    if (league_id != "") { this.league_id = league_id; }
    let league = this.mod.returnLeague(this.league_id);

//    let league = await this.mod.getAllLeagueData(this.league_id);

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

    league_join_form.addEventListener('submit', function(e){

      e.preventDefault();

      let league_id = e.target.getAttribute("data-league-id");
      let email = document.getElementById("join-league-user-email").value;

      let co = document.querySelector(".league-join-overlay-box");
      if (co) {
        co.style.display = "none";
      }

      mod.sendJoinLeagueTransaction(league_id, {"email": email});
    
      salert("League join request sent");

      setTimeout(function(){
        window.location = window.location.origin+"/arcade";
      }, 2500);
    });  

  }
}

module.exports = JoinLeague;

