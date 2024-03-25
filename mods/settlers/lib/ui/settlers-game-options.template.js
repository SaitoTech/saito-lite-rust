module.exports = (app, mod) => {
	let html = `
        <div class="overlay-input">
            <label for="game_length ">Game Length:</label>
            <select name="game_length">
              <option value="8" >8 VP - for a quick sprint</option>
              <option value="10" selected>10 VP - standard game</option>
              <option value="12">12 VP - marathon</option>
            </select>
            <label for="turn_limit">Turn Time Limit / Pass After:</label>
            <select name="turn_limit">
              <option value="0" default>no limit</option>
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
            </select>

        </div>
    `;

	return html;
};
