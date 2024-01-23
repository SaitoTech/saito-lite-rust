module.exports = (app, mod) => {
	let html = `
      <h1 class="overlay-title">${mod.name} Options</h1>
        <div class="overlay-input">
          <label for="difficulty">Difficulty:</label>
          <select name="difficulty">
            <option value="4">easy</option>
            <option value="5" selected default>not so easy</option>
            <option value="6">damn hard</option>
          </select>
        </div>
      
    `;

	//With checkbox
	html += `<ul style="list-style: none;">
              <li><input type="checkbox" name="generalist" selected/>Generalist</li>
              <li><input type="checkbox" name="scientist" selected/>Scientist</li>
              <li><input type="checkbox" name="medic" selected/>Medic</li>
              <li><input type="checkbox" name="operationsexpert" selected/>Operations Expert</li>
              <li><input type="checkbox" name="quarantinespecialist" selected/>Quarantine Specialist</li>
              <li><input type="checkbox" name="researcher" selected/>Researcher</li>
            </ul><p>Player roles will be selected at random from the checked boxes. If there are more players than selected roles, player roles will be assigned at random from any available option</p>`;

	html += ` <div class="overlay-input">
          <label for="theme">Theme:</label>
          <select name="theme">
            <option value="retro" selected default>Retro</option>
            <option value="classic" >Classic</option>
    
          </select>
        </div>`;
	//<option value="modern">Modern</option>

	return html;
};
