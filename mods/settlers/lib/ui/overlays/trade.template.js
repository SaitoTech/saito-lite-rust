module.exports = TradeOverlayTemplate = (tobj) => {


  let html = `
    <div class="saitoa trade-overlay">
      <div class="h2">You Want:</div>
      <div class="trade_overlay_offers">`;

  let num_cards_in_play = 0;

  for (let r of tobj.resources){
    html +=  `<div id="want_${r}" class="trade_area select ${r}">
          <div class="trade_count_arrow trade_count_up can_select"></div>  
          <div class="trade_count_number" data-count="${tobj.get[r]}">${(tobj.get[r] > 0) ? tobj.get[r] : ''}</div> 
          <div class="trade_count_arrow trade_count_down${tobj.get[r] > 0 ? " can_select" : "" }"></div>
        </div>`;
    num_cards_in_play += tobj.get[r];
  }
      
  html += `</div>
      <div class="h2">You Offer:</div>
      <div class="trade_overlay_offers">`;

  for (let r of tobj.resources){
    html += `<div id="offer_${r}" class="trade_area select ${r}">
            <div class="trade_count_arrow trade_count_up ${(tobj.give[r] < tobj.mod.countResource(tobj.mod.game.player, r))?" can_select":""}"></div>  
            <div class="trade_count_number" data-count="${tobj.give[r]}">${(tobj.give[r] > 0) ? tobj.give[r] : ''}</div> 
            <div class="trade_count_arrow trade_count_down${tobj.give[r] > 0 ? " can_select" : "" }"></div>
          </div>`;
    num_cards_in_play += tobj.give[r];

  }

  html += `</div>

      <div class="trade_overlay_buttons">
        <div id="trade_overlay_broadcast_button" class="trade_overlay_button ${num_cards_in_play>0? "valid_trade":"noselect"}">Broadcast Offer</div>
      </div>

    </div>
  `;


  return html;

}
