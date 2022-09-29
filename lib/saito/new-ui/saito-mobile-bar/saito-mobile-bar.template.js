module.exports = SaitoMobileBarTemplate = (app, mod, align) => {

    let html = `
    <div class="saito-mobile-bar">
      <div id="saito-mobile-toggle-left" class="saito-mobile-toggle-left">
        <i id="saito-mobile-toggle-left-icon" class="fas fa-angle-right"></i>
      </div>
      <div class="saito-action-buttons-mobile">
        <div id="saito-mobile-actions" class="saito-redsquare-actions-buttons-icon">
          <i id="saito-mobile-actions-icon" class="fas fa-plus"></i>
        </div>
      </div>
      <div id="chat-toggle" class="saito-mobile-toggle-chat">
        <i id="chat-icon" class="far fa-comment-alt"></i>
      </div>
      <div id="saito-mobile-toggle-right" class="saito-mobile-toggle-right">
        <i id="saito-mobile-toggle-right-icon" class="fas fa-angle-left"></i>
      </div>
    </div>
    `;
    return html;

}

