module.exports = () => {

  return `
      <div id="redsquare-home" class="redsquare-home">
        <div class="redsquare-appspace-header">
        <div style="display: none" class="redsquare-new-tweets-banner" id="redsquare-new-tweets-banner">Load New Posts</div> 
          <div class="redsquare-actions-buttons">
            <div class="redsquare-actions-buttons-icon"></div>
            <div id="redsquare-page-header-title" class="redsquare-page-header-title">🟥 RED SQUARE</div>
            <div class="redsquare-actions-container">
              <div id="redsquare-tweet" class="saito-button-secondary small">New Post</div>
              <div id="redsquare-profile" class="saito-button-secondary small">My Profile</div>
            </div>
          </div>
        </div>
        <div id="redsquare-appspace-body" class="redsquare-appspace-body"></div>
        <div id="redsquare-intersection"></div>
      </div>
  `;

}

