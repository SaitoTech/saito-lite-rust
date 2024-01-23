module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
            <h1>${mod.gamename}</h1>
            <p>Four novel viruses are quickly spreading throughout the world and it is up to you and your teammates to find the cure in this fast paced cooperative board game.</p>
            <h2>Roles</h2>
            <p>Each player has a role, which gives them a special ability: </p>
            <table>
            <tbody>
            <tr><th>Medic</th><td>The medic removes <em>all</em> cubes of one color. When a cure has been found, the Medic removes cubes simply by being in the city, without using an action.</td></tr>
            <tr><th>Operations Expert</th><td>The operations expert may build a research station in the current city without discarding a card -or- discard any card when in a city with a research station to move anywhere in the world.</td></tr>
            <tr><th>Scientist</th><td>The scientist only needs four cards of the same color to discover the cure for a disease.</td></tr>
            </tbody></table>
            <h2>Game Play</h2>
            <p>Each player has four actions per turn, which may be used to MOVE to a new city, CURE diseases in the current city, RESEARCH a cure for a disease, BUILD a research station, or SHARE knowledge</p>
            <table>
            <tr><th>Move</th><td><ul>
                  <li><strong>Drive/Ferry</strong> -- Players can move from city to city by ground transportation by following the connecting lines on the board map. Each segment requires one action.</li>
                  <li><strong>Shuttle Flight</strong> -- Players may move from one city with a research station to another city with a research station as an action</li>
                  <li><strong>Direct Flight</strong> -- Players may discard a card from their hand to move to the city listed on the card</li>
                  <li><strong>Charter Flight</strong> -- A player may discard the card with the city matching their current location to move to any city on the board</li>
                  </ul></td></tr>
            <tr><th>Cure disease</th><td>A player may remove one cube of any color in their current city as an action. Once a cure for the disease has been discovered, they may remove all cubes of that color with one action.</td></tr>
            <tr><th>Reseach a cure</th><td>At a city with a research station, players may discard five cards of the same color to discover the cure for that disease.</td></tr>
            <tr><th>Build a research station</th><td>Players may discard the card matching the city of their current location in order to build a new research station in that city. Only six research stations may exist in the globe, so if the limit is reached, the player may chose an old station to remove.</td></tr>
            <tr><th>Share knowldge</th><td>If two players are in the same city and one of them holds the card matching that city, they may share knowledge. In which case, the player may give or receive the card (as appropriate) as an action.</td></tr>
            </table>
            <p>After the player finishes their four actions, they draw two additional player cards. Players may not have more than 7 cards in their hand at any time and must immediately discard any extra cards. Most cards are city cards, though some are EVENT cards which may be played at any time and do not count as an action. There are also EPIDEMIC cards shuffled into the deck. EPIDEMICS increase the virulence of the diseases</p>
            <h2>Infection and Outbreaks</h2>
            <p>Before then next player goes, 2-4 additional cities are infected with new disease cubes. Cites can hold up to 3 disease cubes (of a given color), afterwhich an OUTBREAK occurs. During an outbreak, all neigboring cities get one cube of that disease's color. This can lead to chain reactions of outbreaks.</p>
            <h2>Victory and Defeat</h2>
            <p>If the players discover the cures to all four diseases, then they are victorious. However, they are in a race against time. The players lose upon the 8th OUTBREAK, if the deck of player cards runs out, or if any disease exceeds more than 24 cubes on the board.</p>
            </div>`;

	return html;
};
