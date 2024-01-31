module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
    <div class="h1">${mod.name}</div>
    <p>Welcome to the city-state of Jaipur, where with a little luck and quick wits you can become fabulously wealthy at the world famous bazaar.</p>
    <div class="h2">How to Play</div>
    <p>Players take turns performing one of the following four actions:</p>
    <ol>
    <li>Take one commodity card from the market</li>
    <li>Take all the camel cards from the market</li>
    <li>Sell one type of commodity</li>
    <li>Trade two or more cards with the market</li>
    </ol>
    <p>You may hold up to seven commodity cards in your hand. When you sell cards, you get one good token (worth varying amounts of value) per card you sell, and if you sell at least 3 cards, you gain a bonus token (whose value will only be known to you until the end of the round). You may sell individual cloth, leather, or spice cards, but valuable commodities, such as silver, gold, and diamonds have a minimum sell of two.</p>
    <p>You cannot sell camels, but they don't count against your hand limit and you can trade them back to the market for commodities. The player with the largest herd of camels is awarded a camel token worth 5 points.</p>
    <div class="h2">How to Win</div>
    <p>The round ends when there are no cards left to replenish the market, or three token piles are emptied out.</p>
    <p>The player with the highest total wins the round, and the first player to win two rounds is the winner of the game.</p>
    `;

	return html;
};
