module.exports = ChatManagerTemplate = (app, mod) => {

  return `
  <div class="chat-manager hide-scrollbar">
    <div class="chat-manager-header">
      <div class="close-chat-manager mobile-overlay-only"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="chat-manager-options"><i class="fa-solid fa-ellipsis"></i></div>
    </div>
    <div class="chat-manager-list">
    </div>
  </div>`;

}
