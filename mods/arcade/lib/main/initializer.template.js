module.exports = (game_id) => {
	if (game_id) {
		return `
        <div class="arcade-initializer"> 
            <div class="arcade-game-initializer-success-title">Your game is ready!</div>
            <button class="arcade-game-initializer-success-button saito-button">start game</button>
        </div>`;
	} else {
		return `
        <div class="arcade-initializer">
            <div id="game-loader-container" class="game-loader-container"> 
              <div id="game-loader-title" class="game-loader-title">
                Your Game is Initializing
              </div>
              <div class="game-loader-spinner" id="game-loader-spinner"></div>
            </div>
        </div>`;
	}
};
