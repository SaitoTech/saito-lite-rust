module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
          <h2>Wuziqi （五子棋）</h2>
           <p> Wuziqi, also known as Gokomu and Gobang, is a simple two player game played on a Go board. It is similar to <abbr title="also known as Naughts and Crosses">Tic-Tac-Toe</abbr> or Connect Four in that players alternately place tokens in an attempt to create a line of five consecutive tokens of their color. Tokens may be placed anywhere on the board not already occupied.</p>
           <p> The first player to place five of their own tokens in a continuous line--vertical, horizontal or diagonally--wins the round. The player who wins the most rounds, wins the match.</p><p> Matches are best out of three by default, but you can change this in the advanced options in the arcade. You may also specify the size of the board for added challenge.</p>
          </div>`;
	return html;
};
