module.exports = (app, mod) => {

  let html = `
     <div class="stun-container">
     <div class="stun-container__bar container">
       <button id="my-stun-btn" data-id="my-stun" class="menu button-active">
         Connect
       </button>
     
     
     </div>

     <div id="stun-information" class="stun-information container">
     
       </div>
     </div>`;

  return html;
}