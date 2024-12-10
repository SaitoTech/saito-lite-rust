module.exports = (app, mod) => {
	return `
    <div class="redsquare-feed-source hidden">
      <div class="saito-button-tab ${mod.curated ? "active" : ""}" id="curated" title="curated feed"><span>curated</span></div>
      <div class="saito-button-tab ${mod.curated ? "" : "active"}" id="everything" title="original redsquare feed"><span>unfiltered</span></div>
    </div>
    <div class="redsquare-progress-banner"></div>
    <div class="tweet-manager"></div>
    <div class="redsquare-intersection" id="redsquare-intersection">
      <div id="intersection-observer-trigger" class="intersection-observer-trigger"></div>
    </div>
    <div class="tweet-thread-holder" id="tweet-thread-holder"></div>
  `;
};
