module.exports = () => {
	let html = `<div class="rules-overlay">
    <h1>Twilight Struggle</h1>
    <p>Players take the roles of the US and the USSR and vie for global dominance over ten turns that cover the cold war. Twilight Struggle is a card-based board game. Most cards describes an EVENT, which may be associated with the US, the USSR, or neutral. Every card has an OPERATIONS value. Some SCORING cards trigger a pause to score the current board state. The board show the amount of influence each player has in various countries across the globe. Every country has a STABILITY number and lines on the board show adjacency between countries.</p>
    <p>Each turn begins with the selection of a HEADLINE, wherein both players select one card from their hand to play first. The card with the higher OPERATIONS value takes effect first, or in the event of a tie the US player's card goes into effect first. A HEADLINE card must be chosen and played, regardless of whether the event helps the player or their opponent.</p>
    <p>After the HEADLINE, the players alternate playing cards for 6-7 ACTION ROUNDS. The USSR always starts. Cards may be played for EVENTS or OPERATIONS. Playing a card associated with one's opponent (for OPERATION points) still triggers the EVENT as if the opponent had played it themselves. OPERATIONS may be used to place INFLUENCE markers, make REALIGNMENT rolls, attempt COUPS, or advance in the SPACE RACE. </p>
    <dl>
    <dt>INFLUENCE</dt><dd>Influence markers are placed on countries with friendly influence or their immediate neighbors. It costs 1 OP to place influence in a friendly or uncontrolled country, and 2 OP to place influence in an enemy controlled country. To control a country, your influence must exceed your opponent's by at least the STABILITY number of the country.</dd>
    <dt>REALIGNMENT</dt><dd>Realignment rolls reduce enemy influence in a country regardless of whether the player has any influence in the country or its neighbors. It costs 1 OP per roll. Both players roll and the high roller can remove the difference in die values of influence in the target country. Players get +1 if the target country borders their SUPERPOWER, +1 if they have more influence in the target country, and +1 for each adjacent controlled country.</dd>
    <dt>COUP</dt><dd>A Coup is an attempt to replace the enemy's influence in a target country with that of your own. Roll the dice and add the OP of the card and subtract double the STABILITY number of the country. The result, if positive, is a successful coup and the player may first remove that many enemy influence then add any remaining amount of friendly influence.</dd>
    <dt>SPACE RACE</dt><dd>Players gain victory points and special abilities for advancing in the SPACE RACE. A player may only attempt to advance in the SPACE RACE once per turn and success depends upon a dice roll. The player must DISCARD a card with a minimum OPERATIONS values. Unlike other actions, the EVENT of the discarded card does not get triggered.</dd>
    </dl>
    <h3>DEFCON STATUS</h3>
    <p>If the DEFCON level (a measure of threat of nuclear war) ever reaches 1, the game immediately ends and the PHASING player (who plays the card) loses. DEFCON level degrades for any COUP in a BATTLEGROUND country. Any DEFCON level below 5 will place geographic restrictions on where COUPS or REALIGNMENT rolls may be attempted. DEFCON is improved at the beginning of each turn. Many Events will improve or degrade the DEFCON level.</p>
    <h3>MILITARY OPERATIONS</h3>
    <p>Each player must conduct a minimum amount of military operations per turn (determined by DEFCON), or risk losing VP. Wars and COUPS are military operations. The OP spent on the COUP or the amount specified in the text of the war EVENT card. </p>
    <h3>CHINA CARD</h3>
    <p>The USSR starts with the China card, which may be played like any regular card. When played, the China card is passed to the opponent who may use it in the next turn. </p>
    <h3>SCORING</h3>
    <p>Scoring is conducted regionally when a SCORING card is played. SCORING cards must be played at some point during the turn if in your hand. The card specifies the number of VP for each of the possible conditions:</p>
    <ul>
    <li>PRESENCE: You control at least one country in the region.</li>
    <li>DOMINATION: You control more countries and more Battleground countries than your opponent in the region</li>
    <li>CONTROL: You control more countries than your opponent and all of the Battleground countries.</li>
    </ul>
    <p>Players are also awarded +1 VP for each Battleground country they control in the region and +1 VP for each controlled country adjacent to the enemy superpower.</p>
    <p>If a player ever reaches a 20 VP lead over the opponent, then they win the game. </p>
    </div>`;

	return html;
};
