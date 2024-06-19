module.exports = SaitoProfileTemplate = (app, mod, profile) => {
	let publicKey = profile.publicKey;
	let identicon = app.keychain.returnIdenticon(publicKey, 'png');
	let icon = profile?.icon || "";
	let can_edit = app.modules.returnModule('Profile') && mod?.enable_profile_edits;
	
	if (can_edit) {
		if (publicKey !== mod.publicKey) {
			can_edit = false;
		  let localKey = app.keychain.returnKey(publicKey, true);
		  if (localKey) {
		  	if (localKey?.privateKey) {
		  		can_edit = true;
		  	}
			}
		}
	}

	let html = `<div id="saito-profile${profile.ordinal}" class="saito-profile" data-id="${publicKey}">
      					<div id="profile-banner-${publicKey}" class="saito-profile-banner profile-banner-${publicKey}" data-id="${publicKey}">`;  

  if (can_edit){
 		html += `<i class="saito-banner-edit fas fa-camera"> </i>`;
  }

  html += `</div>
     
      <div class="saito-profile-header-row">
      	<div class="saito-identicon-box">
        	<img class="saito-identicon" src="${identicon}">
        	${icon}
        </div>
  
        <div class="saito-profile-header">
        	<div class="saito-profile-username">${profile?.name || app.keychain.returnIdentifierByPublicKey(publicKey) || "Anonymous Account" }</div>  
      		<div class="saito-profile-key ${(profile?.mask_key) ? "hidden": ""}">${publicKey}</div>  
        </div>  
      </div>
      
      <div class="saito-profile-description ${can_edit? "can-edit" : ""}">
      	<div id="profile-description-${publicKey}" class="profile-description-${publicKey}" data-id="${publicKey}">${profile?.description || ""}</div>
      	<div class="saito-description-edit"><i class="fas fa-pen"></i></div>
	    </div>`;

	html += `
		<div class="saito-profile-controls"></div>
    <div class="saito-profile-menu"></div>
  `;

	html += `</div>`;

	return html;
};
