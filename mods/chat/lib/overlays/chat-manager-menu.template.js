module.exports  = (app, mod) => {
	let html = `<div class="saito-module-settings">`;

	if ('Notification' in window) {

		html += `
			<fieldset class="saito-grid">
				<legend class="settings-label">Notifications</legend>

				<input type="checkbox" id="audio-notifications" ${mod?.audio_notifications ? "checked":"" }/>
				<label for="audio-notifications">incoming message chime</label>

				<fieldset id="sensitivity-fieldset" class="saito-grid" ${mod?.audio_notifications ? "" : `style="display:none;"`}>
					<legend class="settings-label">Sensitivity</legend>
					<input type="radio" id="all" name="chime-threshold" value="all" ${mod?.audio_notifications=="all" ? "checked": "" }/>
					<label for="all">All messages</label>
					<input type="radio" id="groups" name="chime-threshold" value="groups" ${mod?.audio_notifications=="groups" ? "checked": "" }/>
					<label for="groups">Unopened groups</label>
					<input type="radio" id="tabs" name="chime-threshold" value="tabs" ${mod?.audio_notifications=="tabs" ? "checked": "" }/>
					<label for="tabs">Hidden tab</label>
				</fieldset>

				<fieldset id="chime-fieldset" class="saito-grid" ${mod?.audio_notifications ? "" : `style="display:none;"`}>
					<legend class="settings-label">Chimes</legend>
					<input type="radio" id="Glass" name="chat-chime" value="Glass" ${mod?.audio_chime=="Glass" ? "checked": "" }/>
					<div class="flex-row"><label for="Glass">Chime A</label><i data-id="Glass" class="sound-preview fa-solid fa-volume-low"></i></div>
					<input type="radio" id="Taptap" name="chat-chime" value="Taptap" ${mod?.audio_chime=="Taptap" ? "checked": "" }/>
					<div class="flex-row"><label for="Taptap">Chime B</label><i data-id="Taptap" class="sound-preview fa-solid fa-volume-low"></i></div>
				</fieldset>


			</fieldset>


			<fieldset class="saito-grid">
				<input type="checkbox" id="auto-open" ${mod.auto_open_community ? "checked":"" }/>
				<label for="auto-open">always open community chat</label>
			</fieldset>

			`;

	}

	html += 
		`<fieldset id="add-publickey" class="saito-grid settings-link">
			<i class="fa-solid fa-user-group"></i>
			<label>add contact</label>
		</fieldset>`;

	html += 
		`<fieldset id="add-contacts" class="saito-grid settings-link">
			<i class="fa-solid fa-user-group"></i>
			<label>new/open chat</label>
		</fieldset>`;

	html += 
		`<fieldset id="create-group" class="saito-grid settings-link">
			<i class="fa-solid fa-users"></i>
			<label>new group</label>
		</fieldset>`;

	html += 
		`<fieldset id="edit-contacts" class="saito-grid settings-link">
			<i class="fa-solid fa-users-gear"></i>
			<label>manage chats</label>
		</fieldset>`;

	html += 
		`<fieldset id="chat-link" class="saito-grid settings-link">
			<i class="fas fa-link"></i>
			<label>my chat id</label>
		</fieldset>`;

	if (mod?.black_list?.length > 0){
		html += `<fieldset id="blocked-accounts" class="saito-grid settings-link">
		<i class="fa-solid fa-ban"></i>
		<label>Manage Blocked Accounts</label>
		</fieldset>`;
	}
		

	return html;
};

/*
				<!--input type="checkbox" id="enable-notifications" ${mod.audio_notifications ? "checked":"" }/>
				<label for="enable-notifications">use system notifications <span class="note">(not recommended)</span></label-->

*/
