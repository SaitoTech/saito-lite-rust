const SettingsTemplate = require('./modtools-settings.template');
const SaitoContacts = require('../../../lib/saito/ui/modals/saito-contacts/saito-contacts');
const ModtoolsAppPermissions = require('./modtools-app-permissions');

class ModtoolsSettings {
  constructor(app, mod, container) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.contacts = new SaitoContacts(app, mod, true);
    this.app_permissions = new ModtoolsAppPermissions(app, mod, '#modtools-apps');
  }

  render() {
    if (document.getElementById('modtools-settings')) {
      this.app.browser.replaceElementById(
        SettingsTemplate(this.app, this.mod),
        'modtools-settings'
      );
    } else {
      this.app.browser.addElementToSelector(SettingsTemplate(this.app, this.mod), this.container);
    }

    if (document.querySelector('#modtools-apps')) {
      this.app_permissions.render();
    }

    this.attachEvents();
  }

  attachEvents() {
    let settings_self = this;

    if (document.getElementById('blacklisted-accounts')) {
      if (this.mod.blacklisted_publickeys?.length){
        document.getElementById('blacklisted-accounts').onclick = (e) => {
          this.contacts.title = 'Blacklisted Accounts';
          this.contacts.multi_button = 'Remove from Blacklist';
          this.contacts.callback = (keys) => {
            for (let key of keys) {
              this.app.connection.emit('saito-unblacklist', key);
            }
            this.render();
          };

          this.contacts.render(this.mod.blacklisted_publickeys);
        };
      }
    }

    if (document.getElementById('whitelisted-accounts')) {
      if (this.mod.whitelisted_publickeys?.length){
        document.getElementById('whitelisted-accounts').onclick = (e) => {
          this.contacts.title = 'Whitelisted Accounts';
          this.contacts.multi_button = 'Remove from Whitelist';
          this.contacts.callback = (keys) => {
            for (let key of keys) {
              this.app.connection.emit('saito-unwhitelist', key);
            }
            this.render();
          };
          this.contacts.render(this.mod.whitelisted_publickeys);
        };
      }
    }

    if (document.getElementById('add-whitelist')){
      document.getElementById('add-whitelist').onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.contacts.multi_button = 'Add to Whitelist';
          this.contacts.callback = (keys) => {
            for (let key of keys) {
              this.app.connection.emit('saito-whitelist', {publicKey: key});
            }
            this.render();
          };
          this.contacts.render();
        };
    }

    if (document.getElementById('none_mod')) {
      document.getElementById('none_mod').onclick = (e) => {
        this.mod.permissions.mode = 'none';
        this.mod.save();
      };
    }

    if (document.getElementById('public_mod')) {
      document.getElementById('public_mod').onclick = (e) => {
        this.mod.permissions.mode = 'public';
        this.mod.save();
      };
    }

    if (document.getElementById('friends_mod')) {
      document.getElementById('friends_mod').onclick = (e) => {
        this.mod.permissions.mode = 'friends';
        this.mod.save();
      };
    }

    if (document.getElementById('custom_mod')) {
      document.getElementById('custom_mod').onclick = (e) => {
        this.mod.permissions.mode = 'custom';
        this.mod.save();
      };
    }
  }
}

module.exports = ModtoolsSettings;
