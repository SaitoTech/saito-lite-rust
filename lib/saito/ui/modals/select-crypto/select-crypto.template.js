module.exports = ModalSelectCryptoTemplate = (app, mod, cryptomod) => {

  return `  
    <div class="modal-select-crypto">
      ${cryptomod.renderModalSelectCrypto(app, mod, cryptomod)}
    </div>
  `;

}

