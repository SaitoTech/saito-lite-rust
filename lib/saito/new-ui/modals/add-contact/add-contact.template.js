module.exports = ModalAddContactTemplate = () => {

  return `  
    <div class="saito-modal-add-contact">
      <div class="saito-modal-title">Invite Friends</div>
      <div class="saito-modal-content">
        <div style="margin:1em 0">How would you like to add a contact to Saito:</div>
        <div style="">
          <div class="welcome-invite-box address-link-box"><i class="fas fa-key"></i><div>Add by Saito address</div></div>
          <div class="welcome-invite-box scanqr-link-box"><i class="fas fa-qrcode"></i><div>Scan QR Code</div></div>
          <div class="welcome-invite-box generate-link-box"><i class="fas fa-link"></i><div>Share Bundle</div></div>
        </div>
      </div>
    </div>
  `;

}

