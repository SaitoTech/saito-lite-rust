module.exports = EmailSidebarTemplate = () => {
  return `
    <div id="email-controls" class="email-controls">
      <div class="email-bars-menu">
      </div>
      <div id="email-loader" class="email-loader">
        <div class="blockchain_synclabel">syncing blocks...</div>
        <div class="blockchain_syncbox">
          <div class="blockchain_syncbar" style="width: 100%;"></div>
        </div>
      </div>
      <div class="email-navigator-bars-menu">
        <div>
          <ul class="email-navigator" id="email-navigator">
            <li class="email-navigator-item active-navigator-item" id="email-nav-inbox">Inbox</li>
            <li class="email-navigator-item" id="email-nav-sent">Sent</li>
            <!--li class="email-navigator-item" id="email-nav-trash">Trash</li-->
          </ul>
        </div>
        <div>
          <ul class="email-apps" id="email-apps"></ul>
        </div>
      </div>
    </div>
    <div id="email-chat" class="email-chat">
    </div>
  `;
}
