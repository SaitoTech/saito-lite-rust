const SaitoModuleTemplate = require("./../../../../lib/saito/new-ui/templates/saito-module.template");
const LeagueComponentExistingLeague = require("./../components/existing-league");

module.exports = (app, mod, leagues) => {

  let html = `
    <div class="league-main-container" id="league-main-container">
    <div class="saito-module">
      <div></div>
      <div class="saito-module-details-box">
        <div class="saito-module-title">Community Leagues</div>
        <div class="saito-module-description">Create and join leagues to compete against other players in specific games, chat, and make friends</div>
      </div>
      <div class="saito-module-action" id="create-new-league">New League</div>
    </div>`;


    let filter1 = leagues.filter( l => l.admin == app.wallet.returnPublicKey() );
    let filter2 = leagues.filter( l => l.myRank > 0 && l.admin != app.wallet.returnPublicKey());
    let filter3 = leagues.filter( l => l.myRank == 0 && l.admin != app.wallet.returnPublicKey());

  if (filter1.length > 0){
    html += `<div class="league-component-existing-league" id="leagues-for-admin">`;
    filter1.forEach((game) => {
      LeagueComponentExistingLeague.render(app, mod, game, "leagues-for-admin");
    });
    html +=  `</div>`;
  }  

  if (filter2.length > 0){
    html += `<div class="league-component-existing-league" id="leagues-for-play">`;
    filter2.forEach((game) => {
      LeagueComponentExistingLeague.render(app, mod, game, "leagues-for-play");
    });
    html +=  `</div>`;
  }  

 if (filter3.length > 0){
    html += `<div class="league-component-existing-league" id="leagues-for-join">`;
    filter3.forEach((game) => {
      LeagueComponentExistingLeague.render(app, mod, game, "leagues-for-join");
    });
    html +=  `</div>`;
  }  


  html +=  `</div>`;



  return html;
}

