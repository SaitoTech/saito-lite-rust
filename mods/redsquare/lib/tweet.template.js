module.exports = (app, mod, tweet) => {

  console.log("inside tweet template");
  console.log(tweet);

  let txMsg = tweet.tx.msg;
  let optional = tweet.tx.optional;
  let publickey = tweet.tx.transaction.from[0].add || "";
  let images = txMsg.data.images || [];
  let text = txMsg.data.text || "";
  let flagged =  optional.flagged ||  null;
  let link_properties =  optional.link_properties ||  null;
  let num_likes =  optional.num_likes ||  0;
  let num_replies =  optional.num_replies ||  0;
  let num_retweets = optional.num_retweets || 0;
  let parent_id = optional.parent_id || "";
  let dt = app.browser.formatDate(tweet.tx.transaction.ts);

  let profileImg = '/saito/img/no-profile.png';
  if (app.crypto.isPublicKey(publickey)) {
    profileImg = app.keys.returnIdenticon(publickey);
  }

  let userline = "posted on " + dt.month + " " + dt.day + ", " + dt.year + " at  " + dt.hours + ":" + dt.minutes;

  return `

        <div class="tweet">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
            <div class="saito-user">
              <div class="saito-identicon-box"><img alt="saito dynamic image" class="saito-identicon"
                  src="${profileImg}">
              </div>
              <div class="saito-address">${publickey}</div>
              <div class="saito-user-timestamp">${userline}</div>
            </div>
          </div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="tweet-text">${text}</div>
              <div class="tweet-preview">


              ${returnImages()}  


              </div>
              <div class="tweet-controls">
                <div class="tweet-tool tweet-tool-comment">
                  <span class="tweet-tool-comment-count">${num_replies}</span> <i class="far fa-comment"></i>
                </div>
                <div class="tweet-tool tweet-tool-retweet"><span class="tweet-tool-retweet-count">${num_retweets}</span>
                  <i class="fa fa-repeat"></i>
                </div>
                <div class="tweet-tool tweet-tool-like"><span class="tweet-tool-like-count  ">${num_likes}</span> <i
                    class="far fa-heart"></i></div>
                <div class="tweet-tool tweet-tool-share "><i class="fa fa-arrow-up-from-bracket"></i>
                </div>
                <div class="tweet-tool tweet-tool-flag"><i class="fa fa-flag"></i></div>
              </div>
            </div>
          </div>
        </div>
  `;


  function returnImages() {
    let imgs = ``;

    if (images.length > 1) {
      for (let i = 0; i < images.length; i++) {
        imgs += `<img alt="saito dymamic image" src="${images[i]}">`
      }
    }
    
    return `<div class="tweet-picture">
                ${imgs}
            </div>`;
  }  
}



