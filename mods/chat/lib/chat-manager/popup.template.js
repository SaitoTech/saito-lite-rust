module.exports = (app, mod, group, isStatic = false) => {
	if (!group) {
		return '';
	}
	if (!group.name) {
		group.name = '';
	}

	let class_name = 'chat-container';

	if (isStatic) {
		class_name = 'chat-static';
	}

	let is_encrypted = ``;
	let dm = (group.members.length == 2 && !group?.member_ids);
	let dm_counterparty = "";

	if (dm) {
		for (let i = 0; i < group.members.length; i++){
			if (group.members[i] !== mod.publicKey) {
				dm_counterparty = group.members[i];
				if (app.keychain.hasSharedSecret(dm_counterparty)) {
					is_encrypted = `<i class="fa-solid fa-lock"></i>`;
				
					let key = app.keychain.returnKey(dm_counterparty);
					if (key.encryption_failure){
						is_encrypted = `<i class="fa-solid fa-unlock fix-me" data-id="${dm_counterparty}"></i>`;		
					}
				}
			}
		}
	}

	let html = `<div class="${class_name} chat-popup ${dm ? 'saito-dm-chat' : ''}" id="chat-popup-${group.id}">
          			<div class="chat-header" id="chat-header-${group.id}">
            			<div class="chat-header-nav">
				            <i class="fa-solid fa-window-minimize chat-sizing-icon chat-minimizer-icon"></i>
				            <i class="fa-regular fa-square chat-sizing-icon chat-maximizer-icon"></i>
				            <i id="chat-container-close" class="chat-container-close fas fa-times"></i>
			            </div>
			            <div class="chat-header-info">
			            	<div class="chat-mobile-back"><i class="fa-solid fa-arrow-left"></i></div>
              			<div class="chat-details">
              				${is_encrypted}
              				<div id="chat-group-${group.id}" class="chat-group${dm?" saito-address":""}" data-id="${dm ? dm_counterparty: group.name}">${group.name}</div>
              			</div>
			              <div class="chat-action-icons">
			                <div class="chat-actions"></div>
			                <div class="chat-action-menu" data-id="${group.id}"><i class="fa-solid fa-ellipsis-vertical"></i></div>
				             </div>
			            </div>
			          </div>

          <div class="chat-body">
            <!--div id="load-older-chats" class="saito-chat-button" data-id="${group.id}">check for earlier messages</div-->
            ${mod.returnChatBody(group.id)}
          </div>

          <div class="chat-footer">
            <i class="fa-regular fa-paper-plane chat-input-submit" id="chat-input-submit"></i>
          	<div class="saito-mentions-list hidden" id="saito-mentions-list"></div>
          </div>


      </div>
  `;

	return html;
};
