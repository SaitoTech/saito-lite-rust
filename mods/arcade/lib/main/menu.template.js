module.exports = ArcadeMenuTemplate = (gamelist) => {
	return `
    <div class="arcade-game-list-container">
    <div class="sidebar-header">
        <div class="sidebar-title">Games</div>
    </div>
    <div class="saito-menu arcade-menu saito-sidebar-element hide-scrollbar">
        <ul class="saito-menu-list">${gamelist}</ul>
    </div>
    </div>
  `;
};
