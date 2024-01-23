module.exports = (players = 2) => {
	let help = 'Naval Battle';

	let html = `
      <div class="naval-battle-overlay" id="naval-battle-overlay">
	<div class="help">${help}</div>
	<div class="naval-battle-grid">
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
