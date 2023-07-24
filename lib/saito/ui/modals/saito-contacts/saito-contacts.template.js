module.exports = async (app, contacts) => {

  let html = `<div id="saito-contacts-modal" class="saito-modal contacts">
                <div class="saito-modal-title">Contacts</div>
                <div class="saito-modal-content saito-contacts-list">
              `;
  let keys = await app.keychain.returnKeys();

  for (let i = 0; i < keys.length; i++) {
    if (keys[i].aes_publickey) {
      let publickey = keys[i].publickey;
      let imgsrc = (app.crypto.isPublicKey(publickey)) ? app.keychain.returnIdenticon(publickey) : "";
      let name = app.keychain.returnIdentifierByPublicKey(publickey, true);
      if (name == publickey) { 
        name = "Anonymous User";
      }

      html += `<div class="saito-contact" data-id="${publickey}">`;

      if (contacts.multi_select){
        html += `<input type="checkbox" data-id="${publickey}"/>`;
      }

      html += `<div class="saito-user">
                <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
                  ${name}
                <div class="saito-userline">${publickey}</div>
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
