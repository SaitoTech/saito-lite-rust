module.exports  = (changeMode = false) => {
	return `
    <div id="hud" class="hud hide-scrollbar">
      <div id="hud-header" class="hud-header">
        ${
	changeMode
		? '<i id="hud-mode-button" class="hud-controls fas fa-recycle"></i>'
		: ''
}
        <i id="hud-toggle-button" class="hud-controls fas fa-caret-down"></i>
      </div>
      <div id="hud-body" class="hud-body hide-scrollbar">
        <div id="status" class="status"></div>
        <div id="controls" class="controls hide-scrollbar"></div>
        <div id="status-overlay" class="status-overlay"></div>
        <div class="hud-notice"></div>
      </div>
    </div>
  `;
};
