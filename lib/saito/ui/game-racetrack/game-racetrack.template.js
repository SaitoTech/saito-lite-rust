module.exports  = (scoreboard) => {
	let html = '';
	html += `
    <div id="racetrack" class="racetrack">
    <div class="racetrack-label">${scoreboard.title}</div>
  `;

	html += `<div class="racetrack-slot"><div class="racetrack-slot-label">${scoreboard.icon}</div>`;
	html += '<div class="track-players">';
	for (let p of scoreboard.players) {
		p.score = Math.min(p.score, scoreboard.win);
		if (p.score == scoreboard.win) {
			html += `<div class="player-position p${p.color}"><span>${p.name}</span></div>`;
		}
	}
	html += '</div></div>';

	for (let j = scoreboard.win - 1; j >= scoreboard.min; j--) {
		html +=
			'<div class="racetrack-slot"><div class="racetrack-slot-label">' +
			j +
			'</div>';
		html += '<div class="track-players">';
		for (let p of scoreboard.players) {
			if (p.score == j) {
				html += `<div class="player-position p${p.color}"><span>${p.name}</span></div>`;
			}
		}
		html += '</div></div>';
	}
	html += '</div>';

	return html;
};
