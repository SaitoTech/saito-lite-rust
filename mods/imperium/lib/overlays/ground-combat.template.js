module.exports = (
	imperium_self,
	attacker,
	defender,
	sector,
	planet_idx,
	overlay_html
) => {
	let sys = imperium_self.returnSectorAndPlanets(sector);
	let planet = sys.p[planet_idx];
	let attacker_forces = planet.units[attacker - 1];
	let defender_forces = planet.units[defender - 1];

	let html = `

    <div class="ground-combat-overlay">
      <div class="ground-combat-units">

	<div class="ground-combat-attacker">
	  <div class="ground-combat-attacker-name">${imperium_self.returnFactionName(
		imperium_self,
		attacker
	)}</div>
	  <div class="unit-table small">
  `;

	for (let i = 0; i < attacker_forces.length; i++) {
		if (
			attacker_forces[i].strength > 0 &&
			attacker_forces[i].destroyed != 1
		) {
			let obj = attacker_forces[i];
			for (let z = 0; z < obj.shots; z++) {
				if (z == 0) {
					html += `
            <div class="unit-element player-${attacker}-ship-${i} player-${attacker}-ship-${i}-shot-${z}">
              <div class="unit-box-infantry unit-box-ship unit-box-ship-${obj.type}"></div>
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

        <div class="ground-combat-ui">
          <!--
	    <div class="ground-combat-title"></div>
            <div class="ground-combat-subtitle"></div> 
	  --->
	  <div class="ground-combat-menu">${overlay_html}</div>
	</div>

	<div class="ground-combat-defender">
	  <div class="ground-combat-defender-name">${imperium_self.returnFactionName(
		imperium_self,
		defender
	)}</div>
	  <div class="unit-table small">
  `;
	for (let i = 0; i < defender_forces.length; i++) {
		if (
			defender_forces[i].strength > 0 &&
			defender_forces[i].destroyed != 1
		) {
			let obj = defender_forces[i];
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
