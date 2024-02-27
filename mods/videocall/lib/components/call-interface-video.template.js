module.exports = CallInterfaceVideoTemplate = (
	mod,
	videoEnabled = true,
	audioEnabled = true
) => {
	let html = `
    <div class="stun-chatbox full-screen" id="stun-chatbox">
      <main>
        <section class="video-container-large split-view">
          <div class="expanded-video"></div>
          <div class="side-videos"></div>
        </section>

        <section class="footer">

          
          <div class="timer">
            <div class="counter"> 00:00 </div>
            <div class="users-on-call">
              <div class="stun-identicon-list"></div>
              <div class="users-on-call-text"><span class="users-on-call-count">1</span> on call</div>
            </div>
            <div class="add_users_container icon_click_area">
              <label>Invite</label>
              <i class="add_users fa fa-plus"></i>
            </div>
          </div>
       
          <div class="control-panel">
            <div class="control-list imported-actions">
              <div class="display-control icon_click_area">
                <label>Settings</label>
                <i class="fa-solid fa-cog"></i>
              </div>
            </div>

            <div class="control-list call-controls">

              <div class="audio-control icon_click_area${audioEnabled ? '' : ' disabled'}">
                <label>Audio</label>
                <i class="fa ${audioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}"> </i>
              </div>
            
              <div class="video-control icon_click_area${	videoEnabled ? '' : ' disabled'}">
                <label>Video</label>
                <i class="fas ${	videoEnabled ? 'fa-video' : 'fa-video-slash'}"></i>
              </div>
              <div class="disconnect-control icon_click_area">
                 <label>End </label>
                 <i class="disconnect_btn  fas fa-phone"> </i>
              </div>
            </div>
          </div>
        </section>
    </main>

    ${
	mod.browser_active
		? `<div class="maximizer">
      <i class="fa fa-window-maximize" aria-hidden="true"></i>
    </div>`
		: `<div class="minimizer">
      <i class=" fas fa-caret-down"></i>
    </div>`
}

  </div>`;

	if (!mod.browser_active) {
		html = `<div class="stun-overlay-container">${html}</div>`;
	}

	return html;
};
