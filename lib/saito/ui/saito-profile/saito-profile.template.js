module.exports = SaitoProfileTemplate = (app, mod, profile) => {
  let identicon = app.keychain.returnIdenticon(profile.publicKey, 'png');
  let publicKey = profile.publicKey
  let html = `
    <div class="saito-profile">
   
   
      <div id="${publicKey}-profile-banner" class="saito-profile-banner" data-id="${publicKey}"></div>
      
      <div class="saito-profile-options-row">
        <img class="saito-profile-identicon" src="${identicon}">
      
        <div class="saito-profile-icons">
          <!--<i class="fas fa-gamepad"></i>    
          <i class="far fa-id-card"></i>
          <i class="fas fa-video"></i>
          <i class="fa fa-money-bill-wave"></i>-->
    `;

  if (profile.publicKey !== mod.publicKey) {
    if (!app.keychain.hasPublicKey(profile.publicKey)) {
      html += `
          <div class="saito-profile-follow-btn saito-profile-add-contact-btn">Add Contact</div>
        `;
    }
    if (mod.isFollowing(profile.publicKey)) {
      html += `
          <div class="saito-profile-follow-btn saito-profile-unfollow-contact-btn">Unfollow</div>
        `;
    } else {
      html += `
          <div class="saito-profile-follow-btn saito-profile-follow-contact-btn">Follow</div>
        `;
    }
  } else if (profile.publicKey == mod.publicKey) {
    html += `<div class="saito-profile-follow-btn saito-following">Contacts</div>`;
  }

  html += `
        </div>  
      </div>
     <div class="saito-profile-info">
      <div class="saito-username">${profile.publicKey}</div>
    </div>`;

  html += `
    <div class="saito-profile-menu float">
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-posts ${profile.tab == 'posts' ? 'active' : ''
    }" data-id="posts">Posts <span>${profile.posts.length > 0 ? `(${profile.posts.length})` : ''
    }</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-replies ${profile.tab == 'replies' ? 'active' : ''
    }" data-id="replies">Replies <span>${profile.replies.length > 0 ? `(${profile.replies.length})` : ''
    }</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-retweets ${profile.tab == 'retweets' ? 'active' : ''
    }" data-id="retweets">Retweets <span>${profile.retweets.length > 0 ? `(${profile.retweets.length})` : ''
    }</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-likes ${profile.tab == 'likes' ? 'active' : ''
    }" data-id="likes">Likes <span>${profile.likes.length > 0 ? `(${profile.likes.length})` : ''
    }</span></div>
    </div>
  `;

  html += `</div>`;

  return html;
};
