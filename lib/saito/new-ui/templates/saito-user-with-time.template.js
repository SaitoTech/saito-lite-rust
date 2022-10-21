
module.exports = SaitoUserWithTimeTemplate = (app, mod, publickey = "", userline = "", timestamp = 0, id = "", alert = 0) => {

  id = (id) ? id : publickey;

  let time = "3:46";

  if (timestamp) {
    let x = app.browser.formatDate(timestamp);
    time = x.hours + ":" + x.minutes;
  }

  let imgsrc = (publickey) ? app.keys.returnIdenticon(publickey) : '/saito/img/no-profile.png';


  return `
  <div class="saito-user" id="saito-user-${id}" data-id="${id}">
  <div class="saito-identicon-container">
    <img class="saito-identicon square" src="${imgsrc}">
    ${alert > 0 ? `<div class="saito-notification-counter">${alert}</div>` : ""}
  </div>
  <div class="saito-address saito-address-${publickey} saito-address-long" data-id="${publickey}">${publickey}</div>
  <div class="saito-userline">${userline}</div>
  <div class="saito-datetime">${time}</div>
  </div>
  `;

}

{/* <div class="saito-user" id="saito-user-${id}" data-id="${id}">
<div class="saito-identicon-container">
  <img class="saito-identicon square" src="${imgsrc}">
  ${alert > 0 ? `<div class="saito-notification-counter">${alert}</div>`: ""}
</div>
<div class="saito-address saito-address-${publickey} saito-address-long" data-id="${publickey}">${app.keys.returnIdentifierByPublicKey(publickey, true)}</div>
<div class="saito-userline">${userline}</div>
<div class="saito-datetime">${time}</div>
</div> */}