module.exports = (app, mod) => {
	let html = `<h1 class="overlay-title">Wordblocks Options</h1>`;

	html += `<div class="overlay-input">
                <label for="dictionary">Dictionary:</label>
                <select name="dictionary">
                  <option value="sowpods" title="A combination of the Official Scrabble Player Dictionary and Official Scrabble Words" selected>English: SOWPODS</option>
                  <option value="twl" title="Scrabble Tournament Word List">English: TWL06</option>
                  <option value="fise">Spanish: FISE</option>
                  <option value="tagalog">Tagalog</option>
                  <option value="test">Test</option>
                </select>
              </div>
          <div class="overlay-input">
          
          <label for="clock">Turn time limit:</label>
          <select name="clock">
            <option value="0" default>no clock</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
          </select>
      
          </div>`;

	return html;
};

/*
          <option value="0.5">30 seconds</option>
            <option value="1">1 minute</option>
            <option value="1.5">90 seconds</option>
            <option value="3">3 minutes</option>
            <option value="5">5 minutes</option>
  
*/