module.exports = RedSquareGamesSidebarTemplate = (app, mod) => {

  return `

<div class="saito-sidebar right">
  
  <div class="redsquare-sidebar-calendar">
  </div>

  <div class="settings-appspace-versions-container">
    <h6> Version </h6>
    <div class="settings-appspace-versions">
      <p class="saito-black">Code Version:</p>
      <p>${app.wallet.wallet.version}</p>
      <p class="saito-black">Wallet Version:</p>
      <p>${app.options.wallet.version}</p>
    </div>
  </div>

  <div class="settings-appspace-icons-container">
    <h6> Help </h6>
    <div class="settings-appspace-icons"  style="padding-bottom:40px;">
    <div><a target="_blank" href="https://discord.gg/HjTFh9Tfec"><i class="fab fa-discord"></i></a></div>
    <div class="saito-black">Discord</div>

    <div> <a target="_blank" href="https://t.me/SaitoIO"><i class="fab fa-telegram"></i></a></div>
    <div class="saito-black">Telegram</div>

     <div> <a target="_blank" href="https://github.com/SaitoTech"> <i class="fab fa-github"></i></a></div>
    <div class="saito-black">Github</div>    
  </div>


  `;


}

