module.exports = (app, obj = {}) => {

  return `
   <div class="saito-modal saito-modal-menu" id="saito-user-menu">
   <div class="saito-modal-title">When do you want to play?</div>
   <div class="saito-modal-content">
     <div id="create-invite-now" class="saito-modal-menu-option"><i class="fas fa-key"></i><div>create game now</div></div>
     <div id="create-specific-date" class="saito-modal-menu-option"><i class="fas fa-qrcode"></i><div>pick a future date/time</div></div>
<!---     <div id="create-negotiate-date" class="saito-modal-menu-option"><i class="fas fa-link"></i><div>negotiate a future date/time</div></div>  --->
   </div>
 </div>
  
   `
};
