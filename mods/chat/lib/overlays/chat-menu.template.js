module.exports = (chat_group) => {

  return `
   <div class="saito-modal saito-modal-menu" id="saito-chat-menu">
    <div class="saito-modal-title">${chat_group.name}</div>
     <div class="saito-modal-content">
      <div id="rename" class="saito-modal-menu-option"><i class="fas fa-user-edit"></i><div>Rename</div></div>
      <div id="delete" class="saito-modal-menu-option"><i class="fas fa-trash-alt"></i><div>Delete</div></div>
     </div>
   </div>
  
   `
};
