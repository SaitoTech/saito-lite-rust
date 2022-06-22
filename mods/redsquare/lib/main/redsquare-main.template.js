
module.exports = (app, mod) => {

  return `

      <div class="saito-main">

        <div id="chirp-input-container">
          <div class="chirp-input-profile">
            <img src="/redsquare/images/david.jpeg" />
          </div>
          <div class="">
            <textarea placeholder="What's happening"></textarea>
          </div>
          <button> Tweet </button>
        </div>
        <div id="chirp-list">
          <div class="chirp-item">
            <div class="chirp-item-profile">
              <img src="/redsquare/images/david.jpeg" />
            </div>
            <div class="chirp-item-contents">
              <div class="chirp-user">
                <div class="chirp-user-details">
                  <p> trevelyan</p>
                 <i class="fas fa-certificate"></i>
                </div>

                <div class="chirp-user-actions">
                <i class="fab fa-rocketchat"></i>
                <i class="fas fa-user-friends"></i>
                </div>

              </div>
              <div class="chirp-text-container">
                <p> Saito x Tesla . A sneak peak of the conversation between David Lancashire and Elon Musk</p>
              </div>
              <div class="chirp-image-container">
                <img src="/redsquare/images/nice-car.jpg" />
              </div>
            </div>
          </div>

          <div class="chirp-item">
            <div class="chirp-item-profile">
              <img src="/redsquare/images/richard.jpeg" />
            </div>
            <div class="chirp-item-contents">
              <div class="chirp-user">
                <div class="chirp-user-details">
                  <p> arpee</p>
                 <i class="fas fa-certificate"></i>
                </div>

                <div class="chirp-user-actions">
                <i class="fab fa-rocketchat"></i>
                <i class="fas fa-user-friends"></i>
                </div>

              </div>
              <div class="chirp-text-container">
                <p> Saito is the future!</p>
              </div>
              <div class="chirp-image-container">
                <img src="/redsquare/images/field.jpg" />
              </div>
            </div>
          </div>
        </div>
      </div>



      <div class="saito-sidebar right">
          <div class="saito-search-bar">
            <i class="fas fa-search"></i> <input type="text" placeholder="Search on Saito" />
          </div>
          <div class="saito-calendar-small"></div>

      </div>


  `;

}
