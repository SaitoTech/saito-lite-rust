module.exports = (game_self, players = 2) => {
	let help = `The Diet of Worms convenes as Protestant influence spreads across Germany...`;
	let html = `
      <div class="diet-overlay" id="diet-overlay">
	<div class="help">${help}</div>
	<div class="cardfans">
          <div class="protestant">
	  </div>
	  <div class="catholic">
	  </div>
	</div>
      </div>
  `;
	return html;
};
