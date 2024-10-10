module.exports = (app, mod, dev_card) => {
	let html = `
    <div class="saitoa dev-card-overlay">
      <div class="settlers-items-container">`;
	if (mod.canPlayerPlayCard()) {
		html += `<div class="settlers-item-info-text">Select Card to Play:</div>`;
	} else {
		html += `<div class="settlers-item-info-text">Action Cards:</div>`;
	}

	html += `<div class="settlers-item-row settlers-cards-container">`;

	let cards = '';

	let disable = !mod.canPlayerPlayCard();

	for (let x = 0; x < mod.game.state.players[mod.game.player-1].devcards.length; x++) {
		let card = mod.game.deck[0].cards[mod.game.state.players[mod.game.player-1].devcards[x]];

		//
		// It's not out turn or we have already played a dev card this turn, or which just bought the card (but it isn't a VP)
		//
		let card_disable = disable || (!mod.game.state.hasRolled && card.action !== 1);

		cards += `
 	           <div class="settlers-dev-card ${card_disable ? 'settlers-card-disabled' : ''}" id="${x}">
 	             	<img src="${card.img}">
	              <div class="settlers-dev-card-title">${card.card}</div>
	              <div class="settlers-dev-card-text">${card.subtitle}</div>
 	           </div>
          `;
	}

	//These are all new so disabled!
	for (let x = 0; x < mod.game.deck[0].hand.length; x++) {
		let card = mod.game.deck[0].cards[mod.game.deck[0].hand[x]];
		cards += `
            <div class="settlers-dev-card settlers-card-disabled">
              <img src="${card.img}">
              <div class="settlers-dev-card-title">${card.card}</div>
              <div class="settlers-dev-card-text">${card.subtitle}</div>
            </div>
          `;
	}

	if (!cards){
		cards = `
            <div class='player-notice'>
							You don't have any cards, but can buy one with             
              ${mod.formatResource('ore')}
              ${mod.formatResource('wheat')}
              ${mod.formatResource('wool')}
            </div>
            `;
	}

	html += cards;

	html += `
        </div>
      </div>
    </div>  
  `;
	return html;
};
