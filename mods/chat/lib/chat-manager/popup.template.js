
module.exports = (app, mod, chat_popup_id) => {

    return `

  <div class="chat-container chat-popup-${chat_popup_id}" id="chat-popup-${chat_popup_id}">
  <div class="chat-header">
  <i class="far fa-comment-dots"></i>
  <h6>Community Chat</h6>
  <i id="chat-container-close-${chat_popup_id}" class="chat-container-close fas fa-times"></i>
</div>
<div class="chat-body">
  <div class="chat-item other">
      <div class="chat-time">
          5:00am
      </div>
      <div class="chat-profile">
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
          <img src="/saito/img/background.png" />
      </div>
      <div class="chat-dialog">
          <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </div>
          <div>
              Here is a link to a game i just made
          </div>
          <div>
              Let's play a game
          </div>
      </div>
  </div>
  <div class="chat-item other">
      <div class="chat-time">
          5:00am
      </div>
      <div class="chat-profile">
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
          <img src="/saito/img/background.png" />
      </div>
      <div class="chat-dialog">
          <div>
              sure
          </div>
          <div>
              Let's hope on
          </div>

      </div>
  </div>
  <div class="chat-item me">
      <div class="chat-time">
          5:00am
      </div>
      <div class="chat-dialog">
          <div>
              Let's play a game
          </div>
          <div>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum do
          </div>

      </div>
  </div>

  <div class="chat-item other">
      <div class="chat-time">
          5:00am
      </div>
      <div class="chat-profile">
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
          <img src="/saito/img/background.png" />
      </div>
      <div class="chat-dialog">
          <div>
              lorem ipsum dolor
          </div>


      </div>
  </div>

  <div class="chat-item other">
      <div class="chat-time">
          5:00am
      </div>
      <div class="chat-profile">
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
          <img src="/saito/img/background.png" />
          <div class="chat-profile-dropdown">
              <div>
                  <i class="fas fa-globe"></i>
                  <p> Connect</p>
              </div>
              <div>
                  <i class="far fa-calendar"></i>
                  <p> Schedule Event</p>
              </div>
              <div>
                  <i class="fas fa-chess-board"></i>
                  <p> See Ranking</p>
              </div>
          </div>
      </div>
      <div class="chat-dialog">
          <div>
              sure
          </div>
          <div>
              Let's hope on
          </div>

      </div>
  </div>

</div>

<div class="chat-footer">
  <input type="text" placeholder="Type something..." />
  <i class="fas fa-paper-plane"></i>
</div>
  </div>

  `;

}





{/* <i id="chat-container-close-${chat_popup_id}" class="chat-container-close fas fa-times"></i> */ }