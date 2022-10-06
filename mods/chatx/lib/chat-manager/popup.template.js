const JSON = require('json-bigint');

module.exports = (app, mod, group_id) => {

    let group = mod.returnGroup(group_id);
    if (!group) { return ""; }
    if (!group.name) { group.name = ""; }

    
    let html = `

      <div class="chat-container chat-container-${group_id}" id="chat-container-${group_id}">

        <div class="chat-header" id="chat-header-${group_id}">
          <i class="far fa-comment-dots"></i>
          <h6>${group.name}</h6>
          <i id="chat-container-close-${group_id}" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body chat-body-${group_id}">
    `;

    html += mod.returnChatBody(group_id);

    html += `

        </div>

        <div class="chat-footer">
          <input name="chat-input" class="chat-input chat-input-${group_id}" id="chat-input-${group_id}" type="text" value="" autocomplete="off" placeholder="Type something..." />
          <i class="fas fa-paper-plane chat-input-submit" id="chat-input-submit-${group_id}"></i>
        </div>

      </div>

  `;

  return html;

}


