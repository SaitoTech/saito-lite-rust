const SaitoOverlay = require("../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JoinLeagueOverlayTemplate = require("./join-league-overlay.template");
const SaitoTooltip = require("../../../../lib/saito/new-ui/saito-tooltip/saito-tooltip");

class JoinLeagueOverlay {
  constructor(app){
    this.app = app;
    this.overlay = new SaitoOverlay(app, false, true);
    this.saito_tooltip = new SaitoTooltip(app);
  }

  async render(app, mod, league_id) {
  	this.league_id = league_id;
    this.mod = mod;

    let league = await mod.getAllLeagueData(league_id);
    this.overlay.show(app, mod, JoinLeagueOverlayTemplate(app, mod, league));

    let backdrop_image = `/${league.game.toLowerCase()}/img/arcade/arcade.jpg`;
    this.overlay.setBackground(backdrop_image);

    this.saito_tooltip.info = `<div class="saito-table league-join-table">
            <div class="saito-table-body" id="league-table-ranking-body">
              
              <div class="saito-table-row">
                <div>League Name</div>
                <div> ${league.name}</div>
              </div>

              <div class="saito-table-row">
                <div>Game</div>
                <div> ${league.game}</div>
              </div>

              <div class="saito-table-row">
                <div>Type</div>
                <div> ${league.type}</div>
              </div>

              <div class="saito-table-row">
                <div>Players</div>
                <div> ${league.playerCnt}</div>
              </div>

              <div class="saito-table-row">
                <div>League Info</div>
                <div> ${app.browser.stripHtml(league.description)}</div>
              </div>

            </div>
          </div>`;

    this.saito_tooltip.render(app, mod, ".saito-tooltip-box");
  
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
      
    const league_join_form = document.getElementById('league-join-form');

    league_join_form.addEventListener('submit', function(e){
      e.preventDefault();

      let league_id = e.target.getAttribute("data-league-id");
      let email = document.getElementById("join-league-user-email").value;

      mod.sendJoinLeagueTransaction(league_id, {"email": email});
    
      salert("League join request sent");

      setTimeout(function(){
        window.location = window.location.origin+"/arcade";
      }, 2500);
    });  

  }
}

module.exports = JoinLeagueOverlay;