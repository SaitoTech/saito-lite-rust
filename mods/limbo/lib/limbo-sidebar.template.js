
module.exports = LimboSideBarTemplate = (app, mod, dreamer) => {
	if (!dreamer || !mod.dreams[dreamer]) {
		console.log("Clear sidebar");
		return '';
	}

	const formatUser = (publickey) => {
			let imgsrc = app.crypto.isPublicKey(publickey)
				? app.keychain.returnIdenticon(publickey)
				: '';
			let name = app.keychain.returnIdentifierByPublicKey(publickey, true);
			if (name == publickey) {
				name = 'Anonymous User';
			}

			return `<div class="saito-contact" >
								<div class="saito-user saito-add-user-menu" data-id="${publickey}">
	                				<div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
	                  				<div class="saito-address" data-id="${publickey}" data-disable="true">${name}</div>
	                				<div class="saito-userline">${publickey}</div>
	                				<div></div>
	                			</div>
	            			  </div>`;

	}



	let group = mod.dreams[dreamer].members;

	let groupName = app.keychain.returnUsername(dreamer);
	let identicon = app.keychain.returnIdenticon(dreamer, 'png');


	let html = `
	<div id="limbo-sidebar" class="limbo-sidebar">
    	<div class="saito-profile">
      		<div class="saito-profile-cover"></div>
    		<div class="saito-profile-options-row">
        		<img class="saito-profile-identicon" src="${identicon}">
        		<div class="saito-profile-icons">${groupName}</div>
      		</div>
     		<div class="saito-profile-info">`;

    if (group?.description){
    	html += `<div class="saito-profile-about">${group.description}</div>`;	
    }
    
    html += `</div>
      		<div class="saito-profile-menu vertical">
				<div id="share_link" class="saito-modal-menu-option">
            		<i class="fas fa-link"></i>
            		<div>Share</div>
          		</div>
				<div id="exit_space" class="saito-modal-menu-option">
            		<i class="fa-solid fa-person-through-window"></i>
            		<div>Exit</div>
          		</div>
      		</div>
    		</div>
    		<div class="saito-modal-content">`;

    for (let key of group){
    	html += formatUser(key);
    }

    html +=`</div></div>`;

	return html;
};
