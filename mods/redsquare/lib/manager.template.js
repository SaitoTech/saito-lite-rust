module.exports = (app, mod) => {
	return `
    <div class="redsquare-feed-source hidden">
      <div class="saito-button-tab ${mod.showOnlyWatched ? "" : "active"}" id="for-you">for you</div>
      <div class="saito-button-tab ${mod.showOnlyWatched ? "active" : ""}" id="following">following</div>
    </div>
    <div class="redsquare-progress-banner"></div>
    <div class="tweet-manager"></div>
    <div class="redsquare-intersection" id="redsquare-intersection">
      <div id="intersection-observer-trigger" class="intersection-observer-trigger"></div>
    </div>
    <div class="tweet-thread-holder" id="tweet-thread-holder"></div>
  `;
};
