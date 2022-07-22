const SaitoUserWithControls = require('./../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = (app, mod, tweet) => {

    console.log('tweet');
    console.log(tweet);

    let tweet_img = "";
    let tweet_text = "";
    let youtube_preview = "";

    if (typeof tweet.img != 'undefined' && tweet.img != "") {
        tweet_img = `<div class="redsquare-image-container"><img src="${tweet.img}" /></div>`;
    }
    if (typeof tweet.text != 'undefined' && tweet.text != "") {
      tweet_text = tweet.text;
    }


    // TO-DO
    // create separate templates for youtube embed and link preview
    // and import both templates here
    if (tweet.youtube_id != null) {
      youtube_preview = `<iframe class="youtube-embed" src="https://www.youtube.com/embed/${tweet.youtube_id}"></iframe>`;
    } else {
    }

    let link_preview = '';
    if (tweet.link_properties != null) {
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

    return `
       <div class="redsquare-item" id="${tweet.tx.transaction.sig}">
         ${SaitoUserWithControls(app, mod, tweet.tx.transaction.from[0].add)}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tweet.tx.transaction.sig}" data-id="${tweet.tx.transaction.sig}">
           <div class="tweet">${tweet_text}</div>
           ${tweet_img}
           <div class="youtube-embed-container">${youtube_preview}</div>
           <div class="link-preview" id="link-preview-${tweet.tx.transaction.sig}">${link_preview}</div>
           <div class="redsquare-tweet-tools">
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-comment"></i></div>
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-heart"></i></div>
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="fas fa-retweet"></i></div>
           </div>
         </div>
      </div>
    `;

}

