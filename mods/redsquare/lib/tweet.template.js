//const SaitoUser = require('./../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, mod, tweet) => {
  let notice = tweet?.notice || "";
  let text = tweet?.text || "";
  text = mod.filterText(text);

  //if (tweet.tx.update_tx){
  //  console.log("Tweet Template == Rendering edited TX");
  //}
  

  if (!text && !notice && tweet.retweet_tx) {
    notice = "retweeted by " + app.browser.returnAddressHTML(tweet.tx.from[0].publicKey);
  }

  let is_liked_css = (mod.liked_tweets.includes(tweet.tx.signature)) ? "liked" : "";
  let is_retweeted_css = (mod.retweeted_tweets.includes(tweet.tx.signature))? "retweeted" : "";
  let is_replied_css = (mod.replied_tweets.includes(tweet.tx.signature)) ? "replied" : "";


  let controls = `
              <div class="tweet-controls">
                <div class="tweet-tool tweet-tool-comment" title="Reply/Comment">
                  <span class="tweet-tool-comment-count ${is_replied_css}">${tweet.num_replies}</span> <i class="far fa-comment ${is_replied_css}"></i>
                </div>
                <div class="tweet-tool tweet-tool-retweet" title="Retweet/Quote-tweet"><span class="tweet-tool-retweet-count ${is_retweeted_css}">${tweet.num_retweets}</span>
                  <i class="fa fa-repeat ${is_retweeted_css}"></i>
                </div>
                <div class="tweet-tool tweet-tool-like" title="Like tweet"><span class="tweet-tool-like-count ${is_liked_css}">${tweet.num_likes}</span> <div class="tweet-like-button">
                <div class="heart-bg">
                  <div class="heart-icon ${is_liked_css}"></div>
                </div>
              </div></div>
                    
                <div class="tweet-tool tweet-tool-share" title="Copy link to tweet"><i class="fa fa-arrow-up-from-bracket"></i>
                </div>`;
  if (tweet.tx.from[0].publicKey === mod.publicKey) {
    controls += `<div class="tweet-tool tweet-tool-edit" title="Edit your tweet"><i class="fas fa-edit"></i></div>`;
  } else {
    controls += `<div class="tweet-tool tweet-tool-flag" title="Flag tweet as inappropriate"><i class="fa fa-flag"></i></div>`;
  }
  controls += `           </div>`;

  let html = `
        <div class="tweet tweet-${tweet.tx.signature}" data-id="${tweet.tx.signature}">
          <div class="tweet-notice">${notice}</div>
          <div class="tweet-header"></div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="tweet-text">${app.browser.sanitize(text)}</div>`;

  if (tweet.youtube_id != null && tweet.youtube_id != "null") {
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
