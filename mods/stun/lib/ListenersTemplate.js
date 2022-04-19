module.exports = (app, mod) => {

    const  stun_self = app.modules.returnModule('Stun');
    const preferred_crypto = app.wallet.returnPreferredCrypto();
    let publicKey = preferred_crypto.returnAddress();
    let key_index = app.keys.keys.findIndex(key => key.publickey === publicKey)
    let listenersHtml= "";
    const listeners = app.keys.keys[key_index].data?.stun?.listeners;
        if(listeners){
            listenersHtml = listeners.map(listener => ` <li class="list-group-item">${listener}</li>` ).join('');
            console.log(listeners, listenersHtml);
        }else {
            listenersHtml = "<p> There are no listeners";
        }
   


    return  ` <div class="appear listeners-container">
    <label class="" for="listeners-input"
      >Input Keys (Insert Keys separated by a comma)</label
    >
    <div class="input-container">
      <textarea id="listeners-input" class="p-2" rows="4" cols="20"></textarea>
      <button id="add-to-listeners-btn" class="btn btn-primary">
        Add To Listeners
      </button>
    </div>
    <ul class="list-group">
      ${listenersHtml}
    </ul>
    </div>`;
}