module.exports = (app, mod, year_of_plenty) => {
	let resourceList = mod.returnResources();

	let html = `
      <div class="saitoa settlers-selection-overlay">
        <div class="settlers-items-container">
          <div class="settlers-item-row">
            <div class="settlers-item-info-text"> Select any 2 resources from bank (can be same or different): </div>
          </div>
          <div class="settlers-item-row settlers-cards-container settlers-desired-resources settlers-select-options">
  `;

	for (let i of resourceList) {
		html += `<img id="${i}" src="${mod.returnCardImage(i)}" >`;
	}

	html += `
          </div>


          <div class="settlers-item-row">
            <div class="settlers-item-info-text"> Selected resources: </div>
          </div>
          <div class="settlers-item-row settlers-cards-container settlers-desired-resources settlers-selected-resources">
        
          </div>
        </div>
      </div>
  `;

	return html;
};
