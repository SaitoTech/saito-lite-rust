module.exports = (data) => {

    let game = data.name || data.game;
    
    return `
      <div class="saito-modal saito-modal-share-link">
         <div class="saito-modal-content">
           <div id="copy-invite-link" class="saito-modal-menu-option"><i class="fas fa-link"></i><div>Copy ${game} Invitation Link</div></div>
         </div>
      </div>
    `;
}
