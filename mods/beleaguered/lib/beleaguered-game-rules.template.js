module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
              <h1>Beleaguered</h1>
                <ul>
                  <li>Cards (2-King in each suit) are randomly arranged in four rows on each side of the middle stack</li>
                  <li>The goal is to arrange the cards in sequential order and matching suit in the middle stack</li>
                  <li>Cards can be moved around on higher cards on the side stacks regardless of their suit</li>
                  <li>Any card can be placed on the empty side stack.</li>
                </ul>
            </div>
            `;

	return html;
};
