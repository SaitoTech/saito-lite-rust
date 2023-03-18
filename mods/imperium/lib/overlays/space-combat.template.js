module.exports = ImperiumSpaceCombatOverlayTemplate = (imperium_self, attacker, defender, sector, overlay_html) => {

  let obj = {};
  obj.type = "carrier";
  obj.name = "Carrier";
  obj.cost = 3;
  obj.move = 1;
  obj.combat = 9;
  obj.capacity = 10;

  let html = `

    <div class="space-combat-overlay">
      <div class="space-combat-description">SPACE COMBAT: Sector 41</div>
      <div class="space-combat-units">

	<div class="space-combat-attacker">
	  <div class="unit-table small">

            <div class="unit-element">
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

          </div>
	</div>

        <div class="space-combat-ui">${overlay_html}</div>

	<div class="space-combat-defender">
	  <div class="unit-table small">

            <div class="unit-element">
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

          </div>
	</div>

      </div>
    </div>

  `;

  return html;

}

