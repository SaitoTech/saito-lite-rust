module.exports = GameBoardTemplate = (game_mod) => {

	return `
<div class="gameboard ${game_mod.theme} ${game_mod?.felt}">
  <div class="deal" id="deal">
  </div>
</div>
<div class="mystuff"></div>
	`;
};
