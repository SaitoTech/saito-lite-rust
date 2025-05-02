module.exports = (app, mod) => {

	let eo = app.options.settings?.debug || false;

	return `
			<fieldset class="saito-grid">
			<legend class="settings-label">Module Debug Mode</legend>
			<input type="checkbox" id="show" ${eo ? 'checked' : ''}/> 
   			<label for="show">Verbose Logging <span class="note">I want to know what is happening</span></label>
			</fieldset>
			`;
};
