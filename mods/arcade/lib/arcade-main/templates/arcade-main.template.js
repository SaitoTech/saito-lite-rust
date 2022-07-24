
module.exports = ArcadeMainTemplate = (app, mod) => {
  return `
    <div id="arcade-main" class="arcade-main">
      <div class="alert-banner">
        <div class="alert-icon">&#9888;</div>
        <div class="alert-body">
	  <div class="alert-title">Warning</div>
 	  <div class="alert-notice">Saito requires a standards-compliant browser: yours may freeze <a href="#" style="text-decoration:none">click for details</a></div>
        </div>
      </div>
      <div id="arcade-mobile-helper"></div>
      <div id="arcade-tabs">
        <div id="arcade-hero" class="arcade-hero">
        </div>
        <div id="observables-hero" class="observables-hero arcade-tab-hidden">
        </div>
        <div id="tournaments-hero" class="tournaments-hero arcade-tab-hidden">
          coming soon
        </div>
      </div>
      <div id="arcade-sub" class="arcade-sub">
      </div>
    </div>
  `;
}
