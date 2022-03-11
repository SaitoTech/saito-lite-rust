module.exports = ChatBoxTemplate = (group) => {
  return `
      <div data-id="${group.id}" id="chat-box-${group.id}" class="chat-box">
	       <div id="chat-box-header-${group.id}" class="chat-box-header">
            <div class="chat-box-header-title">${group.name}</div>
            <div class="chat-box-close" id="chat-box-close-${group.id}">&#x2715</div>
	       </div>
	       <div id="chat-box-main-${group.id}" class="chat-box-main"></div>
	       <div id="chat-box-input-${group.id}" class="chat-box-input">
            <textarea class="chat-box-new-message-input" id="chat-box-new-message-input-${group.id}" rows="1" cols="40"></textarea>
            <div class="chat-room-submit-button" id="chat-room-submit-button-${group.id}"><i class="icon-small fas fa-arrow-circle-right"></i></div>
         </div>
      </div>
  `;
}
