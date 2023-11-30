module.exports = ChatManagerTemplate = (app, mod) => {

  return `
  <div class="chat-manager">
    <div class="chat-manager-header">
      <div class="chat-manager-title">
        <h5>Chats</h5>
      </div>
      <div class="close-chat-manager">
        <img class="saito-header-logo" alt="Logo" src="/saito/img/logo.svg">
        <i class="fa-solid fa-arrow-left"></i>
      </div>
      <div class="chat-manager-options"><i class="fa-solid fa-ellipsis"></i></div>
    </div>
    <div class="chat-manager-list hide-scrollbar${mod.browser_active ? "" : " saito-sidebar-element"}">
    </div>
  </div>`;

}
