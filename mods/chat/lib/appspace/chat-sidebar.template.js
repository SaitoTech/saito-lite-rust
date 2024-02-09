const MemberList = require("../overlays/member-list.template");

module.exports = ChatSideTemplate = (app, mod, group) => {
	if (!group) {
		return '';
	}

	let groupKey = group.id;
	let groupName = group.name;
	let identicon = app.keychain.returnIdenticon(groupKey, 'png');

	if (group.member_ids) {
		// Multiparty Group
		groupKey = "";
	} else if (group.id == mod.communityGroup?.id || group.name == mod.communityGroupName) {
		// Community Chat
		// If the peerservices haven't come up, we won't have a communityGroup obj yet....
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
     		<div class="saito-profile-info">`;
    if (groupKey){
    	html += `<div class="saito-username">${groupKey}</div>`;
    }
    if (group?.description){
    	html += `<div class="saito-profile-about">${group.description}</div>`;	
    }
    
    html += `</div>
      		<div class="saito-profile-menu vertical">
      			<div id="chat-group-edit" class="saito-modal-menu-option"><i class="fa-solid ${(group.id == mod.communityGroup?.id || group?.member_ids) ? "fa-users-gear": "fa-user-gear"}"></i><div>Manage Chat</div></div>
      		</div>
      	</div>
      	${MemberList(app, mod, group)}
    </div>`;

	return html;
};
