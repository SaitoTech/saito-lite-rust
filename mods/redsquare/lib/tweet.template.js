const saito = require('./../../../lib/saito/saito');
const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');
const Tweet = require('./tweet');

module.exports = (app, mod, tweet, include_controls = 1, include_header = 1) => {

    let publickey = "";   
    let tweet_img = "";
    let tweet_text = "";
    let link_preview = '';
    let youtube_preview = "";

    if (typeof tweet.tx.msg.data.images != 'undefined' && tweet.tx.msg.data.images.length > 0) {
        let imgs = tweet.tx.msg.data.images;
        tweet_img += `<div class="redsquare-image-container">`;
        let img_class = (imgs.length>1) ? 'tweet-multiple-img' : '';
        for (let i=0; i<imgs.length; i++) {
          tweet_img += `<div class='${img_class}' style="background: url(${imgs[i]});"></div>`;
        }
        tweet_img += `</div>`;
    }
    if (typeof tweet.text != 'undefined' && tweet.text != "") {
      tweet_text = tweet.text;
    }
    if (tweet.youtube_id != null) {
      youtube_preview = `<iframe class="youtube-embed" src="https://www.youtube.com/embed/${tweet.youtube_id}"></iframe>`;
    }


    if (tweet.retweet_html != null) {
      link_preview = tweet.retweet_html;
    } else {

      if (tweet.link_properties != null) {

        //
        // if link properties
        //
        tweet_text = tweet_text.replace(tweet.link, '');

        if (typeof tweet.link_properties != 'undefined') {
          if (tweet.link_properties['og:exists'] !== false) {

            let d = tweet.link_properties;
 
            let link = new URL(d['og:url']);
            link_preview = `
                      <a target="_blank" href="${d['og:url']}">
                      <div class="preview-container">
                          <div class='preview-img' style="background: url(${d['og:image']})"></div>
                          <div class="preview-info">  
                            <div class="preview-url">${link.hostname}</div>
                            <div class="preview-title">${d['og:title']}</div>
                            <div class="preview-description">${d['og:description']}</div>
                          </div>
                      </div>
                      </a>
                      `;
          }
        }
      }
    }

    let dt = app.browser.formatDate(tweet.tx.transaction.ts);
    let userline = "posted on " + dt.month + " " + dt.day + ", " + dt.year + " at  " + dt.hours + ":" + dt.minutes;
    if (tweet.retweet_html != null) { 
       userline = "retweeted on " + dt.month + " " + dt.day + ", " + dt.year + " at  " + dt.hours + ":" + dt.minutes;
    }

    let saito_tweet_replied = "saito-tweet-no-activity";
    let saito_tweet_liked = "saito-tweet-no-activity";
    let saito_tweet_retweeted = "saito-tweet-no-activity";
    let saito_tweet_flagged = "saito-tweet-no-activity";
    
    if (tweet.children.length > 0 ) { saito_tweet_replied = "saito-tweet-activity"; }
    if (tweet.num_likes > 0) { saito_tweet_liked = "saito-tweet-activity"}
    if (tweet.num_retweets > 0 ) { saito_tweet_retweeted = "saito-tweet-activity"}
    if (tweet.flagged > 0 ) { saito_tweet_flagged = "saito-tweet-activity"}

    let html = `
       <div class="redsquare-item" id="tweet-box-${tweet.tx.transaction.sig}" data-id="${tweet.tx.transaction.sig}">
    `;
    if (include_header == 1) {
      html += SaitoUser(app, mod, tweet.tx.transaction.from[0].add, userline);
    }
    html += `
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tweet.tx.transaction.sig}" data-id="${tweet.tx.transaction.sig}">
    `;
    
    html += `
           <div class="redsquare-tweet-sidebar" data-id="${tweet.tx.transaction.sig}">
           </div>
      `;

    html += `
    <div class="tweet-body" data-id="${tweet.tx.transaction.sig}">
      <div class="tweet">${tweet_text}</div>
      ${tweet_img}
      <div class="youtube-embed-container">${youtube_preview}</div>
      <div class="link-preview" id="link-preview-${tweet.tx.transaction.sig}">${link_preview}</div>
     `;

      if (include_controls == 1) {
      html += `
        <div class="redsquare-tweet-tools" data-id="${tweet.tx.transaction.sig}">
           <div class="tweet-tool-comment tweet-reply-${tweet.tx.transaction.sig} ${saito_tweet_replied}"><span class="tweet-tool-comment-count tweet-tool-comment-count-${tweet.tx.transaction.sig}">${tweet.children.length}</span> <i class="far fa-comment"></i></div>
           <div class="tweet-tool-retweet tweet-retweet-${tweet.tx.transaction.sig} ${saito_tweet_retweeted}"><span class="tweet-tool-retweet-count tweet-tool-retweet-count-${tweet.tx.transaction.sig}">${tweet.num_retweets || 0}</span> <i class="fa fa-repeat"></i></div>
           <div class="tweet-tool-like tweet-like-${tweet.tx.transaction.sig} ${saito_tweet_liked}"><span class="tweet-tool-like-count  tweet-tool-like-count-${tweet.tx.transaction.sig}">${tweet.num_likes || 0}</span> <i class="far fa-heart"></i></div>
           <div class="tweet-tool-share tweet-share-${tweet.tx.transaction.sig}"><i class="fa fa-arrow-up-from-bracket"></i></div>
           <div class="tweet-tool-flag tweet-flag-${tweet.tx.transaction.sig} ${saito_tweet_flagged}"><i class="fa fa-flag"></i></div>
        </div>
      `;
    } else {
      html += `<div class="redsquare-tweet-no-tools"></div>`;
    }

        
     
  html += `
      </div>


          <div></div>
           <div class="redsquare-item-children redsquare-item-children-${tweet.tx.transaction.sig}"></div>
        </div>

    </div>

    
    `;

    return html;

}

