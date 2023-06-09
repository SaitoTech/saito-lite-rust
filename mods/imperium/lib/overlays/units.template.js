module.exports = ImperiumUnitsOverlayTemplate = (imperium_self) => {

  let available_units = [];
  for (let x in imperium_self.units) {
    available_units.push(x);
  }

  let html = `
    <div class="units-overlay hide-scrollbar">
  `;


  for (let i = 0; i < available_units.length; i++) {

    let obj = imperium_self.units[available_units[i]];

console.log(JSON.stringify(obj));

    html += `
        <div class="unit">
          <div class="unit-description" data-type="${obj.type}" data-name="${obj.name}" data-amount="0">${obj.name}</div>
          <div class="unit-ship unit-ship-${obj.type}"></div>
          <div class="unit-details">
            <div class="unit-num">${obj.cost}</div>
            <div class="unit-desc">cost</div>
	  </div>
          <div class="unit-details">
  	    <div class="unit-num">${obj.move}</div>
	    <div class="unit-desc">move</div>
	  </div>
          <div class="unit-details">
  	    <div class="unit-num">${obj.combat}</div>
	    <div class="unit-desc">combat</div>
	  </div>
          <div class="unit-details">
	    <div class="unit-num">${obj.capacity}</div>
	    <div class="unit-desc">cargo</div>
 	  </div>
        </div>
      `;
  }

  html += `
    </div>
  `;

  return html;
}

