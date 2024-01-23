module.exports = (app, mod) => {
	let html = `<h1 class="overlay-title">Chess Options</h1>`;

	html += `<div class="overlay-input">   
                  <label for="player1">Pick Your Color:</label>
                  <select name="player1">
                    <option value="random" default>Random</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                  </select>
                </div>`;

	/*html   +=  `<div class="overlay-input">
                  <label for="observer_mode">Observer Mode:</label>
                  <select name="observer">
                    <option value="enable" >enable</option>
                    <option value="disable" selected>disable</option>
                  </select>
                </div>`;*/

	return html;
};
