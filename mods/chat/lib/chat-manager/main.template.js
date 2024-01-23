module.exports = ChatManagerTemplate = (manager_self) => {
	return `
  <div class="chat-manager">
    <div id="chat-manager-header" class="chat-manager-header">
      <div class="chat-manager-title" title="Recent Chats and Secure Contacts">
        <h5>Chats</h5>
      </div>
      <div class="close-chat-manager">
        <img class="saito-header-logo" alt="Logo" src="/saito/img/logo.svg">
        <i class="fa-solid fa-arrow-left"></i>
      </div>
      <div class="chat-manager-options"><i class="fa-solid fa-ellipsis"></i></div>
      <div class="alternate-close-button"><i class="fa-solid fa-xmark"></i></div>
    </div>
    <div class="chat-manager-list hide-scrollbar${
	manager_self.mod.browser_active ? '' : ' saito-sidebar-element'
}">
    </div>
  </div>`;
};
