const TweetManagerTemplate = require("./manager.template");
const Tweet = require("./tweet");
const Notification = require("./notification");
const SaitoProfile = require("./../../../lib/saito/ui/saito-profile/saito-profile");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");

class TweetManager {
  constructor(app, mod, container = ".saito-main") {
    this.app = app;
    this.mod = mod;
    this.container = container;

    this.mode = "loading";

    this.publickey = "";

    this.profile = new SaitoProfile(app, mod, ".saito-main");

    //This is an in-place loader... not super useful when content is overflowing off the bottom of the screen
    this.loader = new SaitoLoader(app, mod, "#redsquare-intersection");

    //////////////////////////////
    // load more on scroll-down //
    //////////////////////////////
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Intersection: " + this.mode);

            this.showLoader();

            //
            // load more tweets
            //
            if (this.mode == "tweets") {
              mod.loadTweets(null, (txs) => {
                if (this.mode !== "tweets") { return; }

                this.hideLoader();
                for (let i = 0; i < this.mod.tweets.length; i++) {
                  let tweet = this.mod.tweets[i];
                  if (!tweet.isRendered()) {
                    tweet.renderWithCriticalChild();
                  }
                }

                if (txs.length == 0){
                  this.app.browser.addElementToSelector(`<div class="saito-end-of-redsquare">No more tweets</div>`, ".tweet-manager");
                  this.intersectionObserver.unobserve(document.querySelector("#redsquare-intersection"));
                }
              });
            }

            //
            // load more notifications
            //
            if (this.mode == "notifications") {

              mod.loadNotifications(null, (txs) => {
                if (this.mode !== "notifications") { return; }
                for (let i = 0; i < this.mod.notifications.length; i++) {
                  let notification = new Notification(
                    this.app,
                    this.mod,
                    this.mod.notifications[i].tx
                  );
                  //if (!notification.isRendered()) {
                    notification.render(".tweet-manager");
                  //}
                }
                if (this.mod.notifications.length == 0) {
                   let notification = new Notification(this.app, this.mod, null);
                   notification.render(".tweet-manager");
                }

                this.intersectionObserver.unobserve(document.querySelector("#redsquare-intersection"));
                this.hideLoader();
              });
            }

            //
            // load more profile tweets
            //
            if (this.mode == "profile") {
              this.mod.loadProfileTweets(null, this.publickey, (txs) => {
                if (this.mode !== "profile") { return; }
                
                for (let z = 0; z < txs.length; z++) {
                  let tweet = new Tweet(this.app, this.mod, txs[z]);
                  if (tweet?.noerrors){
                    tweet.render();  
                  }
                }
                this.hideLoader();
                if (txs.length == 0){
                  this.app.browser.addElementToSelector(`<div class="saito-end-of-redsquare">No more tweets</div>`, ".tweet-manager");
                  this.intersectionObserver.unobserve(document.querySelector("#redsquare-intersection"));
                }
              });
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "30px",
        threshold: 1,
      }
    );
  }

  render(new_mode = "tweets") {
    let myqs = `.tweet-manager`;

    //Stop observering while we rebuild the page
    this.intersectionObserver.disconnect();
    this.profile.remove();

    console.log(new_mode);

    let holder = document.getElementById("tweet-thread-holder");
    let managerElem = document.querySelector(myqs);
    
    if (!document.querySelector(myqs)) {
      this.app.browser.addElementToSelector(TweetManagerTemplate(), this.container);
    } else {
      if (this.mode == "tweets" ) {
        console.log("Cache tweets");
    
        let kids = managerElem.children;
        console.log(kids.length);
        holder.replaceChildren(...kids);
        
      }else {
        console.log("clear tweet manager");
        while (managerElem.hasChildNodes()){
          managerElem.firstChild.remove();
        }
      }
    }

    
    
    this.showLoader();


    ////////////
    // tweets //
    ////////////
    if (new_mode == "tweets") {

      if (holder){
        console.log("Restore tweets");
        let kids = holder.children;
        console.log(kids.length);
        managerElem.replaceChildren(...kids);
      }

      for (let i = 0; i < this.mod.tweets.length; i++) {
        let tweet = this.mod.tweets[i];
        tweet.renderWithCriticalChild();
      }

      setTimeout(()=> { this.hideLoader();}, 50);
    }

    ///////////////////
    // notifications //
    ///////////////////
    if (new_mode == "notifications") {

      if (this.mod.notifications.length == 0) {
        let notification = new Notification(this.app, this.mod, null);
        notification.render(".tweet-manager");
      } else {
        for (let i = 0; i < this.mod.notifications.length; i++) {
          let notification = new Notification(this.app, this.mod, this.mod.notifications[i].tx);
          notification.render(".tweet-manager");
        }
      }

      setTimeout(()=> { this.hideLoader();}, 50);
    }

    /////////////
    // profile //
    /////////////
    if (new_mode == "profile") {
      this.profile.publickey = this.publickey;

      this.profile.render();

      //
      // all peers reset to 0 tweets fetched
      //
      this.mod.updatePeerStat(new Date().getTime(),"profile_earliest_ts");
      
      /*this.mod.loadProfileTweets(null, this.publickey, (txs) => {
        for (let z = 0; z < txs.length; z++) {
          let tweet = new Tweet(this.app, this.mod, txs[z]);
          tweet.render();
        }
        setTimeout(()=> { this.hideLoader();}, 50);
      });*/
    }

    this.mode = new_mode;

    //Fire up the intersection observer
    this.attachEvents();
  }

  //
  // this renders a tweet, loads all of its available children and adds them to the page
  // as they appear...
  //
  renderTweet(tweet) {

    this.render("single");

    //Show the basic tweet first
    if (!tweet.parent_id) {
      tweet.renderWithChildren();  
    }
    
    //Query the whole thread
    let thread_id = tweet.thread_id || tweet.parent_id || tweet.tx.transaction.sig;

    this.mod.loadTweetThread(null, thread_id, () => {
      let root_tweet = this.mod.returnTweet(thread_id);
      root_tweet.renderWithChildren();
      this.hideLoader();
    });

    //
    //Mobile back button (when left navigation bar hidden!)
    //
    if (window.innerWidth < 1200){
      this.app.connection.emit("saito-header-replace-logo", (e) => {
          this.app.connection.emit("redsquare-home-render-request");
      });
    }

  }

  attachEvents() {
    //
    // dynamic content loading
    //
    this.intersectionObserver.observe(document.querySelector("#redsquare-intersection"));

    this.app.connection.emit("redsquare-navigation-complete");
  }

  showLoader() {
    this.loader.show();
  }
  hideLoader() {
    this.loader.hide();
  }
}

module.exports = TweetManager;
