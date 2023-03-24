module.exports = ChatTeaser = (app, publickey = "", userline = "", timestamp = 0, id = "", alert = 0) => {

  id = (id) ? id : publickey;

  let time = "";

  if (timestamp) {
    let x = app.browser.formatDate(timestamp);
    time = x.hours + ":" + x.minutes;
  }

  let imgsrc = (publickey) ? app.keychain.returnIdenticon(publickey) : '/saito/img/no-profile.png';

  return `
  <div class="saito-user" id="saito-user-${id}" data-id="${id}">
  <div class="saito-identicon-box">
    <img class="saito-identicon" src="${imgsrc}">
    ${alert > 0 ? `<div class="saito-notification-counter">${alert}</div>` : ""}
  </div>
  <div class="saito-address saito-address-long" data-id="${publickey}">${publickey}</div>
  <div class="saito-userline">${userline}</div>
  ${time && `<div class="saito-datetime">${time}</div>`}
  </div>
  `;

}

