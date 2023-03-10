module.exports = (app, publickey="") => {

   let key = app.keychain.returnKey(publickey);

   if (!key) { key = {}; }

   let email  = key.email || "";
   let identifier = key.identifier || "";
   let telegram = key.telegram || "";
   
   let html = '';
   html += `
      <div class="redsquare-profile">
        <div class="redsquare-appspace-header">
          <div class="redsquare-actions-buttons">
            <div class="redsquare-actions-buttons-icon"></div>
            <div id="redsquare-page-header-title" class="redsquare-page-header-title"><i class="redsquare-redsquare fa-solid fa-square"></i> PROFILE</div>
            <div class="redsquare-actions-container"></div>
          </div>
        </div>
        <div class="redsquare-appspace-body">

          <div class="redsquare-appspace-profile">
	`;
	if (email) {
	  html += `	
            <div>Email:</div>
	    <div>${email}</div>
	  `;
	}
	if (identifier) {
	  html += `
            <div>Username:</div>
            <div>${identifier}</div>
	  `;
	}
	if (publickey) {
	  html += `
            <div>Public Key:</div>
            <div>${publickey} <span class="copy-public-key">  <i class="fas fa-copy"></i></span></div>
	  `;
	}

	html += `
          </div>

	  <div class="redsquare-profile-tweets">
      <div class="saito-loader temp"></div>
    </div>

        </div>
      </div>
   `;

    return html;

}

