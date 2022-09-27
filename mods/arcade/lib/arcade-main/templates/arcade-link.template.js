module.exports = (app, mod, data) => {
    let invite_link = data.invite_link || "";
    let game = data.game || "";

    return `
      <div class="arcade--private-link-overlay saito-modal saito-modal-add-contact">
         <div class="saito-modal-title">Invite Friend to Game</div>
         <div class="saito-modal-content">
           <div id="copy-invite-link" class="saito-modal-option" data-link='${invite_link}'><i class="fas fa-link"></i><div>Copy Game Link</div></div>
         </div>
      </div>
    `;
}

/* data-text="Play this game with me" data-url="https://saito.io/arcade" */