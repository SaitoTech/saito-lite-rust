module.exports = ArcadeLeagueTemplate = (app, mod, league) => {

  if (!league){
    return "";
  }

  let html = `<div class="league-details-overlay">
    
    <h2>${league.name}</h2>
     
    <p>${league.description}</p>
    <div class="league-overview-box">
      <div class="info-item"><div>Game:</div><div>${(league.game)?league.game:"All"}</div></div>
      <div class="info-item"><div>Players:</div><div>${league.playerCnt}${league.max_players > 0 ? ` / ${league.max_players}`:""}</div></div>
      <div class="info-item"><div>Type:</div><div>${league.type}</div></div>
      <div class="info-item"><div>Ranking Algo:</div><div>${league.ranking}</div></div>
      <div class="info-item"><div>Admin:</div><div>${app.keys.returnUsername(league.admin)}</div></div>
    </div>`;
    if (app.modules.returnActiveModule().name == "Arcade" && league.game && league.myRank > 0 && league.admin !== "saito"){
      html += `<div><button type="button" id="game-invite-btn" class="game-invite-btn" >Create Game</button></div>`;
    }
    html += `<div id="league-leaderboard" class="league-leaderboard">
      <div class="leaderboard-spinner loader"></div>
    </div>
    <div class="btn-controls-box">`;
    if (league.myRank <=0 && (league.max_players == 0 || league.playerCnt < league.max_players)){
      html += `<button class='button' id='join-btn'>JOIN</button>`;
    }
    if (app.wallet.returnPublicKey() == league.admin && (league.max_players == 0 || league.playerCnt < league.max_players)){
     html += `<button class='button' id='invite-btn'>INVITE</button>`; 
    }
    html += `</div>`;
    
    
  html += `</div>`;


  return html;
}