module.exports = GameHelpTemplate = (line1="learn", line2="to play") => {

	return `
		<div id="game-help" class="game-help">
			<div class="game-help-text">
				<div>${line1}</div>
				<div style="clear:both">${line2}</div>
			</div>
		</div>
	`;
};
