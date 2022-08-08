
module.exports = (app, mod) => {

    return `
      <button class="saito-button-secondary" id="redsquare-new-tweets-btn">Load New Tweets</button>
      <div id="redsquare-appspace-home" class="redsquare-appspace-home">

        <div class="saito-page-header">
          <div id="redsquare-new-tweet" class="saito-button-secondary small" style="float: right;">Create New Tweet</div>
          <div id="saito-page-header-title" class="saito-page-header-title">RED SQUARE</div>
	  <div id="saito-page-header-text" class="saito-page-header-text">Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.
          </div>

        </div>



        <div class="redsquare-list"></div>

      </div>
    `;

}

