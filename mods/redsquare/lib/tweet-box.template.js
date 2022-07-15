const SaitoUserWithControls = require('./../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = (app, mod, tx) => {

console.log("AAA");

    let html = `

  <div class="redsquare-item">
     <div class="redsquare-user-container">

     ${SaitoUserWithControls(app, mod, tx.transaction.from[0].add)}

     <div class="redsquare-item-contents-container">
       <div class="redsquare-item-contents" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">
          <div class="redsquare-text-container">
              <p>${tx.msg.content}</p>
          </div>
      `;

    if (typeof tx.msg.img != 'undefined' && tx.msg.img != "") {
        html += `
	  <div class="redsquare-image-container">
            <img src="${tx.msg.img}" />
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

console.log("BBB");

    return html;
}

