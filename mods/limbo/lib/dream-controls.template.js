module.exports = DreamControlsTemplate = (mod) => {

  let html = `
    <div class="dream-controls" id="dream-controls">
      <div class="video-preview"></div>
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00:00 </div>
          <div class="stun-identicon-list"></div>
        </div>  
        <div class="control-list">
          <div class="audio-control icon_click_area">
            <i class="fa fa-microphone"> </i>
          </div>`;


  if (mod?.localStream?.getVideoTracks().length > 0){
    html += `<div class="video-control icon_click_area">
            <i class="fas fa-video"></i>
          </div>`;
  }

  if (mod?.screenStream){
    html += `<div class="screen-control icon_click_area">
            <i class="fa-solid fa-display"></i>
          </div>`;
  }

  html += `<div class="disconnect-control icon_click_area">
             <i class="fa-solid fa-x"></i>
          </div>
        </div>
      </div>
    </div>`;


    return html;
};
