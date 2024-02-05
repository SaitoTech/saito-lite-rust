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
			<i class="fa-solid fa-plus"></i>
			<label>create new chat</label>
		</fieldset>`;

	html += 
		`<fieldset id="edit-contacts" class="saito-grid settings-link">
			<i class="fa-solid fa-users"></i>
			<label>manage chats</label>
		</fieldset>`;

	return html;
};
