module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
            <h1>Spider Saitolaire</h1>
            <ul>
            <li>You have ten slots in which to arrange two decks of playing cards. </li>
            <li>Only half the cards are dealt at the beginning, and additional draws place a new card on each stack</li>
            <li>Cards must be placed in numerical order, e.g. only a 3 can be placed on top of a 4.</li>
            <li>Sequences of arranged cards of a single suit may be moved as a unit to another pile.</li>
            <li>Any card may be placed on an open slot.</li>
            <li>When you complete a set from A to K, it is immediately removed from gameplay</li>
            </ul>
            </div>
            `;

	return html;
};
