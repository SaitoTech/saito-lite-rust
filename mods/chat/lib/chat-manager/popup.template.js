
module.exports = (app, mod, group) => {

    if (!group) { return ""; }
    if (!group.name) { group.name = ""; }
    
    let html = `

      <div class="chat-container" id="chat-container">

        <div class="chat-header" id="chat-header">
          <i id="chat-container-minimize" class="far fa-comment-dots"></i>
          <div class="chat-group-tabs">
            <div id="chat-group-${group.id}" class="chat-group active-chat-tab">${group.name}</div>
          </div>
          <i id="chat-container-close" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">${mod.returnChatBody(group.id)}</div>

        <div class="chat-footer">
        
        <textarea name="chat-input" class="chat-input" id="chat-input" type="text" value="" autocomplete="off" placeholder="Type something..." cols="5" wrap="soft"></textarea>
          
          <i class="fas fa-paper-plane chat-input-submit" id="chat-input-submit"></i>
        </div>

      </div>

  `;

  return html;

}


