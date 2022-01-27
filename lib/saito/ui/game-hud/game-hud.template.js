module.exports = GameHudTemplate = (changeMode = false) => {

  return `
    <div id="hud" class="hud">
      <div id="hud-header" class="hud-header">
        ${(changeMode)?'<i id="hud-mode-button" class="hud-controls fas fa-recycle"></i>':''}
        <i id="hud-toggle-button" class="hud-controls fas fa-caret-down"></i>
      </div>
      <div id="hud-body" class="hud-body">
        <div id="status" class="status"></div>
        <div id="status-overlay" class="status-overlay"></div>
      </div>
    </div>
  `;
}

