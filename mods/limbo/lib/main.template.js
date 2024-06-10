module.exports = LimboMainTemplate = () => {
	return `
    <div id="saito-container" class="saito-container limbo-container">
      <div id="limbo-main" class="saito-main limbo-main">
        <div class="limbo-menu">
          <h1>What do you want to peercast?</h1>
          <div class="limbo-launch-options">
            <div class="limbo-option" id="screen"><i class="fa-solid fa-desktop"></i><label>Screen</label></div>
            <div class="limbo-option" id="audio"><i class="fa-solid fa-radio"></i><label>Voice</label></div>
            <div class="limbo-option" id="video"><i class="fa-solid fa-clapperboard"></i><label>Webcam</label></div>
          </div>
          <div class="space-list-header"></div>
          <div id="spaces" class="spaces-list"></div>
        </div>
      </div>
      <div class="saito-sidebar right"></div>
    </div>
  `;
};
