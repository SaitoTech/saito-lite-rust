module.exports = DevCardOverlayTemplate = (app, mod, dev_card) => {

  let html = `
    <div class="saitoa dev-card-overlay">
      <div class="settlers-items-container">`
  if (mod.canPlayerPlayCard()){
    html += `<div class="settlers-item-info-text">Select a card to play:</div>`;
  }else{
    html += `<div class="settlers-item-info-text">My dev cards:</div>`;
  }
        
  html += `<div class="settlers-item-row settlers-cards-container settlers-desired-resources">`;

      let cards = "";
      let disable = !mod.canPlayerPlayCard();

      console.log(disable);

      if (mod.game.state.playerTurn !== mod.game.player){
        disable = true;
      }

      console.log(disable);

      for (let x = 0; x < mod.game.deck[0].hand.length; x++) {
          let card = mod.game.deck[0].cards[mod.game.deck[0].hand[x]];
        
          let card_disable = disable || (x >= mod.game.state.players[mod.game.player - 1].devcards);
          
          if (!mod.game.state.hasRolled && card.action !== 1){
            card_disable = true;
          }

          cards += `
            <div class="settlers-dev-card ${card_disable ? "settlers-card-disabled":""}" id="${x}">
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
