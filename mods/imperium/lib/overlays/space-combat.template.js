module.exports = ImperiumSpaceCombatOverlayTemplate = (imperium_self, attacker, defender, sector, overlay_html) => {


  let sys            = imperium_self.returnSectorAndPlanets(sector);
  let attacker_ships = sys.s.units[attacker-1];
  let defender_ships = sys.s.units[defender-1];

  let html = `

    <div class="space-combat-overlay">
      <div class="space-combat-units">

	<div class="space-combat-attacker">
	  <div class="unit-table small">
  `;

  for (let i = 0; i < attacker_ships.length; i++) {
    let obj = attacker_ships[i];
    html += `
            <div class="unit-element player-${attacker}-ship-${i}">
              <div class="unit-box-ship unit-box-ship-${obj.type}"></div>
              <div class="unit-box">
  	        <div class="unit-box-num">${obj.combat}</div>
	        <div class="unit-box-desc">hits on</div>
	      </div>
              <div class="unit-box">
  	        <div class="unit-box-num">?</div>
	        <div class="unit-box-desc">roll</div>
	      </div>
            </div>
    `;
  }
  html += `
          </div>
	</div>

        <div class="space-combat-ui">
          <div class="space-combat-title">invasion</div>
          <div class="space-combat-subtitle">Sector 41</div>
	  <div class="space-combat-menu">${overlay_html}</div>
	</div>

	<div class="space-combat-defender">
	  <div class="unit-table small">
  `;
   for (let i = 0; i < defender_ships.length; i++) {
     let obj = defender_ships[i];
     html += `
            <div class="unit-element player-${defender}-ship-${i}">
              <div class="unit-box">
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
   }

   html += `
          </div>
	</div>
      </div>
    </div>
  `;

  return html;

}

