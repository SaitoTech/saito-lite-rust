module.exports = ModalAddContactTemplate = () => {

  return `  
    <div class="saito-modal saito-modal-add-contact">
      <div class="saito-modal-title">Provide Saito Address</div>
      <div class="saito-modal-content">
        <input class="saito-modal-text-input" id="add-publickey-input" type="text" placeholder="david@saito">
        <div id="add-publickey-button" class="saito-modal-button saito-button-secondary">add</button>
      </div>
    </div>
  `;

}

