module.exports = (players = 2) => {
	let help = 'Field Battle';

	let html = `
      <div class="field-battle-overlay" id="field-battle-overlay">
	<div class="help">${help}</div>
	<div class="field-battle-grid">
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
