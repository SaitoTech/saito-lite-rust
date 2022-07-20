const SaitoUserWithControls = require('./../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = (app, mod, tweet) => {

    console.log('tweet');
    console.log(tweet);

    let tweet_image = '';
    if (typeof tweet.img != 'undefined' && tweet.img != "") {
        tweet_image = `<div class="redsquare-image-container"><img src="${tweet.img}" /></div>`;
    }

    let tweet_text = '';
    if (typeof tweet.text != 'undefined' && tweet.text != "") {
      tweet_text = tweet.text;
    }

    return `
       <div class="redsquare-item">
         ${SaitoUserWithControls(app, mod, tweet.tx.transaction.from[0].add)}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tweet.tx.transaction.sig}" data-id="${tweet.tx.transaction.sig}">
           <div class="tweet">${tweet_text}</div>
           ${tweet_image}
           <div class="link-preview" id="link-preview-${tweet.tx.transaction.sig}"></div>
           <div class="redsquare-tweet-tools">
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-comment"></i></div>
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-heart"></i></div>
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="fas fa-retweet"></i></div>
           </div>
         </div>
      </div>
    `;

}

