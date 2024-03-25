module.exports = StatsOverlayTemplate = (poker, tracked_stats) => {

	let html = `<div class="poker-stats-overlay">
								<div class="h2">Game Statistics</div>
								<div class="stats-table">
								<div class="stats-table-header stats-table-row">
									<div></div>
	`;

	for (let p in poker.game.stats) {
		html += `<div title="${p}">${poker.app.keychain.returnUsername(p)}</div>`;
	}

	html += "</div>";

	for (let s of tracked_stats){
		html += `<div class="stats-table-row">`;
		if (s?.further){
			html += `<div class="stats-label label-note" title="${s.further}">${s.readable}*</div>`;
		}else{
			html += `<div class="stats-label">${s.readable}</div>`;
		}
					

		for (let p in poker.game.stats){
			let stat_entry = "---";
			let playerStats = poker.game.stats[p];
			let current_stat = playerStats[s.code];
			
			console.log(playerStats, s.code, current_stat);
			// Now we get a little fancy
			if (current_stat > 0){
				if (s?.percentage){
					let denom = playerStats["hands"];

					if (s.percentage == "adjusted"){
						denom -= playerStats["walks"];
					}

					if (denom > 0){
						let percent = Math.round(100 * current_stat / denom);

						stat_entry = `${percent} (${current_stat}/${denom})`;

					}
				}else{
					stat_entry = current_stat;
				}

			}

			html += `<div>${stat_entry}</div>`;
		}

		html += "</div>";
	}

	//close table and overlay
	html += '</div></div>';


	return html;
};


