module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
    <div class="h1">${mod.name}</div>
    <p>Welcome to the Industrial Revolution, a veritable bonanza of steam, where players compete to make sets of factories in order to profit!</p>
    <div class="h2">How to Play</div>
    <p>Players take turns performing one of the following four phases (in order):</p>
    <ol>
    <li>Play the first card from your hand. Afterwards, if you have an available space, you may play the second card from your hand.</li>
    <li>Reveal and Trade. Reveal the top two cards from the deck, then use those and the remaining cards in your hand to trade with other players. </li>
    <li>All revealed or traded cards must now be played</li>
    <li>Draw three new cards</li>
    </ol>
    <p>If you ever need to play a card and do not have a space to play it, you must sell your factories. You earn gold coins according to the number of factories you sell at once.</p>
    
    <div class="h2">How to Win</div>
    <p>The game ends the third time the draw pile is emptied. Players liquidate their remaining factories and the player with the most gold coins wins.</p>
    `;

	return html;
};
