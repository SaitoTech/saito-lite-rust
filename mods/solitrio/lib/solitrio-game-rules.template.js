module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
              <h1>Solitrio</h1>
                <ul>
                  <li>Cards (2-10 in each suit) are randomly arranged in four rows of ten with four blank spaces.</li>
                  <li>The goal is to arrange the cards in sequential order with one suit per row.</li>
                  <li>The 2 of any suit may be placed in the leftmost space of any row (if empty).</li>
                  <li>All other cards must match the suit of its left neighbor and be the next in sequence, e.g. the 8&spades; may be placed after (to the right of) the 7&spades;.</li>
                  <li>If you get stuck, you may reshuffle the board. Reshuffling will not move a 2 (or any connected sequence of cards) from its target position.</li>
                  <li>You only have two chances to reshuffle the board and you lose if you cannot order the cards.</li>
                </ul>
            </div>
            `;

	return html;
};
