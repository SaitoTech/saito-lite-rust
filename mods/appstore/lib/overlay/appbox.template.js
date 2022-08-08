const SaitoModuleInstallTemplate = require("./../../../../lib/saito/new-ui/templates/saito-module-install.template");


module.exports = AppBoxTemplate = (app, mod, approw) => {

  let base64msg = app.crypto.stringToBase64(JSON.stringify({ name : approw.name , description : approw.description , unixtime : approw.unixtime , publickey : approw.publickey , version : approw.version , bsh : approw.bsh , bid : approw.bid }));
  let appimg = '/saito/img/dreamscape.png';
  if (approw.image != "") { appimg = approw.image; }
  

  let html = `

    <div class="appstore-appbox" id="${base64msg}">

      ${SaitoModuleInstallTemplate(app, mod, approw.name , appimg, 0)}

    </div>

  `;

  return html;

}


