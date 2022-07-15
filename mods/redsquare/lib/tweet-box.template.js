
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

              <div class="x">
                  <i class="fas fa-solid fa-ellipsis-h"></i>
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

        <div class="redsquare-date-container">
          <p>3:46 PM · Jul 6, 2022</p>
        </div>

        <div class="redsquare-tweet-tools">
          <span class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="fas fa-comment"></i></span>
          <span class="tweet-tool-like"><span class="tweet-like-count">0</span> <i class="fas fa-heart"></i></span>
          <span class="tweet-tool-like"><i class="fad fa-bullhorn"></i></span>
        </div>

      </div>
  </div>`;

  return html;
}