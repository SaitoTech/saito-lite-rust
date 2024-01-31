module.exports = (app, mod) => {
	let options_html = `
      <h1 class="overlay-title">Advanced Options</h1>
        <div class="overlay-input">
          <label for="crypto">Crypto:</label>
          <select id="crypto" name="crypto">
            <option value="" selected>None</option>
      `;

	let listed = [];
	for (let i = 0; i < app.modules.mods.length; i++) {
		if (
			app.modules.mods[i].ticker != '' &&
			app.modules.mods[i].ticker != undefined &&
			!listed.includes(app.modules.mods[i].ticker)
		) {
			options_html += `<option value="${app.modules.mods[i].ticker}">${app.modules.mods[i].ticker}</option>`;
			listed.push(app.modules.mods[i].ticker);
		}
	}

	options_html += `
        </select>
          <label for="server">Game Server:</label>
          <select id="server" name="server">
            <option value="na" selected>North America</option>
            <option value="as">Asia</option>
          </select>
          <div id="stake_wrapper" class="overlay-input" style="display:none;">
            <label for="stake">Cost Per Kill:</label>
            <input type="number" id="stake" list="suggestedChipValues" name="stake" min="0" value="0" step="1">
          </div>
          <datalist id="suggestedChipValues">
            <option value="0.01">
            <option value="0.1">
            <option value="1">
            <option value="5">
            <option value="10">
            <option value="15">
            <option value="20">
          </datalist>
          </div>

  `;

	return options_html;
};
