module.exports = (app, obj = {}) => {

  return `
   <div class="saito-modal saito-modal-user-menu" id="saito-user-menu">
   <div class="saito-modal-content">
     <div id="create-invite-now" class="saito-modal-menu-option" data-user-challenged=""><i class="fas fa-check"></i><div>play game now</div></div>
     <div id="create-specific-date" class="saito-modal-menu-option"><i class="fas fa-calendar"></i><div>pick a future date/time</div></div>
   </div>
 </div>
  
   `
};
