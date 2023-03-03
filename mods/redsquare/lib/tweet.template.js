//const SaitoUser = require('./../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, mod, tweet) => {

  let optional = tweet.tx.optional;
  let notice = "";
  if (tweet.notice != "") { notice = tweet.notice; }

  let publickey = "";
  try { 
    if (tweet.tx.transaction.from[0].add) { publickey = tweet.tx.transaction.from[0].add; }
  } catch (err) {}
;
  let text = tweet.text || "";
  let flagged =  optional.flagged ||  null;
  let link_properties =  optional.link_properties ||  null;
  let num_likes =  optional.num_likes ||  0;
  let num_replies =  optional.num_replies ||  0;
  let num_retweets = optional.num_retweets || 0;
  let parent_id = optional.parent_id || "";
  let dt = app.browser.formatDate(tweet.tx.transaction.ts);
  let show_controls = tweet.show_controls;
  let sig_class = "tweet-"+tweet.tx.transaction.sig;
 
  if (text == "" && tweet.retweet_tx != null && tweet.retweet_tx != "" && notice == "") {
    //
    // set notice
    //
    notice = "retweeted by " + app.browser.returnAddressHTML(tweet.tx.transaction.from[0].add);
  }

  let userline = "posted on " + dt.month + " " + dt.day + ", " + dt.year + " at  " + dt.hours + ":" + dt.minutes;
  let controls = `
              <div class="tweet-controls">
                <div class="tweet-tool tweet-tool-comment">
                  <span class="tweet-tool-comment-count">${num_replies}</span> <i class="far fa-comment"></i>
                </div>
                <div class="tweet-tool tweet-tool-retweet"><span class="tweet-tool-retweet-count">${num_retweets}</span>
                  <i class="fa fa-repeat"></i>
                </div>
                <div class="tweet-tool tweet-tool-like"><span class="tweet-tool-like-count  ">${num_likes}</span> <div class="tweet-like-button">
                <div class="heart-bg">
                  <div class="heart-icon"></div>
                </div>
              </div></div>
                    
                <div class="tweet-tool tweet-tool-share "><i class="fa fa-arrow-up-from-bracket"></i>
                </div>
                <div class="tweet-tool tweet-tool-flag"><i class="fa fa-flag"></i></div>
              </div>`;

  let html = `
        <div class="tweet ${sig_class}" data-id="${tweet.tx.transaction.sig}">
          <div class="tweet-notice">${notice}</div>
          <div class="tweet-header"></div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="tweet-text">${app.browser.sanitize(text)}</div>
  `;
  if (tweet.youtube_id != null) {
    html += `
      <iframe class="youtube-embed" src="https://www.youtube.com/embed/${tweet.youtube_id}"></iframe>
    `;
  } else {
    html += `
              <div class="tweet-preview tweet-preview-${tweet.tx.transaction.sig}">
              </div>
    `;
  }
  html += `
              ${(show_controls) ? controls : ``}
            </div>
          </div>
        </div>
  `;

  return html;

}



