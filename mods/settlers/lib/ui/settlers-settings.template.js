module.exports = (app, mod) => {

    let cm = mod.loadGamePreference('settlers_confirm_moves');
    if (cm == null){
    	cm = 1;
    }

    let eo = mod.loadGamePreference('settlers_overlays');
    if (eo == null){
    	eo = 1;
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
            <input type="radio" id="auto" name="confirm_moves" value="1" ${cm ? "checked" : ""}/>
            <label for="auto">Confirm <span class="note">Make sure I don't accidentally misclick the board</span></label>
            <input type="radio" id="manual" name="confirm_moves" value="0" ${cm ? "": "checked"}/>
            <label for="manual">No <span class="note">I am careful</span></label>

			</fieldset>
			`;
};
