module.exports = ImperiumUnitsOverlayTemplate = (imperium_self) => {

  let available_units = [];
  for (let x in imperium_self.units) {
    available_units.push(x);
  }

  let html = "";
  html += `

<div class="units-overlay" style="">
  <div class="units-info">
    <div class="units-header">
      <div class="units-description">UNITS: all units in game</div>
    </div>
    <div class="units-table">
      <div class="unit-table small">
  `;


  for (let i = 0; i < available_units.length; i++) {

    let preobj = imperium_self.units[available_units[i]];
    let obj = JSON.parse(JSON.stringify(preobj));

    html += `
        <div class="unit-element">
          <div class="unit-description" data-type="${obj.type}" data-name="${obj.name}" data-amount="0">${obj.name}</div>
          <div class="unit-box-ship unit-box-ship-${obj.type}"></div>
          <div class="unit-box">
            <div class="unit-box-num">${obj.cost}</div>
            <div class="unit-box-desc">cost</div>
	  </div>
          <div class="unit-box">
  	    <div class="unit-box-num">${obj.move}</div>
	    <div class="unit-box-desc">move</div>
	  </div>
          <div class="unit-box">
  	    <div class="unit-box-num">${obj.combat}</div>
	    <div class="unit-box-desc">combat</div>
	  </div>
          <div class="unit-box">
	    <div class="unit-box-num">${obj.capacity}</div>
	    <div class="unit-box-desc">cargo</div>
 	  </div>
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

