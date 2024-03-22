module.exports = StatsOverlayTemplate = (poker, tracked_stats) => {

	let html = `<div class="poker-stats-overlay">
								<div class="h2">Game Statistics</div>
								<div class="stats-table">
								<div class="stats-table-header stats-table-row">
									<div></div>
	`;

	for (let p in poker.game.stats) {
		html += `<div>${poker.app.keychain.returnUsername(p)}</div>`;
	}

	html += "</div>";

	for (let s of tracked_stats){
		html += `<div class="stats-table-row">
								<div class="stats-label" title="${s?.further ? s.further:""}">${s.readable}${s.further?"*":""}</div>`;

		for (let p in poker.game.stats){
			let stat_entry = "---";
			let current_stat = p[s.code];

			// Now we get a little fancy

			if (!s?.percentage){

			}else{

			}

			html += `<div>${stat_entry}</div>`;
		}

		html += "</div>";
	}

	//close table and overlay
	html += '</div></div>';


	return html;
};


