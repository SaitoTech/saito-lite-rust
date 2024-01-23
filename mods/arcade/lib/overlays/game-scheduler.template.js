module.exports = (app, tx = {}) => {
	let publickey = tx.msg.options.desired_opponent_publickey;
	let imgsrc = '';

	if (app.crypto.isPublicKey(publickey)) {
		imgsrc = app.keychain.returnIdenticon(publickey);
	}

	let user = `<div class="saito-user saito-user-${publickey}" data-id="${publickey}" data-disable="true">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    ${app.browser.returnAddressHTML(publickey)}
    <div class="saito-userline" data-id="${publickey}">${
	tx.msg.options.game
} Invitation</div>
  </div>`;

	return `
   <div class="saito-modal saito-modal-menu saito-scheduler-modal" id="saito-user-menu">
   <div class="saito-modal-title">${user}</div>
   <div class="saito-modal-content">
     <div id="create-invite-now" class="saito-modal-menu-option" data-user-challenged=""><i class="fas fa-check"></i><div>play game now</div></div>
     <div id="create-specific-date" class="saito-modal-menu-option disabled-option"><i class="fas fa-calendar"></i><div>pick a future date/time</div></div>
   </div>
 </div>
  
   `;
};
