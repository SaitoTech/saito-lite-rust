const AppStorePublishWaitingTemplate = require('./waiting.template');

module.exports = AppStorePublishSuccess = {

  render(app, mod) {

    if (!document.getElementById("appstore-app-install-overlay")) {
      app.browser.addElementToDom('<div id="appstore-app-install-overlay" class="appstore-app-install-overlay"></div>');
    }

    document.querySelector('.appstore-app-install-overlay').innerHTML = AppStorePublishWaitingTemplate(app, mod.data);
    document.querySelector('.appstore-app-install-overlay').style.display = "block";

  },

  attachEvents(app, mod) {
  },

}
