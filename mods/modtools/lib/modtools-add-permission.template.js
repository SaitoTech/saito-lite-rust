module.exports = (app, mod) => {
	let mods = app.modules.mods;

	let html = `
		<div class="saito-module-settings modtools-addnew-permission-container">
			<fieldset class="saito-grid">
			<legend class="settings-label">New Permission</legend>

		    <div class="modtools-app-permission-dropdowns">
				<div class="overlay-input">
					<select id="modtools-add-permission-app" class="app-options-select">
	`;

					for (let i = 0; i < mods.length; i++) {	
						let name = (mods[i].name).toLowerCase();

						if (typeof mod.apps[name] == 'undefined') {
							html += `<option value='${name}'>${mods[i].name}</option>`;
						}
					}

	html += `
					</select>
				</div>

				<div class="overlay-input">
					<select id="modtools-add-permission-option" class="app-options-select">
						<option value="*" >Allow all</option>
	                 	<option value="!" >None</option>
	                 	<option value="$" >Fee-bearing</option>
					</select>
				</div>
			</div>

			<div class="modtools-add-permission-actions">
				<div class="saito-button-primary small" id="modtools-add-permission-btn" >Add</div>
				<div class="saito-button-primary small" id="modtools-cancel-permission-btn" >Cancel</div>
			</div>

			</fieldset>

		</div>
	`;


	return html;
}
