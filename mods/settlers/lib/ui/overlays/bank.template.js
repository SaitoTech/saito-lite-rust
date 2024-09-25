module.exports = (app, mod, bank) => {
	console.log(bank?.selected_resource);
	let prompt = (bank?.selected_resource) ? "R" : "Select r";
	let html = '';

	if (Object.keys(bank.my_resources).length > 0) {
		html += `<div class="saitoa bank-overlay">
			          <div class="settlers-items-container">
			            <div class="settlers-item-info-text">${prompt}esource to give bank:</div>`;

		for (let i in bank.my_resources) {
			let row = `<div class="settlers-cards-container settlers-trade-resources 
			${ bank?.selected_resource == i ? 'selected' : '' } 
			${ mod.canPlayerTradeWithBank()	? `` : `settlers-row-disabled`}" id="${i}" data-selected="0" >`;
			for (let j = 0; j < bank.minForTrade[i]; j++) {
				row += `<img src="${mod.returnCardImage(i)}">`;
			}
			row += `</div>`;

			if (!bank?.selected_resource || bank.selected_resource == i) {
				html += row;
			}
		}
	}else{
		html += `<div class="saitoa bank-overlay">
			          <div class="settlers-items-container">
			            <div class="settlers-item-info-text">Bank/Port Trading</div>`;

		let three4one = false;
		for (let i in bank.minForTrade){
			if (bank.minForTrade[i] == 3){
				three4one = true;
			} else if (bank.minForTrade[i] == 2){
				let row = `<div class="settlers-cards-container settlers-row-disabled">`;
				for (let j = 0; j < bank.minForTrade[i]; j++) {
					row += `<img src="${mod.returnCardImage(i)}">`;
				}
				row += `</div>`;
				html += row;				
			}
		}

		html += `<div class="settlers-cards-container settlers-item-info-text">${three4one ? 3 : 4} of the same resource</div>`;
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
