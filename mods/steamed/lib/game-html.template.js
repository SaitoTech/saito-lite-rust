module.exports = (app, mod) => {
	return `
			<div id="main" class="main" style="display: all">
			<div class="gameboard" id="gameboard">
				<div class="player_field" id="opponent">
					<div class="field_slot" id="o1"></div>
					<div class="field_slot" id="o2"></div>
					<div class="field_slot" id="o3"></div>
				</div>
				<div class="player_field" id="self">
					<div class="status"></div>
					<div class="field_slot" id="s1"></div>
					<div class="field_slot" id="s2"></div>
					<div class="field_slot" id="s3"></div>
					<div class="steam-controls">
						<div id="forward" class="control"><i class="fa-solid fa-forward"></i></div>
						<div id="discard" class="control" style="visibility:hidden;"><i class="fa-solid fa-trash"></i></div>
					</div>
				</div>
				<div class="pot">
					<div class="field_slot tip" id="draw_deck"></div>
					<div class="offer"></div>
					<div class="field_slot" id="discards"></div>
				</div>
				<div class="score_card" id="my_score"></div>
				<div class="score_card" id="opponent_score"></div>
			</div>
		</div>
`;
}