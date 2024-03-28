module.exports = (app, mod) => {
	return `
		<div class="gameboard" id="gameboard">
			<div class="jaipur_board" style="display: none">
				<div class="bonus_tokens"></div>
				<div class="market"></div>
				<div class="invisible_item"></div>
			</div>
			<div id="rules">
				<div class="rules_header">Do one of the following:</div>
				<ol>
					<li>Take <em>one commodity</em> from the market</li>
					<li>Take <em>all camels</em> from the market</li>
					<li>Sell one kind of commodity</li>
					<li>Trade two or more cards with market</li>
				</ol>
			</div>
			<div id="purchase_zone" class="purchase_zone"></div>
		</div>
`;
}