module.exports = ArcadeGameSidebarTemplate = (game_mod) => {
  let gamename = game_mod.name;
  if (game_mod.gamename) { gamename = game_mod.gamename; }
  return `
  <div class="arcade-sidebar" id="arcade-sidebar">
    <div class="arcade-controls">
      <div class="arcade-bars-menu">
        <div class="arcade-navigator-bars-menu register-username-check">
          <div class="arcade-sidebar-active-games-header" style="display:flex; align-items:center;justify-content: space-between">
            <h2>${gamename}</h2>
          </div>
          <div class="arcade-apps-wrapper">
            <ul class="arcade-apps" id="arcade-apps">
	      <li class="arcade-navigator-item tip" id="New-Game">New Game</li>
	      <li class="arcade-navigator-item tip" id="How-To-Play">How to Play</li>
	      <li class="arcade-navigator-item tip" id="Return-to-Arcade">Return to Arcade</li>
	    </ul>
          </div>
        </div>
    </div>
  </div>

<div id="arcade-announcement" class="arcade-announcement"><b>Publisher Message: </b>this game is released open source under terms of this license. If you enjoy this game please support the publisher by purchasing a physical copy here. Or maybe join us and help create more open source games.</div>

  <div id="email-chat" class="email-chat"></div>

<style>


</style>

  `;
}
