module.exports = (app, contacts) => {

  let html = `<div id="saito-contacts-modal" class="saito-modal contacts">
                <div class="saito-modal-title">Contacts</div>
                <div class="saito-modal-content saito-contacts-list">
              `;
  let keys = app.keychain.returnKeys();

  for (let i = 0; i < keys.length; i++) {
    if (keys[i].aes_publicKey) {
      let publicKey = keys[i].publicKey;
      let imgsrc = (app.crypto.isPublicKey(publicKey)) ? app.keychain.returnIdenticon(publicKey) : "";
      let name = app.keychain.returnIdentifierByPublicKey(publicKey, true);
      if (name == publicKey) { 
        name = "Anonymous User";
      }

      html += `<div class="saito-contact" data-id="${publicKey}">`;

      if (contacts.multi_select){
        html += `<input type="checkbox" data-id="${publicKey}"/>`;
      }

      html += `<div class="saito-user">
                <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
                  ${name}
                <div class="saito-userline">${publicKey}</div>
              </div>
            </div>`;
    }
  }

  html += "</div>";

  if (contacts.multi_select){
    html += `<button id="saito-contact-submit" class="saito-button-primary" type="button">Create Group</button>`;
  }
  html += "</div>";      

    return html;
}
