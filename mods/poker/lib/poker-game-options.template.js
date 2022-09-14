module.exports = (app, mod) => {

  let options_html = `
      <h1 class="overlay-title">Poker Options</h1>
          <div class="overlay-input">
            <label for="blind_mode">Mode:</label>
            <select id="blind_mode" name="blind_mode">
              <option value="static">static blinds</option>
              <option value="increase">increasing blinds</option>
            </select>
          </div>
          <div class="options_notice" id="blind_explainer">Small blind is one chip, big blind is two chips throughout the game</div>
          <div class="overlay-input">
            <label for="num_chips">Num chips:</label>
            <select id="num_chips" name="num_chips">
              <option value="40">40</option>
              <option value="100" selected>100</option>
              <option value="250">250</option>
            </select>
          </div>
          <div class="overlay-input">
            <input type="checkbox" name="chip_graphics" />
            <label for="chip_graphics">Use visual chips</label>
          </div>
          <div class="overlay-input">
            <label for="crypto">Crypto:</label>
            <select id="crypto" name="crypto">
              <option value="" selected>None</option>
    `;

    let listed = [];
    for (let i = 0; i < tapp.modules.mods.length; i++) {
      if (
        tapp.modules.mods[i].ticker != "" &&
        tapp.modules.mods[i].ticker != undefined &&
  !listed.includes(tapp.modules.mods[i].ticker)
      ) {
        options_html += `<option value="${tapp.modules.mods[i].ticker}">${tapp.modules.mods[i].ticker}</option>`;
  listed.push(tapp.modules.mods[i].ticker);
      }
    }

    options_html += `
            </select>
          </div>
          <div id="chip_wrapper" class="overlay-input" style="display:none;">
            <label for="stake">Game stake:</label>
            
            <input type="number" id="stake" list="suggestedChipValues" name="stake" min="0" value="0" step="1">
          </div>
          <datalist id="suggestedChipValues">
            <option value="0.01">
            <option value="0.1">
            <option value="1">
            <option value="5">
            <option value="20">
            <option value="50">
            <option value="100">
          </datalist>
   
          <!--input type="hidden" id="stake" name="stake" value="0"-->`;

    return options_html;

}

