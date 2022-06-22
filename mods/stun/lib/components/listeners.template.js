module.exports = (app, mod) => {

  const stun_self = app.modules.returnModule('Stun');
  const preferred_crypto = app.wallet.returnPreferredCrypto();
  let publicKey = preferred_crypto.returnAddress();
  let key_index = app.keys.keys.findIndex(key => key.publickey === publicKey)
  let listenersHtml = "";
  const listeners = app.keys.keys[key_index].data?.stun?.listeners;
  if (listeners) {
    listenersHtml = listeners.map(listener => ` <li class="list-group-item">${listener}</li>`).join('');
    console.log(listeners, listenersHtml);
  } else {
    listenersHtml = "<p> There are no listeners";
  }



  return ` <div class="appear listeners-container">
   
    <ul id="stun-listeners" class="list-group">
        ${listenersHtml}
    </ul>
    </div>`;
}