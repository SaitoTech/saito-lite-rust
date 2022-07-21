module.exports = (app, mod, key) => {
  let html = ``;

  html += `<div class="card">
             <div class="card-header" id="headingOne">
               <h5 class="mb-0">
                 <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                 ${key.publickey}
                 </button>
               </h5>
             </div>
           
             <div id="collapseOne" class= " p-4 collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
               <div class="row mb-4">
                 <div class="col-sm-4"><p class="name">IP Address:</p></div>
                 <div class="col-sm-8"><p class="data">${key.data?.stun?.ip_address}</p></div>
               </div>
               <div class="row mb-4">
                 <div class="col-sm-4"><p class="name">PORT:</p></div>
                 <div class="col-sm-8"><p class="data">${key.data?.stun?.port}</p></div>
               </div>
               <div class="row mb-4">
                 <div class="col-sm-4"><p class="name">SDP Offer:</p></div>
                 <div style="position: relative" class="col-sm-8">
                   <p class="data offer p-2">
                ${JSON.stringify(key.data?.stun?.offer_sdp)}
                   </p>
                   
                 </div>
               </div>
             </div>
           </div>`
  
  return `  <div class="appear peer-container accordion" id="accordionExample">
        ${html}  </div>`;
}