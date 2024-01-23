module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
    <h1>${mod.name}</h1>
    <p>You are the ruler of a small kingdom with grand hopes and dreams. In all directions lie small tracts of land on the verge of a nervous breakdown. Pacify these lands under your banner and expand your kingdom, and do it quickly as other principalities are looking to expand. Hire minions, construct buildings, and fill the coffers of your treasury.</p>
    <h2>How to Play</h2>
    <p>Players take turns, playing an <em>action</em> card from their hand, then buying a card from the supply pile with their <em>treasure</em>. Each player begins with seven COPPER and 3 ESTATES, so in the first two turns the player will not have any ACTION cards to play. Playing an action card or buying a card is optional, but each player is guaranteed one play or purchase per turn. Some action cards give players additional actions, purchases, or temporary treasure to spend that turn. All cards in the players hand are discarded at the end of the turn. </p>
    <h2>How to Win</h2>
    <p>The game ends when all the PROVINCE cards are purchased or any three supply stacks are emptied. (The game begins with 10 copies of each playing card). Players go through their deck summing up their total number of VICTORY POINTS to determine the winner. There are 3 TREASURE cards and 3 VICTORY cards also in the supply. All cards are put on top of your discards and shuffled back into your deck, even VICTORY cards which have no associated value for playing or purchasing.</p>
    `;

	return html;
};
