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
      console.log("public key ", tk.publickey, publicKey);
      stun = app.keys.keys[i].data.stun;

    } else {



      html += `<div class="card">
             <div class="card-header" id="headingOne">
               <h5 class="mb-0">
                 <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                 ${app.keys.keys[i].publickey}
                 </button>
               </h5>
             </div>
           
             <div id="collapseOne" class= " p-4 collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
               <div class="row mb-4">
                 <div class="col-sm-4"><p class="name">IP Address:</p></div>
                 <div class="col-sm-8"><p class="data">${app.keys.keys[i].data?.stun?.ip_address}</p></div>
               </div>
               <div class="row mb-4">
                 <div class="col-sm-4"><p class="name">PORT:</p></div>
                 <div class="col-sm-8"><p class="data">${app.keys.keys[i].data?.stun?.port}</p></div>
               </div>
               <div class="row mb-4">
                 <div class="col-sm-4"><p class="name">SDP Offer:</p></div>
                 <div style="position: relative" class="col-sm-8">
                   <p class="data offer p-2">
                ${JSON.stringify(app.keys.keys[i].data?.stun?.offer_sdp)}
                   </p>
                   
                 </div>
               </div>
             </div>
           </div>`
    }
  }

  console.log("html ", html);



  return `  <div class="appear peer-container accordion" id="accordionExample">
        ${html}  </div>`;
}