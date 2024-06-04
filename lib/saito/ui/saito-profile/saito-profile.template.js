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
     
      <div class="saito-profile-options-row">
        <img class="saito-profile-identicon" src="${identicon}">
  
        <div class="saito-profile-header">
        	<div class="saito-profile-username">${app.keychain.returnIdentifierByPublicKey(publicKey) || "Anonymous Account" }</div>  
      		<div class="saito-profile-key">${publicKey}</div>  
        </div>  
      </div>
      
      <div class="saito-profile-description ${can_edit? "can-edit" : ""}">
      	<div id="profile-description-${publicKey}" class="profile-description-${publicKey}" data-id="${publicKey}"></div>
      	<div class="saito-description-edit"> <i class="fas fa-pen"></i></div>
	    </div>`;

	html += `
    <div class="saito-profile-menu float">
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-posts ${
			profile.tab == 'posts' ? 'active' : ''
		}" data-id="posts">Posts <span>${
		profile.posts.length > 0 ? `(${profile.posts.length})` : ''
	}</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-replies ${
			profile.tab == 'replies' ? 'active' : ''
		}" data-id="replies">Replies <span>${
		profile.replies.length > 0 ? `(${profile.replies.length})` : ''
	}</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-retweets ${
			profile.tab == 'retweets' ? 'active' : ''
		}" data-id="retweets">Retweets <span>${
		profile.retweets.length > 0 ? `(${profile.retweets.length})` : ''
	}</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-likes ${
			profile.tab == 'likes' ? 'active' : ''
		}" data-id="likes">Likes <span>${
		profile.likes.length > 0 ? `(${profile.likes.length})` : ''
	}</span></div>
    </div>
  `;

	html += `</div>`;

	return html;
};
