
module.exports = (app, mod, chat_popup_id) => {

    return `

  <div class="chat-container chat-popup-${chat_popup_id}" id="chat-popup-${chat_popup_id}">
      <div>
          <h6>Community Chat</h6>
          <i id="chat-container-close-${chat_popup_id}" class="chat-container-close fas fa-times"></i>
      </div>
      <div>
          <div class="chat-dialog">
              <div class="saito-list  saito-white-background  ">
                  <div class="saito-list-chatbox">
                      <div class="saito-list-user-image-box">
                          <img class="saito-identicon" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-username">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                          <p> Hey how are you?</p>
                      </div>
                      <div class="saito-list-user-timestamp">
                          22:00pm
                      </div>
                  </div>
                  <div class="saito-list-chatbox">
                      <div class="saito-list-user-image-box">
                          <img class="saito-identicon" src="/saito/img/background.png" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-username">t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                          <p> Hey how are you?</p>
                      </div>
                      <div class="saito-list-user-timestamp">
                          22:00pm
                      </div>
                  </div>
                  <div class="saito-list-chatbox">
                      <div>
                          <img src="/saito/img/background.png" />
                      </div>
                      <div>
                          <div>t4gEMWsDjZ4xeYGn2gCGxFg8ty53rs7UQKUpwfvsBq33 </div>
                          <p> Hey how are you?</p>
                      </div>
                      <div>
                          22:00pm
                      </div>
                  </div>

              </div>
          </div>
      </div>
      <div>
          <input type="text" placeholder="Type message" />
          <i id="saito-sendmsg-btn" class="fas fa-paper-plane"></i>
      </div>
  </div>

  `;

}


