
module.exports = SaitoUserWithTimeTemplate = (app, mod, publickey="", userline="", timestamp="", id="") => {


  if (id == "") { id = publickey; }
  let time = "3:46";
  if (timestamp != "") { time = timestamp; }
  let imgsrc = '/saito/img/no-profile.png';

  if (publickey !== "") {
    imgsrc = app.keys.returnIdenticon(publickey);
  }



  return `
    <div class="saito-user saito-user-${id}" id="saito-user-${id}" data-id="${id}">
      <div class="saito-identicon-container">
        <img class="saito-identicon square" src="${imgsrc}">
      </div>
      <div class="saito-username saito-username-long">${publickey}</div>
      <div class="saito-userline">${userline}</div>
      <div class="saito-datetime">${time}</div>
    </div>
  `;

}

