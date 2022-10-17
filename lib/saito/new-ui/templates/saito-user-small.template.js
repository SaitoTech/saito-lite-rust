
module.exports = SaitoUserTemplate = (app, mod, publickey = "", userline = "", timestamp = 0) => {


  let imgsrc = '/saito/img/no-profile.png';

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keys.returnIdenticon(publickey);
  }

  let time = "";

  if (timestamp){
    let x = app.browser.formatDate(timestamp);
    time = x.hours + ":" + x.minutes;
  }


  return `

    <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
      <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
      <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${app.keys.returnIdentifierByPublicKey(publickey, true)}</div>
      <div class="saito-userline" data-id="${publickey}">${userline}</div>
      ${time && `<div class="saito-userline-timestamp">${time}</div>`}
    </div>
   
  `;

}

