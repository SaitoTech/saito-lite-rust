const RedSquareAppspaceNotificationsTemplate = require("./notifications.template");
const Notification = require("./../notification");
const SaitoLoader = require("./../../../../lib/saito/new-ui/saito-loader/saito-loader");

class RedSquareAppspaceNotifications {

  constructor(app, mod) {
    this.app = app;
    this.name = "RedSquareAppspaceNotifications";
    this.saito_loader = new SaitoLoader(app, mod);
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceNotificationsTemplate(app, mod), "appspace");

    for (let i = 0; i < mod.ntfs.length; i++) {
      let notification = new Notification(app, mod, mod.ntfs[i]);
      notification.render(app, mod, ".redsquare-list");
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {
    notificationSelf = this;

    sel = ".tweet";

    if (document.querySelector(sel) != null) {
      document.querySelector(sel).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        notificationSelf.saito_loader.render(app, mod, 'redsquare-home-header', false);

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

