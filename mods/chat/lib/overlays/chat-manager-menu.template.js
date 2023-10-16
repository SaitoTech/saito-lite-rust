module.exports = ChatManagerMenuTemplate = (app, mod) => {
  let html = `<div class="chat-manager-menu">`;

  if ("Notification" in window) {
    if (Notification?.permission === "granted" && mod.enable_notifications) {
      html += `<div class="toggle-notifications" title="enable notifications"><i class="fa-solid fa-bell"></i><span>Mute Notifications</span></div>`;
    } else {
      html += `<div class="toggle-notifications" title="enable notifications"><i class="fa-solid fa-bell-slash"></i><span>Enable Notifications</span></div>`;
    }
  }

  html += `
      <div class="refresh-contacts" title="refresh contacts"><i class="fa-solid fa-rotate-right"></i><span>Check Online Status</span></div>
      <div class="add-contacts" title="create new chat group"><i class="fa-solid fa-plus"></i><span>Create New Group</span></div>
      <div class="notice">Right click any group to edit it</div>
    </div>`;

  return html;
};
