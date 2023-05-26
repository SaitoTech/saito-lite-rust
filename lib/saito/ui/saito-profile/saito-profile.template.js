module.exports = WithdrawTemplate = (app, mod, profile) => {

  let identicon = app.keychain.returnIdenticon(profile.publickey, "png");

  let html = `
    <div class="saito-profile-container">
   
      <div class="saito-profile-cover">
      </div>
      
      <img class="saito-profile-identicon" src="${identicon}">
      
        
     <div class="saito-profile-info">
      <div class="saito-username">${profile.publickey}</div>
      <div class="saito-follow-count">
        <div class="saito-follow">49 <span>Following</span></div>
        <div class="saito-follow">235 <span>Followers</span></div>
       </div>
     </div>
      
    </div> 
  `;

  return html;

}
