const SaitoModule = require('./../../../../lib/saito/new-ui/templates/saito-module.template');
const SaitoModuleIntroTemplate = require('./../../../../lib/saito/new-ui/templates/saito-module-intro.template');

module.exports = AppstoreAppDetailsTemplate = (app, mod, module) => {

  var unixtime = new Date(module.unixtime);

  let html = `
    <div class="saito-module-box">
  `;

   html += SaitoModuleTemplate(app, mod, "", module.name, module.description );

  html += `

    <div class="appstore-appbox-details">
      <div class="saito-table">
        <div class="saito-table-row odd">
	  <div>date</div>
	  <div>${unixtime.toUTCString()}</div>
        </div>
        <div class="saito-table-row">
	  <div>publisher</div>
	  <div>${module.publickey}</div>
        </div>
        <div class="saito-table-row odd">
	  <div>version</div>
	  <div>${module.version}</div>
        </div>
        <div class="saito-table-row">
	  <div>block hash</div>
	  <div>${module.bsh}</div>
        </div>
      </div>
    </div>

    <button id="appstore-install-confirm-button" class="appstore-install-confirm-button saito-button-primary">confirm install</button>
  
  `;


  return html;

}
