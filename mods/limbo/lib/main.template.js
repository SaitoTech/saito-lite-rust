module.exports = LimboMainTemplate = (app, mod) => {
	let html = `
    <div id="saito-container" class="saito-container limbo-container">
      <div id="limbo-main" class="saito-main limbo-main">
        <div class="limbo-menu">
          <h1>What do you want to swarmcast?</h1>
          <div class="limbo-launch-options">`;
  if (!app.browser.isMobileBrowser()){
    html += `<div class="limbo-option" id="screen"><i class="fa-solid ${mod.icons.screen}"></i><label>screen</label></div>`;
  }          
  html += `<div class="limbo-option" id="audio"><i class="fa-solid ${mod.icons.audio}"></i><label>voice</label></div>
            <div class="limbo-option" id="video"><i class="fa-solid ${mod.icons.camera}"></i><label>webcam</label></div>
          </div>
          <div class="space-list-header"></div>
          <div id="spaces" class="spaces-list"></div>
        </div>
      </div>
      <div class="saito-sidebar right"></div>
    </div>
  `;

  return html;
};
