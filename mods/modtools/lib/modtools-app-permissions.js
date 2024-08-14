const ModtoolsAppPermissionsTemplate = require("./modtools-app-permissions.template");
const ModtoolsAdPermissionTemplate = require("./modtools-add-permission.template");
var SaitoOverlay = require('../../../lib/saito/ui/saito-overlay/saito-overlay');

class ModtoolsAppPermissions {
  constructor(app, mod, container) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(this.app, this.mod);
  }

  render() {
    this.displayAppPermissions();
    this.attachEvents();
  }

  attachEvents() {
    let this_self = this;


    // add new app permission
    if (document.querySelector('#modtools-apps-add-new')) {
      document.querySelector('#modtools-apps-add-new').onclick = (e) => {

        // show add new permission UI
        document.querySelector('#add-new-permission-box').style.display = 'block';
        document.querySelector('#modtools-apps-add-new').style.display = 'none';
        document.querySelector('#add-new-permission-box').innerHTML = ModtoolsAdPermissionTemplate(this_self.app, this_self.mod);
      
        //clicked on cancel
        document.querySelector('#modtools-cancel-permission-btn').onclick = (e) => {
          document.querySelector('#add-new-permission-box').innerHTML = ``;
          document.querySelector('#modtools-apps-add-new').style.display = 'block';
          document.querySelector('#add-new-permission-box').style.display = 'none';
        }

        //clicked on add
        document.querySelector('#modtools-add-permission-btn').onclick = (e) => {
          let app_selected = document.querySelector('#modtools-add-permission-app').value;
          app_selected = app_selected.toLowerCase();
          let value_selected = document.querySelector('#modtools-add-permission-option').value;

          console.log('app_selected - value_selected', app_selected, value_selected);

          this_self.mod.apps[app_selected] = value_selected;
          this_self.mod.save();
          this_self.displayAppPermissions();
          this_self.attachEvents();

          document.querySelector('#add-new-permission-box').innerHTML = ``;
          document.querySelector('#modtools-apps-add-new').style.display = 'block';
          document.querySelector('#add-new-permission-box').style.display = 'none';
        }

      }
    }
    

    if (document.querySelector('.app-permission-option')) {
      document.querySelectorAll('.app-permission-option').forEach(function(elem){

        elem.onchange = async (e) => {
          let value = e.target.value;
          let app_name = e.target.getAttribute("data-app-name");

          // confirm for delete
          if (value == '-') {
            let confirm = await sconfirm(`Are you sure you want to delete permission for '${app_name}'?`);

            console.log('confirm answer:', confirm);
            if (confirm) {
              console.log('deleting option');
              delete this_self.mod.apps[app_name]; 
            }

          } else {
            this_self.mod.apps[app_name] = value;
          }

          console.log('value:',value);
          console.log('e:',app_name);

          this_self.mod.save();
          this_self.displayAppPermissions();
          this_self.attachEvents();
        }

      });
    }
  }

  displayAppPermissions() {
    document.querySelector('#modtools-app-permissions').innerHTML = ``;
    let html = ``;
    this.mod.load();
    let apps = this.mod.apps;

    if (Object.keys(apps).length == 0) {
      html = `No app permissions to show`;
    } else {
      for(let key in apps){
        html += `
              <div class="app-permission-option">
                  <div class="app-name">${key.toUpperCase()}</div>
                  <div class="overlay-input">
                  <select data-app-name="${key.toLowerCase()}" class="app-options-select" >
                      <option value="*" ${apps[key] == '*'  ? `selected` : ``}>Allow all</option>
                      <option value="!" ${apps[key] == '!'  ? `selected` : ``}>None</option>
                      <option value="$" ${apps[key] == '$'  ? `selected` : ``}>Fee-bearing</option>
                      <option value="-">Remove</option>
                  </select>
                  </div>
              </div>
              `;  
      }
    }

    document.querySelector('#modtools-app-permissions').innerHTML = html;
  }

}

module.exports = ModtoolsAppPermissions;
