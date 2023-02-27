module.exports = SettingsAppspaceSidebarTemplate = (app, mod) => {

  return `
  <div class="settings-appspace-sidebar">
    <div class="settings-appspace-versions-container">
    <h6>Version</h6>
    <div class="settings-appspace-versions">
      <p class="saito-black">Code Version:</p>
      <p>${app.wallet.wallet.version}</p>
      <p class="saito-black">Wallet Version:</p>
      <p>${app.options.wallet.version}</p>
    </div>
  </div>
  <div class="settings-appspace-icons-container">
    <h6>Help</h6>
    <div class="settings-appspace-icons">
      <div>
        <a target="_blank" href="https://discord.gg/HjTFh9Tfec">
          <i class="fab fa-discord"></i>
          <span class="saito-black">Discord</span>
        </a>
      </div>
      <div>
        <a target="_blank" href="https://t.me/SaitoIO">
          <i class="fab fa-telegram"></i>
          <span class="saito-black">Telegram</span>
        </a>
      </div>
      <div>
        <a target="_blank" href="https://github.com/SaitoTech">
          <i class="fab fa-github"></i>
          <span class="saito-black">Github</span>
        </a>
      </div>
      <div>
        <a target="_blank" href="mailto:community@saito.tech">
          <i class="fas fa-envelope"></i>
          <span class="saito-black">help@saito.tech</span>
        </a>
      </div>
      <div class="settings-sidebar-nuke">
        <i class="fas fa-bomb"></i>
        <span class="saito-black">Nuke Wallet</span>
      </div>
    </div>
  </div>
</div>
  `;

}

