const SaitoArcadeInviteTemplate = require('./../../../../lib/saito/new-ui/templates/saito-arcade-invite.template');
const RedSquareLeagueSidebar = require('./league-sidebar.template');


module.exports = RedSquareGamesSidebarTemplate = (app, mod) => {

  let html =  `
        <div class="saito-sidebar right">
          <div class="saito-arcade-invite-list">
          </div>

          <div class="saito-leaderboard">
            <h6>Your Rankings:</h6>
            <div class="saito-table">`;
  

  let league_mod = app.modules.returnModule("League");
    if (league_mod){
      if (league_mod.leagues.length > 0){
        let cnt = 1;
        for (let l of league_mod.leagues){
          html += `<div class="saito-table-row ${(cnt%2 == 1)?"odd":""}">
                          <div class="saito-table-gamename">${l.name}</div>
                          <div class="saito-table-rank">${(l.myRank <= 0)?"unranked":l.myRank}</div>
                      </div>`;
          cnt++;
        }
      }
    }
    
  html += `</div></div>`;

  return html;

}

