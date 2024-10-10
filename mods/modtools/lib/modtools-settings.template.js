module.exports = (app, mod) => {

	let html = `
			<div id="modtools-settings" class="saito-module-settings">
			<fieldset class="saito-grid">
			<legend class="settings-label">Moderation Controls</legend>
	`;


/***** let people customize module settings ? ****

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

	let public_c = "";
	let friends_c = "";
	let custom_c = "";
	let none_c = "";

	if (mod.permissions.mode == "none") { none_c = "checked"; }
	if (mod.permissions.mode == "public") { public_c = "checked"; }
	if (mod.permissions.mode == "friends") { friends_c = "checked"; }
	if (mod.permissions.mode == "custom") { custom_c = "checked"; }

	html += `

            <fieldset class="saito-grid">
            	<legend class="settings-label">Who Moderates:</legend>

            	<input type="radio" id="none_mod" name="who_moderates" value="none_mod" ${none_c}>
            	<label for="none_mod">Me <span class="note">- I handle my own moderation</span></label>

            	<input type="radio" id="custom_mod" name="who_moderates" value="custom_mod" ${custom_c}>
            	<label for="custom_mod">Custom <span class="note">- selected accounts from my friends and contacts</span></label>

            	<input type="radio" id="friends_mod" name="who_moderates" value="friends_mod" ${friends_c}>
            	<label for="friends_mod">Friends <span class="note">- my friends and contacts</span></label>

            	<input type="radio" id="public_mod" name="who_moderates" value="public_mod" ${public_c}>
            	<label for="public_mod">Saito <span class="note">- get blacklists from a Saito run node</span></label>

            </fieldset>

	`;

//        if (app.options.modtools.whitelist.length > 0){
                html += `<fieldset id="whitelisted-accounts" class="saito-grid settings-link">
                <i class="fa-regular fa-face-smile-beam"></i>
                <label>Manage Whitelisted Accounts (${app.options.modtools.whitelist.length})</label>
                <div id="add-whitelist" class="saito-grid-extra-button saito-button-secondary">Add</div>
                </fieldset>`;
//        }

//        if (app.options.modtools.blacklist.length > 0){
                html += `<fieldset id="blacklisted-accounts" class="saito-grid settings-link">
                <i class="fa-solid fa-ban"></i>
                <label>Manage Blocked Accounts (${app.options.modtools.blacklist.length})</label>
                </fieldset>`;


                /*html += `
                <fieldset id="modtools-apps" class="saito-grid">
	            	<legend class="settings-label">App Permissions:</legend>
	            	<div class="modtools-app-permissions" id="modtools-app-permissions">
					</div>

					<div class="add-new-permission-box" id="add-new-permission-box"></div>
					<div class="saito-button-primary small" id="modtools-apps-add-new">+</div>
                </fieldset>`;
                */
//        }

	html += `
			</div>
	`;

	return html;
}
