const InviteTemplate = require("./invite.template");

class LeagueRankings {
	
  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;

    app.connection.on('arcade-invites-render-request', () => {
      this.render();
    });

  }

  render() {
    //
    // insert content we will render into
    //
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(), this.container);
    }

    //
    // add content
    //
    let html = ``;
    for (let i=0; i<3; i++) {
      html += InviteTemplate(this.app, this.mod);
      
    }

    this.app.browser.addElementToSelector(html, ".arcade-invites");
    

    this.attachEvents();

  }

  attachEvents() {
  }

};

module.exports = LeagueRankings;

