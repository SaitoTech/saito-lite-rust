
module.exports = SaitoUserTemplate = (app, mod, publickey = "", userline = "") => {

  let imgsrc = '/saito/img/no-profile.png';
  let txn_class = ``;
  let txn_data_id = ``;

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keys.returnIdenticon(publickey);
  }

  if (txn != null) {
    txn_class = `saito-user-`+txn.transaction.sig;
    txn_data_id = `data-txn-id='`+txn.transaction.sig+`'`;
  }

  return `

    <div class="saito-user saito-user-${publickey} ${txn_class}" id="saito-user-${publickey}" ${txn_data_id}  data-id="${publickey}">
      <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
      <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${publickey}</div>
      <div class="saito-userline" data-id="${publickey}">${userline}</div>
    </div>
  `;

}

