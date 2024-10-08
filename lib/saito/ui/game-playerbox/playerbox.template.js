module.exports  = (obj) => {
	return `
    <div class="game-playerbox game-playerbox-${obj.player_number}" id="game-playerbox-${obj.player_number}">
      <div class="game-playerbox-head game-playerbox-head-${obj.player_number}" id="game-playerbox-head-${obj.player_number}"></div>
      <div class="game-playerbox-body game-playerbox-body-${obj.player_number} hide-scrollbar" id="game-playerbox-body-${obj.player_number}"></div>
      <div class="game-playerbox-graphics game-playerbox-graphics-${obj.player_number}" id="game-playerbox-graphics-${obj.player_number}"></div>
    </div>
  `;
};
