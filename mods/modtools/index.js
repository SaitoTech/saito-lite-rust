module.exports = (app, mod) => {

  let blacklist = mod.blacklist;
  let whitelist = mod.whitelist;
  let node_publicKey = mod.publicKey;
  let time_now = Date.now();

	let html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="description" content="">
      <meta name="author" content="">
      <title>Saito Modtools</title>
      <link rel="stylesheet" type="text/css" href="/saito/lib/jsonTree/jsonTree.css" />
      <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen">
      <script src="/saito/lib/jsonTree/jsonTree.js"></script>
      <link rel="icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png">
      <link rel="apple-touch-icon" sizes="192x192" href="/saito/img/touch/pwa-192x192.png">
      <link rel="icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png">
      <link rel="apple-touch-icon" sizes="512x512" href="/saito/img/touch/pwa-512x512.png"></link>
      <link rel="stylesheet" href="/saito/saito.css?v=${app.build_number}" type="text/css" >
      <link rel="stylesheet" href="/modtools/style.css?v=${app.build_number}" type="text/css" >

    </head>
<body>


    <div class="modtools-main-container hide-scrollbar" id="modtools-main-container">
      <div class="saito-module-details-box">
        <div class="saito-module-title">Modtools</div>
        <div class="saito-module-description">Module for managing and customizing wallet and application moderation tools</div>
      </div>
      

    <div class="modtools-container">
      <div class="modtools-container-title">Node</div>
      <div class="saito-address treated" data-id="${node_publicKey}">
        ${node_publicKey}
      </div>
      <div class="modtools-icon-holder"><i id="pw-lock" class="fa-solid fa-lock"></i></div>
    </div>


    <div class="modtools-container">
      <div class="modtools-container-header">
        <div class="modtools-container-title">Blacklisted</div>
    `;
      if (blacklist.length > 0) {
        html += `<div class="saito-button-primary" id="unblacklist">Remove</div>`
      }
      html += "</div>";

      if (blacklist.length > 0) {
        for(let i=0; i<blacklist.length; i++) {
            var added = new Date(blacklist[i].created_at);
            let dateString = added.toUTCString();

            let expString = "forever";
            if (blacklist[i].duration > 0) {
              let timeleft = blacklist[i].created_at + blacklist[i].duration - time_now;
              if (timeleft < 0){
                expString = "expired";
              }else{
                let duration = app.browser.formatTime(timeleft);
                expString = `${duration.hours}H : ${duration.minutes}M : ${duration.seconds}S`;
              }
            }

            let publicKey = blacklist[i].publicKey;
            let identicon = app.keychain.returnIdenticon(publicKey);

            html += `
                <div class="modtools-contact">
                    <div class="modtools-contact-details">
                      <div class="saito-identicon-box">
                        <img class="saito-identicon" src="${identicon}">
                      </div>
                      <div class="saito-address treated" data-id="${publicKey}">${app.keychain.returnIdentifierByPublicKey(publicKey, true)}</div>
                    </div>
                    <div class="modtools-contact-date">${dateString}</div>
                    <div class="modtools-contact-date">${expString}</div>
                    <div class="saito-address treated" data-id="${blacklist[i].moderator}">${app.keychain.returnIdentifierByPublicKey(blacklist[i].moderator, true)}</div>
                </div>
               `; 
        }
      } else {
        html += `
          <div>No contacts in blacklist</div>
        `;
      }

    html +=`
        </div>
    `;


    html +=  `
        <div class="modtools-container">
          <div class="modtools-container-header">
            <div class="modtools-container-title">Whitelisted</div>
      `;
      if (whitelist.length > 0) {
        html += `<div class="saito-button-primary" id="unwhitelist">Remove</div>`
      }
      html += `<div class="saito-button-primary" id="whitelist">Add</div></div>`;

      if (whitelist.length > 0) {
        for(let i=0; i<whitelist.length; i++) {
            var added = new Date(whitelist[i].created_at);
            let dateString = added.toUTCString();

            let expString = "forever";
            if (whitelist[i].duration > 0) {
              let timeleft = whitelist[i].created_at + whitelist[i].duration - time_now;

              if (timeleft < 0){
                expString = "expired";
              }else{
                let duration = app.browser.formatTime(timeleft);
                expString = `${duration.hours}H : ${duration.minutes}M : ${duration.seconds}S`;
              }
            }
            
            let publicKey = whitelist[i].publicKey;
            let identicon = app.keychain.returnIdenticon(publicKey);

            html += `
                <div class="modtools-contact">
                    <div class="modtools-contact-details">
                      <div class="saito-identicon-box">
                        <img class="saito-identicon" src="${identicon}">
                      </div>
                      <div class="saito-address treated" data-id="${publicKey}">${app.keychain.returnIdentifierByPublicKey(publicKey, true)}</div>
                    </div>
                    <div class="modtools-contact-date">${dateString}</div>
                    <div class="modtools-contact-date">${expString}</div>
                    <div class="saito-address treated" data-id="${whitelist[i].moderator}">${app.keychain.returnIdentifierByPublicKey(whitelist[i].moderator, true)}</div>
                  </div>
               `; 

        }
      } else {
        html += `
          <div>No contacts in whitelist</div>
        `;
      }


    html +=`
        
        </div>
        <div id="options-space"></div>    
        </div>
    `;

/*
    html +=  `
        <div class="modtools-container">
          <div class="modtools-container-title">App Permissions</div>
      `;


      if (Object.keys(apps).length > 0) {
        for(let key in apps){
          html += `
                <div class="app-permission-option">
                    <div class="app-name">${key.toUpperCase()}</div>
                    <div class="app-permission-list">
                      ${apps[key] == '*'  ? `<div>Allow all</div>` : ``}
                      ${apps[key] == '!'  ? `<div>Allow none</div>` : ``}
                      ${apps[key] == '$'  ? `<div>Allow fee-bearing</div>` : ``}
                    </div>
                </div>
                `;  
          }
      } else {
        html += `
          <div>No app permissions to show</div>
        `;
      }

    html +=`

        </div>    
    
    </div>`;
*/

let public_options = Object.assign({}, app.options);
delete public_options.wallet;
    
let opt_str = JSON.stringify(
          public_options,
          (key, value) =>
            typeof value === 'bigint' ? value.toString() : value // return everything else unchanged
          );
html += `
</body>

  <script type="text/javascript">
    var options = \'${opt_str}\';
    var blacklist = [];
    var whitelist = [];`

  for (let b of blacklist) {
    html += ` blacklist.push(\`${b.publicKey}\`);`;
  }
  for (let w of whitelist) {
    html += ` whitelist.push(\`${w.publicKey}\`);`;
  }
  html += `</script>

<script type="text/javascript" src="/saito/saito.js?build=${app.build_number}"></script>
</html>`;

	return html;
};
