

module.exports = (app, mod) => {
     console.log(app, mod);

     const preferred_crypto = app.wallet.returnPreferredCrypto();
     let publicKey = preferred_crypto.returnAddress();
     const keyss = app.keys.keys;
     console.log("key ", keyss);
     let stun = "";
     let html = ``;
     for (let i = 0; i < app.keys.keys.length; i++) {
          let tk = app.keys.keys[i];
          if (tk.publickey === publicKey) {
            console.log("public key ", tk.publickey, publicKey)
               stun = app.keys.keys[i].data.stun;

          } else {
            
            //    html += ` <div class="stun-information-container peer">
            //    <div class="stun-info">
            //      <p class="stun-info-name">Public key:</p>
            //      <p class="stun-info-data">${app.keys.keys[i].publickey}</p>
            //    </div>
            //    <div class="stun-info">
            //      <p class="stun-info-name">IP Address:</p>
            //      <p class="stun-info-data">${app.keys.keys[i].data?.stun?.ip_address}</p>
            //    </div>
            //    <div class="stun-info">
            //      <p class="stun-info-name">PORT:</p>
            //      <p class="stun-info-data">${app.keys.keys[i].data?.stun?.port}</p>
            //    </div>
            //    <div class="stun-info">
            //      <p class="stun-info-name">SDP Offer:</p>
            //      <p class="stun-info-data offer">${app.keys.keys[i].data?.stun?.offer_sdp}</p>
            //    </div>
            //  </div>`;
          }
     }

     console.log("html ", html);

     // if (!stun?.ip_address || !stun?.port || !stun?.offer_sdp) return;
     return `
     <div class="stun-ui-container">
     <h1 class="heading">Stun Dev Center</h1>

     <h5 class="my-heading">My Stun Information</h5>
     <div class="stun-information-container">
       <div class="stun-info">
         <p class="stun-info-name">IP Address:</p>
         <p class="stun-info-data">${stun?.ip_address || ""}</p>
       </div>
       <div class="stun-info">
         <p class="stun-info-name">PORT:</p>
         <p class="stun-info-data">${stun?.port || ""}</p>
       </div>
       <div class="stun-info">
         <p class="stun-info-name">SDP Offer:</p>
         <p class="stun-info-data offer">${JSON.stringify(stun?.offer_sdp || "")}</p>
         <button class="generate" id="generate">Generate Offer</button>
       </div>
       <div class="stun-info">
         <p class="stun-info-name">Update Keychain for:</p>
         <input class="stun-info-data offer" id="input_address" />
         <button class="generate" id="update">Update</button>
       </div>
       <div class="stun-info">
         <p class="stun-info-name">Create Answer:</p>
         <textarea cols="15" rows="20" class="stun-info-data offer">
         </textarea>
       </div>
     </div>

     <h5 class="my-heading">Peer Stun Information</h5>
     <div class="stun-information-peer-container">
          ${html}
     </div>
   </div>`;


}