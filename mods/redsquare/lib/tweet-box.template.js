const SaitoUserWithControls = require('./../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = (app, mod, tweet) => {

    let html = `

  <div class="redsquare-item">
     <div class="redsquare-user-container">

     ${SaitoUserWithControls(app, mod, tweet.publickey)}

     <div class="redsquare-item-contents-container">
       <div class="redsquare-item-contents" id="tweet-${tweet.tx_sig}" data-tweet-id="${tweet.id}">
          <div class="redsquare-text-container">
              <p>${tweet.content}</p>
          </div>
      `;

    if (typeof tweet.img != 'undefined' && tweet.img != "") {
        html += `
	  <div class="redsquare-image-container">
            <img src="${tweet.img}" />
          </div>`;
    }

    html += `
          <div class="redsquare-tweet-tools">
            <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-comment"></i></div>
            <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="far fa-heart"></i></div>
            <div class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="fas fa-retweet"></i></div>
          </div>
        </div>

    </div>
  </div>`;

    return html;
}

