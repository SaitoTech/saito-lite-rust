module.exports = (game_self, players = 2) => {
	let help = 'Protestants and Catholics debate at the Diet of Worms...';
	if (
		game_self.game.player == game_self.returnPlayerOfFaction('protestant')
	) {
		help =
			'Protestants - select card to indicate your commitment during the Diet of Worms';
	} else {
		if (
			game_self.game.player == game_self.returnPlayerOfFaction('papacy')
		) {
			help =
				'Papacy - select card to indicate your commitment during the Diet of Worms';
		} else {
			if (
				game_self.game.player ==
				game_self.returnPlayerOfFaction('hapsburg')
			) {
				help =
					'Hapsburg - select card to indicate your commitment during the Diet of Worms';
			}
		}
	}
	if (players > 2) {
		help =
			'The Protestant and Catholic Powers convene for Theological Debate during the Diet of Worms. Both sides pick cards to indicate their level of commitment during the debate.';
	}

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
