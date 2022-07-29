//const PublishApp = require('./publish.js');
const AppStoreAppspaceTemplate = require('./main.template.js');


class AppStoreAppspace {

  constructor(app, mod) {
    this.app = app;
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = AppStoreAppspaceTemplate(app, mod);
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    //
    // on-click publish
    //
/***
    document.getElementById('appstore-publish-button').onclick = () => {
      PublishApp.render(app, data);
      PublishApp.attachEvents(app, data);
    }
    document.getElementById('appstore-publish-button').click();
***/
  }


}

module.exports = AppStoreAppspace;


