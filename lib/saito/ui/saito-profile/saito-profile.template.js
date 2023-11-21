module.exports = SaitoProfileTemplate = (app, mod, profile) => {

  let identicon = app.keychain.returnIdenticon(profile.publicKey, "png");

  let html = `
    <div class="saito-profile">
   
      <div class="saito-profile-cover">
      </div>
      
      <div class="saito-profile-options-row">
        <img class="saito-profile-identicon" src="${identicon}">
      
        <div class="saito-profile-icons">
          <!--<i class="fas fa-gamepad"></i>    
          <i class="far fa-id-card"></i>
          <i class="fas fa-video"></i>
          <i class="fa fa-money-bill-wave"></i>-->
    `;

  if (!app.keychain.hasPublicKey(profile.publicKey) && profile.publicKey !== mod.publicKey) {
    html += `
        <div class="saito-profile-follow-btn saito-profile-add-contact-btn">Add Contact</div>
      `;
  }else if (profile.publicKey == mod.publicKey) {
    html +=  `<div class="saito-profile-follow-btn saito-following">Contacts</div>`;
  }

  html += `
        </div>  
      </div>
     <div class="saito-profile-info">
      <div class="saito-username">${profile.publicKey}</div>`;


  html += `
    <div class="saito-profile-menu">
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-posts ${profile.tab == "posts" ? "active" :""}" data-id="posts">Posts <span>${profile.posts.length > 0 ? `(${profile.posts.length})` :""}</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-replies ${profile.tab == "replies" ? "active" :"" }" data-id="replies">Replies <span>${profile.replies.length > 0 ? `(${profile.replies.length})` :""}</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-retweets ${profile.tab == "retweets" ? "active" :"" }" data-id="retweets">Retweets <span>${profile.retweets.length > 0 ? `(${profile.retweets.length})` :""}</span></div>
      <div class="redsquare-profile-menu-tabs redsquare-profile-menu-likes ${profile.tab == "likes" ? "active" :"" }" data-id="likes">Likes <span>${profile.likes.length > 0 ? `(${profile.likes.length})` :""}</span></div>
    </div>
  `;

  html += `</div>
    </div>`;

  return html;
};
