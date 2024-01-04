module.exports = CallInterfaceFloat = () => {
  return `
    <div class="small-audio-chatbox" id="small-audio-chatbox">
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00.00 </div>
          <div class="users-on-call">
            <div class="image-list"></div>
            <div> <span class="users-on-call-count">1</span> on call </div>
          </div>
        </div>  
        <div class="control-list">
          <span class="audio-control mini_okay icon_click_area">
            <i class="fa fa-microphone"> </i>
          </span>
          <span class="disconnect-control mini_okay icon_click_area">
             <i class="disconnect_btn fas fa-phone"> </i>
          </span>
        </div>
      </div>
    </div>`;
}

/*
module.exports = () => {
  return `
          <li class="chat-manager-small-extension game-menu-sub-option">
          <span class="audio-control">  <i class="fa fa-microphone aria-hidden="true"></i> </span>  
          </li>
          <li class="chat-manager-small-extension game-menu-sub-option">
            <span class="disconnect-control"  id="disconnect-btn-menu">Disconnect</span>
          </li>
          <li class="chat-manager-small-extension image-list game-menu-sub-option">

          </li>

           `;
};

*/