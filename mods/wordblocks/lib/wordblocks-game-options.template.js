module.exports = (app, mod) => {

  let html = `<h1 class="overlay-title">Wordblocks Options</h1>`;

    html += `<div class="overlay-input">
                <label for="dictionary">Dictionary:</label>
                <select name="dictionary">
                  <option value="sowpods" title="A combination of the Official Scrabble Player Dictionary and Official Scrabble Words" selected>English: SOWPODS</option>
                  <option value="twl" title="Scrabble Tournament Word List">English: TWL06</option>
                  <option value="fise">Spanish: FISE</option>
                  <option value="tagalog">Tagalog</option>
                </select>
              </div>
          <div class="overlay-input">
          <label for="observer_mode">Observer Mode:</label>
          <select name="observer">
            <option value="enable">enable</option>
            <option value="disable" selected>disable</option>
          </select>
          </div>`;

    html += mod.returnCryptoOptionsHTML();
    return html;
}