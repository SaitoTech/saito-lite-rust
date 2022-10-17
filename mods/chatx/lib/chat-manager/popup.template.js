
module.exports = (app, mod, group_id = "") => {

    let group = mod.returnGroup(group_id);
    if (!group) { return ""; }
    if (!group.name) { group.name = ""; }

    
    let html = `

      <div class="chat-container" id="chat-container-${group_id}">

        <div class="chat-header" id="chat-header-${group_id}">
          <i id="chat-container-minimize-${group_id}" class="far fa-comment-dots"></i>
          <h6>${group.name}</h6>
          <i id="chat-container-close-${group_id}" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">${mod.returnChatBody(group_id)}</div>

        <div class="chat-footer">
    
          <input name="chat-input" class="chat-input chat-input-${group_id}" id="chat-input-${group_id}" type="text" value="" autocomplete="off" placeholder="Type something..." />

          <i class="fas fa-paper-plane chat-input-submit" id="chat-input-submit-${group_id}"></i>
        </div>

      </div>

  `;

  return html;

}


