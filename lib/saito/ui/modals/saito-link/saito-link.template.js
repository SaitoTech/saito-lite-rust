module.exports = (app, link_self) => {
  let data = link_self.data;
	let game = data.name || data.game;

  let html = `
      <div class="saito-modal saito-modal-share-link">
         <div class="saito-modal-title">Share Options</div>
         <div class="saito-modal-content">
           <div id="copy-invite-link" class="saito-modal-menu-option"><i class="fas fa-link"></i><div>Copy ${game} Link</div></div>`;
  

  // Check if Chat / RedSquare installed
  if (link_self.share_to_chat){
    let chat_mod = app.modules.returnModuleBySlug("chat");
    if (chat_mod?.communityGroupName){
      html += `<div id="chat-invite-link" class="saito-modal-menu-option"><i class="fas fa-comments"></i><div>Share Link in ${chat_mod.communityGroupName}</div></div>`;
    }  
  }

  if (link_self.share_to_redsquare){
    let rs_mod = app.modules.returnModuleBySlug("redsquare");
    if (rs_mod){
     html += `<div id="tweet-invite-link" class="saito-modal-menu-option"><i class="${rs_mod.icon_fa}"></i><div>Tweet to ${rs_mod.returnName()}</div></div>`; 
    }
  }

  if (link_self.share_to_qr){
    html += `<div id="qr-invite-link" class="saito-modal-menu-option"><i class="fa-solid fa-qrcode"></i><div>Generate QR code</div></div>`; 
  }
	
  html += `</div>
      </div>
    `;

  return html;
};
