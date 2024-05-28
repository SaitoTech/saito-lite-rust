module.exports = LiteDreamControlsTemplate = (videoEnabled = false) => {

  let html = `
    <div class="dream-controls lite" id="dream-controls">
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00:00 </div>
          <div class="stun-identicon-list"></div>
        </div>  
        <div class="control-list">
          <div class="audio-control icon_click_area">
            <i class="fa fa-microphone"> </i>
          </div>`;

  if (videoEnabled){
    html += `<div class="video-control icon_click_area">
            <i class="fas fa-video"></i>
          </div>`;
  }

  html += `
          <div class="share-control icon_click_area">
            <i class="fas fa-link"></i>
          </div>
          <div class="disconnect-control icon_click_area">
             <i class="disconnect_btn fas fa-phone"> </i>
          </div>
        </div>
      </div>
    </div>`;


    return html;
};
