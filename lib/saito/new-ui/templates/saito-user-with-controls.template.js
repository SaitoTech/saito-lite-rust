
module.exports = SaitoUserWithControlsTemplate = (app, mod, publickey="", userline="") => {


  let imgsrc = '/saito/img/no-profile.png';

  if (publickey !== "") {
    imgsrc = app.keys.returnIdenticon(publickey);
  }


  return `
    <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
      <div class="saito-identicon-container">
        <img class="saito-identicon" src="${imgsrc}">
      </div>
      <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${app.keys.returnIdentifierByPublickey(publickey, true)}</div>
      <div class="saito-userline">posted on 3:46 PM - July 7, 2022</div>
      <div class="saito-controls">
        <i class="fas fa-solid fa-ellipsis-h"></i>
      </div>
    </div>
  `;

}

