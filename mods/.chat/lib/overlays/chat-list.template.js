module.exports = (app, chat_mod) => {
	let html = `<div id="saito-chats-modal" class="saito-modal contacts">
                <div class="saito-modal-title">My Chats</div>
                <div class="saito-modal-content saito-contacts-list">
              `;


	for (let group of chat_mod.groups){

		let identicon_source = group.id;

		if (group.members.length == 2) {
			for (let mem of group.members) {
				if (mem !== chat_mod.publicKey) {
					identicon_source = mem;
				}
			}
		}

		let imgsrc = app.keychain.returnIdenticon(identicon_source);

		let shared = "";

		if (app.keychain.hasSharedSecret(identicon_source)){
			shared = `<i class="fa-solid fa-lock secure_contact_notice"></i>`;
		}

		html += 
			 `
			 <div class="saito-contact" data-id="${group.id}">
			 <div class="saito-user" data-id="${group.id}" data-disable="true">
			    ${shared}
			    <div class="saito-identicon-box">
			      <img class="saito-identicon" src="${imgsrc}" data-disable="true"/>
			    </div>
			    <div class="saito-address saito-address-long" data-id="${group.name}" data-disable="true">${group.name}</div>
			    <div class="saito-userline">${group.txs.length} messages</div>    
			  </div>
			 </div>`;
 
	}



	html += '</div></div>';

	return html;
};


