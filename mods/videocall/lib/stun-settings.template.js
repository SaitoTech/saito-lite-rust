module.exports = (app, mod) => {
	let privacy = app.options.stun?.settings?.privacy || 'all';
	let html = `
			<fieldset class="saito-grid">
			<legend class="settings-label">Enable direct calls on Saito Talk from:</legend>
			<input type="radio" id="all" name="stun-privacy" value="all" ${
	privacy == 'all' ? 'checked' : ''
}/>
			<label for="all">Anyone</label>
			<input type="radio" id="key" name="stun-privacy" value="key" ${
	privacy == 'key' ? 'checked' : ''
}/>
			<label for="key">Acquaintances</label>
			<input type="radio" id="dh" name="stun-privacy" value="dh" ${
	privacy == 'dh' ? 'checked' : ''
}/>
			<label for="dh">Friends</label>
			<input type="radio" id="none" name="stun-privacy" value="none" ${
	privacy == 'none' ? 'checked' : ''
}/>
			<label for="none">No one</label>
			</fieldset>
			`;

	if (mod?.streams?.active){
		html += `<fieldset class="stun-input-settings">
            <legend class="stun-input-settings-label">Adjust Inputs</legend>
            <select style="display:none" class="saito-select" id="video-input"></select>
            <select style="display:none" class="saito-select" id="audio-input"></select>
            <button style="display:none"  id="test-mic" class="chat-settings-test-mic">Test Microphone</button>
            <div style="display:none"  class="chat-settings-audio-controls">
            <i id="toggle-playback" class="fas fa-play chat-settings-toggle-icon"></i>
                <span id="audio-progress">00:00 / 00:00</span>
            </div>
            <div style="display:none"  class="chat-settings-audio-progress-bar">
              <div id="progress" class="chat-settings-progress"></div>
            </div>
        </fieldset>`;
	}		
	return html;
};
