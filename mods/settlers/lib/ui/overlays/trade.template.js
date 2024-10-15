module.exports = (tobj) => {
	let html = `
    <div class="saitoa trade-overlay">
      <div class="h2">You ${tobj.accepting_trade ? 'Accept' : 'Want'}:</div>
      <div class="trade_overlay_offers">`;

	let num_cards_in_play = 0;

	for (let r of tobj.resources) {
		html += `<div id="want_${r}" class="trade_area select ${r}">
          <div class="trade_count_arrow trade_count_up can_select"></div>  
          <div class="trade_count_number" data-count="${tobj.get[r]}">${tobj.get[r] > 0 ? tobj.get[r] : ''}</div> 
          <div class="trade_count_arrow trade_count_down${tobj.get[r] > 0 ? ' can_select' : ''}"></div>
        </div>`;
		num_cards_in_play += tobj.get[r];
	}

	html += `</div>
      <div class="h2">You ${tobj.accepting_trade ? 'Give' : 'Offer'}:</div>
      <div class="trade_overlay_offers">`;

	let valid_trade = true;

	for (let r of tobj.resources) {
		if (tobj.give[r] > tobj.mod.countResource(tobj.mod.game.player, r)) {
			valid_trade = false;
		}
		html += `<div id="offer_${r}" class="trade_area select ${r} 
					${tobj.give[r] > tobj.mod.countResource(tobj.mod.game.player, r) ? ' invalid_offer' : ''}">
            <div class="trade_count_arrow trade_count_up ${tobj.give[r] < tobj.mod.countResource(tobj.mod.game.player, r) ? ' can_select' : ''}"></div>  
            <div class="trade_count_number" data-count="${tobj.give[r]}">${tobj.give[r] > 0 ? tobj.give[r] : ''}</div> 
            <div class="trade_count_arrow trade_count_down${tobj.give[r] > 0 ? ' can_select' : ''}"></div>
          </div>`;
		num_cards_in_play += tobj.give[r];
	}

	html += `</div>

      <div class="trade_overlay_buttons">
      	<div id="trade_overlay_cancel_button" class="trade_overlay_button valid_trade">${tobj.accepting_trade ? 'Reject' : 'Cancel'} Offer</div>
        <div id="trade_overlay_broadcast_button" class="trade_overlay_button ${	valid_trade && num_cards_in_play > 0 ? 'valid_trade' : 'noselect'}">${tobj.accepting_trade && valid_trade ? 'Accept' : 'Broadcast'} Offer</div>
      </div>

    </div>
  `;

	return html;
};
