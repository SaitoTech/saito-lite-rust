
module.exports = (app, mod) => {

    return `
      <div id="redsquare-appspace-home" class="redsquare-appspace-home">

        <div class="saito-page-header">
          <div id="redsquare-feed-settings" class="saito-button-secondary small" style="float: right;">Feed Settings</div>
          <div id="redsquare-new-tweet" class="saito-button-secondary small" style="float: right;">Create New Tweet</div>
          <div class="saito-page-header-title">RED SQUARE</div>
	  <div class="saito-page-header-text">
	    Welcome to Red Square, an open media and gaming application running atop the Saito network. We welcome contact from those interested in learning more about Saito or building peer-to-peer applications for the world's first open network.
          </div>

        </div>

        <div class="redsquare-list"></div>

      </div>
    `;

}

