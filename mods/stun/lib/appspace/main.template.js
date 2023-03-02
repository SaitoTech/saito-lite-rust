module.exports = StunAppspaceTemplate = () => {

  return `
      <div class="stun-appspace"> 

        <card class="appear stunx-appspace-card">

          <div class="saito-page-header-title"> Saito Video <span class="saito-badge">α</span></div>

          <p>Saito lets you host your own peer-to-peer video chat!</p>

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
      </div>

    `;

}

