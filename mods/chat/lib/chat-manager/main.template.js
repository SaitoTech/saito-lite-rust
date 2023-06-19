module.exports = ChatManagerTemplate = (app, mod) => {

  return `
  <div class="chat-manager hide-scrollbar">
    <div class="chat-manager-header">
      <div class="refresh-contacts"><i class="fa-solid fa-rotate-right"></i></div>
      <div class="add-contacts"><i class="fa-solid fa-plus"></i></div>
    </div>
    <div class="saito-list saito-white-background chat-manager-list">
    </div>
  </div>`;

}
