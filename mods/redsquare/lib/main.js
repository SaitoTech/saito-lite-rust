const RedSquareMainTemplate = require('./main.template');
const TweetManager = require('./manager');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoProgress = require('./../../../lib/saito/ui/saito-progress-bar/saito-progress-bar');

class RedSquareMain {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.name = 'RedSquareMain';

    this.components = {};

    this.scroll_depth = 0;
    this.scroll_behavior = 'auto';

    this.manager = new TweetManager(app, mod, '.saito-main');
    this.loader = new SaitoProgress(app, mod, '.redsquare-progress-banner');

    //
    // measuring activity
    //
    this.idleTime = 10;

    ////////////////////
    // EVENTS
    ////////////////////

    //
    // HOME-RENDER-REQUEST -- render the main thread
    //
    this.app.connection.on('redsquare-home-render-request', (scroll_to_top = false) => {
      if (scroll_to_top) {
        this.scroll_depth = 0;
        this.idleTime = 10;
        this.scroll_behavior = 'smooth';
        window.history.replaceState({}, null, '/' + this.mod.slug);
      } else {
        window.history.pushState({}, null, '/' + this.mod.slug);
        this.scroll_behavior = 'auto';
      }

      this.renderHome();
    });

    //
    // POSTCACHE RENDER REQUEST removes "loading new tweets" if exists, then
    // re-renders if canRefreshPage() returns true. if we cannot refresh the
    // page we show a button that can be clicked to do so.
    //
    this.app.connection.on('redsquare-home-postcache-render-request', (num_tweets = 0) => {
      //
      // check if we can refresh page (show tweets immediately) or show prompt / button
      //
      if (num_tweets > 0) {
        //
        // we only want to show the reload tweets button if there are new tweets
        // to show, which we
        //
        let are_there_new_tweets_to_show = false;

        for (let i = 0; i < this.mod.tweets.length && i < 10; i++) {
          if (!this.mod.tweets[i].isRendered()) {
            if (!this.mod.curated || this.mod.tweets[i].curated) {
              if (this.mod.tweets[i].curated) {
                are_there_new_tweets_to_show = true;
              }
            }
          }
        }

        //
        // Don't insert new tweets or button if looking at a tweet or profile
        //
        if (this.manager.mode == 'tweets' && are_there_new_tweets_to_show) {
          this.scroll_depth = 0;
          this.idleTime = 10;
          this.scroll_behavior = 'smooth';

          if (this.canRefreshPage()) {
            //this.manager.clearFeed();
            this.renderHome();
          } else {
            setTimeout(() => {
              if (!document.getElementById('saito-new-tweets')) {
                this.app.browser.prependElementToSelector(
                  `<div class="saito-button-secondary saito-new-tweets" id="saito-new-tweets">load new tweets</div>`,
                  '.redsquare-progress-banner'
                );
              }

              document.getElementById('saito-new-tweets').onclick = (e) => {
                e.currentTarget.remove();
                //this.manager.clearFeed();
                this.renderHome();
              };
            }, 1000);
          }
        }
      }

      // Update earliest so that we can set up infinite scroll
      this.mod.tweets_earliest_ts--;
    });

    //
    // when someone clicks on a tweet
    //
    this.app.connection.on('redsquare-tweet-render-request', (tweet) => {
      this.scrollFeed(0);

      window.history.pushState(
        {
          view: 'tweet',
          tweet: tweet.thread_id
        },
        null,
        '/' + this.mod.slug + `/?tweet_id=${tweet.tx.signature}`
      );

      this.app.connection.emit('saito-header-replace-logo', () => {
        window.history.back();
      });

      this.renderThread(tweet);
    });

    this.app.connection.on('redsquare-notifications-render-request', () => {
      window.history.pushState(
        {
          view: 'notifications',
          last_view: this.notifications_last_viewed_ts,
          unviewed_ct: this.mod.notifications_number_unviewed
        },
        null,
        '/' + this.mod.slug + '#notifications'
      );

      this.app.connection.emit('saito-header-replace-logo', () => {
        window.history.back();
      });

      this.scrollFeed(0);

      this.renderNotifications();
    });

    //
    // Replace RS with a user's profile (collection of their tweets)
    //
    this.app.connection.on('redsquare-profile-render-request', (publicKey = '') => {
      this.scrollFeed(0);

      if (!publicKey) {
        publicKey = this.mod.publicKey;
      }

      let target = publicKey == this.mod.publicKey ? '#profile' : `/?user_id=${publicKey}`;

      window.history.pushState({ view: 'profile', publicKey }, '', '/' + this.mod.slug + target);

      this.app.connection.emit('saito-header-replace-logo', () => {
        window.history.back();
      });

      this.renderProfile(publicKey);
    });

    this.app.connection.on(
      'redsquare-insert-loading-message',
      (message = 'loading new tweets...') => {
        // There is a tendency for these site messages to run on top of each other,
        // so log in the console too
        console.log('RS loading-message: ' + message);

        siteMessage(message, 1000);
        //        this.loader.render(message);
      }
    );

    this.app.connection.on('redsquare-remove-loading-message', (message = `Finished Loading!`) => {
      //NOTE: --> COMMENT THIS OUT TO KEEP MESSAGE DISPLAYED FOR CSS TWEAKING
      //  siteMessage();
      //      this.loader.finish(message);
    });

    this.app.connection.on('saito-blacklist', (obj) => {
      let target_key = obj?.publicKey;

      if (!target_key) {
        return;
      }

      for (let tweet of this.mod.tweets) {
        if (tweet.tx.isFrom(target_key)) {
          tweet.hideTweet();
        }
      }
    });

    window.onpopstate = (event) => {
      //if (this.mod.debug){
      console.log(
        '===================',
        'RSnavigation: ',
        event?.state,
        window.location,
        '========================'
      );
      //}
      this.render(event.state);
    };
  }

  render(state) {
    if (document.querySelector('.saito-container')) {
      //this.app.browser.replaceElementBySelector(RedSquareMainTemplate(), '.saito-container');
      if (document.querySelector('.saito-main')) {
        document.querySelector('.saito-main').innerHTML = '';
      }
    } else {
      this.app.browser.addElementToDom(RedSquareMainTemplate());
    }

    //
    // check url hash so we don't render conflicting things...
    //
    let render_tweets = true;

    let user_id = this.app.browser.returnURLParameter('user_id');

    switch (window.location.hash) {
      case '#notifications':
        console.log('RSNAV: Render Notifications');
        this.renderNotifications();
        render_tweets = false;
        break;
      case '#profile':
        user_id = this.mod.publicKey;
        break;
      case '#bizarro':
        this.mod.bizarro = true;
      default:
    }

    //
    // render user profile
    //
    if (user_id) {
      console.log('RSNAV: Render Profile');
      render_tweets = false;
      this.renderProfile(user_id);
    }

    //
    // if view specific tweet, ask for tweet/children
    //
    let tweet_id = this.app.browser.returnURLParameter('tweet_id');
    if (tweet_id) {
      console.log('RSNAV: Render Thread');
      this.mod.loadTweetWithSig(tweet_id, (txs) => {
        console.log(`RSNAV: Tweet thread load returned ${txs.length} tweets`);
        for (let z = 0; z < txs.length; z++) {
          this.mod.addTweet(txs[z], 'url_sig');
        }
        let tweet = this.mod.returnTweet(tweet_id);
        this.renderThread(tweet);
      });

      render_tweets = false;
    }

    if (render_tweets) {
      console.log('RSNAV: Render Feed');
      this.renderHome();
    }

    // Only needs to be run once...
    this.attachEvents();
  }

  renderHome() {
    console.log("RS: renderHome");
    this.manager.render('tweets');
    this.scrollFeed(this.scroll_depth, this.behavior);

    this.app.connection.emit('saito-header-reset-logo');
  }

  renderProfile(key) {
    this.manager.renderProfile(key);
  }

  renderNotifications() {
    this.mod.resetNotifications();
    this.manager.render('notifications');
  }

  renderThread(tweet) {
    this.manager.renderTweet(tweet);
  }

  attachEvents() {
    var scrollableElement = document.querySelector('.saito-container');

    let lastScrollTop = 0;
    let triggered = false;
    let is_running = false;

    if (this.events_attached) {
      return;
    }

    if (this.app.browser.isSupportedBrowser()) {
      // TODO: only apply if height of scrollable is 100px > than 100vh

      let hh = getComputedStyle(document.body).getPropertyValue('--saito-header-height');

      scrollableElement.addEventListener('scroll', (e) => {
        var st = scrollableElement.scrollTop;

        if (is_running) {
          return;
        }

        // console.log("A:", scrollableElement.scrollTop, lastScrollTop, triggered);
        is_running = true;

        if (st > lastScrollTop) {
          // downscroll code
          if (!triggered) {
            document.getElementById('saito-header').style.top = `-${hh}`;
            document.getElementById('saito-header').style.height = '0';
            document.getElementById('saito-header').style.padding = '0';
            triggered = true;
          }

          is_running = 'down';
        } else if (st < lastScrollTop) {
          // upscroll code
          if (triggered) {
            document.getElementById('saito-header').removeAttribute('style');
            triggered = false;
          }
        } // else was horizontal scroll
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling

        //console.log("B:", scrollableElement.scrollTop, lastScrollTop, triggered);

        if (this.manager.mode == 'tweets') {
          this.scroll_depth = scrollableElement.scrollTop;
          this.idleTime = 0;
        }

        setTimeout(() => {
          is_running = false;
          if (scrollableElement.scrollTop < 50 && triggered) {
            document.getElementById('saito-header').removeAttribute('style');
            triggered = false;
          }
        }, 75);
      });
    }

    this.monitorUserInteraction();

    this.events_attached = true;
  }

  scrollFeed(newDepth = this.scroll_depth, behavior = 'auto') {
    if (this.manager.mode == 'tweets') {
      this.scroll_depth = document.querySelector('.saito-container').scrollTop;
    }

    document.querySelector('.saito-container').scroll({ top: newDepth, left: 0, behavior });
  }

  monitorUserInteraction() {
    let this_main = this;
    // Increment the idle time counter every second.
    var idleInterval = setInterval(function () {
      this_main.idleTime = this_main.idleTime + 1;
    }, 1000);

    document.body.addEventListener('scroll', function () {
      this_main.idleTime = 0;
    });
    document.body.addEventListener('keydown', function () {
      this_main.idleTime = 0;
    });
    document.body.addEventListener('click', function () {
      this_main.idleTime = 0;
    });
    document.body.addEventListener('touchstart', function () {
      this_main.idleTime = 0;
    });
  }

  //
  // we can refresh the page if we are at the top, and we have not
  // clicked on an overlay such as leaving a response or trying to
  // load content.
  //
  canRefreshPage() {
    //
    // no if we have scrolled down
    //
    if (this.scroll_depth) {
      return 0;
    }

    //return false if any overlay is open
    if (document.querySelector('.saito-overlay') != null) {
      return 0;
    }

    //
    // if the user is typing something
    //
    let textareas = document.querySelectorAll('textarea');
    for (var i = 0; i < textareas.length; i++) {
      if (textareas[i].value.trim() !== '') {
        return 1;
      }
    }

    if (this.idleTime >= 10) {
      return 1;
    }

    //
    // no by default
    //
    return 0;
  }
}

module.exports = RedSquareMain;
