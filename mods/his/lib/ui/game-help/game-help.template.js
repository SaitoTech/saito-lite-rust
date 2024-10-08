module.exports  = (targs) => {

  let line1 = "";
  let line2 = "";

  if (targs.line1) { line1 = targs.line1; }
  if (targs.line2) { line2 = targs.line2; }

	return `
		<div id="game-help" class="game-help">
			<div class="game-help-text">
				<div class="line1">${line1}</div>
				<div class="line2" style="clear:both">${line2}</div>
			</div>
		</div>
	`;
};
