module.exports = (app, mod, group, isStatic = false) => {
  if (!group) {
    return "";
  }
  if (!group.name) {
    group.name = "";
  }

  let class_name = "chat-container";

  if (isStatic) {
     class_name = "chat-static";
  }

  let is_encrypted = `<i class="far fa-comment-dots chat-minimizer-icon"></i>`;

  if (group.members.length == 2) {
    for (let member of group.members) {
      if (member !== mod.publicKey) {
        if (app.keychain.hasSharedSecret(member)) {
          is_encrypted = `<i class="fa-solid fa-lock chat-minimizer-icon"></i>`;
        }
      }
    }
  }

  let html = `
       <div class="${class_name} chat-popup" id="chat-popup-${group.id}">

          <div class="chat-header" id="chat-header-${group.id}">

            ${is_encrypted}
            <div id="chat-group-${group.id}" class="chat-group active-chat-tab saito-address" data-id="${group.name}" data-disable="true">${
      group.name
    }</div>
            <i id="chat-container-close" class="chat-container-close fas fa-times"></i>
          </div>

          <div class="chat-body">
            <div id="load-older-chats" class="saito-chat-button" data-id="${
              group.id
            }">fetch earlier messages</div>
            ${mod.returnChatBody(group.id)}
          </div>

          <div class="chat-footer">
            <i class="fa-regular fa-paper-plane chat-input-submit" id="chat-input-submit"></i>
          </div>

      </div>
  `;

  return html;
};
