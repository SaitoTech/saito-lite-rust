module.exports = StunLaunchTemplate = () => {

  return `
      <div class="stun-appspace"> 
        <div class="stun-appspace-content">
          <card class="appear stunx-appspace-splash">
            <div class="saito-page-header-title">Saito Video</div>
              <p>peer-to-peer video chat</p>
            <div class="stunx-appspace-actions">
              <div class="stunx-appspace-create">
                <div class="saito-button-primary" id="createRoom">Start Call</div>
              </div>
            </div>
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

}

