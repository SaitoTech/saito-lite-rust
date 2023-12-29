module.exports = StunLaunchTemplate = (app, mod) => {
   let html = `
      <div class="stun-appspace"> 
        <div class="stun-appspace-content">
          <card class="appear stunx-appspace-splash">
            <div class="saito-page-header-title">Saito Video</div>
              <div>peer-to-peer video chat</div>
            <div class="stunx-appspace-actions">`;
              
  if (mod.room_obj){
    html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createRoom" data-id="${mod.room_obj?.room_code}">Join Meeting</div>`;
  }else{
    html += `<div class="saito-button-primary stunx-appspace-launch-call-btn" id="createRoom">Start Meeting</div>`;
  }            
            
  html +=   `</div>
            <div class="my-stun-container-info">
              <i class="fas fa-info-circle"></i>
              <span class="saito-info-text">Blockchain-mediated peer-to-peer connections can take longer to negotiate if you are on a mobile network or behind an aggressive firewall.</span>
            </div>
          </card>
          <card class="stun-appspace-settings">
          </card>
        </div>
        <div class="stun-appspace-navigation">
          <div>
            <div><a href="/redsquare"><i class="fa-solid fa-square"></i><span>RedSquare</span></a></div>
          </div>
          <div>
            <div><a href="/arcade"><i class="fas fa-gamepad"></i><span>Arcade</span></a></div>
          </div>
        </div>
      </div>

    `;

  return html;
};
