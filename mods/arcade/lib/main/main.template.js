module.exports = ArcadeMainTemplate = () => {
  return `
    <div id="saito-container" class="saito-container arcade-container">
      <div class="saito-sidebar left"></div>
      <div id="arcade-main" class="saito-main arcade-main">
        <div id="arcade-central-panel" class="arcade-central-panel">
          <div id="arcade-banner" class="arcade-banner"></div>
          <div id="arcade-invites-box" class="arcade-invites-box"></div>
	</div>
        <div id="arcade-leagues" class="arcade-leagues"></div>
      </div>
    </div>
  `;
}
