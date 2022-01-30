module.exports = ArcadeGameSidebarTemplate = (game_mod) => {
  let gamename = (game_mod.gamename)? game_mod.gamename: game_mod.name;
  
  let html = `
  <div class="arcade-sidebar" id="arcade-sidebar">
    <div class="arcade-controls">
      <div class="arcade-navigator-bars-menu">
        <div class="arcade-game-sidebar-header">
          <span class="arcade-game-sidebar-return-to-arcade"><i class="fas fa-arrow-circle-left navigation-return-to-arcade"></i></span><h2 style="width:100%">${gamename}</h2>
        </div>
        <div class="arcade-apps-wrapper">
          <ul class="arcade-apps" id="arcade-apps">
	         <li class="arcade-navigator-item tip" id="new-game">New Game</li>
	         <li class="arcade-navigator-item tip" id="how-to-play">How to Play</li>
	        </ul>
        </div>
      </div>
    </div>`;

 if (game_mod.status || game_mod.publisher_message) {
  html += `<div id="arcade-announcement" class="arcade-announcement">`
  if (game_mod.status){
    html += `<div id="game-status-notice" class="game-status-notice"><div>Game status: <b>${game_mod.status}</b></div>`;
    if (game_mod.status === "Alpha"){
      html += `<div>The game is a playable demo under active development. Expect the unexpected.</div>`;
    }else if (game_mod.status === "Beta"){
      html += `<div>Please let us know if you find any bugs or have suggestions to make the game better</div>`;
    }
    html += "</div>";
  }
    if (game_mod.publisher_message){
      html += `<div id="game-wizard-publisher-message"><b>Publisher Message: </b> ${game_mod.publisher_message}</div>`;
    }
  html += `</div>`;
  }


  html += `<div id="email-chat" class="email-chat"></div>`;
  return html;
}
