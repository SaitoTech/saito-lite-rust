const ShowCardTemplate = (app, mod, this_obj) => {
	let html = `
  <div class="ts-overlay">
  <h1>${this_obj.title}</h1>
  <div class="ts-body">
  <div class="cardlist-container">${mod.returnCardList(cards)}</div>`;
	if (this_obj.cards.length == 0) {
		html = `<div style="text-align:center; margin: auto;">
            There are no cards to display
            </div>`;
	}

	html += '</div></div>';

	return html;
};
module.exports = ShowCardTemplate;