module.exports = SaitoProfileTemplate = async(app, mod, profile) => {

  let identicon = app.keychain.returnIdenticon(profile.publickey, "png");

  let html = `
    <div class="saito-profile-container">
   
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

    let publicKey = await app.wallet.getPublicKey();

    if (
      app.keychain.hasPublicKey(profile.publickey) &&
      profile.publickey !== publicKey
    ) {
      html += `
        <div class="saito-profile-follow-btn">Follow</div>
      `;
    }

    html +=`

        </div>  
      </div>
        
     <div class="saito-profile-info">
      <div class="saito-username">${profile.publickey}</div>
      <div class="saito-follow-count">
        <div class="saito-follow">${(profile.keys).length} <span>Friends</span></div>
       </div>
     </div>
      
    </div> 
  `;

  return html;

}
