const AppStoreBundleConfirmTemplate 	  = require('./appstore-bundle-confirm.template.js');

module.exports = AppStoreBundleConfirm = {

    render(app, data) {
      document.querySelector(".appstore-loading-text").innerHTML = AppStoreBundleConfirmTemplate(data.bundle_appstore_publickey);
      try {document.querySelector(".saito-loader").parentElement.innerHTML = '<i style="font-size: 3em;" class="installed fas fa-check-circle"></i>';} catch (err) {}
    },

    attachEvents(app, data) {

      document.getElementById('confirm-bundle-install-btn').addEventListener('click', (e) => {

          app.options.bundle = data.appstore_bundle;
          app.storage.saveOptions();

	  let email_redirect = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/redsquare";
          window.location = email_redirect;

        });

      }

}
