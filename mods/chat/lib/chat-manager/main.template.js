module.exports = ChatManagerTemplate = (app, mod) => {

  return `
  <div class="chat-manager hide-scrollbar">
    <div class="chat-manager-header">
      <div class="close-chat-manager mobile-overlay-only"><i class="fa-solid fa-arrow-left"></i></div>
      ${("Notification" in window) ? `<div class="toggle-notifications" title="enable notifications"><i class="fa-solid fa-bell-slash"></i></div>` : ""}
      <div class="refresh-contacts" title="refresh contacts"><i class="fa-solid fa-rotate-right"></i></div>
      <div class="add-contacts" title="create new chat group"><i class="fa-solid fa-plus"></i></div>
    </div>
    <div class="chat-manager-list">
    </div>
  </div>`;

}
