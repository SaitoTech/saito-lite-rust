module.exports = (app, publickey="") => {

   let key = app.keychain.returnKey(publickey);

console.log(">");
console.log("KEY RETURNED: " + JSON.stringify(key));
console.log(">");

   let is_this_me = false;
   if (publickey === app.wallet.publickey) { is_this_me = true; }
   let follow_text = "follow";

   if (!key) {
     key = {};
   } else {
     if (key.watched == true) {
       follow_text = "unfollow";
     }
   }

   let email  = key.email || "";
   let identifier = key.identifier || "";
   let telegram = key.telegram || "";


   let html = '';
   html += `
      <div class="redsquare-profile">
        <div class="redsquare-appspace-header">
   `;
   if (!is_this_me) {
     html += `
	  <div class="redsquare-appspace-profile-follow-btn saito-button-secondary" data-id="${publickey}">${follow_text}</div>
     `;
   }
   html += `
          <div class="redsquare-actions-buttons">
            <div class="redsquare-actions-buttons-icon"></div>
            <div id="redsquare-page-header-title" class="redsquare-page-header-title"><i class="redsquare-redsquare fa-solid fa-square"></i> PROFILE</div>
            <div class="redsquare-actions-container"></div>
          </div>
        </div>
        <div class="redsquare-appspace-body">
	  <div class="redsquare-appspace-profile-container">
            <div class="redsquare-appspace-profile">
	`;
  if (identifier) {
    html += `
            <div>Username:</div>
            <div>${identifier}</div>
            <div></div>
    `;
  }
	if (email) {
	  html += `	
            <div>Email:</div>
	          <div>${email}</div>
            <div></div>
	  `;
	}
	if (publickey) {
	  html += `
            <div>Public Key:</div>
            <div>${publickey}</div>
            <div class="copy-public-key"><i class="fas fa-copy"></i></div>
	  `;
	}

	html += `
          </div>
	  </div>
	  <div class="redsquare-profile-tweets">
            <div class="saito-loader temp"></div>
          </div>

        </div>
      </div>
   `;

    return html;

}

