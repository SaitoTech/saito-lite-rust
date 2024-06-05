module.exports = SaitoProfileTemplate = (app, mod, profile) => {
	let publicKey = profile.publicKey;
	let identicon = app.keychain.returnIdenticon(publicKey, 'png');
	
	let can_edit = app.modules.returnModule('Profile') && publicKey === mod.publicKey;
	
	let html = `<div class="saito-profile">
      					<div id="profile-banner-${publicKey}" class="saito-profile-banner profile-banner-${publicKey}" data-id="${publicKey}">`;  

  if (can_edit){
 		html += `<i class="saito-banner-edit fas fa-camera"> </i>`;
  }

  html += `</div>
     
      <div class="saito-profile-header-row">
        <img class="saito-profile-identicon" src="${identicon}">
  
        <div class="saito-profile-header">
        	<div class="saito-profile-username">${app.keychain.returnIdentifierByPublicKey(publicKey) || profile.name || "Anonymous Account" }</div>  
      		<div class="saito-profile-key">${publicKey}</div>  
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
