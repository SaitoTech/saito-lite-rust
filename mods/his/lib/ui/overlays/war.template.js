module.exports = (players = 2) => {
	let help = 'Foreign War';

	let html = `
      <div class="war-overlay" id="war-overlay">
	<div class="help">${help}</div>
	<div class="war-grid">
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
