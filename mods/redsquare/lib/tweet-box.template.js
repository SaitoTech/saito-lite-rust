
module.exports = (app, mod, tweet) => {


    let html = `<div class="redsquare-item">
     <div class="redsquare-user-container">
    <div class="saito-list-user">
    <div class="saito-list-user-image-box">
        <img class="saito-idenitcon" src="${tweet.identicon}" />
    </div>
    <div class="saito-list-user-content-box">
    <div class="saito-username">
        <p>${tweet.publickey}</p>
        <i class="fas fa-certificate redsquare-certificate"></i>
   </div>
        <p class="saito-tweet-timestamp">3:46 PM - July 7, 2022 </p>
    </div>
    
    <div class="x">
    <i class="fas fa-solid fa-ellipsis-h"></i>
</div>
</div>
</div>
    <div class="redsquare-item-contents-container">
      <div class="redsquare-item-contents" id="tweet-${tweet.tx_sig}" data-tweet-id="${tweet.id}">
          <div class="redsquare-text-container">
              <p>${tweet.content}</p>
          </div>
      `;

    if (typeof tweet.img != 'undefined' && tweet.img != "") {
        html += `<div class="redsquare-image-container">
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

   //   <div class="redsquare-item-profile">
    //       <img src="${tweet.identicon}" />
    //   </div>

