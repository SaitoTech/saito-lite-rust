module.exports = DialerTemplate = (app, mod, is_dialing = true) => {
	let html = `
      <div class="stun-minimal-appspace"> 
      	<h2>Saito Talk</h2>
      	<div class="contact"></div>

		<div id="stun-phone-notice" class="stun-phone-notice">${
	is_dialing ? '' : ' is calling you'
}</div>`;

	/*html +=  `<fieldset class="stun-input-settings">
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
              </fieldset>`;*/

	if (is_dialing) {
		html += `<div class="video_switch">
	      	<label class="switch_label" for="video_call_switch">Enable Video</label>
			<label class="switch">
			  <input type="checkbox" id="video_call_switch">
			  <span class="slider round"></span>
			</label>
		</div>`;
	}

	html += `<div class="video-preview stun-appspace-settings"></div>`;

	if (is_dialing) {
		html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="startcall">Call</div>`;
	} else {
		html += `
			<div class="stun-button-row">
				<div class="saito-button-primary" id="rejectcall">Reject</div>
				<div class="saito-button-primary" id="answercall">Answer</div>
			</div>`;
	}
	html += `</div>`;

	return html;
};
