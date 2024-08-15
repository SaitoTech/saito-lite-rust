const ScoringTemplate = (region, sobj) => {
	let results_text = 'Region Tied';
	let bonus_events = '';
	let winner_css = 'winner-tied';

	let us_bg = `${sobj.us.bg} battleground`;
	let us_nbg = `${sobj.us.total - sobj.us.bg} non-battleground`;
	let ussr_bg = `${sobj.ussr.bg} battleground`;
	let ussr_nbg = `${sobj.ussr.total - sobj.ussr.bg} non-battleground`;
	if (sobj.us.bg != 1) {
		us_bg += 's';
	}
	if (sobj.ussr.bg != 1) {
		ussr_bg += 's';
	}
	if (sobj.us.total - sobj.us.bg != 1) {
		us_nbg += 's';
	}
	if (sobj.ussr.total - sobj.ussr.bg != 1) {
		ussr_nbg += 's';
	}

	if (sobj.us.vp > sobj.ussr.vp) {
		results_text = `US wins +${sobj.us.vp - sobj.ussr.vp} VP`;
		winner_css = 'winner-us';
	}
	if (sobj.us.vp < sobj.ussr.vp) {
		results_text = `USSR wins +${sobj.ussr.vp - sobj.us.vp} VP`;
		winner_css = 'winner-ussr';
	}
	if (sobj.bonus.length > 0) {
		bonus_events = `
      <div class="scoring-bonus-title"></div>  
      <div class="scoring-event-grid"></div>
    `;
	}

	let usc = `US controls ${us_bg} and ${us_nbg} for ${sobj.us.status}`;
	let ussrc = `USSR controls ${ussr_bg} and ${ussr_nbg} for ${sobj.ussr.status}`;

	usc = usc.replace('and 0 non-battlegrounds ', '');
	ussrc = ussrc.replace('and 0 non-battlegrounds ', '');
	usc = usc.replace('0 battlegrounds and ', '');
	ussrc = ussrc.replace('0 battlegrounds and ', '');
	usc = usc.replace('controls 0 battlegrounds for None', 'has No Presence');
	ussrc = ussrc.replace(
		'controls 0 battlegrounds for None',
		'has No Presence'
	);
	usc = usc.replace(' for Thailand', '');
	ussrc = ussrc.replace(' for Thailand', '');
	usc = usc.replace(' for undefined', '');
	ussrc = ussrc.replace(' for undefined', '');

	let html = `

    <div class="scoring-overlay ${region}-scoring ${winner_css}">

        <div class="card card-hud"><img class="cardimg" src="/twilight/img/en/TNRnTS-01.svg"><img class="cardimg" src="/twilight/img/EarlyWar.svg"><img class="cardimg" src="/twilight/img/BothPlayerCard.svg"><img class="cardimg" src="/twilight/img/MayNotBeHeld.svg"></div>
     
        <div class="scoring-box">
          <div class="scoring-result-title">${results_text}</div>   
	  <div class="scoring-text">${usc}</div>
	  <div class="scoring-text">${ussrc}</div>
          ${bonus_events}
	</div>

    </div>

  `;

	return html;
};
module.exports = ScoringTemplate;