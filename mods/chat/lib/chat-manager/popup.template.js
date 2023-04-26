
module.exports = (app, mod, group) => {

  if (!group) { return ""; }
  if (!group.name) { group.name = ""; }

  let html = `
      <div class="chat-container chat-popup chat-popup-${group.id}" id="chat-popup-${group.id}">

        <div class="chat-header" id="chat-header-${group.id}">
          <i  class="far fa-comment-dots"></i>
          <div id="chat-group-${group.id}" class="chat-group active-chat-tab saito-address" data-id="${group.name}">${group.name}</div>
          <i id="chat-container-close" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">${mod.returnChatBody(group.id)}</div>

        <div class="chat-footer">
          <div name="chat-input" class="chat-input" id="chat-input-${group.id}" type="text" value="" autocomplete="off" placeholder="Type something..." contenteditable="true"></div>
          <i class="fas fa-paper-plane chat-input-submit" id="chat-input-submit"></i>
        </div>

      </div>
  `;

  return html;

}


