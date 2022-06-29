
module.exports = (app, mod) => {

  return `


      <div class="saito-main email-appspace">

        <div id="redsquare-input-container">
          <div class="redsquare-input-profile">
            <img src="/redsquare/images/david.jpeg" />
          </div>
          <div class="">
            <textarea placeholder="What's happening"></textarea>
          </div>
          <button> Tweet </button>
        </div>
        <div id="redsquare-list">
          <div class="redsquare-item">
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
                <p> Saito x Tesla . A sneak peak of the conversation between David Lancashire and Elon Musk</p>
              </div>
              <div class="redsquare-image-container">
                <img src="/redsquare/images/nice-car.jpg" />
              </div>
            </div>
          </div>
 
          <div class="redsquare-item">
            <div class="redsquare-item-profile">
              <img src="/redsquare/images/richard.jpeg" />
            </div>
            <div class="redsquare-item-contents">
              <div class="redsquare-user">
                <div class="redsquare-user-details">
                  <p> arpee</p>
                 <i class="fas fa-certificate"></i>
                </div>

                <div class="redsquare-user-actions">
                <i class="fab fa-rocketchat"></i>
                <i class="fas fa-user-friends"></i>
                </div>

              </div>
              <div class="redsquare-text-container">
                <p> Saito is the future!</p>
              </div>
              <div class="redsquare-image-container">
                <img src="/redsquare/images/field.jpg" />
              </div>
            </div>
          </div>
        </div>
     

        <div class="chat-container">
        <div>
          <h6>Community Chat</h6>
          <i id="chat-container-close" class="fas fa-times"></i>
        </div>
        <div>
          <div class="chat-dialog">
            <div class="chat-bubble">
              <img src="/saito/img/background.png" />
              <div>
                <p class="saito-small-p"> dLadj1dXEDAfDaYtz1idaf3DZTAvA3eKGSRdSZo3WgQ11E</p>
                <p class="saito-small-p"> Hi</p>
              </div>
              <p class="saito-small-p">22.23</p>
            </div>
            <div class="chat-bubble">
              <img src="/saito/img/background.png" />
              <div>
                <p class="saito-small-p"> gLWj1XEDAfDaYtz1ifpf3DZTAvA3eKGSRdSZo3WgQ11E</p>
                <p class="saito-small-p"> Hey</p>
              </div>
              <p class="saito-small-p">22.23</p>
            </div>
          </div>
        </div>
        <div>
          <input type="text" placeholder="Type message" />
          <i id="saito-sendmsg-btn" class="fas fa-paper-plane"></i>
        </div>
      </div>

      </div>



  


  `;

}
