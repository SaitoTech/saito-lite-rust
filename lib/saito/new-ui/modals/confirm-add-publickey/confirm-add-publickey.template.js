module.exports = (app, mod, identiconUri, publickey) => {

  return `

    <div id='saito-confirm-add-pubkey'>
      <div class="saito-identicon-box">
        <img class="saito-identicon" src="${identiconUri}">
      </div>
    
      <div class="saito-address">${publickey}</div>
      <input id="add-publickey-input" type="hidden" value="${publickey}">
      <div class="saito-button-primary" id="saito-add-key-btn" data-id="${publickey}">Add Contact</div>
    </div>     

  `;

}

