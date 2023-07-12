module.exports = (app, chat_group) => {

  let html = `
   <div class="saito-modal saito-modal-menu" id="saito-chat-menu">
    <div class="saito-modal-title">${chat_group.name}</div>
     <div class="saito-modal-content">
      <div id="rename" class="saito-modal-menu-option"><i class="fas fa-user-edit"></i><div>Rename</div></div>
      <div id="delete" class="saito-modal-menu-option"><i class="fas fa-trash-alt"></i><div>Delete</div></div>
     </div>`;

  if (chat_group.members.length > 2) {
    html += `<div class="saito-modal-content">`;

    for (let publickey of chat_group.members){

      let imgsrc = (app.crypto.isPublicKey(publickey)) ? app.keychain.returnIdenticon(publickey) : "";
      let name = app.keychain.returnIdentifierByPublicKey(publickey, true);
      if (name == publickey) { 
        name = "Anonymous User";
      }

      html += `<div class="saito-contact" data-id="${publickey}">`;

      html += `<div class="saito-user">
                <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
                  ${name}
                <div class="saito-userline">${publickey}</div>
              </div>
            </div>`;
    }
  }

   html += "</div>";

   return html;
};
