module.exports = ArcadeLeagueTemplate = (app, mod, league) => {

  if (!league){
    return "";
  }

  let html = `<div class="league-details-overlay">
    
    <h2>${league.name}</h2>
     
    <p>${league.description}</p>
    <div class="league-overview-box">
      <div>Game:</div><div>${(league.game)?league.game:"All"}</div>
      <div>Players:</div><div>${league.playerCnt}${league.max_players > 0 ? ` / ${league.max_players}`:""}</div>
      <div>Type:</div><div>${league.type}</div>
      <div>Ranking Algo:</div><div>${league.ranking}</div>
      <div>Admin:</div><div>${app.keys.returnUsername(league.admin)}</div>
    </div>`;

    //Show League dates
    if (league.startdate || league.enddate){
      html += `<div class="season-dates">${league.startdate} --- ${league.enddate}</div>`;
    }
    //Show League Options
    if (league.options){
      html += `<div class="info-header">All matches in this league use the following game options:</div>
      <div class="gameShortDescription">${makeDescription(app, league.game, JSON.parse(league.options))}</div>`;
    }

    if (app.modules.returnActiveModule().name == "Arcade" && league.game && league.myRank > 0 && league.admin !== "saito"){
      if (mod.checkDate(league.enddate) && mod.checkDate(league.startdate, true)){
        html += `<div><button type="button" id="game-invite-btn" class="game-invite-btn" >Create Game</button></div>`;
      }
    }
    html += `<div id="league-leaderboard" class="league-leaderboard">
      <div class="leaderboard-spinner loader"></div>
    </div>
    <div class="btn-controls-box">`;
    //Available space in the league
    if (league.max_players == 0 || league.playerCnt < league.max_players){
      if (mod.checkDate(league.startdate) || league.allowlate){
        if (league.myRank <=0){
          html += `<button class='button' id='join-btn'>JOIN</button>`;
        }
        if (app.wallet.returnPublicKey() == league.admin){
         html += `<button class='button' id='invite-btn'>INVITE</button>`; 
        }
      }
    }
    html += `</div>`;
    
    
  html += `</div>`;


  return html;
}


//Adapted from arcade-invite.template.js
let makeDescription = (app, game, options) => {

  let html = '';
  let gameModule = app.modules.returnModule(game);
  if (gameModule && gameModule !== "Arcade") {
    let sgoa = gameModule.returnShortGameOptionsArray(options);
    for (let i in sgoa) {
      html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">${i.replace(/_/g, ' ')}`;
      if (sgoa[i] !== null){
        html += `: </div><div class="gameShortDescriptionValue">${sgoa[i]}</div></div>`;
      }else{
        html += `</div></div>`
      }
    }
  }
  
  return html;

}
