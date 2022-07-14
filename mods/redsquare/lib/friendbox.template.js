
module.exports = (app, mod, i) => {

  return `
    <div class="saito-userbox">
      <div class="saito-identicon">${app.keys.returnIdenticon(app.keys.keys[i].publickey)}</div>
      <div class="saito-publickey">${app.keys.keys[i].publickey}</div>
      <div class="saito-username">${app.keys.returnUsername(app.keys.keys[i].publickey)}</div>
      <div class="">no shared secret</div>
    </div>

  `;

}

