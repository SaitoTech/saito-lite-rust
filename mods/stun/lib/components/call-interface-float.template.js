module.exports = CallInterfaceFloat = () => {
  return `
    <div class="small-audio-chatbox" id="small-audio-chatbox">
      <div class="video-container"></div>
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00.00 </div>
          <div class="image-list"></div>
        </div>  
        <div class="control-list">
          <span class="audio-control icon_click_area">
            <i class="fa fa-microphone"> </i>
          </span>
          <span class="disconnect-control icon_click_area">
             <i class="disconnect_btn fas fa-phone"> </i>
          </span>
        </div>
      </div>
    </div>`;
}

