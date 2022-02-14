module.exports = EmailSidebarTemplate = () => {
  return `
  <div id="email-sidebar" class="email-sidebar">
    <div id="email-controls" class="email-controls">
      <div class="email-bars-menu">
        <ul class="email-navigator" id="email-navigator">
          <li class="email-navigator-item active-navigator-item active" id="welcome-nav-inbox">welcome</li>
        </ul>
        <ul class="email-apps" id="email-apps"></ul>
      </div>
    </div>
    <div id="email-chat" class="email-chat">
    </div>
  </div>
  `;
}
