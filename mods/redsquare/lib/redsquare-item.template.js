
module.exports = (app, mod, tweet) => {


  let html = `<div class="redsquare-item">
      <div class="redsquare-item-profile">
          <img src="/redsquare/images/david.jpeg" />
      </div>
      <div class="redsquare-item-contents">
          <div class="redsquare-user">
              <div class="redsquare-user-details">
                  <p> trevelyan</p>
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

  if (typeof tweet.image != 'undefined' && tweet.image != "") {
      html  += `<div class="redsquare-image-container">
              <img src="/redsquare/images/nice-car.jpg" />
          </div>`;
  }

  html += `
      </div>
  </div>`;

  return html;
}