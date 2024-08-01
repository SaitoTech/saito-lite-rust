module.exports = StunLaunchTemplate = (app, mod) => {
	let html = `
      <div class="stun-appspace"> 
        <div class="stun-appspace-content">
          <div class="staun-appspace-cards">
            <card class="appear stunx-appspace-splash">
              <div>
                <div class="saito-page-header-title">Saito Talk</div>
                <div>peer-to-peer video chat</div>
              </div>
              <fieldset class="stun-input-settings">
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
              </fieldset>
            </card>
            <card class="stun-appspace-settings">
            </card>
          </div>  
          <div class="stunx-appspace-actions">`;

          if (mod.room_obj) {
            html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createRoom" data-id="${mod.room_obj?.call_id}">Join Meeting</div>`;
          } else {
            html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createRoom">Start Meeting</div>`;
            html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createScheduleRoom">Schedule Meeting</div>`;
          }                       
          html += `</div>

        </div>
      
      </div>

    `;

	return html;
};
