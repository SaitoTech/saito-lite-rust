module.exports = SaitoModuleOverlayTemplate = (app, mod, invite, action) => {

  if (!invite){
    return dummyHTML();  
  }

  let module_obj = app.modules.returnModule(invite.msg.game);
  if (!module_obj){
    return dummyHTML();
  }

  let name = module_obj.gamename || module_obj.name;
  let image = module_obj.respondTo("arcade-games")?.img || `/${module_obj.returnSlug()}/img/arcade.jpg`;

  let html = `
    <div class="saito-module-overlay-box">
      <div class="saito-module-overlay-img" style="background-image: url(${image});"></div>
      <div class="saito-module-overlay-info-box">
         <h5>${name}</h5>
      <div id="saito-module-overlay-info-table" class="saito-leaderboard saito-module-overlay-info-table">
        <div class="saito-table">
          ${formatOptions(module_obj.returnShortGameOptionsArray(invite.msg.options))}
        </div>
    `;
          if (invite.msg.originator !== app.wallet.returnPublicKey()){
            html += `<div class="saito-button-primary saito-module-overlay-btn ${action}" data-cmd="${action}">${action.charAt(0).toUpperCase() + action.slice(1)}</div>`;
          }
    html += ` 
      </div>`;

    html += `
      </div>
    </div>`;

    return html;
}

const formatOptions = (sgoa)=> {
  let html = '';
  let cnt = 1;

  for (let i in sgoa) {
    html += `<div class="saito-table-row ${(cnt%2 == 1)? "odd":""}">
                <div class="saito-table-gamename">${i.replace(/_/g, ' ')}</div>`;
    if (sgoa[i] !== null){
      html += `<div class="saito-table-rank">${sgoa[i]}</div>`;
    }
    html += "</div>";
  }

  return html;
}