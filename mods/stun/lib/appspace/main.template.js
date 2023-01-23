module.exports = StunAppspaceTemplate = () => {

  return `
      <div class="stun-appspace"> 

        <card class="appear stunx-appspace-card">

          <div class="saito-page-header-title"> Saito Video <span class="saito-badge">α</span></div>

          <p>Provide Room Code, or <span class="stun-host-your-own">host your own peer-to-peer video chat!</span></p>

          <div class="stunx-appspace-actions">
            <div class="stunx-appspace-join">
             <input type="text" placeholder="enter code" id="inviteCode" />
            </div>
            <div class="stunx-appspace-create">
              <div class="saito-button-primary" id="joinInvite">Join</div>
            </div>
          </div>

          <div class="my-stun-container-info">
            <i class="fas fa-info-circle"></i>
            <span class="saito-info-text">Saito uses the blockchain to negotiate the peer-to-peer connections used for video chat. Please note that connections can take longer to negotiate if you are on a mobile network or behind an aggressive firewall.</span>
          </div>
        </card>
      </div>

    `;

}

