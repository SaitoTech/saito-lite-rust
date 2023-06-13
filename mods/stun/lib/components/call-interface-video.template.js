module.exports = CallInterfaceVideoTemplate = (mod, videoEnabled = true, audioEnabled = true) => {
  return `
    <div class="stun-chatbox" id="stun-chatbox">
      <main>
        <section class="large-wrapper">
          <div class="video-container-large">
            <div class="expanded-video"></div>
            <div class="side-videos"></div>
          </div>
        </section>

        <section class="footer">

          <div class="control-panel">
            <div class="timer">
              <p class="counter"> 00.00 </p>
              <div class="users-on-call">
                <div class="image-list"></div>
                <p><span class="users-on-call-count">1</span> on call</p>
              </div>
              <div class="add_users_container icon_click_area">
                <label>Invite</label>
                <i class="add_users fa fa-plus"></i>
              </div>
            </div>

          <div class="control-list">
            <span class="display-control icon_click_area">
              <label>Display</label>
              <i class="fa-solid fa-display"></i>
            </span>
            ${
              mod.CallInterface.display_mode !== "presentation" &&
              `<span class="share-control icon_click_area">
                  <label>Present</label>
                  <i class="fa-brands fa-slideshare"></i>
                </span>`
            }
          
            <span class="chat_control_container icon_click_area">
              <label>Chat</label>
              <i class="chat_control fa-regular fa-comments"></i>
            </span>
            
            <span class="spacer"></span>

            <span class="audio-control mini_okay icon_click_area${audioEnabled ? "" : " disabled"}">
              <label>Audio</label>
              <i class="fa ${audioEnabled ? "fa-microphone" : "fa-microphone-slash"}"> </i>
            </span>
            <span class="video-control mini_okay icon_click_area${videoEnabled ? "" : " disabled"}">
              <label>Video</label>
              <i class="fas ${videoEnabled ? "fa-video" : "fa-video-slash"}"></i>
            </span>
            <span class="disconnect-control mini_okay icon_click_area">
               <label>End </label>
               <i class="disconnect_btn  fas fa-phone"> </i>
            </span>
          </div>
        </div>
      </section>
    </main>

    ${
      mod.browser_active
        ? ""
        : `<div class="minimizer">
      <i class=" fas fa-caret-down"></i>
    </div>`
    }

  </div>`;
};
