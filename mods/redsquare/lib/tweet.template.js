const SaitoUserWithControls = require('./../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = (app, mod, tx) => {

    let tweet_image = '';
    if (typeof tx.msg.img != 'undefined' && tx.msg.img != "") {
        tweet_image = `<div class="redsquare-image-container"><img src="${tx.msg.img}" /></div>`;
    }

    return `
       <div class="redsquare-item">
         ${SaitoUserWithControls(app, mod, tx.transaction.from[0].add)}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">
           <div class="tweet">${tx.msg.content}</div>
           ${tweet_image}
           <div class="redsquare-tweet-tools">
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-comment"></i></div>
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-heart"></i></div>
             <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="fas fa-retweet"></i></div>
           </div>
         </div>
      </div>
    `;

}

