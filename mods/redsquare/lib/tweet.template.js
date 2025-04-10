
module.exports = (app, mod, tweet) => {
	let notice = tweet?.notice || '';
	let text = tweet?.text || '';

	// replace @ key/identifer
	text = app.browser.markupMentions(text);

	let html_markers = '';
	if (tweet.source.text) {
		html_markers += ` data-source="${tweet.source.text}"`;
	}
	if (tweet.source.type) {
		html_markers += ` data-source-type="${tweet.source.type}"`;
	}
	if (tweet.source.node) {
		html_markers += ` data-source-node="${tweet.source.node}"`;
	}
	if (tweet?.curated){
		html_markers += ` data-curated="${tweet?.curated}"`;	
	}

	if (!text && !notice && tweet.retweet_tx) {
		notice =
			'retweeted by ' +
			app.browser.returnAddressHTML(tweet.tx.from[0].publicKey);
	}

	let is_liked_css = mod.liked_tweets.includes(tweet.tx.signature)
		? 'liked'
		: '';

	let is_retweeted_css = mod.retweeted_tweets.includes(tweet.tx.signature)
		? 'retweeted'
		: '';
	let is_replied_css = mod.replied_tweets.includes(tweet.tx.signature)
		? 'replied'
		: '';

	let controls = `
              <div class="tweet-controls">
                <div class="tweet-tool tweet-tool-comment" title="Reply/Comment">
                  <span class="tweet-tool-comment-count ${is_replied_css}">${tweet.num_replies}</span> <i class="far fa-comment ${is_replied_css}"></i>
                </div>
                <div class="tweet-tool tweet-tool-retweet" title="Retweet/Quote-tweet"><span class="tweet-tool-retweet-count ${is_retweeted_css}">${tweet.num_retweets}</span>
                  <i class="fa fa-repeat ${is_retweeted_css}"></i>
                </div>
                <div class="tweet-tool tweet-tool-like" title="Like tweet">
		  <span class="tweet-tool-like-count ${is_liked_css}">${tweet.num_likes}</span>
		  <div class="tweet-like-button">
                    <div class="heart-bg">
                      <div class="heart-icon ${is_liked_css}"></div>
                    </div>
                  </div>
		</div>
                <div class="tweet-tool tweet-tool-share" title="Copy link to tweet"><i class="fa fa-arrow-up-from-bracket"></i></div>
		<div class="tweet-tool tweet-tool-more" title="More options"><i class="fa-solid fa-ellipsis"></i></div>
	      </div>
	`;

	let html = `
        <div class="tweet tweet-${tweet.tx.signature}" data-id="${
	tweet.tx.signature
}"${html_markers}>
          <div class="tweet-html-markers">${html_markers.replace(/data-/g, "<br>")}</div>
          <div class="tweet-notice">${notice}</div>
          <div class="tweet-header"></div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="tweet-text">${app.browser.sanitize(text, true)}</div>`;

	if (tweet.youtube_id != null && tweet.youtube_id != 'null') {
		html += `<iframe class="youtube-embed" src="https://www.youtube.com/embed/${tweet.youtube_id}"></iframe>`;
	} else {
		html += `<div class="tweet-preview tweet-preview-${tweet.tx.signature}"></div>`;
	}

	if (tweet?.show_controls) {
		html += controls;
	}

	html += `</div>
          </div>
        </div>
  `;

	return html;
};
