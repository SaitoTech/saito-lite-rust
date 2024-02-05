module.exports = ChatManagerMenuTemplate = (app, mod) => {
	let html = `<div class="saito-module-settings">`;

	if ('Notification' in window) {

		html += `
			<fieldset class="saito-grid">
				<input type="checkbox" id="enable-notifications" ${mod.enable_notifications ? "checked":"" }/>
				<label for="enable-notifications">Use System Notifications</label>

				<input type="checkbox" id="audio-notifications" ${mod?.audio_notifications ? "checked":"" }/>
				<label for="audio-notifications">Incoming Message Chime</label>

			</fieldset>
			`;

	}

	html += 
		`<fieldset id="add-contacts" class="saito-grid settings-link">
			<i class="fa-solid fa-plus"></i>
			<label>Create New Chat</label>
		</fieldset>`;

	html += 
		`<fieldset id="edit-contacts" class="saito-grid settings-link">
			<i class="fa-solid fa-users"></i>
			<label>Manage Open Chats</label>
		</fieldset>`;

	return html;
};
