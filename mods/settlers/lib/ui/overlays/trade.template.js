module.exports = TradeOverlayTemplate = (tobj) => {

  return `
    <div class="saitoa trade-overlay">

      <div class="h1 trade_overlay_title">Offer Trade</div>

      <div class="h2">You Want:</div>
      <div class="trade_overlay_offers">
      	<div id="want_0" class="trade_area select card brick">
          <div class="trade_count_arrow trade_count_up"></div>  
          <div class="trade_count_number" data-count="${(tobj.get[0] > 0) ? tobj.get[0] : ''}">${(tobj.get[0] > 0) ? tobj.get[0] : ''}</div> 
          <div class="trade_count_arrow trade_count_down"></div>
        </div>
      	<div id="want_1" class="trade_area select card wood">
          <div class="trade_count_arrow trade_count_up"></div>  
          <div class="trade_count_number" data-count="${(tobj.get[1] > 0) ? tobj.get[1] : ''}">${(tobj.get[1] > 0) ? tobj.get[1] : ''}</div> 
          <div class="trade_count_arrow trade_count_down"></div>
        </div>
      	<div id="want_2" class="trade_area select card wheat">
          <div class="trade_count_arrow trade_count_up"></div>  
          <div class="trade_count_number" data-count="${(tobj.get[2] > 0) ? tobj.get[2] : ''}">${(tobj.get[2] > 0) ? tobj.get[2] : ''}</div> 
          <div class="trade_count_arrow trade_count_down"></div>
        </div>
      	<div id="want_3" class="trade_area select card wool">
          <div class="trade_count_arrow trade_count_up"></div>  
          <div class="trade_count_number" data-count="${(tobj.get[3] > 0) ? tobj.get[3] : ''}">${(tobj.get[3] > 0) ? tobj.get[3] : ''}</div> 
          <div class="trade_count_arrow trade_count_down"></div>
        </div>
      	<div id="want_4" class="trade_area select card ore">
          <div class="trade_count_arrow trade_count_up"></div>  
          <div class="trade_count_number" data-count="${(tobj.get[4] > 0) ? tobj.get[4] : ''}">${(tobj.get[4] > 0) ? tobj.get[4] : ''}</div> 
          <div class="trade_count_arrow trade_count_down"></div>
        </div>
      </div>

      <div class="h2">You Offer:</div>
      <div class="trade_overlay_offers">
        	<div id="offer_0" class="trade_area select card brick">
            <div class="trade_count_arrow trade_count_up"></div>  
            <div class="trade_count_number" data-count="${(tobj.give[0] > 0) ? tobj.give[0] : ''}">${(tobj.give[0] > 0) ? tobj.give[0] : ''}</div> 
            <div class="trade_count_arrow trade_count_down"></div>
          </div>
        	<div id="offer_1" class="trade_area select card wood">
            <div class="trade_count_arrow trade_count_up"></div>  
            <div class="trade_count_number" data-count="${(tobj.give[1] > 0) ? tobj.give[1] : ''}">${(tobj.give[1] > 0) ? tobj.give[1] : ''}</div> 
            <div class="trade_count_arrow trade_count_down"></div>
          </div>
        	<div id="offer_2" class="trade_area select card wheat">
            <div class="trade_count_arrow trade_count_up"></div>  
            <div class="trade_count_number" data-count="${(tobj.give[2] > 0) ? tobj.give[2] : ''}">${(tobj.give[2] > 0) ? tobj.give[2] : ''}</div> 
            <div class="trade_count_arrow trade_count_down"></div>
          </div>
        	<div id="offer_3" class="trade_area select card wool">
            <div class="trade_count_arrow trade_count_up"></div>  
            <div class="trade_count_number" data-count="${(tobj.give[3] > 0) ? tobj.give[3] : ''}">${(tobj.give[3] > 0) ? tobj.give[3] : ''}</div> 
            <div class="trade_count_arrow trade_count_down"></div>
          </div>
        	<div id="offer_4" class="trade_area select card ore">
            <div class="trade_count_arrow trade_count_up"></div>  
            <div class="trade_count_number" data-count="${(tobj.give[4] > 0) ? tobj.give[4] : ''}">${(tobj.give[4] > 0) ? tobj.give[4] : ''}</div> 
            <div class="trade_count_arrow trade_count_down"></div>
          </div>
      </div>

      <div class="trade_overlay_buttons">
        <div class="trade_overlay_button saito-button-primary trade_overlay_reset_button">Reset</div>
        <div class="trade_overlay_button saito-button-primary trade_overlay_broadcast_button noselect">Broadcast Offer</div>
      </div>

    </div>
  `;

}
