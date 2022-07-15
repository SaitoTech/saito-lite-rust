const SaitoUserWithControlsTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = RedSquareNotificationsAppspaceTemplate = (app, mod) => {

  return `

  <div class="invites-appspace">
  <div class="invites-appspace-item-list">
  <div class="invites-appspace-item">
    <div class="invites-appspace-user-container">
      ${SaitoUserWithControlsTemplate(app, mod, "hYGdpuzFvuHQWpYSn9bd4JG85RY5dTa4jrG8XTv")}
    </div>
    <div class="invites-appspace-item-contents-container">
      <div class="invites-appspace-event">
        <div class="invites-appspace-invite" id="invites-appspace-invite">
    
          <span class=" invites-appspace-advancedoption-button"></span>
          <div class="invites-appspace-section">
            <div class="invites-appspace-header">
              <h6>
                WORDBLOCKS
              </h6>
              <div class="invites-appspace-date"> 7 July 2022 </div>
            </div>
            <p> 
            Wordblocks is a word game in which two to four players score points by placing TILES bearing a single letter onto a board divided into a grid of squares. The tiles must form words that, in crossword fashion, read left to right in rows or downward in columns, and be included in a standard dictionary or lexicon
            </p>
          </div>
          <div class="invites-appspace-section">
            <div class="saito-list horizontal">
              <div class="saito-list-user">
                <div class="saito-list-user-image-box">
                  <img class="saito-idenitcon" src="/saito/img/david.jpeg" />
                </div>
                <div class="saito-list-user-content-box">
                  <div class="saito-username">david@saito.io</div>
                  <p> <span class="saito-green-color">ACCEPTED </span>
                  </p>
                </div>
              </div>
              <div class="saito-list-user invites-appspace-empty-slot">
                <div class="saito-list-user-image-box">
                  <img class="saito-idenitcon" src="/saito/img/no-profile.png" />
                </div>
                <div class="saito-list-user-content-box">
                  <div class="saito-username">Click to join</div>
                  <p> OPEN</p>
                </div>
              </div>
              <div class="saito-list-user invites-appspace-empty-slot">
                <div class="saito-list-user-image-box">
                  <img class="saito-idenitcon" src="/saito/img/no-profile.png" />
                </div>
                <div class="saito-list-user-content-box">
                  <div class="saito-username">Click to join</div>
                  <p> OPEN</p>
                </div>
              </div>
              <div class="saito-list-user">
                <div class="saito-list-user-image-box">
                  <img class="saito-idenitcon" src="/saito/img/richard.jpeg" />
                </div>
                <div class="saito-list-user-content-box">
                  <div class="saito-username">Richard Parris</div>
                  <p class="saito-secondary-color"> PENDING</p>
                </div>
              </div>
            </div>
          </div>
          <div class="invites-appspace-section ">
            <div>
              <p class="invites-appspace-advanced-options">advanced options</p>
            </div>
          </div>
        </div>
        <div class="invites-appspace-actions">
          <div class="saito-button-secondary">Join</div>
        </div>
      </div>
    </div>

  </div>
  </div>
  </div>

  <div class="saito-overlay  close-overlay">
  <div class="saito-backdrop">
    <div>
      <div class="invites-appspace-create-container" id="invites-appspace-invite">
        <div class="">
          <div class="invites-appspace-create-date"> 7 July 2022 </div>

          <div class="invites-appspace-create-section ">
            <div>
              <i class="fas fa-user-friends invites-appspace-create-section-icon"></i>
            </div>
            <div>
              <select class="saito-new-select">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>
          </div>
          <div class="invites-appspace-create-section">
            <div class="invites-appspace-icon">
              <i class="fas fa-circle"></i>
            </div>
            <div class="invites-appspace-create-header">
              <h6>
                WORDBLOCKS
              </h6>
              <p> 
               Click to add description
              </p>
            </div>
          </div>
          <div class="invites-appspace-create-section">
            <div>
              <i class="fas fa-user-plus invites-appspace-create-section-icon"></i>
            </div>
            <div class="saito-list horizontal">
              <div class="saito-list-user">
                <div class="saito-list-user-image-box">
                  <img class="saito-idenitcon" src="/saito/img/david.jpeg" />
                </div>
                <div class="saito-list-user-content-box">
                  <div class="saito-username">david@saito.io</div>
                  <p> <span class="saito-green-color">Online </span>
                  </p>
                </div>
              </div>
              <div class="saito-list-user invites-appspace-empty-slot">
                <div class="saito-list-user-image-box">
                  <img class="saito-idenitcon" src="/saito/img/no-profile.png" />
                </div>
                <div class="saito-list-user-content-box">
                  <div class="saito-username">Click to add</div>
                  <p> OPEN</p>
                </div>
              </div>
            </div>
          </div>
          <div class=" invites-appspace-create-advancedoption-button">advanced options</div>
          <div class="invites-appspace-create-actions"> 
          <div class="saito-button-secondary">Create</div>
          </div>
        </div>
      </div>
      <div class="saito-overlay-actions">
   
      </div>
    </div>
  </div>
</div>



</div>

  `;

}






