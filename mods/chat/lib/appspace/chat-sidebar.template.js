module.exports = ChatSideTemplate = (app, mod, group) => {
	if (!group) {
		return '';
	}

	let groupKey = group.id;
	let groupName = group.name;
	let identicon = app.keychain.returnIdenticon(groupKey, 'png');

	if (group.members.length > 2) {
		// Multiparty Group
	} else if (group.id == mod.communityGroup.id) {
		// Community Chat
		groupKey = "";
	} else {
		// 1-1 chat
		for (let member of group.members) {
			if (member !== mod.publicKey) {
				groupKey = member;
			}
		}

		groupName = app.keychain.returnIdentifierByPublicKey(groupKey);
		if (!groupName) {
			groupName = 'Anonymous Account';
		}
		identicon = app.keychain.returnIdenticon(groupKey, 'png');
	}

	//return `</div>`;

	let html = `
	<div id="chat-sidebar" class="chat-sidebar">
    	<div class="saito-profile">
   
      		<div class="saito-profile-cover"></div>
      
      		<div class="saito-profile-options-row">
        		<img class="saito-profile-identicon" src="${identicon}">
        		<div class="saito-profile-icons">${groupName}</div>
      		</div>
     		<div class="saito-profile-info">
      			<div class="saito-username">${groupKey}</div>
      		</div>
      	</div>
    </div>`;

	return html;
};
