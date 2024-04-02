module.exports = ArcadeMainTemplate = () => {
	return `
    <div id="saito-container" class="saito-container arcade-container">
      <div id="arcade-main" class="saito-main arcade-main">
        <div id="arcade-invites-box" class="arcade-invites-box"></div>
        <div id="arcade-central-panel" class="arcade-central-panel">
          <div id="arcade-game-filter-list" class="arcade-game-filter-list">
            <div id="all-games" class="game-filter-item">all games</div>
            <div id="all-games" class="game-filter-item">card games</div>
            <div id="all-games" class="game-filter-item">board games</div>
            <div id="all-games" class="game-filter-item">one player games</div>
          </div>

	      </div>
      </div>
      <div class="saito-sidebar right">
        <div id="arcade-leagues" class="arcade-leagues"></div>
      </div>
    </div>
  `;
};
