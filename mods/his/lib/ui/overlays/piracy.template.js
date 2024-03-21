module.exports = () => {

	let help = 'Pirate Attacks';

	let html = `
      <div class="piracy-overlay" id="piracy-overlay">
	<div class="help">${help}</div>
	<div class="piracy-grid">
	  <div class="attacker">
	    <div class="title">anti-piracy coalition</div>
	  </div>
	  <div class="defender">
	    <div class="title">surviving pirate forces</div>
	  </div>
	</div>
	</div>
      </div>
  `;
	return html;
};
