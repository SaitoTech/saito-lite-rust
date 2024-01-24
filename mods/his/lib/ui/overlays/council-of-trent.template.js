module.exports = (players = 2) => {
	let help = `Protestants select up to 2 uncommitted debaters. Papacy select up to 4 uncommitted debaters. Both sides roll dice equal to power. Hits on 5 or 6. Winner converts spaces equal to difference in hits.`;

	let html = `
      <div class="council-of-trent-overlay" id="council-of-trent-overlay">
	<div class="help">${help}</div>
	<div class="debaters"></div>
      </div>
  `;
	return html;
};
