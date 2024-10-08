module.exports  = (
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

    <div class="space-combat-overlay">
      <div class="space-combat-units">

	<div class="space-combat-attacker">
	  <div class="space-combat-attacker-name">${imperium_self.returnFactionName(
		imperium_self,
		attacker
	)}</div>
	  <div class="unit-table small">
  `;

	for (let i = 0; i < attacker_ships.length; i++) {
		if (
			attacker_ships[i].strength > 0 &&
			attacker_ships[i].destroyed != 1
		) {
			let obj = attacker_ships[i];
			for (let z = 0; z < obj.shots; z++) {
				if (z == 0) {
					html += `
            <div class="unit-element player-${attacker}-ship-${i} player-${attacker}-ship-${i}-shot-${z}">
              <div class="unit-box-ship unit-box-ship-${obj.type}"></div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.combat}</div>
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
            <div class="unit-element player-${attacker}-ship-${i} player-${attacker}-ship-${i}-shot-${z}">
              <div class="unit-box-ship"></div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.combat}</div>
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

        <div class="space-combat-ui">
          <!--
	    <div class="space-combat-title"></div>
            <div class="space-combat-subtitle">${sector_name}</div> 
	  --->
	  <div class="space-combat-menu">${overlay_html}</div>
	</div>

	<div class="space-combat-defender">
	  <div class="space-combat-defender-name">${imperium_self.returnFactionName(
		imperium_self,
		defender
	)}</div>
	  <div class="unit-table small">
  `;
	for (let i = 0; i < defender_ships.length; i++) {
		if (
			defender_ships[i].strength > 0 &&
			defender_ships[i].destroyed != 1
		) {
			let obj = defender_ships[i];
			for (let z = 0; z < obj.shots; z++) {
				if (z == 0) {
					html += `
            <div class="unit-element player-${defender}-ship-${i} player-${defender}-ship-${i}-shot-${z}">
              <div class="unit-box dice-results">
  	        <div class="unit-box-num">?</div>
	        <div class="unit-box-desc">roll</div>
	      </div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.combat}</div>
	        <div class="unit-box-desc">hits on</div>
	      </div>
              <div class="unit-box-ship unit-box-ship-${obj.type}"></div>
            </div>
        `;
				} else {
					html += `
            <div class="unit-element player-${defender}-ship-${i} player-${defender}-ship-${i}-shot-${z}">
              <div class="unit-box dice-results">
  	        <div class="unit-box-num">?</div>
	        <div class="unit-box-desc">roll</div>
	      </div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.combat}</div>
	        <div class="unit-box-desc">hits on</div>
	      </div>
              <div class="unit-box-ship"></div>
            </div>
	`;
				}
			}
		} // must exist
	}
	html += `
          </div>
	</div>
      </div>
    </div>
  `;

	return html;
};
