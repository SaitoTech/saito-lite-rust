const SaitoGroupTemplate = require('./../../../../lib/saito/new-ui/templates/saito-group.template');
const SaitoUserTemplateWithTime = require('./../../../../lib/saito/new-ui/templates/saito-user-with-time.template');

module.exports = (app, mod) => {

  let groups = app.keys.returnGroups();
  let keys = app.keys.returnKeys();


  let html = `

    <div class="redsquare-appspace-contacts">

      <div class="saito-page-header">
      <div class="saito-redsquare-actions-buttons">
      <div class="saito-redsquare-actions-buttons-icon">
      <i id="action-icon" class="fas fa-plus"></i>
      </div>
       <div class="redsquare-actions-container"> 
       <div id="redsquare-add-contact" class="redsquare-add-contact saito-button-secondary small">Add Contact</div>
       </div>
      </div>

        <div class="saito-page-header-title">CONTACTS</div>
        <div class="saito-page-header-text">Use this page to manage the contacts saved in your wallet, or create groups for secure communication channels with many participants. Remember to backup your wallet after creating a new group or adding a new contact.</div>
      </div>

      <div class="redsquare-appspace-contacts-list">

  `;
 
  if (groups) {
    if (groups.length > 0) {
      html += `
        <h6>Your Groups</h6>
        <div id="saito-grouplist" class="saito-grouplist" style="margin-bottom:2rem">
      `;
      for (let i = 0; i < groups.length; i++) {
        html += SaitoGroupTemplate(app, mod, groups[i]);
      }
      html += `
        </div>
      `;
    }
  }


  if (keys) {
    if (keys.length > 0) {

      html += `
        <h6>Contacts</h6>
        <div id="saito-friendlist" class="saito-friendlist">
      `;

      for (let i = 0; i < keys.length; i++) {
	let identifier = "";
        let userline = "";

	if (keys[i].identifiers.length > 0) {
	  identifier = keys[i].identifiers[0];
	}

	
        if (keys.watched === 1) {
	  if (identifier !== "") {
	    userline = identifier + " -- following"; 
	  } else {
	    userline = "anonymous -- following"; 
	  }
	}

	let security = "public";
	if (keys[i].aes_secret !== "") {
	  security = "secure";
	}
	if (keys.watched === 1 || keys.aes_publickey != "") {
          html += SaitoUserTemplateWithTime(app, mod, keys[i].publickey, userline, security);
	}
      }

      html += `
        </div>
      `;

    }
  }

  html += `
      </div>
    </div>
  `;

  return html;

}

