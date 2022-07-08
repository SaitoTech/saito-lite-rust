module.exports = InvitesAppspaceTemplate = (app, mod) => {

  return `
  <div class="saito-main">
  <h3>Invitations:</h3> 
  <div class="invites-appspace">
  <div>
  <div class="invites-appspace-event">
      <div class="invites-appspace-invite" id="invites-appspace-invite">
          <div class="invites-appspace-date"> 7 July 2022 </div>
          <!-- <p class="invites-appspace-additional-info" data-target="#invites-appspace-invite">
              <i class="fas fa-chevron-circle-down"></i>
          </p> -->
          <span class=" invites-appspace-advancedoption-button"></span>
          <div class="invites-appspace-section">
              <div class="invites-appspace-icon">
                  <i class="fas fa-circle"></i>
              </div>
              <div class="invites-appspace-header">
                  <h6>
                      WORDBLOCKS
                  </h6>
              </div>
          </div>
          <div class="invites-appspace-section">
              <div>
                  <i class="fas fa-user-plus invites-appspace-section-icon"></i>
              </div>
              <div class="saito-list horizontal">
                  <div class="saito-list-user">
                      <div class="saito-list-user-image-box">
                          <img class="saito-idenitcon" src="/saito/img/david.jpeg" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-username">david@saito.io</div>
                          <p>status: <span class="saito-green-color">Accepted </span>
                          </p>
                      </div>
                  </div>
                  <div class="saito-list-user">
                      <div class="saito-list-user-image-box">
                          <img class="saito-idenitcon" src="/saito/img/richard.jpeg" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-username">Richard Parris</div>
                          <p>status: PENDING</p>
                      </div>
                  </div>
              </div>
          </div>
          <div class="invites-appspace-section ">
              <div>
                  <i class="fas fa-paperclip invites-appspace-section-icon"></i>
              </div>
              <div>
                  <p class="invites-appspace-link">Link</p>
              </div>
          </div>
      </div>
      <div class="invites-appspace-actions">
          <div class="saito-button-secondary">Accept</div>
      </div>
  </div>
  <div class="invites-appspace-event">
      <div class="invites-appspace-invite" id="invites-appspace-invite">
          <div class="invites-appspace-date"> 7 July 2022 </div>
          <!-- <p class="invites-appspace-additional-info" data-target="#invites-appspace-invite">
              <i class="fas fa-chevron-circle-down"></i>
          </p> -->
          <span class=" invites-appspace-advancedoption-button"></span>
          <div class="invites-appspace-section">
              <div class="invites-appspace-icon">
                  <i class="fas fa-circle"></i>
              </div>
              <div class="invites-appspace-header">
                  <h6>
                      VIDEO CALL
                  </h6>
              </div>
          </div>
          <div class="invites-appspace-section">
              <div>
                  <i class="fas fa-user-plus invites-appspace-section-icon"></i>
              </div>
              <div class="saito-list horizontal">
                  <div class="saito-list-user">
                      <div class="saito-list-user-image-box">
                          <img class="saito-idenitcon" src="/saito/img/david.jpeg" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-username">david@saito.io</div>
                          <p>status: <span class="saito-green-color">Online </span>
                          </p>
                      </div>
                  </div>
                  <div class="saito-list-user">
                      <div class="saito-list-user-image-box">
                          <img class="saito-idenitcon" src="/saito/img/richard.jpeg" />
                      </div>
                      <div class="saito-list-user-content-box">
                          <div class="saito-username">Richard Parris</div>
                          <p>status: PENDING</p>
                      </div>
                  </div>
              </div>
          </div>
          <div class="invites-appspace-section ">
              <div>
                  <i class="fas fa-paperclip invites-appspace-section-icon"></i>
              </div>
              <div>
                  <p class="invites-appspace-link"> Link</p>
              </div>
          </div>
      </div>
      <div class="invites-appspace-actions">
          <div class="saito-button-secondary">Accept</div>
      </div>
  </div>
</div>
<div class="">
  <button class="invites-appspace-create-invite">Create Invite</button>
</div>
        <div class="saito-overlay  close-overlay">
          <div class="saito-backdrop">
            <!-- <i class="close-overlay fas fa-times"> </i> -->
            <div>
              <div class="invites-appspace-create">
                <div class="invites-appspace-invite" id="invites-appspace-invite">
                  <div class="invites-appspace-date"> 7 July 2022 </div>
                 
                  <span class=" invites-appspace-advancedoption-button">advanced options</span>
                  <div class="invites-appspace-section">
                    <div class="invites-appspace-icon">
                      <i class="fas fa-circle"></i>
                    </div>
                    <div class="invites-appspace-header">
                      <h6>
                        WORDBLOCKS
                      </h6>
                    </div>
                  </div>
                  <div class="invites-appspace-section">
                    <div>
                      <i class="fas fa-user-plus invites-appspace-section-icon"></i>
                    </div>
                    <div class="saito-list horizontal">
                      <div class="saito-list-user">
                        <div class="saito-list-user-image-box">
                          <img class="saito-idenitcon"  src="/saito/img/background.png" />
                        </div>
                        <div class="saito-list-user-content-box">
                          <div class="saito-username">david@saito.io</div>
                          <p>status: <span class="saito-green-color">Online </span>
                          </p>
                        </div>
                      </div>
                      <div class="saito-list-user invites-appspace-adduser-box">
                        <i class="fas fa-plus-circle"></i>
                      </div>
                    </div>
                  </div>
                  <div class="invites-appspace-section ">
                    <div>
                      <i class="fas fa-user-friends invites-appspace-section-icon"></i>
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
                  <div class="invites-appspace-section ">
                    <div>
                      <i class="fas fa-paperclip invites-appspace-section-icon"></i>
                    </div>
                    <div>
                      <input placeholder="Additional Info" type="text" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="saito-overlay-actions">
                <div class="saito-button-secondary">Create</div>
              </div>
            </div>
          </div>
        </div>
        <div class="invites-json-tree" id="invites-json-tree">
          <ul class="jsontree_tree clearfix">
            <li class="jsontree_node jsontree_node_complex jsontree_node_expanded jsontree_node_empty">
            </li>
          </ul>
        </div>
        <p></p>
        <div class="invites" id="invites"></div>
        <p></p>
      </div>
</div>
  `;

}


{/* <p class="invites-appspace-additional-info" data-target="#invites-appspace-invite"><i
class="fas fa-chevron-circle-down"></i></p> */}