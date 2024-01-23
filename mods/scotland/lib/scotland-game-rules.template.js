module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
              <h1>Scotland Yard</h1>
              <p>A team of detectives is on the hunt for international terrorist Mr. X. Can London's finest trap him before their Oyster cards run out of credit?</p>     
             <h2>Players</h2>
             <p>One player controls Mr. X and competes against the rest of the players, who must work together as a team. Depending on the number of players, each player on the detective team may be responsible for moving one or more pawns on the board.</p>
             <h2>How to Win</h2>
             <p>Mr X wins if he can elude capture for 24 moves. The detectives win if they either land on a space occupied by Mr. X, or block him from being able to move to another space.</p>
             <h2>How to Move</h2>
             <p>Players trade tickets to move by taxi, bus, or underground. Detectives begin the game with a limited number of tickets and if they run out of tickets, they are no longer able to use that method of transportation.</p>
             <p>Mr. X also begins with a limited number of tickets, but he gains the tickets discarded by the Detectives throughout the game. Mr. X also has two kinds of special tickets:</p>
             <ul>
              <li><em>Mystery Ticket:</em> Allows Mr. X to move by any means of transportation (including the ferry) without notifying the Detectives of how he moved.</li>
              <li><em>Double Ticket:</em> Played in conjunction with regular tickets, Mr. X can move twice in a single turn.</li>
             </ul>
             <h2>Game Play</h2>
             <p>Mr. X's pawn is invisible to the detectives, but Mr. X can see where the detectives are. However, with each move (excepting the Mystery ticket), the detectives know what means of transportation Mr. X uses on his turn. Furthermore, there are a limited number of starting positions in which the pawns can be placed. Those starting positions are highlighted in the early turns of the game.</p>
             <p>After Mr X's third move, his position will be revealed to all the players and the race begins! Similarly, after moves 8, 13, 18, and 24, Mr. X will briefly surface to let the detectives know where he is.</p>
             <p>Mr X should have an escape route planned after each of those special turns, while the detectives should coordinate to be near bus routes or underground stations in case the need to cover a lot of distance.</p>
             <p>The detectives need to rely on logic and teamwork in order to track and capture Mr. X.</p>
             `;
	return html;
};
