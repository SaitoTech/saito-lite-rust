module.exports = (players = 2) => {
	let help = 'Siege / Assault';

	let html = `
      <div class="siege-overlay" id="siege-overlay">
	<div class="help">${help}</div>
	<div class="siege-grid">
	  <div class="attacker">
	    <div class="title">attacker</div>
	  </div>
	  <div class="defender">
	    <div class="title">defender</div>
	  </div>
	</div>
	</div>
      </div>
  `;
	return html;
};
