module.exports = (app, mod) => {
	return `
    <div class="redsquare-feed-source hidden">
      <div class="saito-button-tab ${mod.showOnlyWatched ? "" : "active"}" id="for-you" title="original redsquare feed"><span>everything</span></div>
      <div class="saito-button-tab ${mod.showOnlyWatched ? "active" : ""}" id="following" title="people saved in my keychain or followed in redsquare"><span>following</span></div>
    </div>
    <div class="redsquare-progress-banner"></div>
    <div class="tweet-manager"></div>
    <div class="redsquare-intersection" id="redsquare-intersection">
      <div id="intersection-observer-trigger" class="intersection-observer-trigger"></div>
    </div>
    <div class="tweet-thread-holder" id="tweet-thread-holder"></div>
  `;
};
