module.exports = GameHudTemplate = () => {

  return `
    <div id="hud" class="hud">
      <div id="hud-header" class="hud-header">
        <i id="hud-toggle-button" class="fas fa-caret-down"></i>
      </div>
      <div id="hud-body" class="hud-body">
        <div id="status" class="status"></div>
        <div id="status-overlay" class="status-overlay"></div>
      </div>
    </div>
  `;
}

