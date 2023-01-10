module.exports = (app, mod, link) => {

    return `
      <div class="arcade-private-link-overlay saito-modal saito-modal-add-contact">
         <div class="saito-modal-content">
           <div id="copy-invite-link" class="saito-modal-menu-option" data-link='${link}'><i class="fas fa-link"></i><div>Copy League Invitation Link</div></div>
         </div>
      </div>
    `;
}
