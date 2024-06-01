module.exports = (app, mod) => {

    let play_mode = mod.loadGamePreference('solitrio-play-mode') || 'auto';

    let html = `
            <div class="saito-module-settings">
            <fieldset class="saito-grid">
            <legend class="settings-label">Play Mode</legend>
            <input type="radio" id="auto" name="play_mode" value="auto" ${play_mode == "auto" ? "checked" : ""}/>
            <label for="auto">Automatic <span class="note">Click a card to automatically move it to a legal slot</span></label>
            <input type="radio" id="manual" name="play_mode" value="manual" ${play_mode == "manual" ? "checked" :""}/>
            <label for="manual">Manual <span class="note">Click a card to select it, then click an empty space to move it</span></label>
            </fieldset>
            </div>
            `;

	return html;
};
