const SaitoGroupTemplate = require('./../../../lib/saito/new-ui/templates/saito-group.template');
const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');


module.exports = (app, mod) => {

  let groups = app.keys.groups;
  let keys = app.keys.keys;


  let html = ``;

  if (groups) {
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


  if (keys) {

    html += `
      <h6>Contacts</h6>
      <div id="saito-friendlist" class="saito-friendlist">
    `;

    for (let i = 0; i < keys.length; i++) {
      html += SaitoUserTemplate(app, mod, keys[i].publickey, keys[i].identifiers);
    }

    html += `
      </div>
    `;

  }

  return html;

}

