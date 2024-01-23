module.exports = (app, mod, tweet) => {
	return `
    <div class="tweet-manager"></div>
    <div class="redsquare-intersection" id="redsquare-intersection">
      <div id="intersection-observer-trigger" class="intersection-observer-trigger"></div>
    </div>
    <div class="tweet-thread-holder" id="tweet-thread-holder"></div>
  `;
};
