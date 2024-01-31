module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
    <h1>Thirteen Days</h1>
    <p>Thirteen Days is a fast paced two player simulation of the Cuban Missile Crisis. (No historical knowledge needed to play)</p>
    <p>The game is played over three rounds, where each player has a secret AGENDA that awards them additional PRESTIGE at the end of the round for completing. Each player starts the round with 5 STRATEGY cards that may either be played for EVENTS or for COMMAND.</p>
    <p>EVENTS are associated with the US, the USSR, or the UN (neutral). Playing a STRATEGY card associated with your opponent allows them to trigger the event, while you can only play it for COMMAND, when you may add/remove INFLUENCE cubes (up to the amount specified on the card) from a single battleground. You may only have up to 17 INFLUENCE on the board and cannot directly move it (i.e. you have to remove influence and add influence in two separate moves). Adding or removing more than one influence affects the DEFCON level, and battlegrounds may contain at most 5 INFLUENCE cubes.</p>
    <p>If you hold the PERSONAL LETTER, you may play it along with another card for +1 INFLUENCE on the COMMAND.</p>
    <p>The round ends after each player has played 4 STRATEGY cards. The remaining STRATEGY card is saved for the AFTERMATH. Players with the most influence in any world opinion battleground may utilize the special abilities (e.g. being able to escalate/de-escalate on DEFCON track, receiving the PERSONAL LETTER, or peeking at the top STRATEGY card and either discarding it or adding it to the AFTERMATH). The secret AGENDAs are then revealed to see how players change their PRESTIGE. A player may only lead by 5 PRESTIGE, but this does not trigger an automatic win.</p>
    <p>At the end of the round, if you have any markers in the DEFCON 1 zone or more than one in the DEFCON 2 zone, you trigger a thermonuclear war and lose the game. DEFCON is advanced by one for all markers at the beginning of every round.</p>
    <p>After three rounds, the AFTERMATH cards are revealed and the player with the most INFLUENCE cubes associated with the cards receives an additional +2 PRESTIGE. The player with the most PRESTIGE wins the game.</p>
    <h2>TL;DR</h2>
    <p>The game is about bluffing and brinksmanship. You know which AGENDA card you selected and your opponent knows the three from which you chose. So, you don't want to give away exactly which AGENDA you are aiming for. Meanwhile, you have a 1 in 3 chance of guessing what your opponent's AGENDA selection is. You can win points from either AGENDA. Most of the AGENDAs award points based on the difference in INFLUENCE in a battleground or difference on the DEFCON track. So, you want to maximize those without tipping over into thermonuclear war. However, you only have four moves in which to accomplish all this before the round ends.</p>
    </div>`;

	return html;
};
