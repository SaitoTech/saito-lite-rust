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
        <div class="saito-profile-follow-btn">Follow</div>
      `;
  }

  html += `
        </div>  
      </div>
     <div class="saito-profile-info">
      <div class="saito-username">${profile.publicKey}</div>`;

  //
  // We don't have access to anyone else's keychain to know how many contacts they have!!!
  //

  if (profile.publicKey == mod.publicKey) {
    html += `
       <div class="saito-follow">
        <div class="saito-follow-count">${profile.keys.length}</div>
        <div>Friends</div>
       </div>`;
  }

  html += `</div>
    </div>`;

  return html;
};
