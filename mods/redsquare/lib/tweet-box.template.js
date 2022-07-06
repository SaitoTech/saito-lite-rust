
module.exports = (app, mod, tweet) => {


  let html = `<div class="redsquare-item">
      <div class="redsquare-item-profile">
          <img src="${tweet.identicon}" />
      </div>
      <div class="redsquare-item-contents" id="tweet-${tweet.tx_sig}" data-tweet-id="${tweet.id}">
          <div class="redsquare-user">
              <div class="redsquare-user-details">
                  <p>${tweet.publickey}</p>
                  <i class="fas fa-certificate"></i>
              </div>

              <div class="redsquare-user-actions">
                  <i class="fab fa-rocketchat"></i>
                  <i class="fas fa-user-friends"></i>
              </div>

          </div>
          <div class="redsquare-text-container">
              <p>${tweet.content}</p>
          </div>
      `;

  if (typeof tweet.img != 'undefined' && tweet.img != "") {
      html  += `<div class="redsquare-image-container">
              <img src="${tweet.img}" />
          </div>`;
  }

  html += `

         <div class="redsquare-tweet-tools">
            <span class="tweet-tool-like"><span class="tweet-like-count">0</span> LIKES</span>
        </div>

      </div>
  </div>`;

  return html;
}