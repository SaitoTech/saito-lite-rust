module.exports  = () => {
	return `
    <div class="small-audio-chatbox" id="small-audio-chatbox">
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00:00 </div>
          <div class="stun-identicon-list"></div>
        </div>  
        <div class="control-list">
          <div class="audio-control icon_click_area">
            <i class="fa fa-microphone"> </i>
          </div>
          <div class="disconnect-control icon_click_area">
             <i class="disconnect_btn fas fa-phone"> </i>
          </div>
        </div>
      </div>
    </div>`;
};
