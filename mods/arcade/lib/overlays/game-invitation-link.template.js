module.exports = (app, mod, data) => {

    let invite_link = data.invite_link || "";
    let game = data.game || "";

    return `
      <div class="arcade-private-link-overlay saito-modal saito-modal-add-contact">
         <div class="saito-modal-title">Invite Link for ${game}</div>
         <div class="saito-modal-content">
           <div id="copy-invite-link" class="saito-modal-menu-option" data-link='${invite_link}'><i class="fas fa-link"></i><div>Copy ${mod.name} Link</div></div>
         </div>
      </div>
    `;
}
