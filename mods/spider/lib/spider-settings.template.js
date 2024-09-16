module.exports = (app, mod) => {
	let difficulty = mod.loadGamePreference('spider-difficulty') || 'medium';
    let play_mode = mod.loadGamePreference('spider-play-mode') || 'manual';

	return `
			<fieldset class="saito-grid">
			<legend class="settings-label">Difficulty</legend>
			<input type="radio" id="easy" name="spider-difficulty" value="easy" ${ difficulty == 'easy' ? 'checked' : ''}/>
			<label for="easy">Easy <span class="note">1 suit</span></label>
			<input type="radio" id="medium" name="spider-difficulty" value="medium" ${	difficulty == 'medium' ? 'checked' : ''}/>
			<label for="medium">Medium <span class="note">2 suits</span></label>
			<input type="radio" id="hard" name="spider-difficulty" value="hard" ${	difficulty == 'hard' ? 'checked' : '' }/>
			<label for="hard">Hard <span class="note">4 suits</span></label>
			</fieldset>

			<fieldset class="saito-grid">
			<legend class="settings-label">Play Mode</legend>
            <input type="radio" id="auto" name="play_mode" value="auto" ${play_mode == "auto" ? "checked" : ""}/>
            <label for="auto">Automatic <span class="note">Click a stack to automatically move it to a legal space</span></label>
            <input type="radio" id="manual" name="play_mode" value="manual" ${play_mode == "manual" ? "checked" :""}/>
            <label for="manual">Manual <span class="note">Click a stack to pick it up, then click where to move it</span></label>

			</fieldset>
			`;
};
