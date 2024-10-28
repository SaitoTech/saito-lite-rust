module.exports = (gamelist) => {
	return `
    <div class="arcade-game-list-container">
    <div class="sidebar-header">
        <div class="sidebar-title">Games</div>
    </div>
    <div class="saito-menu arcade-menu saito-sidebar-element hide-scrollbar">
        <div class="intersection-anchor" id="top-of-game-list"></div>
        <ul class="saito-menu-list">${gamelist}</ul>
        <div class="intersection-anchor" id="bottom-of-game-list"></div>
    </div>
    </div>
  `;
};
