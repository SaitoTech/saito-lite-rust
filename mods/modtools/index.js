module.exports = (app, mod) => {

  let blacklist = app.options.modtools.blacklist;
  let whitelist = app.options.modtools.whitelist;
  let apps = app.options.modtools.apps;
  let node_publicKey = mod.publicKey;

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
    </head>
    <style>
      .modtools-main-container {
        width: 65vw;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          margin-top: calc(var(--saito-header-height) + 3rem);
      }

      .modtools-main-container .saito-module {
        background-color: var(--saito-primary-transparent);
      }

      .modtools-main-container .saito-module-title {
        font-size: 1.8rem;
          font-weight: bold;
      }

      .modtools-container {
        display: flex;
          flex-direction: column;
          gap: 2rem;
      }

      .modtools-container-title {
        font-size: 1.8rem;
          font-weight: bold;
      }

      .modtools-container {
        display: flex;
          flex-direction: column;
          gap: 2rem;
      }

      .modtools-contact {
        align-items: center;
        display: grid;
        grid-template-columns: 0.7fr 0.5fr 2fr;
        text-align: left;
      }

      .modtools-contact-daetails {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .modtools-contact-details {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .modtools-contact-details i {
        cursor: pointer;
      }

      .app-permission-option {
        display: flex;
          justify-content: space-between;
          width: 50%;
      }
    </style>
<body>


    <div class="modtools-main-container" id="modtools-main-container">
    <div class="saito-module">
      <div class="saito-module-details-box">
        <div class="saito-module-title">Modtools</div>
        <div class="saito-module-description">Module for managing and customizing wallet and application moderation tools</div>
      </div>
      
    </div>

    <div class="modtools-container">
    <div class="modtools-container-title">Node</div>
      <div class="saito-address treated" data-id="${node_publicKey}">
        ${node_publicKey}
      </div>
    </div>


    <div class="modtools-container">
        <div class="modtools-container-title">Blacklisted</div>
    `;

      if (blacklist.length > 0) {
        for(let i=0; i<blacklist.length; i++) {
          let timestamp = blacklist[i].created_at;
          var newDate = new Date();
          newDate.setTime(timestamp);
          let dateString = newDate.toUTCString();

          let duration = app.browser.formatTime(blacklist[i].duration);
          let publicKey = blacklist[i].publicKey;
          let identicon = app.keychain.returnIdenticon(publicKey);

          html += `
              <div class="modtools-entry modtools-contact">
                  <div class="modtools-contact-date">${dateString}</div>
                  <div class="modtools-contact-date">${duration.hours}H : ${duration.minutes}M : ${duration.seconds}S</div>
                  <div class="modtools-contact-details">
                  <div class="saito-identicon-box">
                    <img class="saito-identicon" src="${identicon}"></div>
                    <div class="saito-address treated" data-id="${publicKey}">${publicKey}</div>
                  </div>
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
          <div class="modtools-container-title">Whitelisted</div>
      `;

      if (whitelist.length > 0) {
        for(let i=0; i<whitelist.length; i++) {

          let timestamp = whitelist[i].created_at;
          var newDate = new Date();
          newDate.setTime(timestamp);
          let dateString = newDate.toUTCString();

          let duration = app.browser.formatTime(whitelist[i].duration);
          let publicKey = whitelist[i].publicKey;
          let identicon = app.keychain.returnIdenticon(publicKey);

          html += `

              <div class="modtools-entry modtools-contact">
                  <div class="modtools-contact-date">${dateString}</div>
                  <div class="modtools-contact-date">${duration.hours}H : ${duration.minutes}M : ${duration.seconds}S</div>
                  <div class="modtools-contact-details">
                    <div class="saito-identicon-box">
                      <img class="saito-identicon" src="${identicon}"></div>
                      <div class="saito-address treated" data-id="${publicKey}">${publicKey}</div>
                    </div>
                </div>
             `; 

        }
      } else {
        html += `
          <div>No contacts in whitelist</div>
        `;
      }


    html +=`
        <div class="saito-button-primary" id="whitelist">Add</div>
        </div>    
    `;


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
    
    </div>

</body>`;

html += `
<script type="text/javascript" src="/saito/saito.js?build=${app.build_number}"></script>
</html>`;

	return html;
};
