module.exports = ModalAddContactTemplate = () => {

  return `  
    <div class="saito-modal saito-modal-add-contact">
      <div class="saito-modal-title">Add Contact</div>
      <div class="saito-modal-content">
        <div id="add-by-address" class="saito-modal-menu-option"><i class="fas fa-key"></i><div>add by Saito address</div></div>
        <div id="add-by-qrcode" class="saito-modal-menu-option"><i class="fas fa-qrcode"></i><div>scan QR code</div></div>
        <div id="add-by-link" class="saito-modal-menu-option"><i class="fas fa-link"></i><div>share link</div></div>
      </div>
    </div>
  `;

}

