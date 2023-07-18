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

  let html = `
      <div class="${class_name} chat-popup" id="chat-popup-${group.id}">

        <div class="chat-header" id="chat-header-${group.id}">
          <i  class="far fa-comment-dots chat-minimizer-icon"></i>
          <div id="chat-group-${
            group.id
          }" class="chat-group active-chat-tab saito-address" data-id="${group.name}">${
    group.name
  }</div>
          <i id="chat-container-close" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">
          <div id="load-older-chats" class="saito-chat-button" data-id="${group.id}">fetch earlier messages</div>
          ${mod.returnChatBody(group.id)}
        </div>

        <div class="chat-footer">
          <i class="fa-regular fa-paper-plane chat-input-submit" id="chat-input-submit"></i>
        </div>

      </div>
  `;

  return html;
};
