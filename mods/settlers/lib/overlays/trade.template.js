module.exports = TradeOverlayTemplate = (tobj) => {

  return `
    <div class="saitoa trade-overlay">

      <div class="h1 trade_overlay_title">Offer a Trades</div>

      <div class="h2">You Want:</div>
      <div class="trade_overlay_offers">
	<div id="want_0" class="trade_area select card brick">${(tobj.get[0] > 0) ? tobj.get[0] : ''}</div>
	<div id="want_1" class="trade_area select card wood">${(tobj.get[1] > 0) ? tobj.get[0] : ''}</div>
	<div id="want_2" class="trade_area select card wheat">${(tobj.get[2] > 0) ? tobj.get[0] : ''}</div>
	<div id="want_3" class="trade_area select card wool">${(tobj.get[3] > 0) ? tobj.get[0] : ''}</div>
	<div id="want_4" class="trade_area select card ore">${(tobj.get[4] > 0) ? tobj.get[0] : ''}</div>
      </div>

      <div class="h2">You Offer:</div>
      <div class="trade_overlay_offers">
	<div id="offer_0" class="trade_area select card brick">${(tobj.get[0] > 0) ? tobj.get[0] : ''}</div>
	<div id="offer_1" class="trade_area select card wood">${(tobj.get[1] > 0) ? tobj.get[0] : ''}</div>
	<div id="offer_2" class="trade_area select card wheat">${(tobj.get[2] > 0) ? tobj.get[0] : ''}</div>
	<div id="offer_3" class="trade_area select card wool">${(tobj.get[3] > 0) ? tobj.get[0] : ''}</div>
	<div id="offer_4" class="trade_area select card ore">${(tobj.get[4] > 0) ? tobj.get[0] : ''}</div>
      </div>

      <div class="trade_overlay_buttons">
        <div class="trade_overlay_button saito-button-primary trade_overlay_reset_button">Reset</div>
        <div class="trade_overlay_button saito-button-primary trade_overlay_broadcast_button noselect">Broadcast Offer</div>
      </div>

    </div>
  `;

}
