

module.exports = (app, mod) => {

     return `
     <div class="stun-container">
     <div class="stun-container__bar container">
       <button id="my-stun-btn" data-id="my-stun" class="menu button-active">
         My Stun
       </button>
       <button id="listeners-btn" data-id="listeners" class="menu">
         Listeners
       </button>
       <button id="peer-stun-btn" data-id="peer-stun" class="menu">
         Peer Stun
       </button>
     </div>

     <div id="stun-information" class="stun-information container">
     
       </div>
     </div>`;


}