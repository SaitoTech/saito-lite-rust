module.exports = (app, mod) => {

	let html = `
			<div class="saito-module-settings">
			<fieldset class="saito-grid">
			<legend class="settings-label">Moderation Controls</legend>
	`;
/*****
				<div class="modtools-application-overrides">
					<select class="modtools-application">
	`;

	for (let i = 0; i < app.modules.mods.length; i++) {
		let checked = ""; if (i == 0) { checked = "checked"; }
		html += `<option value="${i}">${app.modules.mods[i].name}</option>`;
	}

	html += `
					</select>
					<select class="modtools-settings">
						<option value="all">unblock</option>
						<option value="normal" CHECKED>normal</option>
						<option value="none">block</option>
					</select>
			</fieldset>
			`;
****/

	html += `<fieldset id="moderation-permissions" class="saito-grid settings-link">
                <i class="fa-solid fa-ban"></i>
                <label>Who Can Help Moderate?</label>
                </fieldset>
		<select class="modtools-settings">
			<option value="public">anyone</option>
			<option value="friends" CHECKED>friends</option>
			<option value="custom">custom</option>
		</select>
	`;

	

        if (app.options.modtools.whitelist.length > 0){
                html += `<fieldset id="whitelisted-accounts" class="saito-grid settings-link">
                <i class="fa-solid fa-ban"></i>
                <label>Manage Whitelisted Accounts</label>
                </fieldset>`;
        }

        if (app.options.modtools.blacklist.length > 0){
                html += `<fieldset id="blocked-accounts" class="saito-grid settings-link">
                <i class="fa-solid fa-ban"></i>
                <label>Manage Blocked Accounts</label>
                </fieldset>`;
        }

	html += `
			</div>
	`;

	return html;
}
