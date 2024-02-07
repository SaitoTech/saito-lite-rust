module.exports = ChatManagerMenuTemplate = (app, mod) => {
	let html = `<div class="saito-module-settings">`;

	if ('Notification' in window) {

		html += `
			<fieldset class="saito-grid">
				<legend class="settings-label">Notifications</legend>
				<input type="checkbox" id="enable-notifications" ${mod.enable_notifications ? "checked":"" }/>
				<label for="enable-notifications">use system notifications</label>

				<input type="checkbox" id="audio-notifications" ${mod?.audio_notifications ? "checked":"" }/>
				<label for="audio-notifications">incoming message chime</label>

			</fieldset>

			<fieldset class="saito-grid">
				<input type="checkbox" id="auto-open" ${mod.auto_open_community ? "checked":"" }/>
				<label for="auto-open">always open community chat</label>
			</fieldset>

			`;

	}

	html += 
		`<fieldset id="add-contacts" class="saito-grid settings-link">
			<i class="fa-solid fa-user-plus"></i>
			<label>new chat</label>
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

	return html;
};
