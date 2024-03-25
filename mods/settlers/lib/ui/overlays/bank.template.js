module.exports = BankOverlayTemplate = (app, mod, bank) => {
	console.log(bank?.selected_resource);
	let prompt = (bank?.selected_resource) ? "R" : "Select r";
	let html = `
        <div class="saitoa bank-overlay">
          <div class="settlers-items-container">
            <div class="settlers-item-info-text">${prompt}esource to give bank:</div>
  `;

	if (Object.keys(bank.my_resources).length > 0) {
		for (let i in bank.my_resources) {
			let row = `<div class="settlers-cards-container settlers-trade-resources ${
				bank?.selected_resource == i ? 'selected' : ''
			}" id="${i}" data-selected="0" >`;
			for (let j = 0; j < bank.minForTrade[i]; j++) {
				row += `<img src="${mod.returnCardImage(i)}">`;
			}
			row += `</div>`;

			if (!bank?.selected_resource || bank.selected_resource == i) {
				html += row;
			}
		}
	}

	html += `</div>`;

	if (!bank?.selected_resource) {
		return html + `</div>`;
	}

	html += `<div class="settlers-items-container settlers-items-container-desired-resources">
            <div class="settlers-item-info-text">Select resource to buy:</div>
            <div class="settlers-cards-container settlers-desired-resources">`;

	for (let i of mod.returnResources()) {
		if (i !== bank.selected_resource) {
			html += `<img id="${i}" src="${mod.returnCardImage(i)}">`;
		}
	}

	html += `</div>
          </div>
        </div>`;

	return html;
};
