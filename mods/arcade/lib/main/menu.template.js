module.exports = ArcadeMenuTemplate = (gamelist) => {

  return `
    <div class="arcade-game-list-container">
    <h5>Games</h5>
    <div class="saito-menu arcade-menu saito-sidebar-element hide-scrollbar">
        <ul class="saito-menu-list">${gamelist}</ul>
    </div>
    </div>
  `;

}

