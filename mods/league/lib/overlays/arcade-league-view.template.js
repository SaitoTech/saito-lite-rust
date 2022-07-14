module.exports = ArcadeLeagueTemplate = (app, mod, league) => {

  if (!league){
    return "";
  }

  let html = `<div class="league-details-overlay">
    
    <h2>${league.name}</h2>
     
    <p>${league.description}</p>
    <div class="league-overview-box">
      <div class="info-item"><div>Game:</div><div>${(league.game)?league.game:"All"}</div></div>
      <div class="info-item"><div>Players:</div><div>${league.playerCnt} / ${league.max_players}</div></div>
      <div class="info-item"><div>Type:</div><div>${league.type}</div></div>
      <div class="info-item"><div>Ranking Algo:</div><div>${league.ranking}</div></div>
      <div class="info-item"><div>Admin:</div><div>${app.keys.returnUsername(league.admin)}</div></div>
    </div>
    <div id="league-leaderboard" class="league-leaderboard">
      <div class="leaderboard-spinner loader"></div>
    </div>`;
    if (league.myRank <=0){
      html += `<div class="btn-controls-box">
      <button class='button' id='join-btn'>JOIN</button>
    </div>`;
    }
    
  html += `</div>`;


  return html;
}