const RedSquareNavigationTemplate = require('./navigation.template');
const jsonTree = require('json-tree-viewer');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const Post = require('./post');

class RedSquareNavigation {
  constructor(app, mod, container = '') {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod);
    this.container = container;

    app.connection.on('redsquare-clear-menu-highlighting', (active_tab = '') => {
      document.querySelectorAll('.redsquare-page-active').forEach((el) => {
        el.classList.remove('redsquare-page-active');
      });

      if (active_tab == 'tweets') {
        if (document.querySelector('.redsquare-menu-home')) {
          document.querySelector('.redsquare-menu-home').classList.add('redsquare-page-active');
        }
      }

      if (active_tab == 'notifications') {
        if (document.querySelector('.redsquare-menu-notifications')) {
          document
            .querySelector('.redsquare-menu-notifications')
            .classList.add('redsquare-page-active');
        }
      }

      if (active_tab == 'profile') {
        if (document.querySelector('.redsquare-menu-profile')) {
          document.querySelector('.redsquare-menu-profile').classList.add('redsquare-page-active');
        }
      }
    });

    app.connection.on('redsquare-update-notifications', (num) => {
      this.incrementNotifications(num);
    });
  }

  render() {
    //
    // render menu container
    //
    if (document.querySelector('.redsquare-menu')) {
      this.app.browser.replaceElementBySelector(
        RedSquareNavigationTemplate(this.app, this.mod),
        '.redsquare-menu'
      );
    } else {
      this.app.browser.addElementToSelector(
        RedSquareNavigationTemplate(this.app, this.mod),
        this.container
      );
    }

    //
    // adds chat toggle to left-menu
    //
    this.app.modules.returnModulesRespondingTo('saito-chat-popup').forEach((mod) => {
      let id = `redsquare-menu-${mod.returnSlug()}`;
      const rs = mod.respondTo('saito-chat-popup')[0];
      this.app.browser.addElementToSelector(
        `<li class="redsquare-menu-mobile" id="${id}">
            <i class="${rs.icon}"></i>
            <span>${mod.returnName()}</span>
          </li>`,
        '.saito-menu-list'
      );

      if (rs.event) {
        rs.event(id);
      }

      if (document.getElementById(id)) {
        document.getElementById(id).onclick = () => {
          if (rs.callback) {
            rs.callback(this.app, id);
          }
        };
      }
    });

    this.attachEvents();
  }

  attachEvents() {
    let this_self = this;

    //
    // new tweet
    //
    document.getElementById('new-tweet').onclick = (e) => {
      let post = new Post(this.app, this.mod);
      post.render();
    };

    //
    // new tweet (mobile)
    //
    if (document.getElementById('mobile-new-tweet') != null) {
      document.getElementById('mobile-new-tweet').onclick = (e) => {
        let post = new Post(this.app, this.mod);
        post.render();
      };
    }

    //
    // home
    //
    document.querySelector('.redsquare-menu-home').onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      console.log("======================", "RSNAV: click home ...")

      if (window.location.hash || window.location.search) {

        this.app.connection.emit('redsquare-home-render-request');
        this.app.connection.emit('redsquare-remove-loading-message', 'navigating...');

      } else {
        this.app.connection.emit('redsquare-home-render-request', true);

        let ct = this.mod.loadTweets('later', (tx_count) => {
          this.app.connection.emit('redsquare-home-postcache-render-request', tx_count);
        });

        if (ct) {
          this.app.connection.emit(
            'redsquare-insert-loading-message',
            `Checking with ${ct} peers for new tweets...`
          );
        }
      }

    };

    //
    // notifications
    //
    document.querySelector('.redsquare-menu-notifications').onclick = (e) => {
      this.app.connection.emit('redsquare-notifications-render-request');
      this.app.connection.emit('redsquare-remove-loading-message', 'navigating...');
    };

    //
    // profile
    //
    document.querySelector('.redsquare-menu-profile').onclick = (e) => {
      this.openProfile(this.mod.publicKey);
    };

    //
    // settings
    //
    document.querySelector('.redsquare-menu-settings').onclick = (e) => {
      this.mod.loadSettings();
      let ms = this.app.modules.returnModulesRespondingTo('saito-moderation-core');
      if (ms?.length) {
        ms[0].loadSettings('.module-settings-overlay');
      }
    };

    if (document.querySelector('.redsquare-menu-help')) {
      document.querySelector('.redsquare-menu-help').onclick = (e) => {
        this.overlay.show(`<div class="debug_overlay"></div>`);

        let el = document.querySelector('.debug_overlay');

        if (document.querySelector(".tweet-html-markers.show")){
          Array.from(document.querySelectorAll(".tweet-html-markers.show")).forEach(el => {
            el.classList.remove('show');
          });
        }else{
          Array.from(document.querySelectorAll(".tweet-html-markers")).forEach(el => {
            el.classList.add('show');
          });
        }


        //debug info

        if (!this.mod.styles.includes('/saito/lib/jsonTree/jsonTree.css')) {
          this.mod.styles.push('/saito/lib/jsonTree/jsonTree.css');
          this.mod.attachStyleSheets();
        }

/*
    this.tweets = [];     // time sorted master list of tweets
    this.cached_tweets = []; // serialized-for-web version of curated_tweets
    this.tweets_sigs_hmap = {};
    this.unknown_children = [];
    this.orphan_edits = [];

    this.peers = [];
    this.keylist = {};

    this.tweet_count = 0;
    this.liked_tweets = [];
    this.retweeted_tweets = [];
    this.replied_tweets = [];
    this.hidden_tweets = [];

*/

        try {

          let optjson = JSON.parse(
            JSON.stringify(
              this.mod,
              (key, value) => {
                if (key == "app") return "app";
                if (key == "mod") return "mod";
                if (key == "parent_tweet") return "<-";
                return (typeof value === 'bigint') ? value.toString() : value // return everything else unchanged
              }
            )
          );
          var tree = jsonTree.create(optjson, el);
        } catch (err) {
          console.error('error creating jsonTree: ' + err);
        }

        console.log(this.mod.tweets_sigs_hmap);
      };
    }
  }

  /*
    To capture clicking in navigation menu and through user menu...
  */
  openProfile(publicKey) {
    this.app.connection.emit('redsquare-profile-render-request', publicKey);
    this.app.connection.emit('redsquare-remove-loading-message', 'navigating...');
  }

  incrementNotifications(notifications = -1) {
    let qs = `.redsquare-menu-notifications`;

    if (document.querySelector(qs)) {
      qs = `.redsquare-menu-notifications > .saito-notification-dot`;
      let obj = document.querySelector(qs);
      if (!obj) {
        if (notifications > 0) {
          this.app.browser.addElementToSelector(
            `<div class="saito-notification-dot">${notifications}</div>`,
            `.redsquare-menu-notifications`
          );
        } else {
          this.app.browser.addElementToSelector(
            `<div class="saito-notification-dot"></div>`,
            `.redsquare-menu-notifications`
          );
          qs = `.redsquare-menu-notifications > .saito-notification-dot`;
          let obj = document.querySelector(qs);
          obj.style.display = 'none';
        }
      } else {
        let existing_notifications = 0;
        if (obj.innerHTML) {
          existing_notifications = parseInt(obj.innerHTML);
        }
        if (notifications <= 0) {
          obj.style.display = 'none';
          obj.innerHTML = 0;
        } else {
          obj.style.display = 'flex';
          existing_notifications++;
          obj.innerHTML = existing_notifications;
        }
      }
    }
  }
}

module.exports = RedSquareNavigation;
