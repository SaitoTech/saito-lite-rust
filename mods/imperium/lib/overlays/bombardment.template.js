module.exports = (
	imperium_self,
	attacker,
	defender,
	sector,
	overlay_html
) => {
	let sys = imperium_self.returnSectorAndPlanets(sector);
	let attacker_ships = sys.s.units[attacker - 1];
	let defender_ships = sys.s.units[defender - 1];
	let sector_name = sys.s.name;

	let html = `

    <div class="bombardment-overlay">
      <div class="bombardment-units">

	<div class="bombardment-attacker">
	  <div class="bombardment-attacker-name">${imperium_self.returnFactionName(
		imperium_self,
		attacker
	)}</div>
	  <div class="unit-table small">
  `;

	for (let i = 0; i < attacker_ships.length; i++) {
		let obj = attacker_ships[i];
		if (
			obj.bombardment_rolls > 0 &&
			obj.strength > 0 &&
			obj.destroyed != 1
		) {
			for (let z = 0; z < obj.bombardment_rolls; z++) {
				if (z == 0) {
					html += `
            <div class="unit-element player-bb-${attacker}-ship-${i} player-bb-${attacker}-ship-${i}-shot-${z}">
              <div class="unit-box-ship unit-box-ship-${obj.type}"></div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.bombardment_combat}</div>
	        <div class="unit-box-desc">hits on</div>
	      </div>
              <div class="unit-box dice-results">
  	        <div class="unit-box-num">?</div>
	        <div class="unit-box-desc">roll</div>
	      </div>
            </div>
        `;
				} else {
					html += `
            <div class="unit-element player-bb-${attacker}-ship-${i} player-bb-${attacker}-ship-${i}-shot-${z}">
              <div class="unit-box-ship"></div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.bombardment_combat}</div>
	        <div class="unit-box-desc">hits on</div>
	      </div>
              <div class="unit-box dice-results">
  	        <div class="unit-box-num">?</div>
	        <div class="unit-box-desc">roll</div>
	      </div>
            </div>
	`;
				}
			}
		} // skip destroyed or almost-destroyed
	}
	html += `
          </div>
	</div>

        <div class="bombardment-ui">
	  <div class="bombardment-menu">${overlay_html}</div>
	</div>

      </div>
    </div>
  `;

	return html;
};
