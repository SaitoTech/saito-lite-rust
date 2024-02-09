module.exports = (app, mod, chat_group) => {
	let html = "";

	const formatUser = (publickey, usericon = "", unconfirmed = "", fourthElement = '<div></div>') => {
			let imgsrc = app.crypto.isPublicKey(publickey)
				? app.keychain.returnIdenticon(publickey)
				: '';
			let name = app.keychain.returnIdentifierByPublicKey(publickey, true);
			if (name == publickey) {
				name = 'Anonymous User';
			}

			return `<div class="saito-contact${unconfirmed}" >
								<div class="saito-user saito-address" data-id="${publickey}">
	                				<div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}">${usericon}</div>
	                  				${name}
	                				<div class="saito-userline">${publickey}</div>
	                				${fourthElement}
	                			</div>
	            			  </div>`;

	}



	if (chat_group?.member_ids){

		html += `<div class="saito-modal-content">`;
 
		for (let publickey in chat_group.member_ids) {

			let icon = "";
			let fourth = "";
			let unconfirmed_tag = '';

			//
			//only display for admin
			//
			if (chat_group.member_ids[publickey] == 0) {
				unconfirmed_tag = ' unconfirmed';
				if (chat_group.member_ids[mod.publicKey] !== 'admin'){
					continue;
				}	
			}

			if (chat_group.member_ids[publickey] == "admin"){
				icon = `<i class="saito-overlaid-icon fa-solid fa-dragon"></i>`;
			}

			if (chat_group.member_ids[mod.publicKey] == "admin"){
				if (chat_group.member_ids[publickey] !== "admin"){
					fourth = `<div class="remove_user saito-user-fourth-elem-large" data-id="${publickey}"><i class="fa-solid fa-user-minus"></i></div>`;
				}else{
					fourth = '<div></div>';
				}
			}


			html += formatUser(publickey, icon, unconfirmed_tag, fourth) 

		}
		html += '</div>';

	}else if (chat_group.name === mod.communityGroupName){
		let active_users = [];
		for (let i = chat_group.txs.length - 1; i >= 0; i--){
			let key = chat_group.txs[i].from;
			if (Array.isArray(key)){
				for (let k of key){
					if (!active_users.includes(k)){
						active_users.push(k);
					}	
				}
			}else{
				if (!active_users.includes(key)){
					active_users.push(key);
				}
			}
		}

		for (let publickey of active_users){
			html += formatUser(publickey);
		}

		html = `<div class="saito-modal-content">${html}</div>`;
	}

	return html;
};
