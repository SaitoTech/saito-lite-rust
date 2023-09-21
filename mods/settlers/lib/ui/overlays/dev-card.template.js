module.exports = DevCardOverlayTemplate = (app, mod, dev_card) => {

  let html = `
    <div class="saitoa settlers-info-overlay dev-card-overlay">
      <div class="settlers-items-container">
        <div class="settlers-item-info-text">Select a card to play:</div>
        <div class="settlers-item-row settlers-cards-container settlers-desired-resources">

  `;

      let cards = "";
      for (let x = 0; x < mod.game.deck[0].hand.length; x++) {
          let card = mod.game.deck[0].cards[mod.game.deck[0].hand[x]];
          
          cards += `
            <div class="settlers-dev-card" id="${x}">
              <img src="${card.img}">
              <div class="settlers-dev-card-title">${card.card}</div>
              <div class="settlers-dev-card-text">${mod.rules[card.action]}</div>
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

}
