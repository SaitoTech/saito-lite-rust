module.exports = (app, mod) => {

    let cm = mod.loadGamePreference('settlers_confirm_moves');
    if (cm == null){
    	cm = 1;
    }

    let eo = mod.loadGamePreference('settlers_overlays');
    if (eo == null){
    	eo = 1;
    }

    let pm = mod.loadGamePreference('settlers_play_mode');
    if (pm == null){
    	pm = 1;
    }

	return `
			<fieldset class="saito-grid">
			<legend class="settings-label">Event Overlays</legend>
			<input type="radio" id="show" name="overlays" value="1" ${ eo ? 'checked' : ''}/>
			<label for="show">Always show <span class="note">I want to know what is happening</span></label>
			<input type="radio" id="dontshow" name="overlays" value="0" ${	eo ? '' : 'checked'}/>
			<label for="dontshow">Never show <span class="note">They annoy me</span></label>
			</fieldset>

			<fieldset class="saito-grid">
			<legend class="settings-label">Board Placements</legend>
            <input type="radio" id="confirm" name="confirm_moves" value="1" ${cm ? "checked" : ""}/>
            <label for="confirm">Confirm <span class="note">Make sure I don't accidentally misclick the board</span></label>
            <input type="radio" id="expert" name="confirm_moves" value="0" ${cm ? "": "checked"}/>
            <label for="expert">No <span class="note">I am careful</span></label>
			</fieldset>
			
			<fieldset class="saito-grid">
			<legend class="settings-label">Play Mode</legend>
            <input type="radio" id="auto" name="play_mode" value="1" ${pm ? "checked" : ""}/>
            <label for="auto">Faster <span class="note">Auto-click acknowledge after a few seconds</span></label>
            <input type="radio" id="manual" name="play_mode" value="0" ${pm ? "": "checked"}/>
            <label for="manual">Slow <span class="note">I like clicking through the game and making my opponent wait</span></label>
			</fieldset>
			`;
};
