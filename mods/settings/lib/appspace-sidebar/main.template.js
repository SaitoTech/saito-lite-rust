module.exports = SettingsAppspaceSidebarTemplate = (app, mod) => {

  return `
  <div class="settings-appspace-sidebar">
    <div class="settings-appspace-versions-container">
    <h6>Version</h6>
    <div class="settings-appspace-versions">
      <p>Code Version:</p>
      <p>${app.wallet.wallet.version}</p>
      <p>Wallet Version:</p>
      <p>${app.options.wallet.version}</p>
    </div>
  </div>
  <div class="settings-appspace-icons-container">
    <h6>Help</h6>
    <div class="settings-appspace-icons">
      <div>
        <a target="_blank" href="https://discord.gg/HjTFh9Tfec">
          <i class="fab fa-discord"></i>
          <span>Discord</span>
        </a>
      </div>
      <div>
        <a target="_blank" href="https://t.me/SaitoIO">
          <i class="fab fa-telegram"></i>
          <span>Telegram</span>
        </a>
      </div>
      <div>
        <a target="_blank" href="https://github.com/SaitoTech">
          <i class="fab fa-github"></i>
          <span>Github</span>
        </a>
      </div>
      <div>
        <a target="_blank" href="mailto:community@saito.tech">
          <i class="fas fa-envelope"></i>
          <span>help@saito.tech</span>
        </a>
      </div>
      <div class="settings-sidebar-nuke">
        <i class="fas fa-bomb"></i>
        <span>Nuke Wallet</span>
      </div>
    </div>
  </div>
</div>
  `;

}

