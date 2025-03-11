module.exports = (app, mod, discard) => {
	let html = `
    <div class="saitoa discard-cards-overlay">
      <div class="settlers-items-container">
        <div class="settlers-item-info-text"> Select ${discard.targetCt} cards to discard: </div> `;

	for (let i in discard.my_resources) {
		if (discard.my_resources[i] > 0)
			html += `<div id="${i}" class="settlers-cards-container settlers-desired-resources hide-scrollbar">`;
		for (let j = 0; j < discard.my_resources[i]; j++) {
			html += `<img id="${i}" src="${mod.returnCardImage(i)}">`;
		}
		html += `</div>`;
	}

	html += `
      </div>
    </div>
  `;

	return html;
};
