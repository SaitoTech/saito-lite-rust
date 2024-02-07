module.exports = (app, mod, chat_group) => {
	let html = `
   <div class="saito-modal saito-modal-menu" id="saito-chat-menu">
    <div class="saito-modal-title">${chat_group.name}</div>
     <div class="saito-modal-content">
      <div id="rename" class="saito-modal-menu-option"><i class="fas fa-user-edit"></i><div>Rename</div></div>`;

    if (chat_group?.muted){
		html += `<div id="unmute" class="saito-modal-menu-option"><i class="fa-solid fa-volume"></i><div>Unmute</div></div>`;	
    }else{
    	html += `<div id="mute" class="saito-modal-menu-option"><i class="fa-solid fa-volume-xmark"></i><div>Mute</div></div>`;	
    }
    html += `<div id="delete" class="saito-modal-menu-option"><i class="fas fa-trash-alt"></i><div>Clear History</div></div>
      `;

      if (chat_group.id !== mod.communityGroup.id){
      	if (chat_group.members.length == 2){
      		html += `<div id="block" class="saito-modal-menu-option"><i class="fas fa-ban"></i><div>Delete and Block</div></div>`;	
      	}else{
      		html += `<div id="leave" class="saito-modal-menu-option"><i class="fa-solid fa-door-open"></i><div>Leave Group</div></div>`;	
      	}
      	
      }

	if (chat_group.member_ids) {
		if (chat_group.member_ids[mod.publicKey] == 'admin') {
			html += `<div id="invite" class="saito-modal-menu-option"><i class="fa-solid fa-user-plus"></i><div>Add Member</div></div>`;
		}

		html += `</div>`;
		html += `<div class="saito-modal-content">`;

		for (let publickey in chat_group.member_ids) {
			let imgsrc = app.crypto.isPublicKey(publickey)
				? app.keychain.returnIdenticon(publickey)
				: '';
			let name = app.keychain.returnIdentifierByPublicKey(
				publickey,
				true
			);
			if (name == publickey) {
				name = 'Anonymous User';
			}

			let unconfirmed_tag = '';
			//
			//only display for admin
			//
			if (chat_group.member_ids[mod.publicKey] == 'admin') {
				if (!chat_group.member_ids[publickey]) {
					unconfirmed_tag = ' unconfirmed';
				}
			}
			html += `<div class="saito-contact${unconfirmed_tag}" data-id="${publickey}">`;

			html += `<div class="saito-user">
                <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}">${
	chat_group.member_ids[publickey] == 'admin'
		? `<i class="saito-overlaid-icon fa-solid fa-dragon"></i>`
		: ''
}</div>
                  ${name}
                <div class="saito-userline">${publickey}</div>
                ${
	chat_group.member_ids[mod.publicKey] == 'admin' ||
					publickey === mod.publicKey
		? `<div class="remove_user saito-user-fourth-elem-large" data-id="${publickey}"><i class="fa-solid fa-user-minus"></i></div>`
		: '<div></div>'
}
              </div>
            </div>`;
		}
		html += '</div>';
	}

	html += '</div>';

	return html;
};
