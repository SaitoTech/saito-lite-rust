module.exports = (region, sobj) => {

  let results_text = "Region Tied";
  let bonus_events = "";

  if (sobj.us.vp > sobj.ussr.vp) { results_text = `US wins +${sobj.us.vp-sobj.ussr.vp} VP`; }
  if (sobj.us.vp < sobj.ussr.vp) { results_text = `USSR wins +${sobj.ussr.vp-sobj.us.vp} VP`; }
  if (sobj.bonus.length > 0) {
    bonus_events = `
      <div class="scoring-bonus-title">Bonus Points</div>  
      <div class="scoring-event-grid"></div>
    `;
  }

  let html = `

    <div class="scoring-overlay ${region}-scoring">     

        <div class="scoring-cardlist-container">
          <div class="card card-hud"><img class="cardimg" src="/twilight/img/en/TNRnTS-01.svg"><img class="cardimg" src="/twilight/img/EarlyWar.svg"><img class="cardimg" src="/twilight/img/BothPlayerCard.svg"><img class="cardimg" src="/twilight/img/MayNotBeHeld.svg"></div>
        </div>
     
        <div class="scoring-box">
          <div class="scoring-result-title">${results_text}</div>   
	  <div class="scoring-text">US controls [${sobj.us.bg}] battleground and [${sobj.us.total-sobj.us.bg}] non-battleground countries for [${sobj.us.status}].</div>
	  <div class="scoring-text">USSR controls [${sobj.ussr.bg}] battleground and [${sobj.ussr.total-sobj.ussr.bg}] non-battleground countries for [${sobj.ussr.status}].</div>
          ${bonus_events}
	</div>

    </div>

  `;

  return html;

}

