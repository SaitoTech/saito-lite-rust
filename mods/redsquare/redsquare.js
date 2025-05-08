const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const SaitoCamera = require('../../lib/saito/ui/saito-camera/saito-camera');
const SaitoMain = require('./lib/main');
const RedSquareNavigation = require('./lib/navigation');
const RedSquareSidebar = require('./lib/sidebar');
const TweetMenu = require('./lib/tweet-menu');
const Tweet = require('./lib/tweet');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const prettify = require('html-prettify');
const redsquareHome = require('./index');
const Post = require('./lib/post');
const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const SaitoOverlay = require('./../../lib/saito/ui/saito-overlay/saito-overlay');

/*
 * lib/main.js:    this.app.connection.on("redsquare-home-render-request", () => {      // renders main tweets
 * lib/main.js:    this.app.connection.on("redsquare-home-postcache-render-request", () => {      // pushes new content into feed if possible
 * lib/main.js:    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {   // renders tweet onto page, at bottom
 * lib/main.js:    this.app.connection.on("redsquare-profile-render-request", () => {     // renders profile
 * lib/main.js:    this.app.connection.on("redsquare-notifications-render-request", () => {   // renders notifications
 */

////////////////////////////////////////////
//
// RedSquare depends on the Archive module for TX storage. This allows the
// module to fetch tweets from multiple machines using a consistent API,
// the loadTransactions() function.
//
// Transactions are fetched and submitted to the addTweet() function which
// creates a tweet /lib/tweet.js which is responsible for formatting and
// displaying itself as and when requested.
//
// On initial load the module fetches from localhost. Whenever peers that
// support Archives are added, they are added to a list of peers from
// which tweets can be requested.
//
///////////////////////////////////////////

class RedSquare extends ModTemplate {
  constructor(app) {
    super(app);

    this.appname = 'Red Square';
    this.name = 'RedSquare';
    this.slug = 'redsquare';
    this.description = 'Open Source Twitter-clone for the Saito Network';
    this.categories = 'Social Entertainment';
    this.icon_fa = 'fas fa-square-full';

    this.debug = false;

    this.tweets = []; // time sorted master list of tweets
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

    this.notifications = [];
    this.notifications_sigs_hmap = {};

    //
    // controls whether non-curated tweets will render
    //
    this.curated = true;

    this.possibleHome = 1;

    this.use_floating_plus = 1;

    //
    // is this a notification?
    //
    this.notifications_earliest_ts = new Date().getTime();
    this.notifications_last_viewed_ts = 0;
    this.notifications_number_unviewed = 0;

    this.tweets_earliest_ts = new Date().getTime();

    this.allowed_upload_types = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];

    this.postScripts = ['/saito/lib/emoji-picker/emoji-picker.js'];

    this.enable_profile_edits = true;

    //
    // This is the default Open Graph Card for Redsquare
    // If we have a link to a specific tweet, we will use a different object to populate the
    // generated html in the webserver
    //
    this.social = {
      twitter: '@SaitoOfficial',
      title: '🟥 Saito RedSquare - Web3 Social Media',
      url: 'https://saito.io/redsquare/',
      description: 'Peer to peer Web3 social media platform',
      image: 'https://saito.tech/wp-content/uploads/2022/04/saito_card.png' //square image with "Saito" below logo
      //image: "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png",
    };

    this.theme_options['sangre'] = 'fa-solid fa-droplet';

    this.app.connection.on('saito-render-complete', () => {
      this.app.connection.emit(
        'redsquare-update-notifications',
        this.notifications_number_unviewed
      );
    });

    this.app.connection.on('redsquare-new-post', (msg) => {
      let post = new Post(this.app, this);
      post.render();
    });

    this.app.connection.on('redsquare-post-tweet', (data, keys) => {
      this.sendTweetTransaction(this.app, this, data, keys);
    });

    this.app.connection.on('redsquare-home-render-request', () => {
      if (this.browser_active && this.orphan_edits.length > 0) {
        let orig_length = this.orphan_edits.length;
        for (let i = 0; i < orig_length; i++) {
          let orphan = this.orphan_edits.shift();
          this.editTweet(orphan.tweet_id, orphan.tx, orphan.source);
        }
        console.log(`${orig_length - this.orphan_edits.length} orphaned edits processed!`);
      }
    });

    return this;
  }

  returnServices() {
    let services = [];
    if (!this.app.BROWSER || this.offerService) {
      services.push(
        this.app.network.createPeerService(null, 'redsquare', 'RedSquare Tweet Archive')
      );
    }
    return services;
  }

  loadSettings(container = null) {
    if (!container) {
      let overlay = new SaitoOverlay(this.app, this.mod);
      overlay.show(`<div class="module-settings-overlay"><h2>Redsquare Settings</h2></div>`);
      container = '.module-settings-overlay';
    }
  }

  /////////////////////////////////
  // inter-module communications //
  /////////////////////////////////
  respondTo(type = '', obj) {
    let this_mod = this;

    if (type === 'user-menu') {
      return {
        text: `${
          obj?.publicKey && obj.publicKey === this.publicKey ? 'My' : 'View'
        } RedSquare Profile`,
        icon: 'fa fa-user',
        callback: function (app, publicKey) {
          if (this_mod?.menu) {
            this_mod.menu.openProfile(publicKey);
          } else {
            navigateWindow(`/redsquare/?user_id=${publicKey}`);
          }
        }
      };
    }

    if (type === 'saito-header') {
      let x = [];
      if (!this.browser_active) {
        x.push({
          text: 'RedSquare',
          icon: 'fa-solid fa-square',
          rank: 20,
          callback: function (app, id) {
            navigateWindow('/redsquare');
          },
          event: function (id) {
            this_mod.app.connection.on('redsquare-update-notifications', (unread) => {
              this_mod.app.browser.addNotificationToId(unread, id);
              this_mod.app.connection.emit('saito-header-notification', 'redsquare', unread);
            });
          }
        });
      } else {
        if (this.app.browser.isMobileBrowser() || window.innerWidth < 600) {
          x.push({
            text: 'RedSquare Home',
            icon: 'fa-solid fa-house',
            rank: 21,
            callback: function (app, id) {
              document.querySelector('.redsquare-menu-home').click();
            }
          });
          x.push({
            text: 'Notifications',
            icon: 'fas fa-bell',
            rank: 23,
            callback: function (app, id) {
              document.querySelector('.redsquare-menu-notifications').click();
            },
            event: function (id) {
              this_mod.app.connection.on('redsquare-update-notifications', (unread) => {
                this_mod.app.browser.addNotificationToId(unread, id);
                this_mod.app.connection.emit('saito-header-notification', 'redsquare', unread);
              });
            }
          });
          x.push({
            text: 'Profile',
            icon: 'fas fa-user',
            rank: 26,
            callback: function (app, id) {
              document.querySelector('.redsquare-menu-profile').click();
            }
          });
        }
      }

      return x;
    }

    if (type === 'saito-floating-menu') {
      let x = [];
      x.push({
        text: 'Tweet',
        icon: 'fa-solid fa-pen',
        is_active: this.browser_active,
        disallowed_mods: ['arcade'],
        rank: 10,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          post.render();
        }
      });

      x.push({
        text: 'Tweet Camera',
        icon: 'fas fa-camera',
        is_active: this.browser_active,
        disallowed_mods: ['arcade'],
        rank: 30,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          let camera = new SaitoCamera(app, this_mod, (img) => {
            post.render();
            post.addImg(img);
          });
          camera.render();
        }
      });

      x.push({
        text: 'Tweet Image',
        icon: 'fas fa-image',
        is_active: this.browser_active,
        disallowed_mods: ['arcade'],
        rank: 20,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          post.render();
          post.triggerClick('#hidden_file_element_tweet-overlay');
        }
      });
      return x;
    }

    if (type == 'game-menu') {
      //this.attachStyleSheets();
      //super.render(this.app, this);
      return {
        //id: 'game-share',
        //text: 'Share',
        submenus: [
          {
            parent: 'game-share',
            text: 'Tweet',
            id: 'game-tweet',
            class: 'game-tweet',
            callback: function (app, game_mod) {
              game_mod.menu.hideSubMenus();
              let post = new Post(app, this_mod);
              post.render();
            }
          }
        ]
      };
    }

    //
    // curation / moderation functions
    //
    // all tweets received are passed through this function, which indicates whether they
    // pass the curation function. -1 = fail / 0 = unsure / 1 = pass
    //
    if (type === 'saito-moderation-app') {
      return {
        //
        // default curation logic...
        //
        filter_func: (mod = null, tx = null) => {
          if (tx == null || mod == null || !tx?.from) {
            return 0;
          }

          if (mod.name !== this.name) {
            return 0;
          }

          if (this.hidden_tweets.includes(tx.signature)) {
            return -1;
          }

          //
          // CURATION (browsers)
          //
          // we have two kinds of curation, browsers filter based on a restricted
          // set of criteria, looking for transactions/tweets from users/friends
          // stored on their keylist.
          //
          if (this.app.BROWSER) {
            if (this.app.keychain.hasPublicKey(tx.from[0].publicKey)) {
              return 1;
            }

            if (tx?.optional?.num_replies > 0) {
              return 0;
            }

            if (tx?.optional?.num_likes > 10) {
              return 0;
            }

            return -1;

            //
            // CURATION (servers)
            //
            // servers filter based on whether users have registered usernames and
            // whether the tweets themselves seem to have a positive reception.
            // these criteria are used to determine whether the tweets are passed
            // along to users.
            //
          } else {
            let is_anonymous_user = !this.app.keychain.returnIdentifierByPublicKey(
              tx.from[0].publicKey,
              false
            );
            if (is_anonymous_user) {
              return 0;
            }

            let tweet = new Tweet(this.app, this, tx, '.tweet-manager');
            if (tweet.num_replies > 0) {
              return 1;
            }

            if (tweet.num_likes > 1) {
              return 1;
            }
          }

          return 0;
        }
      };
    }

    return null;
  }

  ////////////////////
  // initialization //
  ////////////////////
  //
  // this function runs whenever the browser or application is loaded. note that
  // at this point we probably do not have any network connections to any peers
  // so most of the work is pre-network init.
  //
  async initialize(app) {
    //
    // database setup etc.
    //
    await super.initialize(app);

    //
    // ensure easy-access in non-awaitable
    //
    this.publicKey = await app.wallet.getPublicKey();

    //
    // fetch content from options file
    //
    this.loadOptions();

    if (!app.BROWSER) {
    //
    // everyone loads their initial set of tweets from localhost
    //
    let ts = Date.now() - 14 * 24 * 60 * 60 * 1000;
    this.app.storage.loadTransactions(
      {
        field1: 'RedSquare',
        flagged: 0,
        tx_size_less_than: 1000000,
        limit: 400,
        updated_later_than: ts
      },
      (txs) => {
        this.processTweetsFromPeer('localhost', txs, 'redsquare.initialize');
        if (!this.app.BROWSER) {
          this.cacheRecentTweets();
        }
      },
      'localhost'
    );
    }
    ///////////////////////
    // SERVERS EXIT HERE //
    ///////////////////////
    if (!app.BROWSER) {
      return;
    }

    //
    // add myself as peer...
    //
    this.addPeer('localhost');

    //
    // check tweets in pending txs
    //
    try {
      let user_id = this.app.browser.returnURLParameter('user_id');
      let tweet_id = this.app.browser.returnURLParameter('tweet_id');
      if (!tweet_id || !user_id) {
        let pending = await app.wallet.getPendingTransactions();
        for (let i = 0; i < pending.length; i++) {
          let tx = pending[i];
          let txmsg = tx.returnMessage();
          if (txmsg && txmsg.module == this.name) {
            if (txmsg.request === 'create tweet') {
              this.addTweet(tx, 'pending_tx');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error while checking pending txs: ');
      console.error(err);
    }
  }

  reset() {}

  ////////////
  // render //
  ////////////
  //
  // browsers run this to render the page. this also runs before the network is
  // likely functional, so it focuses on writing the components to the screen rather
  // that fetching content.
  //
  // content is loaded from the local cache, and then the "loading new tweets" indicator
  // is enabled, and when onPeerServiceUp() triggers we run a postcache-render-request
  // to update the page if it is in a state where that is permitted.
  //
  async render() {
    //
    // browsers only!
    //
    if (!this.app.BROWSER || !this.browser_active) {
      return;
    }

    if (window?.tweets?.length) {
      for (let z = 0; z < window.tweets.length; z++) {
        let newtx = new Transaction();
        newtx.deserialize_from_web(this.app, window.tweets[z]);
        if (!newtx?.optional) {
          newtx.optional = {};
        }
        this.addTweet(newtx, 'server-cache', 1);
      }
    }

    //
    // create and render components
    //
    if (this.main == null) {
      this.main = new SaitoMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      await this.header.initialize(this.app);
      this.menu = new RedSquareNavigation(this.app, this, '.saito-sidebar.left');
      this.sidebar = new RedSquareSidebar(this.app, this, '.saito-sidebar.right');
      this.tweetMenu = new TweetMenu(this.app, this);

      this.addComponent(this.header);
      this.addComponent(this.main);
      this.addComponent(this.menu);
      this.addComponent(this.sidebar);

      //
      // chat manager goes in left-sidebar
      //
      for (const mod of this.app.modules.returnModulesRespondingTo('chat-manager')) {
        let cm = mod.respondTo('chat-manager');
        cm.container = '.saito-sidebar.left';
        cm.render_manager_to_screen = 1;
        this.addComponent(cm);
      }
    }

    await super.render();
    this.rendered = true;
  }

  /////////////////////
  // peer management //
  /////////////////////
  addPeer(peer) {
    let publicKey = peer?.publicKey || this.publicKey;
    let tweet_limit = peer?.publicKey ? 20 : 10;

    let peer_idx = -1;

    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].publicKey === publicKey) {
        peer_idx = i;
      }
    }
    if (peer_idx == -1) {
      this.peers.push({
        peer: peer,
        publicKey: publicKey,
        tweets_earliest_ts: new Date().getTime(),
        tweets_latest_ts: 0,
        tweets_limit: tweet_limit
      });
    } else {
      this.peers[peer_idx].peer = peer;
    }
  }

  ////////////////////////
  // when peer connects //
  ////////////////////////
  async onPeerServiceUp(app, peer, service = {}) {
    //
    // avoid network overhead if in other apps
    //
    if (!this.browser_active) {
      return;
    }

    //
    // Registry Services
    //
    // fetch list of unknown keys and perform name-lookup
    //
    if (service.service === 'registry' && !this.app.BROWSER) {
      this.fetchMissingUsernames((answers) => {
        this.cacheRecentTweets(true);
      });
    }

    //
    // redsquare -- load tweets
    //
    if (service.service === 'archive') {
      //
      // add service peer, query and set up interval to poll every 5 minutes
      //
      this.addPeer(peer, 'tweets');
      this.loadTweets(
        'later',
        (tx_count) => {
          this.app.connection.emit('redsquare-home-postcache-render-request', tx_count);
        },
        peer
      );

      //
      // auto-poll for new tweets, on 5 minute interval
      //
      setInterval(() => {
        this.loadTweets(
          'later',
          (tx_count) => {
            this.app.connection.emit('redsquare-home-postcache-render-request', tx_count);
          },
          peer
        );
      }, 300000);

      if (this.browser_active) {
        siteMessage('Synching Redsquare...', 2000);
        // Rerender now that we should have content coming...
        this.main.render();
      }
    }
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  //
  // messages arrive off-chain over the network here, inviting a response
  // from each peer to its requesting counterparty off-chain. for on-chain
  // messages and responses please see onConfirmation() function.
  //
  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    return super.handlePeerTransaction(app, tx, peer, mycallback);
  }

  //
  // messages arrive on-chain over the network here
  //
  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (this.debug) {
        console.log('%%');
        console.log('NEW TRANSACTION RECEIVED!');
        if (txmsg.data.images) {
          let new_obj = JSON.parse(JSON.stringify(txmsg));
          new_obj.data.images = '[image tweet]';
          //console.log('txmsg: ' + JSON.stringify(new_obj));
        } else {
          //console.log('txmsg: ' + JSON.stringify(txmsg));
        }
      }

      if (txmsg.request === 'delete tweet') {
        await this.receiveDeleteTransaction(blk, tx, conf, this.app);
        return;
      }
      if (txmsg.request === 'edit tweet') {
        await this.receiveEditTransaction(blk, tx, conf, this.app);
        return;
      }
      if (txmsg.request === 'create tweet') {
        await this.receiveTweetTransaction(blk, tx, conf, this.app);
        if (this.addTweet(tx, 'receiveTweet')) {
          this.cacheRecentTweets();
        }
      }
      if (txmsg.request === 'like tweet') {
        await this.receiveLikeTransaction(blk, tx, conf, this.app);
        if (Math.random() < 0.15) {
          this.cacheRecentTweets();
        }
      }
      if (txmsg.request === 'flag tweet') {
        await this.receiveFlagTransaction(blk, tx, conf, this.app);
        this.cacheRecentTweets();
      }
      if (txmsg.request === 'retweet') {
        await this.receiveRetweetTransaction(blk, tx, conf, this.app);
      }

      if (this.app.BROWSER) {
        this.addNotification(tx);
      }
    }
  }

  ///////////////////////////////
  // content loading functions //
  ///////////////////////////////
  //
  // there are three major functions that are called to fetch more content:
  //
  // - loadProfile()
  // - loadTweets()
  // - loadNotifications()
  //
  // these will trigger calls to all of the peers that have been added and
  // fetch more content from all of them up until there is no more content
  // to fetch and display. this content will be fetched and returned in the
  // form of transactions that can be fed to addTweets() or displayed
  // via the manager.
  //
  loadTweets(created_at = 'earlier', mycallback, peer = null) {
    //
    // Instead of just passing the txs to the callback, we count how many of these txs
    // are new to us so we can have a better UX
    //
    let peer_count = 0;
    let peers_returned = 0;

    for (let i = 0; i < this.peers.length; i++) {
      //
      // we have two stop conditions,
      //
      // 1) when our peer has been tapped out on earlier (older) tweets, we stop querying them.
      //
      // 2) if we are our own peer, don't look for later (newer) tweets
      //
      // the second should keep the "loading" message flashing longer
      // though this is a hack and we will need to fix once we are loading from multiple remote peers
      // it is just a bit of a pain because we have triply nested callbacks...
      //
      if (
        !(created_at == 'earlier' && this.peers[i].tweets_earliest_ts <= this.tweets_earliest_ts) &&
        !(
          created_at == 'later' &&
          this.peers[i].publicKey == this.publicKey &&
          this.peers[i].tweets_latest_ts > 0
        ) &&
        (!peer || peer.publicKey == this.peers[i].publicKey)
      ) {
        peer_count++;

        let obj = {
          field1: 'RedSquare',
          flagged: 0,
          //tx_size_less_than: 1330000,
          limit: this.peers[i].tweets_limit
        };

        if (created_at == 'earlier') {
          obj.updated_earlier_than = this.peers[i].tweets_earliest_ts;
          if (this.debug) {
            console.log(
              `REDSQUARE: fetch earlier tweets from ${this.peers[i].publicKey} / ${this.peers[i].tweets_earliest_ts}`
            );
          }
        } else if (created_at == 'later') {
          obj.updated_later_than = this.peers[i].tweets_latest_ts;
        } else {
        }

        this.app.storage.loadTransactions(
          obj,
          (txs) => {
            let count = 0;

            if (txs.length > 0) {
              count = this.processTweetsFromPeer(this.peers[i], txs, 'redsquare.loadTweets');
              if (this.debug) {
                console.log(
                  `REDSQUARE-${i} (${this.peers[i].publicKey}): returned ${
                    txs.length
                  } ${created_at} tweets, ${count} are new to the feed. New earliest timestamp -- ${new Date(
                    this.peers[i].tweets_earliest_ts
                  )}`
                );
              }
            } else {
              if (created_at === 'earlier') {
                if (this.debug) {
                  console.log(`REDSQUARE-${i} (${this.peers[i].publicKey}) peer out of earlier tweets. Mark as closed`);
                }
                this.peers[i].tweets_earliest_ts = 0;
              }
            }

            //
            // We are only verbose about the fetching on the initial load
            // and when users click to refresh... otherwise we want the infinite 
            // scroll to invisibly add tweets to our feed
            //
            if (created_at === 'later') {
              if (this.peers[i].peer !== 'localhost') {
                this.app.connection.emit(
                  'redsquare-insert-loading-message',
                  `Processing ${txs.length} tweets returned from ${this.app.keychain.returnUsername(
                    this.peers[i].publicKey
                  )}`
                );
              } else {
                this.app.connection.emit(
                  'redsquare-insert-loading-message',
                  `Processing ${txs.length} tweets from my archive`
                );
              }

              peers_returned++;

              setTimeout(() => {
                if (peer_count > peers_returned) {
                  this.app.connection.emit(
                    'redsquare-insert-loading-message',
                    `Still waiting on ${peer_count - peers_returned} peer(s)...`
                  );
                } else {
                  this.app.connection.emit('redsquare-remove-loading-message');
                }
              }, 2000);
            }

            if (mycallback) {
              mycallback(count, this.peers[i]);
            }
          },
          this.peers[i].peer
        );
      }
    }

    return peer_count;
  }

  processTweetsFromPeer(peer, txs, source = '') {
    let count = 0;

    if (this.debug){
      console.log("RS processing tweets from peer: ", peer, source);
    }

    //
    // sanity-check in case blocked tweets have come through via
    // saving in local-storage or whitelisting by peers.
    //
    for (let z = 0; z < txs.length; z++) {
      txs[z].decryptMessage(this.app);

      if (txs[z].updated_at < peer.tweets_earliest_ts) {
        peer.tweets_earliest_ts = txs[z].updated_at;
      }
      if (txs[z].updated_at > peer.tweets_latest_ts) {
        peer.tweets_latest_ts = txs[z].updated_at;
      }

      //
      // specify the source of the tweet
      //
      if (!txs[z].optional.source) {
        txs[z].optional.source = {};
      }
      txs[z].optional.source.text = source;
      txs[z].optional.source.type = 'archive';
      if (peer != 'localhost') {
        txs[z].optional.source.peer = peer.publicKey;
      } else {
        txs[z].optional.source.peer = 'localhost';
      }

      //
      // curation, we respect our own by default
      //
      let curated = 0;
      if (peer == 'localhost') {
        curated = 1;
      }

      let added = this.addTweet(txs[z], 'archive', curated);
      let tweet = this.returnTweet(txs[z].signature);

      if (tweet) {
        //
        // save w. metadata
        //
        if (peer.publicKey != this.publicKey) {
          this.saveTweet(txs[z].signature, 0);
        }

        count += added;
      }
    }

    if (peer.tweets_earliest_ts < this.tweets_earliest_ts) {
      this.tweets_earliest_ts = peer.tweets_earliest_ts;
    }

    return count;
  }

  //
  // We have two types of notifications that are slightly differently indexed, so
  // we are doing some fancy work to load all the transactions into one big list and then
  // process it at once. We are only looking at local archive storage because browsers should
  // be saving the txs that are addressed to them (i.e. notifications), but we can easily expand this
  // logic to also query remote sources (by changing return_count to the 2x number of peers)
  //
  loadNotifications(mycallback = null) {
    let notifications = [];
    let return_count = 2;

    //
    // This is the callback to process the returned tweets,
    // which we DONT want to just insert into the feed
    //
    const middle_callback = () => {
      let new_notifications = [];

      if (this.debug) {
        console.log(
          `Redsquare: process ${notifications.length} combined tweet and like notifications`
        );
      }

      if (notifications.length > 0) {
        for (let z = 0; z < notifications.length; z++) {
          notifications[z].decryptMessage(this.app);

          if (this.addNotification(notifications[z])) {
            new_notifications.push(notifications[z]);
          }

          if (notifications[z].timestamp < this.notifications_earliest_ts) {
            this.notifications_earliest_ts = notifications[z].timestamp;
          }
        }
      } else {
        console.log('Redsquare: last notification fetch returned nothing');
        this.notifications_earliest_ts = 0;
      }

      console.log(`Appending ${new_notifications.length} new notification notices to the page`);

      if (mycallback) {
        mycallback(new_notifications);
      }
    };

    if (this.notifications_earliest_ts) {
      if (this.debug) {
        console.log(
          `RS: query notifications before -- ${new Date(this.notifications_earliest_ts)}`
        );
      }

      this.app.storage.loadTransactions(
        {
          field1: 'RedSquare',
          field3: this.publicKey,
          created_earlier_than: this.notifications_earliest_ts
        },
        (txs) => {
          for (let tx of txs) {
            notifications.push(tx);
          }

          if (this.debug) {
            console.log(`Found ${txs.length} tweet notifications`);
          }

          return_count--;
          if (return_count == 0) {
            middle_callback();
          }
        },
        'localhost'
      );

      //
      // Okay, so using a special like tag to make profile loading easier
      // complicates notifications loading... it would be nice if our arbitrary
      // archive fields weren't completely occupied by module/from/to...
      // This will need fixing if/when we change the archive schema (13 Nov 2023)
      //
      this.app.storage.loadTransactions(
        {
          field1: 'RedSquareLike',
          field3: this.publicKey,
          created_earlier_than: this.notifications_earliest_ts
        },
        (txs) => {
          for (let tx of txs) {
            notifications.push(tx);
          }

          if (this.debug) {
            console.log(`Found ${txs.length} like notifications`);
          }

          return_count--;
          if (return_count == 0) {
            middle_callback();
          }
        },
        'localhost'
      );
    } else {
      //
      // Just return empty array if we don't query the peers again
      //
      if (mycallback) {
        mycallback([]);
      }
    }
  }

  loadTweetThread(thread_id, mycallback = null) {
    if (!mycallback) {
      return;
    }

    this.app.connection.emit(
      'redsquare-insert-loading-message',
      'Checking peers for more replies...'
    );

    let peer_count = this.peers.length;

    for (let i = 0; i < this.peers.length; i++) {
      let obj = {
        field1: 'RedSquare',
        field3: thread_id,
        flagged: 0
      };

      this.app.storage.loadTransactions(
        obj,
        (txs) => {
          if (txs.length > 0) {
            for (let z = 0; z < txs.length; z++) {
              txs[z].decryptMessage(this.app);
              this.addTweet(txs[z], 'tweet_thread');
            }
          }

          if (this.peers[i].peer !== 'localhost') {
            this.app.connection.emit(
              'redsquare-insert-loading-message',
              `Processing ${txs.length} tweets returned from ${this.app.keychain.returnUsername(
                this.peers[i].publicKey
              )}`
            );
          } else {
            this.app.connection.emit(
              'redsquare-insert-loading-message',
              `Processing ${txs.length} tweets from my archive`
            );
          }

          peer_count--;
          if (peer_count > 0) {
            this.app.connection.emit(
              'redsquare-insert-loading-message',
              `Still waiting on ${peer_count} peer(s)...`
            );
          } else {
            this.app.connection.emit('redsquare-remove-loading-message');
            if (mycallback) {
              mycallback(txs);
            }
          }
        },
        this.peers[i].peer
      );
    }
  }

  //
  // Prioritize looking for the specific tweet
  // 1) in my tweet list
  // 2) in my local archive
  // 3) in my peer archives
  //  It would be useful if we could convert everything to async and have a return value
  //  so that we can avoid callback hell when we really want to get that tweet to process something on it
  //
  loadTweetWithSig(sig, mycallback = null) {
    let redsquare_self = this;

    if (mycallback == null) {
      return;
    }

    let t = this.returnTweet(sig);

    if (t != null) {
      mycallback([t.tx]);
      return;
    }

    this.app.storage.loadTransactions(
      { sig, field1: 'RedSquare' },
      (txs) => {
        if (txs.length > 0) {
          for (let z = 0; z < txs.length; z++) {
            txs[z].decryptMessage(this.app);
            this.addTweet(txs[z], 'loadTweetSig_local');
          }
          mycallback(txs);
        } else {
          for (let i = 0; i < this.peers.length; i++) {
            if (this.peers[i].publicKey !== this.publicKey) {
              this.app.storage.loadTransactions(
                { sig, field1: 'RedSquare' },
                (txs) => {
                  if (txs.length > 0) {
                    for (let z = 0; z < txs.length; z++) {
                      txs[z].decryptMessage(this.app);
                      this.addTweet(txs[z], 'loadTweetSig_peer');
                    }
                    mycallback(txs);
                  }
                },
                this.peers[i].peer
              );
            }
          }
        }
      },
      'localhost'
    );
  }

  ///////////////
  // add tweet //
  ///////////////
  //
  // this creates the tweet and adds it to the internal list that we maintain of
  // the tweets that holds them in a structured tree (parents hold children, etc.)
  // while also maintaining a separate list of the notifications, etc. this function
  // also indexes the tweets as needed in the various hashmaps so they can be
  // retrieved by returnTweet()
  //
  // this does not DISPLAY any tweets, although it makes sure that when they are
  // added they will render into the TWEET MANAGER component.
  //
  // returns 1 if this is a new tweet that can be displayed
  //
  addTweet(tx, source = '', curated = 0) {
    //
    // if this is a like or flag tx, it isn't anything to add to the feed so stop here
    //
    let txmsg = tx.returnMessage();
    if (
      txmsg.request === 'like tweet' ||
      txmsg.request === 'flag tweet' ||
      txmsg.request === 'retweet'
    ) {
      if (this.debug) {
        console.log("RS.addTweet -- Don't process " + txmsg.request);
      }
      return 0;
    }

    if (txmsg.request === 'delete tweet' && this.app.BROWSER) {
      if (this.debug) {
        console.log("RS.addTweet -- process " + txmsg.request);
      }
      this.receiveDeleteTransaction(0, tx, 0, this.app);
      return 0;
    }

    if (txmsg.request === 'edit tweet') {
    if (this.debug) {
        console.log("RS.addTweet -- process " + txmsg.request);
      }

      this.editTweet(txmsg.data.tweet_id, tx, source);
      return 0;
    }

    //
    // create the tweet
    //
    let tweet = new Tweet(this.app, this, tx, '.tweet-manager');
    tweet.source.text = source;

    if (!tweet?.tx) {
      if (this.debug) {
        console.log("RS.addTweet -- Don't process null tweet");
      }
      return 0;
    }

    //
    // curation
    //
    tweet.curated = this.app.modules.moderate(tweet.tx, this.name);

    if (tweet.tx?.optional?.source?.peer) {
      if (tweet.tx?.optional?.curated) {
        tweet.curated = 1;
      }
    }

    if (tweet.tx?.optional?.source?.curated > 0) {
      for (let z = 0; z < this.peers.length; z++) {
        if (
          tweet.tx.optional.source.peer === this.peers[z].publicKey ||
          tweet.tx.optional.source.peer === 'localhost'
        ) {
          tweet.curated = tweet.tx.optional.source.curated;
        }
      }
    }

    if (curated == 1) {
      tweet.curated = 1;
    }

    //
    // we may be attempting to add a tweet that we already have in our hashmap, in
    // this case we want to load our existing tweet and update the stats for it that
    // already exist in our memory, such as updated an edited version of the text.
    // once we have updated the tweet information, we can optionally signal whether
    // we want to re-render it.
    //
    if (this.tweets_sigs_hmap[tweet.tx.signature]) {
      let t = this.returnTweet(tweet.tx.signature);

      if (this.debug){
        console.log(`RS add duplicate tweet (${source}, ${curated}) to feed (${this.tweets.length}) -- `, t?.text);
      }

      if (!t) {
        return 0;
      }

      t.source.text = source;

      if (tweet.tx.optional) {
        let should_rerender = false;

        if (tweet.tx.optional.num_replies > t.tx.optional.num_replies) {
          t.tx.optional.num_replies = tweet.tx.optional.num_replies;
        }
        if (tweet.tx.optional.num_retweets > t.tx.optional.num_retweets) {
          t.tx.optional.num_retweets = tweet.tx.optional.num_retweets;
          t.tx.optional.retweeters = tweet.tx.optional.retweeters;
          should_rerender = true;
        }
        if (tweet.tx.optional.num_likes > t.tx.optional.num_likes) {
          t.tx.optional.num_likes = tweet.tx.optional.num_likes;
        }
        if (tweet.tx.optional.update_tx) {
          t.tx.optional.update_tx = tweet.tx.optional.update_tx;
          should_rerender = true;
        }
        if (tweet.tx.optional.link_properties) {
          t.tx.optional.link_properties = tweet.tx.optional.link_properties;
          should_rerender = true;
        }
        if (tweet.tx.updated_at > t.updated_at) {
          t.updated_at = Math.max(t.updated_at, tweet.tx.updated_at);
          should_rerender = true;
        }

        if (this.browser_active && t.isRendered()) {
          t.rerenderControls(should_rerender);
        }
      }

      return 0;
    }

    //
    // this tweet is a post
    //
    // we go through our list of tweets and add it in the appropriate spot
    // ordered by time of last update. after adding the parent post, we
    // check to see if there are any unknown/orphaned tweets that should
    // slot themselves in under this tweet, and move them over if needed
    //
    if (!tweet.tx.optional.parent_id) {
      let insertion_index = 0;
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].updated_at > tweet.updated_at) {
          insertion_index++;
        } else {
          break;
        }
      }

      this.tweets.splice(insertion_index, 0, tweet);
      this.tweets_sigs_hmap[tweet.tx.signature] = 1;

      for (let i = 0; i < this.unknown_children.length; i++) {
        if (this.unknown_children[i].tx.optional.thread_id === tweet.tx.signature) {
          tweet.addTweet(this.unknown_children[i]);
          this.unknown_children.splice(i, 1);
          i--;
        }
      }

      if (this.debug){
        console.log(`RS addTweet (${source}, ${curated}) to feed (${this.tweets.length}) -- `, tweet.text);
      }

      return 1;

      //
      // this is a comment / reply
      //
      // we find the tweet that is the parent and push it into the array
      // at that point. otherwise, we mark it as an unknown_child which
      // means we know it HAS a parent but we do not -- as of yet -- have
      // a copy of that tweet.
      //
    } else {
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.signature === tweet.tx.optional.thread_id) {
          this.tweets[i].addTweet(tweet);
          this.tweets_sigs_hmap[tweet.tx.signature] = 1;

          if (this.debug){
            console.log(`RS add child Tweet (${source}, ${curated}) to feed (${this.tweets.length}) -- `, tweet.text);
          }

          return 0;
        }
      }

      this.unknown_children.push(tweet);
      this.tweets_sigs_hmap[tweet.tx.signature] = 1;

      if (this.debug){
        console.log(`RS add unknown child tweet (${source}, ${curated}) to feed (${this.tweets.length}) -- `, tweet.text);
      }

      return 0;
    }
  }

  //
  // addTweets adds notifications, but we have a separate function here
  // for cached notifications, because we don't want to show all of the
  // cached notifications in the main thread automatically, and we want a
  // dedicated function that tells us if this notification is new or not
  //
  addNotification(tx) {
    if (tx.isTo(this.publicKey)) {
      if (!tx.isFrom(this.publicKey)) {
        //
        // only insert notification if doesn't already exist
        //
        if (this.notifications_sigs_hmap[tx.signature] != 1) {
          if (this.debug) {
            console.log('Add notification', tx.msg, tx.timestamp);
          }

          let insertion_index = 0;

          for (let i = 0; i < this.notifications.length; i++) {
            if (tx.timestamp > this.notifications[i].timestamp) {
              break;
            } else {
              insertion_index++;
            }
          }

          this.notifications.splice(insertion_index, 0, tx);
          this.notifications_sigs_hmap[tx.signature] = 1;

          if (tx.timestamp > this.notifications_last_viewed_ts) {
            this.notifications_number_unviewed = this.notifications_number_unviewed + 1;
            this.app.connection.emit(
              'redsquare-update-notifications',
              this.notifications_number_unviewed
            );
          }

          this.saveOptions();

          return 1;
        }
      }
    }

    return 0;
  }

  resetNotifications() {
    this.notifications_last_viewed_ts = new Date().getTime();
    this.notifications_number_unviewed = 0;
    this.saveOptions();

    this.app.connection.emit('redsquare-update-notifications', this.notifications_number_unviewed);
  }

  returnTweet(tweet_sig = null) {
    if (tweet_sig == null) {
      return null;
    }

    if (!this.tweets_sigs_hmap[tweet_sig]) {
      return null;
    }

    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.signature === tweet_sig) {
        return this.tweets[i];
      }
      if (this.tweets[i].hasChildTweet(tweet_sig)) {
        return this.tweets[i].returnChildTweet(tweet_sig);
      }
    }

    for (let j = 0; j < this.unknown_children.length; j++) {
      if (this.unknown_children[j].tx.signature === tweet_sig) {
        return this.unknown_children[j];
      }
    }

    return null;
  }

  removeTweet(tweet_sig = null) {
    if (!tweet_sig || !this.tweets_sigs_hmap[tweet_sig]) {
      return;
    }

    this.tweets_sigs_hmap[tweet_sig] = 0;

    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.signature === tweet_sig) {
        this.tweets[i].remove();
        this.tweets.splice(i, 1);
        return;
      }

      if (this.tweets[i].hasChildTweet(tweet_sig)) {
        this.tweets[i].removeChildTweet(tweet_sig);
        return;
      }
    }

    for (let j = 0; j < this.unknown_children.length; j++) {
      if (this.unknown_children[j].tx.signature === tweet_sig) {
        this.unknown_children.splice(j, 1);
        return;
      }
    }
  }

  pruneTweets() {
    this.unknown_children = [];
    let pruned = [];
    let count = 0;
    if (this.tweets.length > 100) {
      for (let i = 0; count < 90 && i < this.tweets.length; i++) {
        if (this.tweets[i].curated == 1) {
          pruned.push(this.tweets[i]);
          count++;
        }
      }
    }
    this.tweets = pruned;
  }

  returnNotification(tweet_sig = null) {
    if (tweet_sig == null) {
      return null;
    }

    if (!this.notifications_sigs_hmap[tweet_sig]) {
      return null;
    }

    for (let i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i].signature === tweet_sig) {
        return this.notifications[i];
      }
    }

    return null;
  }

  returnThreadSigs(root_id, child_id) {
    let sigs = [];
    let tweet = this.returnTweet(child_id);
    if (!tweet) {
      return [root_id];
    }
    let parent_id = tweet.parent_id;

    sigs.push(child_id);
    while (parent_id != '' && parent_id != root_id) {
      let x = this.returnTweet(parent_id);
      if (!x) {
        parent_id = root_id;
      } else {
        if (x.parent_id != '') {
          sigs.push(parent_id);
          parent_id = x.parent_id;
        } else {
          parent_id = root_id;
        }
      }
    }
    if (child_id != root_id) {
      sigs.push(root_id);
    }
    return sigs;
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  async sendLikeTransaction(app, mod, data, tx) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: 'like tweet',
      data: {}
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction(tx.from[0]?.publicKey);

    //
    // All tweets include the sender in the to, but add the from first so they are in first position
    //
    for (let i = 0; i < tx.to.length; i++) {
      if (tx.to[i].publicKey !== this.publicKey) {
        newtx.addTo(tx.to[i].publicKey);
      }
    }

    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  async receiveLikeTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let liked_tweet = this.returnTweet(txmsg.data.signature);

    //
    // save optional likes
    //
    if (liked_tweet?.tx) {
      //
      // set as curated if liked by moderator
      //
      if (this.app.modules.moderate(tx) == 1) {
        liked_tweet.curated = 1;
      }

      if (!liked_tweet.tx.optional) {
        liked_tweet.tx.optional = {};
      }

      if (!liked_tweet.tx.optional.num_likes) {
        liked_tweet.tx.optional.num_likes = 0;
      }

      if (tx.timestamp > liked_tweet.updated_at) {
        liked_tweet.tx.optional.num_likes++;

        await this.app.storage.updateTransaction(
          liked_tweet.tx,
          { timestamp: tx.timestamp },
          'localhost'
        );

        if (this.browser_active && liked_tweet.isRendered()) {
          liked_tweet.rerenderControls();
        }
      }
    } else {
      //
      // fetch original
      //
      // servers load from themselves
      //
      // servers update their TX.updated_at timestamps based on current_time, since they won't be
      // fetching the blockchain transiently afterwards while viewing tweets that have loaded from
      // others. this permits browsers to avoid double-liking tweets that show up with pre-calculated
      // likes, as those will also have pre-updated updated_at values.
      //
      // this isn't an ironclad way of avoiding browsers saving likes 2x, but last_updated is not a
      // consensus variable and if they're loading tweets from server-archives uncritically it is a
      // sensible set of defaults.
      //
      let received_tx = tx;
      await this.app.storage.loadTransactions(
        { sig: txmsg.data.signature, field1: 'RedSquare' },
        async (txs) => {
          if (txs?.length > 0) {
            let tx = txs[0];

            if (!tx.optional) {
              tx.optional = {};
            }
            if (!tx.optional.num_likes) {
              tx.optional.num_likes = 0;
            }
            tx.optional.num_likes++;

            await this.app.storage.updateTransaction(
              tx,
              { timestamp: Math.max(received_tx.timestamp, tx.updated_at) },
              'localhost'
            );
          }
        },
        'localhost'
      );
    }

    //
    // Save locally -- indexed to myKey so it is accessible as a notification
    //
    // I'm not sure we really want to save these like this... but it may work out for profile views...
    //
    await this.app.storage.saveTransaction(tx, { field1: 'RedSquareLike' }, 'localhost');

    return;
  }

  async sendRetweetTransaction(app, mod, data, tx) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: 'retweet',
      data: {}
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction(tx.from[0]?.publicKey);

    //
    // All tweets include the sender in the to, but add the from first so they are in first position
    //
    for (let i = 0; i < tx.to.length; i++) {
      if (tx.to[i].publicKey !== this.publicKey) {
        newtx.addTo(tx.to[i].publicKey);
      }
    }

    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  async incrementRetweets(localTx, receivedTx) {
    if (!localTx.optional) {
      localTx.optional = {};
    }

    if (!localTx.optional.num_retweets) {
      localTx.optional.num_retweets = 0;
    }
    if (!localTx.optional.retweeters) {
      localTx.optional.retweeters = [];
    }

    if (receivedTx.timestamp > localTx.updated_at) {
      localTx.optional.num_retweets++;

      if (!localTx.optional.retweeters.includes(receivedTx.from[0].publicKey)) {
        localTx.optional.retweeters.unshift(receivedTx.from[0].publicKey);
      }

      await this.app.storage.updateTransaction(
        localTx,
        { timestamp: receivedTx.timestamp },
        'localhost'
      );
    } else {
      console.log('Retweet transaction received after tweet fetch');
    }
  }

  async receiveRetweetTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let retweeted_tweet = this.returnTweet(txmsg.data.signature);

    //
    // save optional likes
    //

    if (retweeted_tweet?.tx) {
      //
      // set as curated if liked by moderator
      //
      if (this.app.modules.moderate(tx) == 1) {
        retweeted_tweet.curated = 1;
      }

      //
      // Put the updated_at timestamp in the tx, in case it isn't there (wasn't read from archive)
      //
      retweeted_tweet.tx.updated_at = retweeted_tweet.updated_at;
      await this.incrementRetweets(retweeted_tweet.tx, tx);
      if (this.browser_active && retweeted_tweet.isRendered()) {
        retweeted_tweet.rerenderControls(true);
      }
    } else {
      //
      // fetch original to update
      //
      await this.app.storage.loadTransactions(
        { sig: txmsg.data.signature, field1: 'RedSquare' },
        async (txs) => {
          if (txs?.length > 0) {
            this.incrementRetweets(txs[0], tx);
          } else {
            console.log('Original tweet not found');
          }
        },
        'localhost'
      );
    }

    return;
  }

  async sendEditTransaction(app, mod, data, keys = []) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: 'edit tweet',
      data: {}
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;

    for (let i = 0; i < keys.length; i++) {
      newtx.addTo(keys[i]);
    }

    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  async sendDeleteTransaction(app, mod, data, keys = []) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: 'delete tweet',
      data: {}
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;

    for (let i = 0; i < keys.length; i++) {
      newtx.addTo(keys[i]);
    }

    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  async sendTweetTransaction(app, mod, data, keys = []) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: 'create tweet',
      data: {}
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== this.publicKey) {
        newtx.addTo(keys[i]);
      }
    }

    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  editTweet(tweet_id, tx, source) {
    let edited_tweet = this.returnTweet(tweet_id);

    if (edited_tweet) {
      let orig_tx = edited_tweet.tx;
      if (!orig_tx.optional) {
        orig_tx.optional = {};
      }

      // What if there are multiple edits?
      if (tx.timestamp > (orig_tx.optional?.edit_ts || 0)) {
        orig_tx.optional.update_tx = tx.serialize_to_web(this.app);

        // To-Do -- shouldn't we replace the tweet?
        let new_tweet = new Tweet(this.app, this, orig_tx, edited_tweet.container);

        new_tweet.source.text = source;
        if (this.browser_active && new_tweet.isRendered()) {
          new_tweet.rerenderControls(true);
        }
      }
    } else {
      this.orphan_edits.push({ tweet_id, tx, source });
    }
  }

  async receiveEditTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    if (!txmsg.data?.tweet_id) {
      console.warn('no tweet id to edit');
      return;
    }

    if (this.browser_active) {
      this.editTweet(txmsg.data.tweet_id, tx, `onchain-edit-${tx.from[0].publicKey}`);
    }

    await this.app.storage.loadTransactions(
      { sig: txmsg.data.tweet_id, field1: 'RedSquare' },
      async (txs) => {
        if (txs?.length) {
          //
          // only update first copy??
          //
          let oldtx = txs[0];
          //
          // save the tx
          //
          if (oldtx.from[0].publicKey === tx.from[0].publicKey) {
            if (!oldtx.optional) {
              oldtx.optional = {};
            }

            if (tx.timestamp > (oldtx.optional?.edit_ts || 0)) {
              oldtx.optional.update_tx = tx.serialize_to_web(this.app);
              oldtx.optional.edit_ts = tx.timestamp;
            }

            await this.app.storage.updateTransaction(
              oldtx,
              { timestamp: tx.timestamp },
              'localhost'
            );
          }
        }
      },
      'localhost'
    );
  }

  //
  // We should remove the tweet in question from memory (if we have it)
  // remove it from the archives and update the archives of linked tweets so that the stats
  // decrement accordingly
  // To-do: implement live updating of reply/retweet counts (currently requires a refresh)
  //
  async receiveDeleteTransaction(blk, tx, conf, app) {
    console.log('REDSQUARE: receive delete transaction!');

    let txmsg = tx.returnMessage();

    if (!txmsg.data) {
      return;
    }
    if (!txmsg.data.tweet_id) {
      return;
    }

    this.removeTweet(txmsg.data.tweet_id);

    await this.app.storage.loadTransactions(
      { sig: txmsg.data.tweet_id },
      async (txs) => {
        if (txs?.length) {
          //
          // only update first copy??
          //
          let oldtx = txs[0];

          //
          // save the tx
          //
          if (oldtx.from[0].publicKey === tx.from[0].publicKey) {
            await this.app.storage.deleteTransaction(oldtx, {}, 'localhost');

            let tweet = new Tweet(this.app, this, oldtx, '');

            // Delete tweet is a reply
            if (tweet.tx.optional.parent_id) {
              await this.app.storage.loadTransactions(
                { sig: tweet.tx.optional.parent_id, field1: 'RedSquare' },
                async (txs) => {
                  if (txs?.length) {
                    if (txs[0]?.optional?.num_replies) {
                      txs[0].optional.num_replies--;
                      await this.app.storage.updateTransaction(
                        txs[0],
                        { timestamp: tx.timestamp },
                        'localhost'
                      );
                    }
                  }
                },
                'localhost'
              );
            }

            // Deleted tweet is a retweet
            if (tweet.retweet_tx) {
              await this.app.storage.loadTransactions(
                { sig: tweet.retweet.tx.signature, field1: 'RedSquare' },
                async (txs) => {
                  if (txs?.length) {
                    if (txs[0].optional?.num_retweets) {
                      txs[0].optional.num_retweets--;
                      await this.app.storage.updateTransaction(
                        txs[0],
                        { timestamp: tx.timestamp },
                        'localhost'
                      );
                    }
                  }
                },
                'localhost'
              );
            }
          }
        }
      },
      'localhost'
    );

    //Save the transaction with command to delete
    if (!app.BROWSER) {
      await this.app.storage.saveTransaction(tx, { field1: 'RedSquare' }, 'localhost');
    }
  }

  async receiveTweetTransaction(blk, tx, conf, app) {
    console.log('REDSQUARE: receive tweet transaction!');

    try {
      let tweet = new Tweet(app, this, tx, '.tweet-manager');
      let other_tweet = null;
      let txmsg = tx.returnMessage();

      //
      // save this transaction in our archives as a redsquare transaction that is owned by ME (the server), so that I
      // can deliver it to users who want to fetch RedSquare transactions from the archives instead of just through the
      // sql database -- this is done by specifying that I -- "localhost" am the peer required.
      //

      //
      // this transaction is TO me, but I may not be the tx.to[0].publicKey address, and thus the archive
      // module may not index this transaction for me in a way that makes it very easy to fetch (field3 = MY_KEY}
      // thus we override the defaults by setting field3 explicitly to our publickey so that loading transactions
      // from archives by fetching on field3 will get this.
      //
      let opt = {
        field1: 'RedSquare', //defaults to module.name, but just to make sure we match the capitalization with our loadTweets
        preserve: 1
      };

      if (tx.isTo(this.publicKey)) {
        //
        // When a browser stores tweets, it is storing tweets it sent or were sent to it
        // this will help use with notifications (to) and profile (from)
        //
        opt['field3'] = this.publicKey;
      } else {
        //
        // When the service node stores tweets, it is for general look up. We will usually
        // search for all tweets or tweets within a thread, thus we want the thread_id indexed
        //
        opt['field3'] = tweet?.thread_id;
      }

      //
      // servers -- get open graph properties
      //

      tweet = await tweet.analyseTweetLinks(app, this, 1);

      //
      // Save the modified tx so we have open graph properties available
      //
      await this.app.storage.saveTransaction(tweet.tx, opt, 'localhost');

      //
      // Includes retweeted tweet
      //
      if (tweet.retweet_tx != null) {
        other_tweet = this.returnTweet(tweet.signature);

        if (other_tweet) {
          if (!other_tweet.tx.optional) {
            other_tweet.tx.optional = {};
          }
          if (!other_tweet.tx.optional.num_retweets) {
            other_tweet.tx.optional.num_retweets = 0;
          }

          if (tx.timestamp > other_tweet.updated_at) {
            other_tweet.tx.optional.num_retweets++;
            console.log('REDSQUARE: Increment retweets ', other_tweet.tx.optional.num_retweets);
            await this.app.storage.updateTransaction(
              other_tweet.tx,
              { timestamp: tx.timestamp },
              'localhost'
            );
            if (this.browser_active && other_tweet.isRendered()) {
              other_tweet.rerenderControls();
            }
          } else {
            console.log('Nope out of retweet incrementing');
          }
        } else {
          //
          // fetch archived copy
          //
          // servers load from themselves
          //
          await this.app.storage.loadTransactions(
            { sig: tweet.signature, field1: 'RedSquare' },
            async (txs) => {
              if (txs?.length) {
                //Only update the first copy??
                let archived_tx = txs[0];

                if (!archived_tx.optional) {
                  archived_tx.optional = {};
                }
                if (!archived_tx.optional.num_retweets) {
                  archived_tx.optional.num_retweets = 0;
                }
                archived_tx.optional.num_retweets++;
                await this.app.storage.updateTransaction(
                  archived_tx,
                  { timestamp: tx.timestamp },
                  'localhost'
                );
              }
            },
            'localhost'
          );
        }
      }

      //
      // Is a reply
      //
      if (tweet.parent_id && tweet.parent_id !== tweet.tx.signature) {
        //
        // if we have the parent tweet in memory...
        //
        other_tweet = this.returnTweet(tweet.parent_id);

        if (other_tweet) {
          if (!other_tweet.tx.optional) {
            other_tweet.tx.optional = {};
          }
          if (!other_tweet.tx.optional.num_replies) {
            other_tweet.tx.optional.num_replies = 0;
          }

          if (tx.timestamp > other_tweet.updated_at) {
            other_tweet.tx.optional.num_replies++;
            console.log('REDSQUARE: Increment replies ', other_tweet.tx.optional.num_replies);
            if (this.browser_active && other_tweet.isRendered()) {
              other_tweet.rerenderControls();
            }
            await this.app.storage.updateTransaction(
              other_tweet.tx,
              { timestamp: tx.timestamp },
              'localhost'
            );
          } else {
            console.log('Nope out of reply count incrementing');
          }
        } else {
          //
          // ...otherwise, hit up the archive first
          //
          await this.app.storage.loadTransactions(
            { sig: tweet.parent_id, field1: 'RedSquare' },
            async (txs) => {
              if (txs?.length) {
                let archived_tx = txs[0];
                if (!archived_tx.optional) {
                  archived_tx.optional = {};
                }
                if (!archived_tx.optional.num_replies) {
                  archived_tx.optional.num_replies = 0;
                }
                archived_tx.optional.num_replies++;
                await this.app.storage.updateTransaction(
                  archived_tx,
                  { timestamp: tx.timestamp },
                  'localhost'
                );
              }
            },
            'localhost'
          );
        }
      }

      //
      // prune if too many tweets
      //
      if (this.tweets.length > 100) {
        this.pruneTweets();
      }
    } catch (err) {
      console.log('ERROR in receiveTweetsTransaction() in RedSquare: ' + err);
    }
  }

  //
  // How does this work with the archive module???
  //
  async sendFlagTransaction(app, mod, data, tx) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: 'flag tweet',
      data: {}
    };

    //
    // data = {signature : tx.signature }
    //
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();

    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  //
  // We have a lot of work to do here....
  // ...an interface for users to delete their own tweets
  // ...an interface for moderators to review tweets
  //
  async receiveFlagTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let flagged_tweet = this.returnTweet(txmsg.data.signature);

    let process_action = tx.isFrom(this.publicKey);

    let modScore = this.app.modules.moderate(tx);

    if (modScore == -1) {
      // Ignore blacklisted people
      return;
    } else if (modScore == 1) {
      // Trusted moderator
      process_action = true;
    } else {
      if (flagged_tweet) {
        // two people who are not moderators have flagged it
        if (flagged_tweet.flagged) {
          process_action = true;
        } else {
          // add a note that this was flagged, but don't necessarily update the database
          flagged_tweet.flagged = true;
        }
      }
    }

    //
    // we will "soft delete" the tweet for the person who flagged it and in the central archives
    //
    if (process_action) {
      if (flagged_tweet?.tx) {
        await this.app.storage.updateTransaction(
          flagged_tweet.tx,
          { timestamp: tx.timestamp, flagged: 1 },
          'localhost'
        );
      } else {
        await this.app.storage.loadTransactions(
          { sig: txmsg.data.signature, field1: 'RedSquare' },
          async (txs) => {
            if (txs?.length > 0) {
              let archived_tx = txs[0];
              await this.app.storage.updateTransaction(
                archived_tx,
                { timestamp: tx.timestamp, flagged: 1 },
                'localhost'
              );
            }
          },
          'localhost'
        );
      }
    }

    //
    // let both users know that something happened
    //
    if (app.BROWSER == 1) {
      if (tx.isTo(this.publicKey)) {
        if (tx.isFrom(this.publicKey)) {
          siteMessage('Tweet successfully flagged for review', 3000);
        } else {
          siteMessage('One of your tweets was flagged for review', 10000);
        }
      }
    }

    return;
  }

  saveTweet(sig, preserve = 1) {
    let tweet = this.returnTweet(sig);

    if (!tweet) {
      console.warn('Want to save a tweet not in our memory');
      return;
    }

    this.app.storage.loadTransactions(
      { field1: 'RedSquare', sig },
      (txs) => {
        if (txs?.length > 0) {
          if (preserve) {
            this.app.storage.updateTransaction(tweet.tx, { preserve: 1 }, 'localhost');
          }
        } else {
          this.app.storage.saveTransaction(
            tweet.tx,
            { field1: 'RedSquare', field3: tweet?.thread_id, preserve },
            'localhost'
          );
        }
      },
      'localhost'
    );
  }

  /////////////////////////////////////
  // saving and loading wallet state //
  /////////////////////////////////////
  loadOptions() {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.app.options.redsquare) {
      const rso = this.app.options.redsquare;

      this.notifications_last_viewed_ts = rso?.notifications_last_viewed_ts || 0;
      this.notifications_number_unviewed = rso?.notifications_number_unviewed || 0;
      this.tweet_count = rso?.tweet_count || 0;

      this.liked_tweets = rso?.liked_tweets || [];
      this.retweeted_tweets = rso?.retweeted_tweets || [];
      this.replied_tweets = rso?.replied_tweets || [];
      this.hidden_tweets = rso?.hidden_tweets || [];

      if (rso?.curated == 0) {
        this.curated = 0;
      }
    }

    this.saveOptions();
  }

  saveOptions() {
    if (!this.app.BROWSER) {
      return;
    }

    let rso = {};

    rso.notifications_last_viewed_ts = this.notifications_last_viewed_ts;
    rso.notifications_number_unviewed = this.notifications_number_unviewed;
    rso.tweet_count = this.tweet_count;

    rso.liked_tweets = this.liked_tweets.slice(-100);
    rso.retweeted_tweets = this.retweeted_tweets.slice(-100);
    rso.replied_tweets = this.replied_tweets.slice(-100);
    rso.hidden_tweets = this.hidden_tweets;

    rso.curated = this.curated;

    this.app.options.redsquare = rso;

    this.app.storage.saveOptions();
  }

  //////////////
  // remember //
  //////////////
  likeTweet(sig = '') {
    if (sig === '') {
      return;
    }
    if (!this.liked_tweets.includes(sig)) {
      this.liked_tweets.push(sig);
      this.saveTweet(sig);
    }
    this.saveOptions();
  }
  unlikeTweet(sig = '') {
    if (sig === '') {
      return;
    }
    if (this.liked_tweets.includes(sig)) {
      for (let i = 0; i < this.liked_tweets.length; i++) {
        if (this.liked_tweets[i] === sig) {
          this.liked_tweets.splice(i, 1);
          i--;
        }
      }
    }
    this.saveOptions();
  }
  retweetTweet(sig = '') {
    if (sig === '') {
      return;
    }
    if (!this.retweeted_tweets.includes(sig)) {
      this.retweeted_tweets.push(sig);
      this.saveTweet(sig);
    }
    this.saveOptions();
  }
  unretweetTweet(sig = '') {
    if (sig === '') {
      return;
    }
    if (this.retweeted_tweets.includes(sig)) {
      for (let i = 0; i < this.retweeted_tweets.length; i++) {
        if (this.retweeted_tweets[i] === sig) {
          this.retweeted_tweets.splice(i, 1);
          i--;
        }
      }
    }
    this.saveOptions();
  }
  replyTweet(sig = '') {
    if (sig === '') {
      return;
    }
    if (!this.replied_tweets.includes(sig)) {
      this.replied_tweets.push(sig);
      this.saveTweet(sig);
    }
    this.saveOptions();
  }
  unreplyTweet(sig = '') {
    if (sig === '') {
      return;
    }
    if (this.replied_tweets.includes(sig)) {
      for (let i = 0; i < this.replied_tweets.length; i++) {
        if (this.replied_tweets[i] === sig) {
          this.replied_tweets.splice(i, 1);
          i--;
        }
      }
    }
    this.saveOptions();
  }

  cacheRecentTweets(skip_username_fetch = false) {
    if (this.app.BROWSER) {
      return;
    }

    if (this.debug) {
      console.log('###');
      console.log('###');
      console.log('### Caching Tweets -- ' + this.tweets.length);
      console.log('###');
      console.log('###');
    }

    this.cached_tweets = [];

    for (let tweet of this.tweets) {
      if (this.tweets.curated == 1) {
        this.cached_tweets.push(tweet.tx.serialize_to_web(this.app));
      } else {
        if (this.cacheRecentTweetsCurationFunction(tweet)) {
          //
          // update tweet source
          //
          tweet.tx.optional.source = {};
          tweet.tx.optional.source.text = 'cached';
          tweet.tx.optional.source.type = 'curated';
          tweet.tx.optional.source.peer = this.publicKey;

          this.cached_tweets.push(tweet.tx.serialize_to_web(this.app));
        }
      }
    }

    if (this.cached_tweets.length < 10 && skip_username_fetch == false) {
      setTimeout(() => {
        this.fetchMissingUsernames((answers) => {
          this.cacheRecentTweets(true);
        });
      }, 250);
    }

    //
    // still nothing, pull the three latest
    //
    for (let z = 0; z < 4 && z < this.tweets.length; z++) {
      this.cached_tweets.push(this.tweets[z].tx.serialize_to_web(this.app));
    }

    if (this.debug) {
      console.log('###');
      console.log('###');
    }
  }

  cacheRecentTweetsCurationFunction(tweet) {
    if (this.debug) {
      console.log('server is examining: ' + tweet.text);
      console.log('moderation result is: ' + this.app.modules.moderate(tweet.tx, 'RedSquare'));
    }

    return this.app.modules.moderate(tweet.tx, 'RedSquare');
  }

  fetchMissingUsernames(mycallback = null) {
    let keylist = [];

    for (let i = 0; i < this.tweets.length; i++) {
      if (!keylist.includes(this.tweets[i].tx.from[0].publicKey)) {
        keylist.push(this.tweets[i].tx.from[0].publicKey);
      }
    }

    let rMod = this.app.modules.returnModule('Registry');
    if (rMod) {
      rMod.fetchManyIdentifiers(keylist, (answer) => {
        if (mycallback != null) {
          mycallback(answer);
        }
      });
    }
  }

  ///////////////
  // webserver //
  ///////////////
  webServer(app, expressapp, express) {
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    let redsquare_self = this;

    expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
      let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

      try {
        if (Object.keys(req.query).length > 0) {
          let query_params = req.query;

          let sig = query_params?.tweet_id || query_params?.thread_id;

          if (sig) {
            redsquare_self.loadTweetWithSig(sig, (txs) => {
              let updated_social = redsquare_self.social;

              for (let z = 0; z < txs.length; z++) {
                let tx = txs[z];

                let txmsg = tx.returnMessage();
                let text = txmsg.data.text;
                let publicKey = tx.from[0].publicKey;
                let user = app.keychain.returnUsername(publicKey);

                //
                // We need adequate protection here
                //
                let url = reqBaseURL + encodeURI(redsquare_self.returnSlug());
                let image = url + '?og_img_sig=' + sig;

                updated_social = {
                  twitter: '@SaitoOfficial',
                  title: user + ' posted on Saito 🟥',
                  url: url,
                  description: app.browser.escapeHTML(text),
                  image: image
                };
              }

              let html = redsquareHome(app, redsquare_self, app.build_number, updated_social);
              if (!res.finished) {
                res.setHeader('Content-type', 'text/html');
                res.charset = 'UTF-8';
                return res.send(html);
              }
              return;
            });

            return;
          }

          if (typeof query_params.og_img_sig != 'undefined') {
            console.info(query_params.og_img_sig);

            let sig = query_params.og_img_sig;

            redsquare_self.loadTweetWithSig(sig, (txs) => {
              for (let i = 0; i < txs.length; i++) {
                let tx = txs[i];
                let txmsg = tx.returnMessage();
                let img = '';
                let img_type;

                if (txmsg.data?.images?.length > 0) {
                  let img_uri = txmsg.data.images[0];
                  img_type = img_uri.substring(img_uri.indexOf(':') + 1, img_uri.indexOf(';'));
                  let base64Data = img_uri.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                  img = Buffer.from(base64Data, 'base64');
                } else {
                  let publicKey = tx.from[0].publicKey;
                  let img_uri = app.keychain.returnIdenticon(publicKey, 'png');
                  let base64Data = img_uri.replace(/^data:image\/png;base64,/, '');
                  img = Buffer.from(base64Data, 'base64');
                  img_type = img_uri.substring(img_uri.indexOf(':') + 1, img_uri.indexOf(';'));
                }

                if (img_type == 'image/svg+xml') {
                  img_type = 'image/svg';
                }

                console.info('### write from redsquare.js:1651 (request Open Graph Image)');
                if (!res.finished) {
                  res.writeHead(200, {
                    'Content-Type': img_type,
                    'Content-Length': img.length
                  });
                  return res.end(img);
                }
              }
            });

            return;
          }
        }
      } catch (err) {
        console.warn('Loading OG data failed with error: ' + err);
      }

      if (!res.finished) {
        let html = redsquareHome(
          app,
          redsquare_self,
          app.build_number,
          redsquare_self.social,
          redsquare_self.cached_tweets
        );
        res.setHeader('Content-type', 'text/html');
        res.charset = 'UTF-8';
        return res.send(html);
      }
      return;
    });

    expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
  }

  //
  // servers can fetch open graph graphics (of links in tweets)
  //
  async fetchOpenGraphProperties(app, mod, link) {
    if (app.BROWSER != 1) {
      return fetch(link, { redirect: 'follow', follow: 50 })
        .then((res) => res.text())
        .then((data) => {
          let no_tags = {
            title: '',
            description: ''
          };

          let og_tags = {
            'og:exists': false,
            'og:title': '',
            'og:description': '',
            'og:url': '',
            'og:image': '',
            'og:site_name': '' //We don't do anything with this
          };

          let tw_tags = {
            'twitter:exists': false,
            'twitter:title': '',
            'twitter:description': '',
            'twitter:url': '',
            'twitter:image': '',
            'twitter:site': '', //We don't do anything with this
            'twitter:card': '' //We don't do anything with this
          };

          // prettify html - unminify html if minified
          let html = prettify(data);

          //Useful to check, don't delete until perfect
          //let testReg = /<head>.*<\/head>/gs;
          //console.log(html.match(testReg));

          // parse string html to DOM html
          let dom = HTMLParser.parse(html);

          try {
            no_tags.title = dom.getElementsByTagName('title')[0].textContent;
          } catch (err) {}

          // fetch meta element for og tags
          let meta_tags = dom.getElementsByTagName('meta');

          // loop each meta tag and fetch required og properties
          for (let i = 0; i < meta_tags.length; i++) {
            let property = meta_tags[i].getAttribute('property');
            let content = meta_tags[i].getAttribute('content');
            // get required og properties only, discard others
            if (property in og_tags) {
              og_tags[property] = content;
              og_tags['og:exists'] = true;
            }
            if (property in tw_tags) {
              tw_tags[property] = content;
              tw_tags['twitter:exists'] = true;
            }
            if (meta_tags[i].getAttribute('name') === 'description') {
              no_tags.description = content;
            }
          }

          // fallback to no tags
          og_tags['og:title'] = og_tags['og:title'] || no_tags['title'];
          og_tags['og:description'] = og_tags['og:description'] || no_tags['description'];

          if (tw_tags['twitter:exists'] && !og_tags['og:exists']) {
            og_tags['og:title'] = tw_tags['twitter:title'];
            og_tags['og:description'] = tw_tags['twitter:description'];
            og_tags['og:url'] = tw_tags['twitter:url'];
            og_tags['og:image'] = tw_tags['twitter:image'];
            og_tags['og:site_name'] = tw_tags['twitter:site'];
          }

          return og_tags;
        })
        .catch((err) => {
          console.error('Error fetching content: ' + err);
          return '';
        });
    } else {
      return '';
    }
  }
}

module.exports = RedSquare;
