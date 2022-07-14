
module.exports = (app, mod) => {

  return `  
  <div class="welcome-modal-wrapper">
    <div class="welcome-modal-action">
      <div class="welcome-modal-left">
        <div class="welcome-modal-header">Create Video Chat</h1></div>
        <div class="welcome-modal-main">
          <div style="margin:1em 0">How would you like to add participants?</div>
          <div style="">
            <div class="welcome-invite-box address-link-box"><i class="fas fa-key"></i><div>Add by Saito address</div></div>
            <div class="welcome-invite-box scanqr-link-box"><i class="fas fa-qrcode"></i><div>Scan QR Code</div></div>
            <div class="welcome-invite-box generate-link-box"><i class="fas fa-link"></i><div>Share Invite</div></div>
          </div>
          <div class="welcome-modal-info">
            <div style="margin-top:20px" class="welcome-modal-explanation">
              <div class="tip">
                <div><b>What happens when I create a video chat with someone? <i class="fas fa-info-circle"></i></b></div>
                <div class="tiptext">Your browser will use Saito to create a direct peer-to-peer connection with your counterparty and then open a video chat with them.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

}

