module.exports = ArcadeMainTemplate = () => {
  return `
    <div id="saito-container" class="saito-container arcade-container">
      <div class="saito-sidebar-left"></div>
      <div id="arcade-main" class="arcade-main">
        <div id="arcade-banner" class="arcade-banner"></div>
        <div id="arcade-invites" class="arcade-invites">
          <div id="arcade-tabs" class="arcade-tabs">
            <div id="arcade-hero" class="arcade-hero"></div>
            <div id="observer-live-hero" class="arcade-tab-container"></div>
            <div id="observer-review-hero" class="arcade-tab-container"></div>
          </div>
        </div>
        <div id="arcade-leagues" class="arcade-leagues"></div>
      </div>
    </div>
  `;
}
