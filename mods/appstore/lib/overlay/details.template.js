const SaitoModuleIntroTemplate = require('./../../../../lib/saito/new-ui/templates/saito-module-intro.template');

module.exports = AppstoreAppDetailsTemplate = (app, mod, module) => {

  var unixtime = new Date(module.unixtime);

  let html = `

    <div class="appstore-overlay-header">
      <div class="appstore-overlay-header-title">
        Install Module?
      </div>
    </div>

    ${SaitoModuleIntroTemplate(app, mod)} 

  `;
    //${SaitoModuleIntroTemplate(app, mod, "", module.name, module.description)} 

  html += `

    <div class="appstore-appbox-version">${module.version}</div>
    <div class="appstore-appbox-publisher">${module.publickey}</div>
    <div class="appstore-appbox-datetime">${unixtime.toUTCString()}</div>
    <div class="appstore-appbox-blockchain">
      <div class="appstore-appbox-blockchain-hash">${module.bsh}</div>
      <div class="appstore-appbox-blockchain-block-id">${module.bid}</div>
    </div>

    <button id="appstore-install-confirm-button" class="appstore-install-confirm-button saito-button-primary">confirm</button>
  
  `;


  return html;

}
