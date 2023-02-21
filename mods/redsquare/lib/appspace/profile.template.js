module.exports = () => {

   return `
      <div class="redsquare-profile">
        <div class="redsquare-appspace-header">
          <div class="redsquare-actions-buttons">
            <div class="redsquare-actions-buttons-icon"></div>
            <div id="redsquare-page-header-title" class="redsquare-page-header-title">🟥 RED SQUARE</div>
            <div class="redsquare-actions-container"></div>
          </div>
        </div>
        <div class="redsquare-appspace-body">

          <h6>Wallet</h6>
          <div class="settings-appspace-user-details">
            <div class="saito-black">Email:</div>
            <div>${email_registered}</div>
            <div id="register-identifier-btn-label" class="saito-black">Username:</div>
            <div>${identifier_registered}</div>
            <div class="saito-black">Public Key:</div>
            <div class="saito-address">${app.wallet.returnPublicKey()} <span style="margin-left: .5rem;" class="copy-public-key">  <i class="fas fa-copy"></i></span></div>
            <div class="saito-black">Private Key:</div>
            <div class="settings-appspace-privatekey saito-password">
              ${app.wallet.returnPrivateKey()}
              <i class="settings-appspace-see-privatekey fas fa-eye" id="settings-appspace-see-privatekey"></i>
            </div>
          </div>

	  <div class="redsquare-profile-tweets"></div>

        </div>
      </div>
  `;

}

