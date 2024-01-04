

module.exports = DialerTemplate = (app, mod) => {

	return `
      <div class="stun-minimal-appspace"> 
      	<h2>Saito Talk</h2>
      	<div class="contact"></div>
      	<div class="video_switch">
	      	<label class="switch_label" for="video_call_switch">Enable Video</label>
			<label class="switch">
			  <input type="checkbox" id="video_call_switch">
			  <span class="slider round"></span>
			</label>
		</div>
		<div class="video-preview stun-appspace-settings"></div>

		<div id="stun-phone-notice" class="stun-phone-notice"></div>

        <div class="saito-button-primary stunx-appspace-launch-call-btn" id="startcall">Call</div>
      </div>`;
};