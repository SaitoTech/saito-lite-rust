const WarTemplate = (card, sobj) => {
	let winner = sobj.winner;
	let roll = sobj.die;
	let modifications = sobj.modifications;
	let modroll = roll - modifications;
	let success = sobj.success;
	let player = sobj.player;

	let winner_css = 'winner-us';
	if (player == 'ussr' && success == 1) {
		winner_css = 'winner-ussr';
	}

	let html = `

    <div class="war-overlay ${card}-war ${winner_css}">
        <div class="card card-hud"><img class="cardimg" src="/twilight/img/en/TNRnTS-01.svg"><img class="cardimg" src="/twilight/img/EarlyWar.svg"><img class="cardimg" src="/twilight/img/BothPlayerCard.svg"><img class="cardimg" src="/twilight/img/MayNotBeHeld.svg"></div>
        <div class="scoring-box">
          <div class="scoring-result-title">${winner}</div>   
	  <div class="scoring-text">
	    Roll: ${roll}
	    <p></p>
	    Mods: -${modifications}
	    <p></p>
	    Modified Roll: ${modroll}
	  </div>
	</div>
    </div>

  `;

	return html;
};
module.exports = WarTemplate;