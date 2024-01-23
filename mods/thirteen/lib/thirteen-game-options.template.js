module.exports = (app, mod) => {
	let html = `
            <h1 class="overlay-title">Thirteen Days</h1>
            <div class="overlay-input">
            <label for="player1">Play as:</label>
            <select name="player1">
              <option value="random">random</option>
              <option value="ussr" default>USSR</option>
              <option value="us">US</option>
            </select>
            </div>
          `;

	return html;
};
