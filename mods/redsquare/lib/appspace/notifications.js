
const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");
const Notification = require("./../notification");
const SaitoLoader = require("./../../../../lib/saito/ui/saito-loader/saito-loader");

class RedSquareAppspaceNotifications {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.name = "RedSquareAppspaceNotifications";
    this.saito_loader = new SaitoLoader(app, mod, '#redsquare-home-header');
    this.increment = 1;
    this.container  = container;
  }

  render() {

    let app = this.app;
    let mod = this.mod;

    if (document.querySelector(".redsquare-notifications")) {
      this.app.browser.replaceElementBySelector(RedSquareAppspaceNotificationsTemplate(app, mod), ".redsquare-notifications");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareAppspaceNotificationsTemplate(app, mod), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareAppspaceNotificationsTemplate(app, mod));
      }
    }

    for (let i = 0; i < mod.notifications.length; i++) {
      let notification = new Notification(app, mod, mod.notifications[i].tx);
      notification.render(".redsquare-notifications");
    }

    if(mod.notifications.length === 0){
      let notification = new Notification(app, mod, null);
      notification.render(".redsquare-notifications");
    }
    
    this.attachEvents(app, mod);

  }

  attachEvents() {
    let app = this.app;
    let mod = this.mod
    
    notificationSelf = this;

    sel = ".tweet";

    if (document.querySelector(sel) != null) {
      document.querySelector(sel).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        notificationSelf.saito_loader.render();

        let el = e.target;
        let tweet_sig_id = el.getAttribute("data-id");

        document.querySelector(".redsquare-list").innerHTML = "";

        let sql = `SELECT * FROM tweets WHERE sig = '${tweet_sig_id}'`;
        mod.fetchTweets(app, mod, sql, function (app, mod) { 
          let t = mod.returnTweet(app, mod, tweet_sig_id);

          if (t == null) {
            console.log("TWEET IS NULL OR NOT STORED");
            return;
          }
          if (t.children.length > 0) {
            mod.renderWithChildren(app, mod, tweet_sig_id);
          } else {
            mod.renderWithParents(app, mod, tweet_sig_id, 1);
          }
        });

        if (!window.location.href.includes('type=tweet')) {
          let tweetUrl = window.location.href + '?tweet_id=' + tweet_sig_id;      
          window.history.pushState({}, document.title, tweetUrl);  
        }

        notificationSelf.saito_loader.remove();
      };
    }
  }

}

module.exports = RedSquareAppspaceNotifications;

