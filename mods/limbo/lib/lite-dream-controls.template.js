module.exports = LiteDreamControlsTemplate = (app, mod, videoEnabled = false) => {

  let html = `
    <div class="dream-controls lite" id="dream-controls">
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00:00 </div>
          <div class="stun-identicon-list"></div>
        </div>  
        <div class="control-list">
          <div id="dreamspace-member-count" class="members-control icon_click_area">
            <i class="fa-solid fa-users"></i>
          </div>`;
  
  if (mod.publicKey == mod.dreamer){
    html += `<div class="audio-control icon_click_area">
            <i class="fa fa-microphone"> </i>
          </div>`;
  }

  if (videoEnabled){
    html += `<div class="video-control icon_click_area">
            <i class="fas fa-video"></i>
          </div>`;
  }

  html += `
          <div class="share-control icon_click_area">
            <i class="fas fa-link"></i>
          </div>`

  if (mod.publicKey == mod.dreamer){
    html += `<div class="disconnect-control icon_click_area">
             <i class="fa-solid fa-x"></i>
          </div>`;
  }

  html += `</div>
      </div>
    </div>`;


    return html;
};
