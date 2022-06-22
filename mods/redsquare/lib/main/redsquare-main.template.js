
module.exports = (app, mod) => {

  return `


    
      <div class="saito-sidebar left">
       <div class="hamburger">
        <i id='icon' class="fas fa-bars"></i>
       </div>
        <div class="section">
          <div>
            <h5> Menu </h5>
          </div>
          <div>
            <div class="saito-menu-list dense ">
              <ul>
                <li>
                  <i class="fas fa-home"></i>
                  <span> Home </span>
                </li>
                <li>
                  <i class="fas fa-calendar"></i>
                  <span> Events</span>
                </li>
                <li>
                  <i class="far fa-id-card"></i>
                  <span> Invites</span>
                </li>
                <li>
                  <i class="fas fa-user"></i>
                  <span> Profile</span>
                </li>
                <li>
                  <i class="fas fa-gamepad"></i>
                  <span> Games</span>
                </li>
                <li>
                  <i class="fas fa-address-book"></i>
                  <span>Contacts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>


        <div class="section">
          <div>
            <h5> Chat </h5>
            <i class="fas fa-ellipsis-v"></i>
          </div>
          <div class="">
            <div class="saito-item-list dense saito-white-background  ">
              <div>
                <img src="/saito/img/background.png" />
                <div class="item-info">
                  <p>Saito Community Chat </p>
                  <span> new chat</span>
                </div>

              </div>
              <div class="saito-user ">
                <img src="/saito/img/background.png" />
                <div class="item-info">
                  <p>Saito Community Chat</p>
                  <span>new chat</span>
                </div>


              </div>

            </div>
          </div>
        </div>




      </div>

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
