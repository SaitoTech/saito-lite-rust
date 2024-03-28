module.exports = (app, mod) => {
	return `<div class="gameboard" id="gameboard">
			<div class="pot" id="pot">
				<div class="pot-chips"></div>
				<div class="pot-counter"></div>
			</div>
			<div class="deal" id="deal"></div>
			<div class="place-holder"></div>
		</div>`;
};
