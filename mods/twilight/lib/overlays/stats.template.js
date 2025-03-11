const StatsTemplate = (twilight_self, stats) => {

	let us_bg = 0;
	let ussr_bg = 0;
	let round_us_vp = [];
	let round_ussr_vp = [];

	console.log('STATS: ' + JSON.stringify(stats));
	for (var i in twilight_self.countries) {
		let countryname = i;
		if (twilight_self.countries[countryname].bg == 1) {
			if (twilight_self.isControlled('us', i) == 1) {
				us_bg++;
			}
			if (twilight_self.isControlled('ussr', i) == 1) {
				ussr_bg++;
			}
		}
	}

	let us_coups = '0';
	if (twilight_self.game.state.stats.us_coups.length > 0) {
		us_coups = JSON.stringify(twilight_self.game.state.stats.us_coups);
	}

	let ussr_coups = '0';
	if (twilight_self.game.state.stats.ussr_coups.length > 0) {
		ussr_coups = JSON.stringify(twilight_self.game.state.stats.ussr_coups);
	}

	let html = `

<div class="statistics-overlay">
    <div class="gobal-stats-grid">
      <div class="us-global-title">US</div>
      <div class="us-global-stats global-desc-ops">${stats.us_ops}</div>
      <div class="us-global-stats global-desc-ops-modified">${stats.us_modified_ops}</div>
      <div class="us-global-stats global-desc-evented-ops">${stats.us_events_ops}</div>
      <div class="us-global-stats global-desc-space">${stats.us_ops_spaced}</div>
      <div class="us-global-stats global-desc-scoring">${stats.us_scorings}</div>
      <div class="us-global-stats global-desc-bg">${us_bg}</div>
      <div class="us-global-stats global-desc-roll">${us_coups}</div>
      <div class="ussr-global-title">USSR</div>
      <div class="ussr-global-stats global-desc-ops">${stats.ussr_ops}</div>
      <div class="ussr-global-stats global-desc-ops-modified">${stats.ussr_modified_ops}</div>
      <div class="ussr-global-stats global-desc-evented-ops">${stats.ussr_events_ops}</div>
      <div class="ussr-global-stats global-desc-space">${stats.ussr_ops_spaced}</div>
      <div class="ussr-global-stats global-desc-scoring">${stats.ussr_scorings}</div>
      <div class="ussr-global-stats global-desc-bg">${ussr_bg}</div>
      <div class="ussr-global-stats global-desc-roll">${ussr_coups}</div>
      <div class="global-desc global-desc-ops">OPS</div>
      <div class="global-desc global-desc-ops-modified">Modified</div>
      <div class="global-desc global-desc-evented-ops">Evented</div>
      <div class="global-desc global-desc-space">Spaced</div>
      <div class="global-desc global-desc-scoring">Scoring Cards</div>
      <div class="global-desc global-desc-bg">Battlegrounds</div>
      <div class="global-desc global-desc-roll">Coups</div>
    </div>
</div>

  `;

	return html;
};
module.exports = StatsTemplate;
