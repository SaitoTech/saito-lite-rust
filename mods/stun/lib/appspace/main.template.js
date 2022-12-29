module.exports = StunAppspaceTemplate = () => {

    return `
      <div class="stun-appspace"> 

        <card class="appear stunx-appspace-card">

          <div class="saito-page-header-title"> Saito Video <span class="saito-badge">α</span></div>

          <p>  Use Saito to start a peer-to-peer video chat!</p>

          <div class="stunx-appspace-actions">
            <div class="stunx-appspace-create">
              <div class="saito-button-secondary" id="createInvite"> Create Invite</div>
            </div>
            <div class="stunx-appspace-join">
              <div class="saito-button-secondary" id="joinInvite">Join</div>
              <input type="text" placeholder="Insert Room Code" id="inviteCode" />
            </div>
          </div>

          <div class="my-stun-cointainer-info">
            <i class="fas fa-info-circle"></i>
            <span class="saito-info-text">Saito uses the blockchain to negotiate peer-to-peer connections. Please note that connections can be more unstable and take longer to negotiate if you are on a mobile network or behind an aggressive firewall. </span>
          </div>
        </card>
      </div>

    `;

}

