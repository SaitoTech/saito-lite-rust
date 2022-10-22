module.exports = ArcadeMobileHelper = (game_mod) => {
  let gamename = (game_mod.gamename)? game_mod.gamename: game_mod.name;
  return `
    <div class="arcade-game-mobile-header">
      <span class="arcade-game-mobile-return-to-arcade"><i class="fas fa-arrow-circle-left navigation-return-to-arcade"></i></span><h1>${gamename}</h1>
    </div>
    <ul class="arcade-apps mobile-helper" id="arcade-apps">
     <li class="arcade-navigator-item tip" id="new-game">New Game</li>
     <li class="arcade-navigator-item tip" id="how-to-play">How to Play</li>
    </ul>
  `;
}
