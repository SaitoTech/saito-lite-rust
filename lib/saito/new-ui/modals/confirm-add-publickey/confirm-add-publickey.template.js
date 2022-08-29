module.exports = (app, mod, identiconUri, publickey, status) => {

  let contactStatus = ``;
  if (status == 0) {
    contactStatus += 
        `<div class="saito-button-primary" id="saito-add-key-btn" data-id="${publickey}">Add Contact</div>`;  
  } else {
    contactStatus += 
        `<h5 class="saito-contact-status">Exists in contacts</h5>`;
  }

  let html =  `

    <div id='saito-confirm-add-pubkey'>
      <div class="saito-identicon-box">
        <img class="saito-identicon" src="${identiconUri}">
      </div>
    
      <div class="saito-address">${publickey}</div>
      <input id="add-publickey-input" type="hidden" value="${publickey}">
      ${contactStatus}
    </div>     

  `;

  return html;

}

